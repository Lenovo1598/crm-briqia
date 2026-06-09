-- ─────────────────────────────────────────
-- TABLA: inventory_items
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        VARCHAR(50),
  titulo      TEXT NOT NULL,
  descripcion TEXT,
  ubicacion   VARCHAR(255),
  zona        VARCHAR(100),
  precio      NUMERIC,
  moneda      VARCHAR(10) DEFAULT 'ARS',
  estado      VARCHAR(50) DEFAULT 'Disponible',
  dormitorios INTEGER,
  banos       INTEGER,
  m2          INTEGER,
  caracteristicas JSONB DEFAULT '[]',
  imagenes    JSONB DEFAULT '[]',
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tipo    ON inventory_items(tipo);
CREATE INDEX IF NOT EXISTS idx_inventory_estado  ON inventory_items(estado);
CREATE INDEX IF NOT EXISTS idx_inventory_zona    ON inventory_items(zona);

-- ─────────────────────────────────────────
-- TABLA: system_prompts (versionado)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_prompts (
  id          SERIAL PRIMARY KEY,
  content     TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT FALSE,
  is_default  BOOLEAN DEFAULT FALSE,
  version     INTEGER,
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt default inicial (solo si no existe ninguno)
INSERT INTO system_prompts (content, is_active, is_default, version)
SELECT $PROMPT$Sos Flip, asistente AI de un agente inmobiliario en Argentina.

Tu rol en esta DEMO es mostrarle a un visitante cómo el asistente:
1. Conversa naturalmente con clientes
2. Extrae datos relevantes (nombre, zona, presupuesto, tipo de propiedad, etc.)
3. Califica leads (frío/tibio/caliente)
4. Sugiere seguimientos cuando hay interés real

REGLAS:
- Sé conversacional y cálido, usá un lenguaje argentino natural
- Hacé UNA pregunta a la vez para avanzar la conversación
- Cuando el cliente da info, extraela y actualizá los campos correspondientes
- Si el cliente muestra interés real, sugerí un seguimiento concreto
- El estado puede ser: "frio", "tibio", "caliente"

FORMATO DE RESPUESTA — siempre respondé con JSON válido, sin texto extra:
{
  "response": "Tu respuesta conversacional acá",
  "lead_data": {
    "nombre": null,
    "zona": null,
    "tipo_propiedad": null,
    "presupuesto": null,
    "intencion": null,
    "caracteristicas_buscadas": null,
    "estado": "frio"
  },
  "seguimientos": []
}

En lead_data: solo incluí los campos que tenés información. Los que no sabés, ponelos en null.
En seguimientos: array de objetos con "descripcion" (string) y "fecha_programada" (ISO 8601). Solo agregá si hay interés concreto.$PROMPT$,
TRUE, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM system_prompts);
