'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { formatSeguimientoDate } from '@/lib/utils';

export interface SeguimientoAgrupado {
  fecha: string;
  mensajes: number;
}

interface SeguimientoListProps {
  seguimientos: SeguimientoAgrupado[];
}

export function SeguimientoList({ seguimientos }: SeguimientoListProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) => setExpanded(prev => prev === idx ? null : idx);

  if (seguimientos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay seguimientos enviados</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
      {seguimientos.map((seg, idx) => (
        <div key={idx}>
          <button
            onClick={() => toggle(idx)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
          >
            <ChevronRight
              size={15}
              className={`text-gray-400 transition-transform flex-shrink-0 ${
                expanded === idx ? 'rotate-90' : ''
              }`}
            />
            <span className="text-sm font-medium text-gray-900 flex-1">
              {formatSeguimientoDate(seg.fecha)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-semibold flex-shrink-0">
              <CheckCircle size={11} />
              {seg.mensajes.toLocaleString('es-AR')} enviado{seg.mensajes !== 1 ? 's' : ''}
            </span>
          </button>

          {expanded === idx && (
            <div className="px-10 pb-4 pt-1">
              <p className="text-xs text-gray-400 italic">
                {seg.mensajes.toLocaleString('es-AR')} seguimiento{seg.mensajes !== 1 ? 's' : ''} enviado{seg.mensajes !== 1 ? 's' : ''} el {formatSeguimientoDate(seg.fecha)}.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
