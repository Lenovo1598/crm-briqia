import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

/**
 * GET /api/busquedas?search=&tipo=
 * Devuelve todas las búsquedas con el conteo de matches de propiedades.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const tipo   = searchParams.get('tipo')?.trim()   || '';

    const rows = await query(
      `SELECT
         b.*,
         (
           SELECT COUNT(*)
           FROM propiedades p
           WHERE
             (b.tipo       IS NULL OR p.tipo      = b.tipo)
             AND (b.zona   IS NULL OR p.zona ILIKE '%' || b.zona || '%')
             AND (b.valor_max IS NULL OR p.valor  <= b.valor_max)
             AND (b.valor_min IS NULL OR p.valor  >= b.valor_min)
             AND (b.dormitorios IS NULL OR p.dormitorios >= b.dormitorios)
             AND (b.banos      IS NULL OR p.banos        >= b.banos)
             AND (b.garage     IS NULL OR p.garage        = b.garage)
             AND (b.apto_banco IS NULL OR p.apto_banco    = b.apto_banco)
         ) AS matches_count
       FROM busquedas b
       WHERE
         ($1 = '' OR b.agente_cliente ILIKE '%' || $1 || '%' OR b.direccion ILIKE '%' || $1 || '%' OR b.zona ILIKE '%' || $1 || '%')
         AND ($2 = '' OR b.tipo = $2)
       ORDER BY b.id DESC`,
      [search, tipo]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/busquedas:', error);
    return NextResponse.json({ error: 'Error al obtener búsquedas' }, { status: 500 });
  }
}

/**
 * POST /api/busquedas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agente_cliente, tipo, direccion, zona,
      valor_min, valor_max, dormitorios, banos,
      patio_parque, garage, m2_const, lote, piso, apto_banco, notas,
    } = body;

    const row = await queryOne(
      `INSERT INTO busquedas
         (agente_cliente, tipo, direccion, zona, valor_min, valor_max,
          dormitorios, banos, patio_parque, garage, m2_const, lote, piso, apto_banco, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        agente_cliente || null, tipo || null, direccion || null, zona || null,
        valor_min || null, valor_max || null,
        dormitorios || null, banos || null,
        patio_parque || null, garage || null,
        m2_const || null, lote || null, piso || null,
        apto_banco ?? null, notas || null,
      ]
    );

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/busquedas:', error);
    return NextResponse.json({ error: 'Error al crear búsqueda' }, { status: 500 });
  }
}
