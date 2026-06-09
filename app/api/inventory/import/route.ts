import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const VALID_TIPOS = ['apartment', 'house', 'ph', 'office', 'land', 'commercial'];
const VALID_ESTADOS = ['Disponible', 'Reservado', 'Vendido'];
const VALID_MONEDAS = ['ARS', 'USD'];

interface RawRow {
  tipo?: string;
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  zona?: string;
  precio?: string | number;
  moneda?: string;
  estado?: string;
  dormitorios?: string | number;
  banos?: string | number;
  m2?: string | number;
  [key: string]: unknown;
}

function parseCSV(text: string): RawRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    // Simple CSV parse (handles basic quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += char;
    }
    values.push(current.trim());

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as RawRow;
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
  }

  const text = await file.text();
  let rows: RawRow[] = [];

  try {
    if (file.name.endsWith('.json')) {
      rows = JSON.parse(text);
      if (!Array.isArray(rows)) {
        return NextResponse.json({ error: 'El JSON debe ser un array de objetos' }, { status: 400 });
      }
    } else {
      rows = parseCSV(text);
    }
  } catch {
    return NextResponse.json({ error: 'Error al parsear el archivo' }, { status: 400 });
  }

  const errors: { row: number; error: string }[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +1 header, +1 base-1

    if (!row.titulo?.toString().trim()) {
      errors.push({ row: rowNum, error: "Campo 'titulo' es obligatorio" });
      continue;
    }

    if (row.tipo && !VALID_TIPOS.includes(row.tipo.toString())) {
      errors.push({ row: rowNum, error: `Tipo '${row.tipo}' no es válido` });
      continue;
    }

    const precio = row.precio !== '' && row.precio !== undefined ? parseFloat(String(row.precio)) : null;
    if (precio !== null && (isNaN(precio) || precio <= 0)) {
      errors.push({ row: rowNum, error: 'Precio debe ser numérico y mayor a 0' });
      continue;
    }

    const moneda = row.moneda && VALID_MONEDAS.includes(row.moneda.toString()) ? row.moneda : 'ARS';
    const estado = row.estado && VALID_ESTADOS.includes(row.estado.toString()) ? row.estado : 'Disponible';

    try {
      await query(
        `INSERT INTO inventory_items
           (tipo, titulo, descripcion, ubicacion, zona, precio, moneda, estado, dormitorios, banos, m2)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          row.tipo?.toString() || null,
          row.titulo.toString().trim(),
          row.descripcion?.toString() || null,
          row.ubicacion?.toString() || null,
          row.zona?.toString() || null,
          precio,
          moneda,
          estado,
          row.dormitorios ? parseInt(String(row.dormitorios)) : null,
          row.banos ? parseInt(String(row.banos)) : null,
          row.m2 ? parseInt(String(row.m2)) : null,
        ]
      );
      imported++;
    } catch {
      errors.push({ row: rowNum, error: 'Error al insertar en DB' });
    }
  }

  return NextResponse.json({ imported, failed: errors.length, errors });
}
