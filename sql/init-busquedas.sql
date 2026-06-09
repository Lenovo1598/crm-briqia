-- ═══════════════════════════════════════
-- TABLA: busquedas
-- Ejecutar en Supabase / PostgreSQL
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS busquedas (
  id             SERIAL PRIMARY KEY,
  agente_cliente VARCHAR(200),
  tipo           VARCHAR(50),       -- 'CASA','DEPTO','PH','LOTE','LOCAL','GALPON','OFICINA'
  direccion      VARCHAR(255),
  zona           VARCHAR(255),
  valor_min      NUMERIC,
  valor_max      NUMERIC,
  dormitorios    INTEGER,
  banos          INTEGER,
  patio_parque   VARCHAR(50),       -- 'PATIO','PARQUE','BALCON','NINGUNO'
  garage         VARCHAR(50),       -- 'SI','NO','1','2','3+'
  m2_const       INTEGER,
  lote           INTEGER,
  piso           INTEGER,
  apto_banco     BOOLEAN,
  notas          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_busquedas_tipo  ON busquedas(tipo);
CREATE INDEX IF NOT EXISTS idx_busquedas_zona  ON busquedas(zona);
CREATE INDEX IF NOT EXISTS idx_busquedas_valor ON busquedas(valor_max);

-- Verificar
SELECT COUNT(*) AS total_busquedas FROM busquedas;
