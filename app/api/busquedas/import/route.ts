import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function toNullable(val: string | undefined): string | null {
  return val === '' || val === undefined ? null : val;
}

function toNullableNum(val: string | undefined): number | null {
  if (!val || val === '') return null;
  const n = parseFloat(val.replace(/[^\d.]/g, ''));
  return isNaN(n) ? null : n;
}

function toNullableBool(val: string | undefined): boolean | null {
  if (!val || val === '') return null;
  return val.toLowerCase() === 'si' || val.toLowerCase() === 'true';
}

/**
 * POST /api/busquedas/import
 * Body: multipart/form-data con campo "file" (CSV)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

    const text  = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'El CSV no tiene datos' }, { status: 400 });
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const rows    = lines.slice(1);

    const errors: string[]  = [];
    let   imported = 0;

    for (let i = 0; i < rows.length; i++) {
      try {
        const values = parseCSVLine(rows[i]);
        const d: Record<string, string> = {};
        headers.forEach((h, idx) => { d[h] = values[idx] ?? ''; });

        await query(
          `INSERT INTO busquedas
             (agente_cliente, tipo, direccion, zona, valor_min, valor_max,
              dormitorios, banos, patio_parque, garage, m2_const, lote, piso, apto_banco, notas)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            toNullable(d.agente_cliente),
            toNullable(d.tipo),
            toNullable(d.direccion),
            toNullable(d.zona),
            toNullableNum(d.valor_min),
            toNullableNum(d.valor_max),
            toNullableNum(d.dormitorios),
            toNullableNum(d.banos),
            toNullable(d.patio_parque),
            toNullable(d.garage),
            toNullableNum(d.m2_const),
            toNullableNum(d.lote),
            toNullableNum(d.piso),
            toNullableBool(d.apto_banco),
            toNullable(d.notas),
          ]
        );
        imported++;
      } catch (e: any) {
        errors.push(`Fila ${i + 2}: ${e.message}`);
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (error) {
    console.error('Error en POST /api/busquedas/import:', error);
    return NextResponse.json({ error: 'Error al importar' }, { status: 500 });
  }
}
