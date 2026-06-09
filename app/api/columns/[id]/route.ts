import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

/**
 * PUT /api/columns/[id]
 * Body: { nombre?, color?, orden?, visible? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, color, orden, visible } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (nombre !== undefined) { updates.push(`nombre = $${i++}`); values.push(nombre); }
    if (color !== undefined)  { updates.push(`color = $${i++}`);  values.push(color);  }
    if (orden !== undefined)  { updates.push(`orden = $${i++}`);  values.push(orden);  }
    if (visible !== undefined){ updates.push(`visible = $${i++}`);values.push(visible);}

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    values.push(id);
    const column = await queryOne(
      `UPDATE kanban_columns SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (!column) {
      return NextResponse.json({ error: 'Columna no encontrada' }, { status: 404 });
    }

    return NextResponse.json(column);
  } catch (error) {
    console.error('Error en PUT /api/columns/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar columna' }, { status: 500 });
  }
}

/**
 * DELETE /api/columns/[id]
 * Verifica que no haya leads huérfanos antes de eliminar.
 * Query param ?force=true elimina sin verificar (también borra los leads).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const column = await queryOne('SELECT * FROM kanban_columns WHERE id = $1', [id]);
    if (!column) {
      return NextResponse.json({ error: 'Columna no encontrada' }, { status: 404 });
    }

    // Contar leads con este estado
    const leadsCount = await queryOne(
      'SELECT COUNT(*) as count FROM leads WHERE estado = $1',
      [column.nombre]
    );
    const count = parseInt(leadsCount?.count ?? '0', 10);

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const moveTo = searchParams.get('moveTo');

    if (count > 0 && !force && !moveTo) {
      return NextResponse.json(
        { error: 'La columna tiene leads', count, columnName: column.nombre },
        { status: 409 }
      );
    }

    if (count > 0 && moveTo) {
      await query('UPDATE leads SET estado = $1 WHERE estado = $2', [moveTo, column.nombre]);
    }

    await query('DELETE FROM kanban_columns WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/columns/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar columna' }, { status: 500 });
  }
}
