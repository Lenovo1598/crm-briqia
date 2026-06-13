import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

/**
 * PATCH /api/webhooks/[id]
 * Activa/desactiva un webhook. Solo admin.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden modificar webhooks' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    if (typeof body?.activo !== 'boolean') {
      return NextResponse.json({ error: 'Campo activo requerido' }, { status: 400 });
    }

    const row = await queryOne(
      `UPDATE webhooks SET activo = $1 WHERE id = $2
       RETURNING id, nombre, url, eventos, secret, activo, created_at, last_triggered_at, last_status`,
      [body.activo, id]
    );

    if (!row) {
      return NextResponse.json({ error: 'Webhook no encontrado' }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Error en PATCH /api/webhooks/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar webhook' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/[id]
 * Elimina un webhook. Solo admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar webhooks' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await query(`DELETE FROM webhooks WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/webhooks/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar webhook' },
      { status: 500 }
    );
  }
}
