import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { generateApiKey } from '@/lib/apiKeys';

/**
 * GET /api/api-keys
 * Lista las API Keys (sin exponer el hash). Solo admin.
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver las API Keys' },
        { status: 403 }
      );
    }

    const rows = await query(
      `SELECT id, nombre, key_prefix, created_at, last_used_at, revoked, revoked_at
       FROM api_keys
       ORDER BY created_at DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/api-keys:', error);
    return NextResponse.json(
      { error: 'Error al obtener API Keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Crea una nueva API Key. Solo admin.
 * La key en texto plano se devuelve una única vez.
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear API Keys' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nombre = (body?.nombre || '').trim();

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');
    const { apiKey, prefix, hash } = await generateApiKey();

    const row = await queryOne(
      `INSERT INTO api_keys (nombre, key_hash, key_prefix, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, key_prefix, created_at, last_used_at, revoked, revoked_at`,
      [nombre, hash, prefix, userId ? parseInt(userId, 10) : null]
    );

    return NextResponse.json({ ...row, api_key: apiKey }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/api-keys:', error);
    return NextResponse.json(
      { error: 'Error al crear API Key' },
      { status: 500 }
    );
  }
}
