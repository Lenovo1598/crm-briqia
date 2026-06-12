'use client';

import { Lead, getLeadDisplayName, formatCurrency, KanbanColumn } from '@/lib/leads';
import { Phone, MessageSquare } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  column: KanbanColumn;
  onOpen: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
}

export function LeadCard({ lead, column, onOpen, onDragStart }: LeadCardProps) {
  const displayName = getLeadDisplayName(lead);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, lead);
      }}
      onClick={() => onOpen(lead)}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md hover:translate-y-[-1px] transition-all"
    >
      {/* Nombre + Monto de inversión */}
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm text-gray-900 truncate flex-1">
          {displayName}
        </span>
        <span className="text-xs text-gray-500 font-medium ml-2 flex-shrink-0">
          {formatCurrency(lead.monto_inversion)}
        </span>
      </div>

      {/* Temperatura Badge */}
      <div className="mb-2">
        <span
          className="inline-block px-2 py-1 rounded text-white text-xs font-semibold"
          style={{ backgroundColor: column.color }}
        >
          {lead.temperatura || column.nombre}
        </span>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 space-y-1">
        {lead.pais_residencia && (
          <div className="flex items-center gap-1">
            <span>🌎</span>
            <span className="truncate">{lead.pais_residencia}</span>
          </div>
        )}

        {lead.plazo_inicio && (
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span className="truncate">{lead.plazo_inicio}</span>
          </div>
        )}

        {lead.whatsapp_id && (
          <div className="flex items-center gap-1">
            <span>📱</span>
            <span className="font-mono truncate text-xs">{lead.whatsapp_id}</span>
          </div>
        )}
      </div>

      {/* Acciones hover */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2 justify-end opacity-0 hover:opacity-100 transition-opacity">
        <button
          className="text-whatsapp hover:text-whatsapp/80 p-1"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://wa.me/${lead.whatsapp_id}`, '_blank');
          }}
          title="Abrir WhatsApp"
        >
          <Phone size={14} />
        </button>
        <button
          className="text-primary hover:text-primary/80 p-1"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(lead);
          }}
          title="Editar"
        >
          <MessageSquare size={14} />
        </button>
      </div>
    </div>
  );
}
