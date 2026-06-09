import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query, queryOne } from '@/lib/db';
import { cookies } from 'next/headers';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FALLBACK_PROMPT = `Sos Flip, asistente AI de un agente inmobiliario en Argentina.
Conversá naturalmente, extraé datos del cliente (nombre, zona, presupuesto, tipo de propiedad) y calificá el lead.
Respondé siempre con JSON: { "response": "...", "lead_data": {...}, "seguimientos": [] }`;

const MAX_HISTORY = 10;
const MAX_INVENTORY = 50;

async function buildSystemPrompt(): Promise<string> {
  const [promptRow, inventory] = await Promise.all([
    queryOne('SELECT content FROM system_prompts WHERE is_active = TRUE LIMIT 1'),
    query(
      `SELECT tipo, titulo, ubicacion, zona, precio, moneda, dormitorios, banos, m2, caracteristicas
       FROM inventory_items WHERE estado = 'Disponible' LIMIT $1`,
      [MAX_INVENTORY]
    ),
  ]);

  const basePrompt = promptRow?.content ?? FALLBACK_PROMPT;

  if (inventory.length === 0) return basePrompt;

  return `${basePrompt}

## INVENTARIO DISPONIBLE (${inventory.length} propiedades)

${JSON.stringify(inventory, null, 2)}

Cuando el cliente pregunte por propiedades, usá EXCLUSIVAMENTE este inventario para responder. No inventes propiedades que no estén en la lista.`;
}

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  const cookieStore = cookies();
  const sessionToken = cookieStore.get('demo_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const session = await queryOne(
    'SELECT * FROM demo_sessions WHERE session_token = $1',
    [sessionToken]
  );

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Guardar mensaje del usuario
  await query(
    'INSERT INTO demo_messages (session_id, role, content) VALUES ($1, $2, $3)',
    [session.id, 'user', message]
  );

  // Obtener historial (últimos N mensajes)
  const history = await query(
    `SELECT role, content FROM demo_messages
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [session.id, MAX_HISTORY]
  );
  // Revertir para orden cronológico, excluir el mensaje recién insertado
  const historyMessages = history.reverse().slice(0, -1);

  // Construir system prompt desde DB (prompt activo + inventario disponible)
  const systemPrompt = await buildSystemPrompt();

  // Llamar a Claude Haiku (más económico para el demo)
  const aiResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...historyMessages.map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ],
  });

  const rawText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '';

  // Parsear JSON de la respuesta
  let parsed: {
    response: string;
    lead_data: Record<string, unknown>;
    seguimientos: Array<{ descripcion: string; fecha_programada: string }>;
  };
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { response: rawText, lead_data: {}, seguimientos: [] };
  } catch {
    parsed = { response: rawText, lead_data: {}, seguimientos: [] };
  }

  // Guardar respuesta del asistente
  await query(
    'INSERT INTO demo_messages (session_id, role, content) VALUES ($1, $2, $3)',
    [session.id, 'assistant', parsed.response]
  );

  // Merge lead_data (solo campos con valor)
  const currentLeadData = session.lead_data || {};
  const incomingLeadData = parsed.lead_data || {};
  const newLeadData = { ...currentLeadData };
  for (const [key, value] of Object.entries(incomingLeadData)) {
    if (value !== null && value !== undefined) {
      newLeadData[key] = value;
    }
  }

  await query(
    'UPDATE demo_sessions SET lead_data = $1, last_activity = NOW() WHERE id = $2',
    [JSON.stringify(newLeadData), session.id]
  );

  // Guardar seguimientos nuevos
  const seguimientosGuardados = [];
  for (const seg of parsed.seguimientos || []) {
    if (seg.descripcion) {
      await query(
        'INSERT INTO demo_seguimientos (session_id, descripcion, fecha_programada) VALUES ($1, $2, $3)',
        [session.id, seg.descripcion, seg.fecha_programada || null]
      );
      seguimientosGuardados.push(seg);
    }
  }

  return NextResponse.json({
    response: parsed.response,
    lead_data: newLeadData,
    seguimientos: seguimientosGuardados,
  });
}
