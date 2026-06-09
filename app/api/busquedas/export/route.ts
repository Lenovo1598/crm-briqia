import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const HEADERS = [
  'id','agente_cliente','tipo','direccion','zona',
  'valor_min','valor_max','dormitorios','banos',
  'patio_parque','garage','m2_const','lote','piso','apto_banco','notas',
  'created_at',
];

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const rows = await query(`SELECT ${HEADERS.join(', ')} FROM busquedas ORDER BY id`);

    const csv = [
      HEADERS.join(','),
      ...rows.map((r: any) => HEADERS.map(h => escapeCSV(r[h])).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="busquedas-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/busquedas/export:', error);
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 });
  }
}
