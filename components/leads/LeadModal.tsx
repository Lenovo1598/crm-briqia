'use client';

import { useState } from 'react';
import { Lead, KanbanColumn, columnNameToTemperatura } from '@/lib/leads';
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

              {/* Temperatura */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Temperatura
                </label>
                <select
                  value={form.temperatura || ''}
                  onChange={(e) =>
                    setForm({ ...form, temperatura: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  {columns.map((col) => (
                    <option key={col.id} value={columnNameToTemperatura(col.nombre)}>
                      {col.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* País de Residencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  País de Residencia
                </label>
                <input
                  type="text"
                  value={form.pais_residencia || ''}
                  onChange={(e) =>
                    setForm({ ...form, pais_residencia: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Monto de Inversión */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Monto de Inversión (USD)
                </label>
                <input
                  type="number"
                  value={form.monto_inversion || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      monto_inversion: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Plazo para Iniciar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Plazo para Iniciar
                </label>
                <input
                  type="text"
                  value={form.plazo_inicio || ''}
                  onChange={(e) =>
                    setForm({ ...form, plazo_inicio: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Medio de Contacto Preferido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Medio de Contacto Preferido
                </label>
                <input
                  type="text"
                  value={form.medio_contacto_preferido || ''}
                  onChange={(e) =>
                    setForm({ ...form, medio_contacto_preferido: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Horario de Contacto Preferido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Horario de Contacto Preferido
                </label>
                <input
                  type="text"
                  value={form.horario_contacto_preferido || ''}
                  onChange={(e) =>
                    setForm({ ...form, horario_contacto_preferido: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Conocimiento Real Estate USA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Conocimiento de Real Estate en USA
                </label>
                <select
                  value={form.conocimiento_realestate_usa || ''}
                  onChange={(e) =>
                    setForm({ ...form, conocimiento_realestate_usa: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                  <option value="parcial">Parcial</option>
                </select>
              </div>

              {/* Cuenta Bancaria USA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ¿Tiene Cuenta Bancaria en USA?
                </label>
                <select
                  value={form.tiene_cuenta_bancaria_usa || ''}
                  onChange={(e) =>
                    setForm({ ...form, tiene_cuenta_bancaria_usa: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Empresa en USA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ¿Tiene Empresa en USA?
                </label>
                <select
                  value={form.tiene_empresa_usa || ''}
                  onChange={(e) =>
                    setForm({ ...form, tiene_empresa_usa: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Interés Visa E2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Interés en Visa E2
                </label>
                <select
                  value={form.interes_visa_e2 || ''}
                  onChange={(e) =>
                    setForm({ ...form, interes_visa_e2: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Sin definir</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                  <option value="consultar">Consultar</option>
                </select>
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
                  Temperatura
                </p>
                <p className="font-semibold text-gray-900">{form.temperatura || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Monto de Inversión
                </p>
                <p className="font-semibold text-gray-900">
                  US$ {form.monto_inversion || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  País de Residencia
                </p>
                <p className="font-semibold text-gray-900">
                  {form.pais_residencia || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Plazo para Iniciar
                </p>
                <p className="font-semibold text-gray-900">
                  {form.plazo_inicio || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Medio de Contacto
                </p>
                <p className="font-semibold text-gray-900">
                  {form.medio_contacto_preferido || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Horario de Contacto
                </p>
                <p className="font-semibold text-gray-900">
                  {form.horario_contacto_preferido || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Conoce Real Estate USA
                </p>
                <p className="font-semibold text-gray-900">
                  {form.conocimiento_realestate_usa || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Cuenta Bancaria USA
                </p>
                <p className="font-semibold text-gray-900">
                  {form.tiene_cuenta_bancaria_usa || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Empresa en USA
                </p>
                <p className="font-semibold text-gray-900">
                  {form.tiene_empresa_usa || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                  Interés Visa E2
                </p>
                <p className="font-semibold text-gray-900">
                  {form.interes_visa_e2 || '—'}
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
