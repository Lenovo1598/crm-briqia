import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { dispatchWebhooks } from '@/lib/webhooks';

/**
 * GET /api/leads/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const lead = await queryOne('SELECT * FROM leads WHERE id = $1', [id]);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error en GET /api/leads/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener lead' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Actualizar lead
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Construir query dinámico
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'nombre',
      'estado',
      'temperatura',
      'pais_residencia',
      'monto_inversion',
      'plazo_inicio',
      'medio_contacto_preferido',
      'horario_contacto_preferido',
      'conocimiento_realestate_usa',
      'tiene_cuenta_bancaria_usa',
      'tiene_empresa_usa',
      'interes_visa_e2',
      'campana_id',
    ];

    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field] ?? null);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE leads
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const lead = await queryOne(sql, values);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    await dispatchWebhooks('lead.updated', lead);

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error en PUT /api/leads/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await query('DELETE FROM leads WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/leads/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar lead' },
      { status: 500 }
    );
  }
}
