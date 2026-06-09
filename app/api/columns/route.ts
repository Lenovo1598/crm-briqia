import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

/**
 * GET /api/columns
 * ?all=true → devuelve todas (incluye ocultas)
 * por defecto → solo las visibles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const sql = all
      ? 'SELECT * FROM kanban_columns ORDER BY orden ASC'
      : 'SELECT * FROM kanban_columns WHERE visible = TRUE ORDER BY orden ASC';

    const columns = await query(sql);
    return NextResponse.json(columns);
  } catch (error) {
    console.error('Error en GET /api/columns:', error);
    return NextResponse.json({ error: 'Error al obtener columnas' }, { status: 500 });
  }
}

/**
 * POST /api/columns
 * Body: { nombre, color? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, color } = body;

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'Nombre de columna es requerido' }, { status: 400 });
    }

    const maxOrder = await queryOne('SELECT MAX(orden) as max_orden FROM kanban_columns');
    const nextOrder = (maxOrder?.max_orden ?? 0) + 1;

    const column = await queryOne(
      `INSERT INTO kanban_columns (nombre, orden, color, visible)
       VALUES ($1, $2, $3, TRUE)
       RETURNING *`,
      [nombre.trim(), nextOrder, color || '#6B7280']
    );

    return NextResponse.json(column, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/columns:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una columna con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al crear columna' }, { status: 500 });
  }
}
