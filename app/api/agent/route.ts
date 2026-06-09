import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

/**
 * GET /api/agent
 * Obtener estado del agente
 */
export async function GET() {
  try {
    const status = await queryOne(
      'SELECT is_active FROM agent_status WHERE id = 1'
    );

    if (!status) {
      // Crear por defecto si no existe
      await query(
        'INSERT INTO agent_status (id, is_active) VALUES (1, true) ON CONFLICT DO NOTHING'
      );
      return NextResponse.json({ is_active: true });
    }

    return NextResponse.json({ is_active: status.is_active });
  } catch (error) {
    console.error('Error en GET /api/agent:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado del agente' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agent
 * Actualizar estado del agente (solo admin)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verificar que sea admin
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden cambiar el estado del agente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active debe ser booleano' },
        { status: 400 }
      );
    }

    const status = await queryOne(
      'UPDATE agent_status SET is_active = $1, updated_at = NOW() WHERE id = 1 RETURNING *',
      [is_active]
    );

    if (!status) {
      // Crear si no existe
      const newStatus = await queryOne(
        'INSERT INTO agent_status (id, is_active) VALUES (1, $1) RETURNING *',
        [is_active]
      );
      return NextResponse.json(newStatus);
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error en PUT /api/agent:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado del agente' },
      { status: 500 }
    );
  }
}
