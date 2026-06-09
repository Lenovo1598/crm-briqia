import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { formatSeguimientoLabel } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  try {
    // Pendientes agrupados por fecha
    const pendientesRows = await query(`
      SELECT
        DATE(fecha_programada AT TIME ZONE 'America/Argentina/Buenos_Aires') AS fecha,
        COUNT(*) AS mensajes
      FROM cola_seguimientos
      WHERE estado = 'pendiente'
      GROUP BY DATE(fecha_programada AT TIME ZONE 'America/Argentina/Buenos_Aires')
      ORDER BY fecha ASC
    `);

    const pendientes = pendientesRows.map((row: any) => ({
      fecha: row.fecha,
      label: formatSeguimientoLabel(row.fecha),
      mensajes: parseInt(row.mensajes, 10),
    }));

    // Enviados agrupados por fecha (últimos 20 días con envíos)
    const enviadosRows = await query(`
      SELECT
        DATE(fecha_programada AT TIME ZONE 'America/Argentina/Buenos_Aires') AS fecha,
        COUNT(*) AS mensajes
      FROM cola_seguimientos
      WHERE estado = 'enviado'
      GROUP BY DATE(fecha_programada AT TIME ZONE 'America/Argentina/Buenos_Aires')
      ORDER BY fecha DESC
      LIMIT 20
    `);

    const enviados = enviadosRows.map((row: any) => ({
      fecha: row.fecha,
      mensajes: parseInt(row.mensajes, 10),
    }));

    // Totales globales
    const totalesRows = await query(`
      SELECT
        COUNT(*) FILTER (WHERE estado = 'pendiente') AS total_pendientes,
        COUNT(*) FILTER (WHERE estado = 'enviado')   AS total_enviados
      FROM cola_seguimientos
    `);

    const totales = totalesRows[0] ?? { total_pendientes: 0, total_enviados: 0 };

    return NextResponse.json({
      pendientes,
      enviados,
      totalPendientes: parseInt(totales.total_pendientes, 10),
      totalEnviados:   parseInt(totales.total_enviados,   10),
    });
  } catch (error) {
    console.error('Error en GET /api/seguimientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener seguimientos' },
      { status: 500 }
    );
  }
}
