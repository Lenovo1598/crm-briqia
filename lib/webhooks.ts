import crypto from 'crypto';
import { query } from './db';

export type WebhookEvent = 'lead.created' | 'lead.updated';

/**
 * Dispara los webhooks activos suscritos a `event`, enviando `payload`
 * como JSON junto con una firma HMAC-SHA256 (header `X-Webhook-Signature`)
 * calculada con el secret de cada webhook.
 *
 * No bloquea al llamador: las requests HTTP se hacen en segundo plano.
 */
export async function dispatchWebhooks(event: WebhookEvent, payload: unknown): Promise<void> {
  try {
    const webhooks: { id: number; url: string; secret: string }[] = await query(
      `SELECT id, url, secret FROM webhooks WHERE activo = TRUE AND $1 = ANY(eventos)`,
      [event]
    );

    await Promise.allSettled(
      webhooks.map(async (wh) => {
        const body = JSON.stringify({ event, data: payload });
        const signature = crypto.createHmac('sha256', wh.secret).update(body).digest('hex');

        try {
          const res = await fetch(wh.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event,
              'X-Webhook-Signature': signature,
            },
            body,
          });
          await query(
            `UPDATE webhooks SET last_triggered_at = NOW(), last_status = $1 WHERE id = $2`,
            [res.status, wh.id]
          ).catch(() => {});
        } catch {
          await query(
            `UPDATE webhooks SET last_triggered_at = NOW(), last_status = NULL WHERE id = $1`,
            [wh.id]
          ).catch(() => {});
        }
      })
    );
  } catch (error) {
    console.error('Error obteniendo webhooks:', error);
  }
}
