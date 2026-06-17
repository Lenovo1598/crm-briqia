import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden editar campañas' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const allowed = ['nombre', 'plataforma', 'estado', 'presupuesto', 'gastado', 'fecha_inicio', 'fecha_fin', 'meta_campaign_id', 'descripcion'];
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const field of allowed) {
      if (field in body) {
        updates.push(`${field} = $${i}`);
        values.push(body[field] ?? null);
        i++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const row = await queryOne(
      `UPDATE campanas SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (!row) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error en PUT /api/campanas/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar campaña' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar campañas' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await query('DELETE FROM campanas WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/campanas/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar campaña' }, { status: 500 });
  }
}
