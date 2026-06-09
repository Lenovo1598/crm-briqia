'use client';

interface LeadData {
  nombre?: string;
  zona?: string;
  tipo_propiedad?: string;
  presupuesto?: number;
  intencion?: string;
  forma_pago?: string;
  caracteristicas_buscadas?: string;
  estado?: string;
}

interface LeadActivoCardProps {
  leadData: LeadData;
}

const estadoColors: Record<string, string> = {
  caliente: 'bg-red-100 text-red-700',
  tibio: 'bg-yellow-100 text-yellow-700',
  frio: 'bg-blue-100 text-blue-700',
};

export default function LeadActivoCard({ leadData }: LeadActivoCardProps) {
  const hasData = Object.values(leadData).some(v => v !== null && v !== undefined && v !== '');

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 italic">Cliente nuevo</p>
        <p className="text-xs text-gray-500 italic mt-1">Esperando datos del cliente...</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-semibold text-gray-900">
          {leadData.nombre || 'Cliente sin nombre'}
        </p>
        {leadData.estado && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${estadoColors[leadData.estado] ?? 'bg-gray-100 text-gray-700'}`}>
            {leadData.estado}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        {leadData.zona && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Zona:</span>
            <span className="text-gray-900 font-medium">{leadData.zona}</span>
          </div>
        )}
        {leadData.tipo_propiedad && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Tipo:</span>
            <span className="text-gray-900 font-medium capitalize">{leadData.tipo_propiedad}</span>
          </div>
        )}
        {leadData.presupuesto && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Presupuesto:</span>
            <span className="text-gray-900 font-medium">
              USD {Number(leadData.presupuesto).toLocaleString('es-AR')}
            </span>
          </div>
        )}
        {leadData.intencion && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Intención:</span>
            <span className="text-gray-900 font-medium capitalize">{leadData.intencion}</span>
          </div>
        )}
        {leadData.caracteristicas_buscadas && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Busca:</span>
            <span className="text-gray-900 font-medium">{leadData.caracteristicas_buscadas}</span>
          </div>
        )}
        {leadData.forma_pago && (
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Pago:</span>
            <span className="text-gray-900 font-medium capitalize">{leadData.forma_pago}</span>
          </div>
        )}
      </div>
    </div>
  );
}
