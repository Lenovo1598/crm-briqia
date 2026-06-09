import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

/**
 * GET /api/busquedas/[id]/matches
 * Devuelve las propiedades que cumplen los criterios de la búsqueda.
 * match_score = cuántos criterios cumple (para ordenar por relevancia).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const busqueda = await queryOne('SELECT * FROM busquedas WHERE id = $1', [id]);
    if (!busqueda) return NextResponse.json({ error: 'Búsqueda no encontrada' }, { status: 404 });

    const matches = await query(
      `SELECT
         p.*,
         (
           CASE WHEN $1::text    IS NULL OR p.tipo      = $1             THEN 1 ELSE 0 END +
           CASE WHEN $2::text    IS NULL OR p.zona ILIKE '%' || $2 || '%' THEN 1 ELSE 0 END +
           CASE WHEN $3::numeric IS NULL OR p.valor     <= $3             THEN 1 ELSE 0 END +
           CASE WHEN $4::numeric IS NULL OR p.valor     >= $4             THEN 1 ELSE 0 END +
           CASE WHEN $5::integer IS NULL OR p.dormitorios >= $5           THEN 1 ELSE 0 END +
           CASE WHEN $6::integer IS NULL OR p.banos       >= $6           THEN 1 ELSE 0 END +
           CASE WHEN $7::text    IS NULL OR p.garage       = $7           THEN 1 ELSE 0 END +
           CASE WHEN $8::boolean IS NULL OR p.apto_banco   = $8           THEN 1 ELSE 0 END
         ) AS match_score
       FROM propiedades p
       WHERE
         ($1::text    IS NULL OR p.tipo        = $1)
         AND ($2::text    IS NULL OR p.zona ILIKE '%' || $2 || '%')
         AND ($3::numeric IS NULL OR p.valor   <= $3)
         AND ($4::numeric IS NULL OR p.valor   >= $4)
         AND ($5::integer IS NULL OR p.dormitorios >= $5)
         AND ($6::integer IS NULL OR p.banos       >= $6)
         AND ($7::text    IS NULL OR p.garage        = $7)
         AND ($8::boolean IS NULL OR p.apto_banco    = $8)
       ORDER BY match_score DESC
       LIMIT 50`,
      [
        busqueda.tipo       ?? null,
        busqueda.zona       ?? null,
        busqueda.valor_max  ?? null,
        busqueda.valor_min  ?? null,
        busqueda.dormitorios ?? null,
        busqueda.banos      ?? null,
        busqueda.garage     ?? null,
        busqueda.apto_banco ?? null,
      ]
    );

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error en GET /api/busquedas/[id]/matches:', error);
    return NextResponse.json({ error: 'Error al obtener matches' }, { status: 500 });
  }
}
