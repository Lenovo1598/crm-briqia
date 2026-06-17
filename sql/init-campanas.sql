-- Tabla de campañas publicitarias (Meta Ads, etc.)
CREATE TABLE IF NOT EXISTS campanas (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(200) NOT NULL,
  plataforma       VARCHAR(50)  NOT NULL DEFAULT 'meta',
  estado           VARCHAR(20)  NOT NULL DEFAULT 'activa'
                   CHECK (estado IN ('activa', 'pausada', 'terminada')),
  presupuesto      NUMERIC(12,2),
  gastado          NUMERIC(12,2) DEFAULT 0,
  fecha_inicio     DATE,
  fecha_fin        DATE,
  meta_campaign_id VARCHAR(100),
  descripcion      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Vincular leads a campañas (nullable: leads sin origen conocido)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS campana_id INTEGER REFERENCES campanas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_campana_id ON leads(campana_id);
