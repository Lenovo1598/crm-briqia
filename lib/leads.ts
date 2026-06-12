// ═══════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════

export interface Lead {
  id: number;
  whatsapp_id: string;
  nombre: string | null;
  estado: string;
  temperatura: string | null;
  pais_residencia: string | null;
  monto_inversion: string | null;
  plazo_inicio: string | null;
  medio_contacto_preferido: string | null;
  horario_contacto_preferido: string | null;
  conocimiento_realestate_usa: string | null;
  tiene_cuenta_bancaria_usa: string | null;
  tiene_empresa_usa: string | null;
  interes_visa_e2: string | null;
  ultima_interaccion: string | null;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  visible: boolean;
  created_at: string;
}

// ═══════════════════════════════════════
// MAPEO DINÁMICO temperatura ↔ columna
// ═══════════════════════════════════════
// El campo `temperatura` en leads (frio/tibio/caliente) determina la
// columna del Kanban en la que se muestra el lead.

const LEGACY_MAP: Record<string, string> = {
  frio:     'Frío',
  frío:     'Frío',
  tibio:    'Tibio',
  tibios:   'Tibio',
  caliente: 'Caliente',
  calientes:'Caliente',
};

/**
 * Resuelve el nombre de columna para un lead a partir de su temperatura.
 * 1. Si `temperatura` coincide exactamente con un nombre de columna → lo usa.
 * 2. Si no, intenta el mapeo legado (frio → Frío, etc.).
 * 3. Fallback: devuelve la temperatura tal cual (quedará huérfano visualmente).
 */
export function resolveColumnName(temperatura: string | null, columns: KanbanColumn[]): string {
  if (!temperatura) return '';
  const exact = columns.find(c => c.nombre === temperatura);
  if (exact) return exact.nombre;
  const legacy = LEGACY_MAP[temperatura.toLowerCase()];
  if (legacy) return legacy;
  return temperatura;
}

/**
 * Convierte el nombre de una columna del Kanban (ej. "Frío") al valor
 * de `temperatura` que debe guardarse en la base de datos (ej. "frio").
 */
export function columnNameToTemperatura(columnName: string): string {
  const normalized = columnName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // quita acentos: "frío" -> "frio"

  if (normalized.startsWith('cal')) return 'caliente';
  if (normalized.startsWith('tib')) return 'tibio';
  if (normalized.startsWith('fri')) return 'frio';
  return normalized;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

export function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num || isNaN(num) || num === 0) return 'US$ 0';
  if (num >= 1000) {
    return `US$ ${(num / 1000).toFixed(0)}k`;
  }
  return `US$ ${num}`;
}

export function getLeadDisplayName(lead: Lead): string {
  return lead.nombre || lead.whatsapp_id || 'Sin nombre';
}

export function getUniquePaises(leads: Lead[]): string[] {
  const paises = leads
    .map(l => l.pais_residencia)
    .filter((p): p is string => !!p);
  return Array.from(new Set(paises)).sort();
}
