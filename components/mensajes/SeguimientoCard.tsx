'use client';

import { Clock, CheckCircle } from 'lucide-react';

interface SeguimientoCardProps {
  fecha: string;
  label: string;
  mensajes: number;
  estado: 'pendiente' | 'enviado';
  onClick?: () => void;
}

export function SeguimientoCard({ fecha: _fecha, label, mensajes, estado, onClick }: SeguimientoCardProps) {
  const isHoy = label === 'Hoy';
  const isPendiente = estado === 'pendiente';

  return (
    <div
      onClick={onClick}
      className={`
        border rounded-xl p-4 bg-white flex items-center justify-between gap-3
        transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${isHoy && isPendiente ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-200'}
      `}
    >
      <div className="min-w-0">
        <p className={`text-sm font-bold truncate ${isHoy ? 'text-gray-900' : 'text-gray-700'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {mensajes.toLocaleString('es-AR')} mensaje{mensajes !== 1 ? 's' : ''}
        </p>
      </div>

      <span
        className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
          isPendiente
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {isPendiente ? (
          <>
            <Clock size={11} />
            Pendiente
          </>
        ) : (
          <>
            <CheckCircle size={11} />
            Enviado
          </>
        )}
      </span>
    </div>
  );
}
