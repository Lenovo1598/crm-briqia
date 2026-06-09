import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

const VALID_TIPOS = ['apartment', 'house', 'ph', 'office', 'land', 'commercial'];
const VALID_ESTADOS = ['Disponible', 'Reservado', 'Vendido'];
const VALID_MONEDAS = ['ARS', 'USD'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const tipo = searchParams.get('tipo') ?? '';
  const estado = searchParams.get('estado') ?? '';

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`(titulo ILIKE $${idx} OR ubicacion ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (tipo) {
    conditions.push(`tipo = $${idx}`);
    params.push(tipo);
    idx++;
  }
  if (estado) {
    conditions.push(`estado = $${idx}`);
    params.push(estado);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const items = await query(
    `SELECT id, tipo, titulo, ubicacion, zona, precio, moneda, estado, dormitorios, banos, m2, created_at
     FROM inventory_items ${where}
     ORDER BY created_at DESC`,
    params
  );

  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.titulo?.trim()) {
    return NextResponse.json({ error: "Campo 'titulo' es obligatorio" }, { status: 400 });
  }
  if (body.tipo && !VALID_TIPOS.includes(body.tipo)) {
    return NextResponse.json({ error: `Tipo '${body.tipo}' no es válido` }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO inventory_items
       (tipo, titulo, descripcion, ubicacion, zona, precio, moneda, estado, dormitorios, banos, m2, caracteristicas)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      body.tipo || null,
      body.titulo.trim(),
      body.descripcion || null,
      body.ubicacion || null,
      body.zona || null,
      body.precio ? Number(body.precio) : null,
      VALID_MONEDAS.includes(body.moneda) ? body.moneda : 'ARS',
      VALID_ESTADOS.includes(body.estado) ? body.estado : 'Disponible',
      body.dormitorios ? parseInt(body.dormitorios) : null,
      body.banos ? parseInt(body.banos) : null,
      body.m2 ? parseInt(body.m2) : null,
      JSON.stringify(body.caracteristicas || []),
    ]
  );

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('confirm') !== 'YES_DELETE_ALL') {
    return NextResponse.json(
      { error: 'Se requiere confirm=YES_DELETE_ALL' },
      { status: 400 }
    );
  }

  const result = await queryOne('SELECT COUNT(*) AS count FROM inventory_items');
  await query('DELETE FROM inventory_items');

  return NextResponse.json({ deleted: parseInt(result?.count ?? '0') });
}
