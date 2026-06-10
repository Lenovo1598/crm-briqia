import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prompt = await queryOne(
    'SELECT id, content, is_default, is_active, version FROM system_prompts WHERE is_active = TRUE LIMIT 1'
  );

  if (!prompt) {
    return NextResponse.json({ error: 'No active prompt found' }, { status: 404 });
  }

  const defaultPrompt = await queryOne(
    'SELECT content FROM system_prompts WHERE is_default = TRUE LIMIT 1'
  );

  return NextResponse.json({
    content: prompt.content,
    is_default: prompt.is_default,
    is_customized: defaultPrompt ? prompt.content !== defaultPrompt.content : false,
    character_count: prompt.content.length,
    version: prompt.version,
  });
}

export async function PUT(request: NextRequest) {
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Contenido vacío' }, { status: 400 });
  }

  const userId = request.headers.get('x-user-id');

  // Desactivar el prompt actual
  await query('UPDATE system_prompts SET is_active = FALSE WHERE is_active = TRUE');

  // Obtener siguiente versión
  const maxVersion = await queryOne('SELECT MAX(version) AS max FROM system_prompts');
  const nextVersion = (maxVersion?.max ?? 0) + 1;

  // Insertar nuevo prompt activo
  await query(
    `INSERT INTO system_prompts (content, is_active, is_default, version, created_by)
     VALUES ($1, TRUE, FALSE, $2, $3)`,
    [content.trim(), nextVersion, userId ? parseInt(userId) : null]
  );

  return NextResponse.json({ success: true, version: nextVersion, character_count: content.trim().length });
}
