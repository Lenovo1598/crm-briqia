import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const rows = await query(
      `SELECT
         c.*,
         COUNT(l.id)::int AS leads_total,
         COUNT(l.id) FILTER (WHERE l.temperatura = 'caliente')::int AS leads_calientes,
         COUNT(l.id) FILTER (WHERE l.temperatura = 'tibio')::int   AS leads_tibios,
         COUNT(l.id) FILTER (WHERE l.temperatura = 'frio')::int    AS leads_frios
       FROM campanas c
       LEFT JOIN leads l ON l.campana_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/campanas:', error);
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear campañas' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, plataforma, estado, presupuesto, fecha_inicio, fecha_fin, meta_campaign_id, descripcion } = body;

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const row = await queryOne(
      `INSERT INTO campanas (nombre, plataforma, estado, presupuesto, fecha_inicio, fecha_fin, meta_campaign_id, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nombre.trim(),
        plataforma || 'meta',
        estado || 'activa',
        presupuesto || null,
        fecha_inicio || null,
        fecha_fin || null,
        meta_campaign_id || null,
        descripcion || null,
      ]
    );

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/campanas:', error);
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 });
  }
}
