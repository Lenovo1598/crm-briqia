-- ─────────────────────────────────────────
-- TABLA: demo_sessions (sesiones del demo público)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token   TEXT UNIQUE NOT NULL,
  lead_data       JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_activity   TIMESTAMPTZ DEFAULT NOW(),
  ip_address      TEXT,
  user_agent      TEXT
);

-- ─────────────────────────────────────────
-- TABLA: demo_messages (mensajes de cada sesión)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_messages (
  id          BIGSERIAL PRIMARY KEY,
  session_id  UUID REFERENCES demo_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(20),
  content     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLA: demo_seguimientos
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_seguimientos (
  id               BIGSERIAL PRIMARY KEY,
  session_id       UUID REFERENCES demo_sessions(id) ON DELETE CASCADE,
  descripcion      TEXT,
  fecha_programada TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para limpieza automática
CREATE INDEX IF NOT EXISTS idx_demo_sessions_last_activity ON demo_sessions(last_activity);
