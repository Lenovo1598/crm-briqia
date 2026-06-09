import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

/**
 * GET /api/messages/[chatId]
 * Lee mensajes de una conversación desde las tablas de Chatwoot.
 * message_type: 0 = incoming (cliente), 1 = outgoing (agente/bot), 2 = activity (ignorar)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId, 10);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'ID de chat inválido' }, { status: 400 });
    }

    // Info del chat (conversación + contacto)
    const chat = await queryOne(
      `SELECT
         conv.id,
         conv.display_id,
         conv.status,
         ct.name,
         ct.phone_number AS phone,
         ct.identifier
       FROM conversations conv
       JOIN contacts ct ON ct.id = conv.contact_id
       WHERE conv.id = $1`,
      [chatId]
    );

    if (!chat) {
      return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 });
    }

    // Mensajes (excluye actividades internas y mensajes privados)
    const messages = await query(
      `SELECT
         m.id,
         m.content,
         m.message_type,
         m.created_at,
         CASE WHEN m.message_type = 0 THEN 'incoming' ELSE 'outgoing' END AS type,
         TO_CHAR(m.created_at AT TIME ZONE 'America/Argentina/Buenos_Aires', 'HH12:MI AM') AS time
       FROM messages m
       WHERE m.conversation_id = $1
         AND m.message_type   IN (0, 1)
         AND (m.private IS NULL OR m.private = FALSE)
         AND m.content IS NOT NULL
         AND m.content <> ''
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [chatId]
    );

    return NextResponse.json({ chat, messages });
  } catch (error) {
    console.error('Error en GET /api/messages/[chatId]:', error);
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 });
  }
}
