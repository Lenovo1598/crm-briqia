'use client';
import { Calendar } from 'lucide-react';

interface Seguimiento {
  descripcion: string;
  fecha_programada?: string;
}

interface SeguimientosTabProps {
  seguimientos: Seguimiento[];
}

export default function SeguimientosTab({ seguimientos }: SeguimientosTabProps) {
  if (seguimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">
          No hay seguimientos programados.
        </p>
        <p className="text-xs text-gray-500">
          Cuando acuerdes uno con el cliente va a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {seguimientos.map((seg, idx) => (
        <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <Calendar size={16} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-gray-900">{seg.descripcion}</p>
            {seg.fecha_programada && (
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(seg.fecha_programada).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
