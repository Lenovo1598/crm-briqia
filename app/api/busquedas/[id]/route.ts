import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const row = await queryOne('SELECT * FROM busquedas WHERE id = $1', [id]);
    if (!row) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error en GET /api/busquedas/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const fields = [
      'agente_cliente','tipo','direccion','zona',
      'valor_min','valor_max','dormitorios','banos',
      'patio_parque','garage','m2_const','lote','piso','apto_banco','notas',
    ];

    const updates: string[] = [];
    const values: any[]    = [];
    let i = 1;

    for (const f of fields) {
      if (f in body) {
        updates.push(`${f} = $${i++}`);
        values.push(body[f] ?? null);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const row = await queryOne(
      `UPDATE busquedas SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (!row) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error en PUT /api/busquedas/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await query('DELETE FROM busquedas WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/busquedas/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
