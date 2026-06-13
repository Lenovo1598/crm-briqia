import bcrypt from 'bcryptjs';

// Debe coincidir con PREFIX_LENGTH en lib/apiKeys.ts.
// No se importa ese módulo aquí porque usa el módulo `crypto` de Node,
// no soportado en el runtime Edge donde corre el middleware.
const PREFIX_LENGTH = 12;

/**
 * Verifica una API Key contra la tabla `api_keys` usando la API REST de
 * Supabase (compatible con el runtime Edge del middleware, que no soporta
 * conexiones TCP directas a Postgres).
 *
 * Devuelve el id de la API Key si es válida y no fue revocada, o `null`.
 */
export async function verifyApiKey(apiKey: string): Promise<number | null> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidos');
      return null;
    }

    const prefix = apiKey.slice(0, PREFIX_LENGTH);

    const res = await fetch(
      `${supabaseUrl}/rest/v1/api_keys?key_prefix=eq.${prefix}&revoked=eq.false&select=id,key_hash`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (!res.ok) return null;

    const rows: { id: number; key_hash: string }[] = await res.json();

    for (const row of rows) {
      if (await bcrypt.compare(apiKey, row.key_hash)) {
        // Fire-and-forget: actualizar último uso
        fetch(`${supabaseUrl}/rest/v1/api_keys?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ last_used_at: new Date().toISOString() }),
        }).catch(() => {});

        return row.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error verificando API Key:', error);
    return null;
  }
}
