import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await query(
    `SELECT tipo, titulo, descripcion, ubicacion, zona, precio, moneda,
            estado, dormitorios, banos, m2
     FROM inventory_items
     ORDER BY created_at DESC`
  );

  const headers = ['tipo', 'titulo', 'descripcion', 'ubicacion', 'zona', 'precio', 'moneda', 'estado', 'dormitorios', 'banos', 'm2'];

  const escape = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = [
    headers.join(','),
    ...items.map((item: Record<string, unknown>) =>
      headers.map(h => escape(item[h])).join(',')
    ),
  ];

  const csv = rows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inventario-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
