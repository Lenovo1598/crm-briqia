import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

/**
 * DELETE /api/api-keys/[id]
 * Revoca una API Key (no la elimina, queda marcada como revocada). Solo admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden revocar API Keys' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const row = await queryOne(
      `UPDATE api_keys
       SET revoked = TRUE, revoked_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (!row) {
      return NextResponse.json({ error: 'API Key no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: 'Error al revocar API Key' },
      { status: 500 }
    );
  }
}
