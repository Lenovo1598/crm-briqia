-- ═══════════════════════════════════════
-- MIGRACIÓN: Agregar columna `visible` a kanban_columns
-- Ejecutar una sola vez en Supabase / PostgreSQL
-- ═══════════════════════════════════════

ALTER TABLE kanban_columns
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;

-- Actualizar columnas existentes con los valores del diseño
-- (Trash y Activo van ocultas por defecto según arquitectura)
UPDATE kanban_columns SET visible = FALSE WHERE nombre IN ('Trash', 'Activo');
UPDATE kanban_columns SET visible = TRUE  WHERE nombre NOT IN ('Trash', 'Activo');

-- Verificar resultado
SELECT id, nombre, orden, color, visible FROM kanban_columns ORDER BY orden;
