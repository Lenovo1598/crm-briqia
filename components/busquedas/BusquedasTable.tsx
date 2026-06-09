'use client';

import { Edit3, Trash2 } from 'lucide-react';
import { MatchesDropdown } from './MatchesDropdown';
import { BusquedaData } from './NuevaBusquedaModal';

interface BusquedaRow extends BusquedaData {
  matches_count: number;
}

interface BusquedasTableProps {
  busquedas: BusquedaRow[];
  onEdit: (b: BusquedaData) => void;
  onDelete: (id: number) => void;
}

const dash = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '—';
const yn = (v: boolean | null) => v === true ? 'SI' : v === false ? 'NO' : '—';

const COLS = [
  { key: 'id',            label: 'ID',          className: 'w-12' },
  { key: 'matches',       label: 'Coincidencias', className: 'w-32' },
  { key: 'agente_cliente',label: 'Agente/Cliente', className: 'min-w-[120px]' },
  { key: 'tipo',          label: 'Tipo',         className: 'w-20' },
  { key: 'direccion',     label: 'Dirección',    className: 'min-w-[120px]' },
  { key: 'zona',          label: 'Zona',         className: 'min-w-[100px]' },
  { key: 'valor',         label: 'Valor (USD)',  className: 'w-32' },
  { key: 'dormitorios',   label: 'Dorm.',        className: 'w-14' },
  { key: 'banos',         label: 'Baños',        className: 'w-14' },
  { key: 'patio_parque',  label: 'Patio/Parque', className: 'w-24' },
  { key: 'garage',        label: 'Garage',       className: 'w-16' },
  { key: 'm2_const',      label: 'm² c.',        className: 'w-14' },
  { key: 'lote',          label: 'Lote',         className: 'w-14' },
  { key: 'piso',          label: 'Piso',         className: 'w-12' },
  { key: 'apto_banco',    label: 'Banco',        className: 'w-14' },
  { key: 'acciones',      label: '',             className: 'w-16' },
];

export function BusquedasTable({ busquedas, onEdit, onDelete }: BusquedasTableProps) {
  if (busquedas.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl flex items-center justify-center py-16 text-gray-400 text-sm">
        No hay búsquedas registradas
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {COLS.map(c => (
              <th key={c.key} className={`px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap ${c.className}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {busquedas.map(b => {
            const valorStr = b.valor_min && b.valor_max
              ? `${(b.valor_min / 1000).toFixed(0)}k – ${(b.valor_max / 1000).toFixed(0)}k`
              : b.valor_max
              ? `≤ ${(b.valor_max / 1000).toFixed(0)}k`
              : b.valor_min
              ? `≥ ${(b.valor_min / 1000).toFixed(0)}k`
              : '—';

            return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-xs text-gray-400">{b.id}</td>
                <td className="px-3 py-2.5">
                  <MatchesDropdown busquedaId={b.id} matchesCount={b.matches_count} />
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{dash(b.agente_cliente)}</td>
                <td className="px-3 py-2.5">
                  {b.tipo ? (
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                      {b.tipo}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate">{dash(b.direccion)}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{dash(b.zona)}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{valorStr}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{dash(b.dormitorios)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{dash(b.banos)}</td>
                <td className="px-3 py-2.5 text-gray-600">{dash(b.patio_parque)}</td>
                <td className="px-3 py-2.5 text-gray-600">{dash(b.garage)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{dash(b.m2_const)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{dash(b.lote)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{dash(b.piso)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{yn(b.apto_banco)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                      title="Editar"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
