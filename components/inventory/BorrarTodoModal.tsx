'use client';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const CONFIRM_TEXT = 'BORRAR TODO';

interface BorrarTodoModalProps {
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BorrarTodoModal({ count, onConfirm, onClose }: BorrarTodoModalProps) {
  const [input, setInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[440px] p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">¿Borrar todo el inventario?</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Vas a eliminar <strong>{count} {count === 1 ? 'propiedad' : 'propiedades'}</strong>.
          Esta acción no se puede deshacer.
        </p>

        <p className="text-xs text-gray-500 mb-2">
          Para confirmar, escribí{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{CONFIRM_TEXT}</code>:
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-red-400"
          placeholder={CONFIRM_TEXT}
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== CONFIRM_TEXT}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
          >
            Borrar todo
          </button>
        </div>
      </div>
    </div>
  );
}
