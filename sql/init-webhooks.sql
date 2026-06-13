-- Tabla de webhooks salientes (notificaciones a sistemas externos como n8n)
CREATE TABLE IF NOT EXISTS webhooks (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  eventos TEXT[] NOT NULL DEFAULT ARRAY['lead.created', 'lead.updated']::TEXT[],
  secret TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered_at TIMESTAMPTZ,
  last_status INTEGER
);
