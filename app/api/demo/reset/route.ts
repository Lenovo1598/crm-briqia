import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('demo_session')?.value;

  if (sessionToken) {
    const session = await queryOne(
      'SELECT id FROM demo_sessions WHERE session_token = $1',
      [sessionToken]
    );

    if (session) {
      await query('DELETE FROM demo_messages WHERE session_id = $1', [session.id]);
      await query('DELETE FROM demo_seguimientos WHERE session_id = $1', [session.id]);
      await query(
        "UPDATE demo_sessions SET lead_data = '{}', last_activity = NOW() WHERE id = $1",
        [session.id]
      );

      return NextResponse.json({ success: true, session_id: session.id });
    }
  }

  // Si no hay sesión, crear una nueva
  const token = crypto.randomBytes(32).toString('hex');
  const ip = request.headers.get('x-forwarded-for') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;

  const rows = await query(
    `INSERT INTO demo_sessions (session_token, ip_address, user_agent)
     VALUES ($1, $2, $3) RETURNING id`,
    [token, ip, userAgent]
  );

  const response = NextResponse.json({ success: true, session_id: rows[0].id });
  response.cookies.set('demo_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}
