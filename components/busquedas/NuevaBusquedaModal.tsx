'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface BusquedaForm {
  agente_cliente: string;
  tipo: string;
  direccion: string;
  zona: string;
  valor: string;           // campo UI — se parsea antes de guardar
  dormitorios: string;
  banos: string;
  patio_parque: string;
  garage: string;
  m2_const: string;
  lote: string;
  piso: string;
  apto_banco: string;
  notas: string;
}

export interface BusquedaData {
  id: number;
  agente_cliente: string | null;
  tipo: string | null;
  direccion: string | null;
  zona: string | null;
  valor_min: number | null;
  valor_max: number | null;
  dormitorios: number | null;
  banos: number | null;
  patio_parque: string | null;
  garage: string | null;
  m2_const: number | null;
  lote: number | null;
  piso: number | null;
  apto_banco: boolean | null;
  notas: string | null;
}

interface Props {
  busqueda?: BusquedaData | null;
  onClose: () => void;
  onSave: (parsed: Record<string, any>) => Promise<void>;
}

const EMPTY: BusquedaForm = {
  agente_cliente: '', tipo: '', direccion: '', zona: '',
  valor: '', dormitorios: '', banos: '', patio_parque: '',
  garage: '', m2_const: '', lote: '', piso: '',
  apto_banco: '', notas: '',
};

function parseValor(input: string): { valor_min: number | null; valor_max: number | null } {
  const cleaned = input.replace(/\./g, '').replace(/[^\d\-]/g, '');
  if (cleaned.includes('-')) {
    const [a, b] = cleaned.split('-').map(n => parseInt(n, 10));
    return { valor_min: isNaN(a) ? null : a, valor_max: isNaN(b) ? null : b };
  }
  const n = parseInt(cleaned, 10);
  return { valor_min: null, valor_max: isNaN(n) ? null : n };
}

function toValorString(min: number | null, max: number | null): string {
  if (min && max) return `${min} - ${max}`;
  if (max) return String(max);
  if (min) return String(min);
  return '';
}

export function NuevaBusquedaModal({ busqueda, onClose, onSave }: Props) {
  const [form, setForm]     = useState<BusquedaForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (busqueda) {
      setForm({
        agente_cliente: busqueda.agente_cliente ?? '',
        tipo:           busqueda.tipo           ?? '',
        direccion:      busqueda.direccion       ?? '',
        zona:           busqueda.zona            ?? '',
        valor:          toValorString(busqueda.valor_min, busqueda.valor_max),
        dormitorios:    busqueda.dormitorios != null ? String(busqueda.dormitorios) : '',
        banos:          busqueda.banos       != null ? String(busqueda.banos)       : '',
        patio_parque:   busqueda.patio_parque ?? '',
        garage:         busqueda.garage       ?? '',
        m2_const:       busqueda.m2_const    != null ? String(busqueda.m2_const)   : '',
        lote:           busqueda.lote        != null ? String(busqueda.lote)        : '',
        piso:           busqueda.piso        != null ? String(busqueda.piso)        : '',
        apto_banco:     busqueda.apto_banco  != null ? (busqueda.apto_banco ? 'SI' : 'NO') : '',
        notas:          busqueda.notas       ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [busqueda]);

  const set = (field: keyof BusquedaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { valor_min, valor_max } = parseValor(form.valor);
      await onSave({
        agente_cliente: form.agente_cliente || null,
        tipo:           form.tipo           || null,
        direccion:      form.direccion       || null,
        zona:           form.zona            || null,
        valor_min,
        valor_max,
        dormitorios:  form.dormitorios ? parseInt(form.dormitorios, 10) : null,
        banos:        form.banos       ? parseInt(form.banos, 10)       : null,
        patio_parque: form.patio_parque || null,
        garage:       form.garage       || null,
        m2_const:     form.m2_const    ? parseInt(form.m2_const, 10)   : null,
        lote:         form.lote        ? parseInt(form.lote, 10)        : null,
        piso:         form.piso        ? parseInt(form.piso, 10)        : null,
        apto_banco:   form.apto_banco === 'SI' ? true : form.apto_banco === 'NO' ? false : null,
        notas:        form.notas || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {busqueda ? 'Editar búsqueda' : 'Nueva búsqueda'}
            </h2>
            <p className="text-sm text-gray-500">Completá los campos que correspondan.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Agente / Cliente</label>
              <input className={inputCls} placeholder="Nombre del agente o cliente" value={form.agente_cliente} onChange={set('agente_cliente')} />
            </div>

            <div>
              <label className={labelCls}>Tipo</label>
              <select className={inputCls} value={form.tipo} onChange={set('tipo')}>
                <option value="">Seleccioná...</option>
                {['CASA','DEPTO','PH','LOTE','LOCAL','GALPON','OFICINA'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Dirección</label>
              <input className={inputCls} placeholder="Dirección específica (opcional)" value={form.direccion} onChange={set('direccion')} />
            </div>

            <div>
              <label className={labelCls}>Zona / Barrio</label>
              <input className={inputCls} placeholder="Ej: La Plata, Gonnet, City Bell" value={form.zona} onChange={set('zona')} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Valor (USD)</label>
              <input className={inputCls} placeholder="Ej: 100.000 - 200.000 (rango) o 200.000 (tope máximo)" value={form.valor} onChange={set('valor')} />
              <p className="text-xs text-gray-400 mt-1">Podés indicar un rango (min - máx) o un único valor (se trata como tope máximo).</p>
            </div>

            <div>
              <label className={labelCls}>Dormitorios (mín.)</label>
              <input className={inputCls} type="number" min={0} placeholder="—" value={form.dormitorios} onChange={set('dormitorios')} />
            </div>

            <div>
              <label className={labelCls}>Baños (mín.)</label>
              <input className={inputCls} type="number" min={0} placeholder="—" value={form.banos} onChange={set('banos')} />
            </div>

            <div>
              <label className={labelCls}>Patio / Parque</label>
              <select className={inputCls} value={form.patio_parque} onChange={set('patio_parque')}>
                <option value="">—</option>
                {['PATIO','PARQUE','BALCON','NINGUNO'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Garage</label>
              <select className={inputCls} value={form.garage} onChange={set('garage')}>
                <option value="">—</option>
                {['SI','NO','1','2','3+'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>m² construidos</label>
              <input className={inputCls} type="number" min={0} placeholder="—" value={form.m2_const} onChange={set('m2_const')} />
            </div>

            <div>
              <label className={labelCls}>Lote (m²)</label>
              <input className={inputCls} type="number" min={0} placeholder="—" value={form.lote} onChange={set('lote')} />
            </div>

            <div>
              <label className={labelCls}>Piso</label>
              <input className={inputCls} type="number" min={0} placeholder="—" value={form.piso} onChange={set('piso')} />
            </div>

            <div>
              <label className={labelCls}>Apto banco</label>
              <select className={inputCls} value={form.apto_banco} onChange={set('apto_banco')}>
                <option value="">—</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Notas</label>
              <textarea className={inputCls} rows={2} placeholder="Observaciones adicionales..." value={form.notas} onChange={set('notas')} />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
