import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    let sql = 'SELECT * FROM mensajes_pendientes WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (estado) {
      sql += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    sql += ' ORDER BY fecha_recibido DESC';

    const mensajes = await query(sql, params);
    return NextResponse.json(mensajes);
  } catch (error) {
    console.error('Error en GET /api/mensajes-pendientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes pendientes' },
      { status: 500 }
    );
  }
}
