// ═══════════════════════════════════════
// HELPERS DE FORMATO
// ═══════════════════════════════════════

/**
 * Devuelve "Hoy", "Mañana" o "mié, 3 jun" para una fecha ISO.
 * Compara fechas en zona horaria local del servidor/browser.
 */
export function formatSeguimientoLabel(fecha: string | Date): string {
  const date = new Date(fecha);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const toDay = (d: Date) => d.toDateString();

  if (toDay(date) === toDay(today)) return 'Hoy';
  if (toDay(date) === toDay(tomorrow)) return 'Mañana';

  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formatea una fecha como "mié, 3 jun" (sin distinguir hoy/mañana).
 */
export function formatSeguimientoDate(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formatea moneda en USD. 1500 → "US$ 1.5k", 500 → "US$ 500"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (!value) return 'US$ 0';
  if (value >= 1000) return `US$ ${(value / 1000).toFixed(0)}k`;
  return `US$ ${value}`;
}

/**
 * Formatea un número de teléfono WhatsApp eliminando sufijos de Baileys.
 */
export function formatPhone(remote_jid: string): string {
  return remote_jid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@g.us', '');
}
