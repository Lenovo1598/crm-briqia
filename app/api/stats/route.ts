import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to   = searchParams.get('to');

    // Totales globales y por ventana fija
    const totalesRows = await query(`
      SELECT
        COUNT(*)                                                        AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')  AS last7days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS last30days
      FROM leads
    `);
    const totales = totalesRows[0] ?? { total: 0, last7days: 0, last30days: 0 };

    // Serie diaria para el gráfico (rango seleccionado)
    let byDate: any[] = [];
    if (from && to) {
      const rows = await query(
        `SELECT
           DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') AS date,
           COUNT(*)                                                         AS total,
           COUNT(*) FILTER (WHERE estado ILIKE 'frío' OR estado ILIKE 'frio')      AS frio,
           COUNT(*) FILTER (WHERE estado ILIKE 'tibio')                            AS tibio,
           COUNT(*) FILTER (WHERE estado ILIKE 'caliente')                         AS caliente
         FROM leads
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires')
         ORDER BY date`,
        [from, to]
      );

      byDate = rows.map((r: any) => ({
        date:     r.date,
        total:    parseInt(r.total,    10),
        frio:     parseInt(r.frio,     10),
        tibio:    parseInt(r.tibio,    10),
        caliente: parseInt(r.caliente, 10),
      }));
    }

    return NextResponse.json({
      total:      parseInt(totales.total,      10),
      last7days:  parseInt(totales.last7days,  10),
      last30days: parseInt(totales.last30days, 10),
      byDate,
    });
  } catch (error) {
    console.error('Error en GET /api/stats:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
