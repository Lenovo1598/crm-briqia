// ═══════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════

export interface Lead {
  id: number;
  whatsapp_id: string;
  nombre: string | null;
  estado: string;
  presupuesto: number | null;
  zona: string | null;
  tipo_propiedad: string | null;
  forma_pago: string | null;
  intencion: string | null;
  propiedad_interes: string | null;
  caracteristicas_buscadas: string | null;
  caracteristicas_venta: string | null;
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
// MAPEO DINÁMICO estado ↔ columna
// ═══════════════════════════════════════
// El campo `estado` en leads coincide directamente con el `nombre`
// de la columna en kanban_columns. El mapeo legado (frio → Frío) se
// mantiene como fallback para leads creados por versiones anteriores de n8n.

const LEGACY_MAP: Record<string, string> = {
  frio:     'Frío',
  tibio:    'Tibio',
  tibios:   'Tibio',
  visita:   'Visita',
  visitas:  'Visita',
  caliente: 'Caliente',
  calientes:'Caliente',
  llamada:  'Llamada',
  llamadas: 'Llamada',
  busqueda: 'Busqueda',
  búsqueda: 'Busqueda',
};

/**
 * Resuelve el nombre de columna para un lead.
 * 1. Si `estado` coincide exactamente con un nombre de columna → lo usa.
 * 2. Si no, intenta el mapeo legado para compatibilidad con n8n antiguo.
 * 3. Fallback: devuelve el estado tal cual (quedará huérfano visualmente).
 */
export function resolveColumnName(estado: string, columns: KanbanColumn[]): string {
  if (!estado) return '';
  const exact = columns.find(c => c.nombre === estado);
  if (exact) return exact.nombre;
  const legacy = LEGACY_MAP[estado.toLowerCase()];
  if (legacy) return legacy;
  return estado;
}

/** @deprecated Usar resolveColumnName con el array de columnas. Mantenido por compatibilidad. */
export function estadoToColumn(estado: string): string {
  return LEGACY_MAP[estado.toLowerCase()] || estado;
}

/** @deprecated El estado ahora es directamente el nombre de la columna. */
export function columnToEstado(columnName: string): string {
  return columnName;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

export function formatCurrency(value: number | null | undefined): string {
  if (!value || value === 0) return 'US$ 0';
  if (value >= 1000) {
    return `US$ ${(value / 1000).toFixed(0)}k`;
  }
  return `US$ ${value}`;
}

export function getLeadDisplayName(lead: Lead): string {
  return lead.nombre || lead.whatsapp_id || 'Sin nombre';
}

export function getUniqueProperties(leads: Lead[]): string[] {
  const props = leads
    .map(l => l.propiedad_interes)
    .filter((p): p is string => !!p);
  return Array.from(new Set(props)).sort();
}
