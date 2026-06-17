import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Lead } from '@/lib/leads';
import { dispatchWebhooks } from '@/lib/webhooks';

/**
 * GET /api/leads
 * Query params: ?temperatura=frio&search=nombre&pais=Mexico
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const temperatura = searchParams.get('temperatura');
    const search = searchParams.get('search');
    const pais = searchParams.get('pais');

    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (temperatura) {
      sql += ` AND temperatura = $${paramIndex}`;
      params.push(temperatura);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (nombre ILIKE $${paramIndex} OR whatsapp_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (pais) {
      sql += ` AND pais_residencia = $${paramIndex}`;
      params.push(pais);
      paramIndex++;
    }

    sql += ' ORDER BY updated_at DESC';

    const leads = await query(sql, params);

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error en GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Crear nuevo lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      whatsapp_id,
      nombre,
      estado,
      temperatura,
      pais_residencia,
      monto_inversion,
      plazo_inicio,
      medio_contacto_preferido,
      horario_contacto_preferido,
      conocimiento_realestate_usa,
      tiene_cuenta_bancaria_usa,
      tiene_empresa_usa,
      interes_visa_e2,
    } = body;

    if (!whatsapp_id) {
      return NextResponse.json(
        { error: 'whatsapp_id es requerido' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO leads (
        whatsapp_id, nombre, estado, temperatura, pais_residencia,
        monto_inversion, plazo_inicio, medio_contacto_preferido,
        horario_contacto_preferido, conocimiento_realestate_usa,
        tiene_cuenta_bancaria_usa, tiene_empresa_usa, interes_visa_e2,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *
    `;

    const lead = await queryOne(sql, [
      whatsapp_id,
      nombre || null,
      estado || 'frio',
      temperatura || 'frio',
      pais_residencia || null,
      monto_inversion || null,
      plazo_inicio || null,
      medio_contacto_preferido || null,
      horario_contacto_preferido || null,
      conocimiento_realestate_usa || null,
      tiene_cuenta_bancaria_usa || null,
      tiene_empresa_usa || null,
      interes_visa_e2 || null,
    ]);

    await dispatchWebhooks('lead.created', lead);

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/leads:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Lead con este whatsapp_id ya existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear lead' },
      { status: 500 }
    );
  }
}
