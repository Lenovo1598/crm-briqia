import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Lead } from '@/lib/leads';

/**
 * GET /api/leads
 * Query params: ?estado=frio&search=nombre&propiedad=116
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');
    const propiedad = searchParams.get('propiedad');

    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (estado) {
      sql += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (nombre ILIKE $${paramIndex} OR whatsapp_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (propiedad) {
      sql += ` AND propiedad_interes = $${paramIndex}`;
      params.push(propiedad);
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
      presupuesto,
      zona,
      tipo_propiedad,
      forma_pago,
      intencion,
      propiedad_interes,
    } = body;

    if (!whatsapp_id) {
      return NextResponse.json(
        { error: 'whatsapp_id es requerido' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO leads (
        whatsapp_id, nombre, estado, presupuesto, zona,
        tipo_propiedad, forma_pago, intencion, propiedad_interes,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const lead = await queryOne(sql, [
      whatsapp_id,
      nombre || null,
      estado || 'frio',
      presupuesto || null,
      zona || null,
      tipo_propiedad || null,
      forma_pago || null,
      intencion || null,
      propiedad_interes || null,
    ]);

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
