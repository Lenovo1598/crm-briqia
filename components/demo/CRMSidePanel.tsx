'use client';
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import LeadActivoCard from './LeadActivoCard';
import SeguimientosTab from './SeguimientosTab';
import NotasTab from './NotasTab';
import HistorialTab, { HistorialItem } from './HistorialTab';

type Tab = 'seguimientos' | 'notas' | 'historial';

interface Seguimiento {
  descripcion: string;
  fecha_programada?: string;
}

interface CRMSidePanelProps {
  leadData: Record<string, unknown>;
  seguimientos: Seguimiento[];
  notas: string[];
  historial: HistorialItem[];
}

export default function CRMSidePanel({ leadData, seguimientos, notas, historial }: CRMSidePanelProps) {
  const [tab, setTab] = useState<Tab>('seguimientos');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'seguimientos', label: 'Seguimientos' },
    { id: 'notas', label: 'Notas' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="w-[420px] shrink-0 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs text-gray-500 italic">✦ CRM</p>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h2 className="text-base font-semibold text-gray-900">Lead activo</h2>
      </div>

      {/* Card del Lead */}
      <div className="px-6 py-4 border-b border-gray-100">
        <LeadActivoCard leadData={leadData as Parameters<typeof LeadActivoCard>[0]['leadData']} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 px-6">
        <div className="flex gap-6">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del tab */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {tab === 'seguimientos' && <SeguimientosTab seguimientos={seguimientos} />}
        {tab === 'notas' && <NotasTab notas={notas} />}
        {tab === 'historial' && <HistorialTab historial={historial} />}
      </div>
    </div>
  );
}
