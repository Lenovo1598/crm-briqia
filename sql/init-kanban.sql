-- ═══════════════════════════════════════
-- TABLA: kanban_columns (Columnas del Kanban)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS kanban_columns (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE,
  orden      INTEGER NOT NULL,
  color      VARCHAR(50) DEFAULT '#6B7280',
  visible    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_columns_orden ON kanban_columns(orden);

-- Columnas según la temperatura del lead (frio / tibio / caliente)
INSERT INTO kanban_columns (nombre, orden, color, visible) VALUES
  ('Frío',     1, '#3B82F6', true),
  ('Tibio',    2, '#F59E0B', true),
  ('Caliente', 3, '#EF4444', true)
ON CONFLICT (nombre) DO NOTHING;

-- ═══════════════════════════════════════
-- VERIFICAR
-- ═══════════════════════════════════════
SELECT 'kanban_columns' as tabla, COUNT(*) as registros FROM kanban_columns
UNION ALL
SELECT 'leads' as tabla, COUNT(*) as registros FROM leads;
