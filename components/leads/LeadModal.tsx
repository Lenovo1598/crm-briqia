'use client';

import { useState, useEffect } from 'react';
import { Lead, KanbanColumn, columnToEstado } from '@/lib/leads';
import { Edit3, Phone, X } from 'lucide-react';

interface LeadModalProps {
  lead: Lead;
  columns: KanbanColumn[];
  onClose: () => void;
  onSave: (lead: Lead) => Promise<void>;
}

export function LeadModal({
  lead,
  columns,
  onClose,
  onSave,
}: LeadModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(lead);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await onSave(form);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const displayName = lead.nombre || lead.whatsapp_id || 'Sin nombre';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md max-h-[85vh] overflow-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {displayName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {lead.whatsapp_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setEditing(!editing)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition"
          >
            <Edit3 size={16} />
            {editing ? 'Cancelar' : 'Editar'}
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${lead.whatsapp_id}`, '_blank')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-lg font-medium text-sm transition"
          >
            <Phone size={16} />
            WhatsApp
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre || ''}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={columnToEstado(col.nombre)}>
                      {col.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Presupuesto (USD)
                </label>
                <input
                  type="number"
                  value={form.presupuesto || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      presupuesto: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Zona */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Zona
                </label>
                <input
                  type="text"
                  value={form.zona || ''}
                  onChange={(e) =>
                    setForm({ ...form, zona: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Tipo Propiedad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo Propiedad
                </label>
                <select
                  value={form.tipo_propiedad || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo_propiedad: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="ph">PH</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local</option>
                </select>
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Forma de Pago
                </label>
                <select
                  value={form.forma_pago || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      forma_pago: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="contado">Contado</option>
                  <option value="financiado">Financiado</option>
                  <option value="hipotecario">Hipotecario</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              {/* Intención */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Intención
                </label>
                <select
                  value={form.intencion || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      intencion: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="comprar">Comprar</option>
                  <option value="vender">Vender</option>
                </select>
              </div>

              {/* Propiedad Interés */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Propiedad de Interés
                </label>
                <input
                  type="text"
                  value={form.propiedad_interes || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      propiedad_interes: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Guardar */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Estado
                </p>
                <p className="font-semibold text-gray-900">{form.estado}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Presupuesto
                </p>
                <p className="font-semibold text-gray-900">
                  US$ {form.presupuesto || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Zona
                </p>
                <p className="font-semibold text-gray-900">
                  {form.zona || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Tipo
                </p>
                <p className="font-semibold text-gray-900">
                  {form.tipo_propiedad || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Forma Pago
                </p>
                <p className="font-semibold text-gray-900">
                  {form.forma_pago || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Intención
                </p>
                <p className="font-semibold text-gray-900">
                  {form.intencion || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Propiedad Interés
                </p>
                <p className="font-semibold text-gray-900">
                  {form.propiedad_interes || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Última Actualización
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(form.updated_at).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
