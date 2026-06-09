import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Obtener pool de conexiones a PostgreSQL
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está definido en .env.local');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('Pool error:', err);
    });
  }

  return pool;
}

/**
 * Ejecutar query
 */
export async function query(
  text: string,
  params?: any[]
): Promise<any> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtener una fila
 */
export async function queryOne(
  text: string,
  params?: any[]
): Promise<any | null> {
  const rows = await query(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Inicializar tablas de usuarios (ejecutar una sola vez)
 */
export async function initializeTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      nombre VARCHAR(200),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✅ Tabla users inicializada');
}
