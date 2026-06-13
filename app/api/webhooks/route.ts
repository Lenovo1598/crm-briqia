import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query, queryOne } from '@/lib/db';

const VALID_EVENTS = ['lead.created', 'lead.updated'];

/**
 * GET /api/webhooks
 * Lista los webhooks configurados. Solo admin.
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver los webhooks' },
        { status: 403 }
      );
    }

    const rows = await query(
      `SELECT id, nombre, url, eventos, secret, activo, created_at, last_triggered_at, last_status
       FROM webhooks
       ORDER BY created_at DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/webhooks:', error);
    return NextResponse.json(
      { error: 'Error al obtener webhooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks
 * Crea un nuevo webhook saliente. Solo admin.
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear webhooks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nombre = (body?.nombre || '').trim();
    const url = (body?.url || '').trim();
    const eventos = Array.isArray(body?.eventos)
      ? body.eventos.filter((e: string) => VALID_EVENTS.includes(e))
      : [];

    if (!nombre || !url) {
      return NextResponse.json(
        { error: 'Nombre y URL son requeridos' },
        { status: 400 }
      );
    }

    if (eventos.length === 0) {
      return NextResponse.json(
        { error: 'Seleccioná al menos un evento' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    const secret = crypto.randomBytes(24).toString('hex');

    const row = await queryOne(
      `INSERT INTO webhooks (nombre, url, eventos, secret)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, url, eventos, secret, activo, created_at, last_triggered_at, last_status`,
      [nombre, url, eventos, secret]
    );

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/webhooks:', error);
    return NextResponse.json(
      { error: 'Error al crear webhook' },
      { status: 500 }
    );
  }
}
