import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface ApiKeyRecord {
  id: number;
  nombre: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
}

const PREFIX_LENGTH = 12;

/**
 * Genera una nueva API key con formato `crm_<random>`.
 * Devuelve la key en texto plano (mostrar solo una vez), su prefijo
 * (para identificarla en listados sin guardar el valor completo) y
 * su hash (para guardar en la base de datos).
 */
export async function generateApiKey(): Promise<{
  apiKey: string;
  prefix: string;
  hash: string;
}> {
  const apiKey = `crm_${crypto.randomBytes(32).toString('base64url')}`;
  const prefix = apiKey.slice(0, PREFIX_LENGTH);
  const hash = await bcrypt.hash(apiKey, 10);

  return { apiKey, prefix, hash };
}

export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, PREFIX_LENGTH);
}
