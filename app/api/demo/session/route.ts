import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('demo_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'No session' }, { status: 404 });
  }

  const session = await queryOne(
    'SELECT * FROM demo_sessions WHERE session_token = $1',
    [sessionToken]
  );

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const messages = await query(
    'SELECT role, content FROM demo_messages WHERE session_id = $1 ORDER BY created_at',
    [session.id]
  );

  const seguimientos = await query(
    'SELECT descripcion, fecha_programada FROM demo_seguimientos WHERE session_id = $1 ORDER BY created_at',
    [session.id]
  );

  return NextResponse.json({
    session_id: session.id,
    lead_data: session.lead_data || {},
    messages,
    seguimientos,
  });
}

export async function POST(request: NextRequest) {
  const token = crypto.randomBytes(32).toString('hex');
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;

  const rows = await query(
    `INSERT INTO demo_sessions (session_token, ip_address, user_agent)
     VALUES ($1, $2, $3)
     RETURNING id, session_token, lead_data`,
    [token, ip, userAgent]
  );
  const session = rows[0];

  const response = NextResponse.json({
    session_id: session.id,
    session_token: session.session_token,
    lead_data: {},
    messages: [],
  });

  response.cookies.set('demo_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  });

  return response;
}
