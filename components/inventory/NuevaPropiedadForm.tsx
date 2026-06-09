'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface PropiedadForm {
  tipo: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  zona: string;
  precio: string;
  moneda: string;
  dormitorios: string;
  banos: string;
  m2: string;
  estado: string;
  caracteristicas: string[];
}

const EMPTY_FORM: PropiedadForm = {
  tipo: 'apartment', titulo: '', descripcion: '', ubicacion: '', zona: '',
  precio: '', moneda: 'ARS', dormitorios: '', banos: '', m2: '',
  estado: 'Disponible', caracteristicas: [],
};

interface NuevaPropiedadFormProps {
  onSubmit: (data: PropiedadForm) => Promise<void>;
}

export default function NuevaPropiedadForm({ onSubmit }: NuevaPropiedadFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PropiedadForm>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof PropiedadForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.caracteristicas.includes(tag)) {
      setForm(prev => ({ ...prev, caracteristicas: [...prev.caracteristicas, tag] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm(prev => ({ ...prev, caracteristicas: prev.caracteristicas.filter(t => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(EMPTY_FORM);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
      >
        <h2 className="text-base font-bold text-gray-900">Nueva propiedad</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{open ? 'Ocultar' : 'Cargar manualmente'}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputClass}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="ph">PH</option>
                <option value="office">Oficina</option>
                <option value="land">Terreno</option>
                <option value="commercial">Local comercial</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputClass}>
                <option>Disponible</option>
                <option>Reservado</option>
                <option>Vendido</option>
              </select>
            </div>

            {/* Título */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={e => set('titulo', e.target.value)}
                placeholder="Ej: 2 ambientes luminoso Palermo"
                className={inputClass}
                required
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación</label>
              <input type="text" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}
                placeholder="Palermo, CABA" className={inputClass} />
            </div>

            {/* Zona */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Zona</label>
              <input type="text" value={form.zona} onChange={e => set('zona', e.target.value)}
                placeholder="Palermo Hollywood" className={inputClass} />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" value={form.precio} onChange={e => set('precio', e.target.value)}
                placeholder="150000" min={0} className={inputClass} />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Moneda</label>
              <select value={form.moneda} onChange={e => set('moneda', e.target.value)} className={inputClass}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>

            {/* Dormitorios */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dormitorios</label>
              <input type="number" value={form.dormitorios} onChange={e => set('dormitorios', e.target.value)}
                placeholder="2" min={0} className={inputClass} />
            </div>

            {/* Baños */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Baños</label>
              <input type="number" value={form.banos} onChange={e => set('banos', e.target.value)}
                placeholder="1" min={0} className={inputClass} />
            </div>

            {/* m² */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">m²</label>
              <input type="number" value={form.m2} onChange={e => set('m2', e.target.value)}
                placeholder="55" min={0} className={inputClass} />
            </div>

            {/* Características */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Características</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Ej: balcón, cochera..."
                  className={`${inputClass} flex-1`}
                />
                <button type="button" onClick={addTag}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  Agregar
                </button>
              </div>
              {form.caracteristicas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.caracteristicas.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                rows={3} placeholder="Descripción opcional de la propiedad..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setOpen(false); }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting || !form.titulo.trim()}
              className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Guardando...' : 'Agregar propiedad'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
