'use client';

interface InventoryItem {
  id: string;
  tipo: string;
  titulo: string;
  ubicacion: string;
  zona: string | null;
  precio: number | null;
  moneda: string;
  estado: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onDelete: (id: string) => void;
}

const estadoBadge: Record<string, string> = {
  Disponible: 'bg-amber-50 text-amber-700 border border-amber-200',
  Reservado:  'bg-blue-50 text-blue-700 border border-blue-200',
  Vendido:    'bg-green-50 text-green-700 border border-green-200',
};

export default function InventoryTable({ items, onDelete }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <p className="text-sm font-medium text-gray-600">No hay propiedades cargadas.</p>
        <p className="text-xs text-gray-400 mt-1">
          Agregá una manualmente o importá un archivo CSV/JSON.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['ID', 'Tipo', 'Título', 'Ubicación', 'Zona', 'Precio', 'Estado', 'Acción'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-gray-400" title={item.id}>
                  {item.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.tipo || '—'}</td>
                <td className="px-4 py-3 text-gray-900 font-medium max-w-[220px] truncate" title={item.titulo}>
                  {item.titulo}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.ubicacion || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.zona || '—'}</td>
                <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                  {item.precio != null
                    ? `${item.moneda} ${Number(item.precio).toLocaleString('es-AR')}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge[item.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full hover:bg-red-100 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
