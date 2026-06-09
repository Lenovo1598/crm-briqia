'use client';

interface NotasTabProps {
  notas: string[];
}

export default function NotasTab({ notas }: NotasTabProps) {
  if (notas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">No hay notas todavía.</p>
        <p className="text-xs text-gray-500">Las notas del asistente aparecerán acá.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notas.map((nota, idx) => (
        <div key={idx} className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
          <p className="text-sm text-gray-900">{nota}</p>
        </div>
      ))}
    </div>
  );
}
