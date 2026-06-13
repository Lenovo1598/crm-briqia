-- Tabla de API Keys persistentes para integraciones externas (n8n, Meta Ads, etc.)
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
