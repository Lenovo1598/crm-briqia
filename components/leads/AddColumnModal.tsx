'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  '#6B7280',
  '#F59E0B',
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
];

interface AddColumnModalProps {
  onClose: () => void;
  onAdd: (nombre: string, color: string) => Promise<void>;
}

export function AddColumnModal({ onClose, onAdd }: AddColumnModalProps) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre de la columna es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd(nombre.trim(), color);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear columna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Nueva Columna</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: En Progreso"
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    color === c ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !nombre.trim()}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-medium rounded-lg transition"
            >
              {loading ? 'Creando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
