'use client';

import { Lead, KanbanColumn as IKanbanColumn, estadoToColumn } from '@/lib/leads';
import { LeadCard } from './LeadCard';
import { MoreVertical } from 'lucide-react';

interface KanbanColumnProps {
  column: IKanbanColumn;
  leads: Lead[];
  onLeadOpen: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragOver: (columnId: number) => void;
  onDragLeave: () => void;
  onDrop: (columnId: number) => void;
  isDraggedOver: boolean;
}

export function KanbanColumn({
  column,
  leads,
  onLeadOpen,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDraggedOver,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(column.id);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(column.id);
      }}
      className={`
        min-w-[280px] flex-shrink-0 flex flex-col
        rounded-lg border transition-all
        ${isDraggedOver
          ? 'border-primary border-2 bg-primary-light'
          : 'border-gray-200 bg-gray-50'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <span className="font-bold text-sm text-gray-900">
            {column.nombre}
          </span>
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            {leads.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-gray-400 text-xs">
            Sin leads
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              column={column}
              onOpen={onLeadOpen}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
