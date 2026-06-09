import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const INBOX_ID = process.env.CHATWOOT_INBOX_ID || '1';

/**
 * GET /api/chats?search=nombre
 * Lee conversations + contacts desde las tablas de Chatwoot (misma DB).
 * Hace LEFT JOIN con leads para enriquecer con presupuesto/zona/propiedad.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const rows = await query(
      `SELECT
         conv.id,
         conv.display_id,
         ct.name,
         ct.phone_number                                          AS phone,
         ct.identifier,
         conv.status,
         conv.unread_count,
         conv.updated_at,
         -- Último mensaje (ignorar actividades internas)
         (
           SELECT content
           FROM   messages
           WHERE  conversation_id = conv.id
             AND  message_type    IN (0, 1)
             AND  (private IS NULL OR private = FALSE)
             AND  content IS NOT NULL AND content <> ''
           ORDER  BY created_at DESC
           LIMIT  1
         ) AS last_message,
         -- Datos del lead vinculado por número de teléfono
         l.presupuesto,
         l.zona,
         l.propiedad_interes,
         l.estado
       FROM conversations conv
       JOIN contacts ct ON ct.id = conv.contact_id
       LEFT JOIN leads l
         ON REGEXP_REPLACE(l.whatsapp_id, '[^0-9]', '', 'g')
            LIKE '%' || REGEXP_REPLACE(COALESCE(ct.phone_number, ct.identifier, ''), '[^0-9]', '', 'g') || '%'
       WHERE conv.inbox_id = $1
         AND (
               $2 = ''
               OR ct.name         ILIKE '%' || $2 || '%'
               OR ct.phone_number ILIKE '%' || $2 || '%'
               OR ct.identifier   ILIKE '%' || $2 || '%'
             )
       ORDER BY conv.updated_at DESC
       LIMIT 100`,
      [INBOX_ID, search]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/chats:', error);
    return NextResponse.json({ error: 'Error al obtener chats' }, { status: 500 });
  }
}
