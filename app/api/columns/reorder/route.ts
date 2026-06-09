import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

interface ReorderUpdate {
  id: number;
  orden: number;
  visible: boolean;
}

/**
 * PUT /api/columns/reorder
 * Body: { updates: [{ id, orden, visible }] }
 * Guarda el orden y visibilidad de múltiples columnas en una sola transacción.
 */
export async function PUT(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const updates: ReorderUpdate[] = body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de updates' }, { status: 400 });
    }

    const pool = getPool();
    client = await pool.connect();

    await client.query('BEGIN');

    for (const { id, orden, visible } of updates) {
      await client.query(
        'UPDATE kanban_columns SET orden = $1, visible = $2 WHERE id = $3',
        [orden, visible, id]
      );
    }

    await client.query('COMMIT');

    const result = await client.query('SELECT * FROM kanban_columns ORDER BY orden ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Error en PUT /api/columns/reorder:', error);
    return NextResponse.json({ error: 'Error al reordenar columnas' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
