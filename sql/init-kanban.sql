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

-- Insertar todas las columnas del diseño
INSERT INTO kanban_columns (nombre, orden, color, visible) VALUES
  ('Llamada',                  1,  '#10B981', true),
  ('Visita',                   2,  '#3B82F6', true),
  ('Referidos',                3,  '#8B5CF6', true),
  ('Busquedas Trash',          4,  '#6B7280', true),
  ('Agentes',                  5,  '#10B981', true),
  ('Alquiler',                 6,  '#3B82F6', true),
  ('Llamadas Realizadas',      7,  '#10B981', true),
  ('Busqueda',                 8,  '#EF4444', true),
  ('Busquedas Realizadas',     9,  '#8B5CF6', true),
  ('Vender',                   10, '#3B82F6', true),
  ('Freno La Busqueda',        11, '#EC4899', true),
  ('Caliente',                 12, '#EF4444', true),
  ('Busqueda Higth Ticket',    13, '#F59E0B', true),
  ('Team Ali',                 14, '#3B82F6', true),
  ('Trabaja Con Otro Agente',  15, '#10B981', true),
  ('Ya Resolvió',              16, '#F59E0B', true),
  ('Seguimiento De Magui',     17, '#8B5CF6', true),
  ('Seguimiento Nanu',         18, '#EC4899', true),
  ('Tibio',                    19, '#F59E0B', true),
  ('Trash',                    20, '#6B7280', false),
  ('Frío',                     21, '#6B7280', true),
  ('Clientes',                 22, '#10B981', true),
  ('Activo',                   23, '#6B7280', false)
ON CONFLICT (nombre) DO NOTHING;

-- ═══════════════════════════════════════
-- VERIFICAR
-- ═══════════════════════════════════════
SELECT 'kanban_columns' as tabla, COUNT(*) as registros FROM kanban_columns
UNION ALL
SELECT 'leads' as tabla, COUNT(*) as registros FROM leads;
