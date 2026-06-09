'use client';

import { ChevronUp, ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { KanbanColumn } from '@/lib/leads';

interface ColumnOrderItemProps {
  column: KanbanColumn;
  index: number;
  total: number;
  isDragging: boolean;
  isDragOver: boolean;
  onToggleVisible: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onDelete: (column: KanbanColumn) => void;
  onDragStart: (e: React.DragEvent, column: KanbanColumn) => void;
  onDragOver: (e: React.DragEvent, column: KanbanColumn) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, column: KanbanColumn) => void;
}

export function ColumnOrderItem({
  column,
  index,
  total,
  isDragging,
  isDragOver,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ColumnOrderItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, column)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, column); }}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, column)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all select-none
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
        ${isDragOver ? 'border-primary bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
    >
      {/* Grip */}
      <span className="cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0">
        <GripVertical size={16} />
      </span>

      {/* Flechas */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(column.id)}
          disabled={index === 0}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => onMoveDown(column.id)}
          disabled={index === total - 1}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Checkbox visible */}
      <input
        type="checkbox"
        checked={column.visible}
        onChange={() => onToggleVisible(column.id)}
        className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer flex-shrink-0"
      />

      {/* Dot de color */}
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: column.color }}
      />

      {/* Nombre */}
      <span className={`flex-1 text-sm font-medium truncate ${column.visible ? 'text-gray-900' : 'text-gray-400'}`}>
        {column.nombre}
      </span>

      {/* Eliminar */}
      <button
        onClick={() => onDelete(column)}
        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded hover:bg-red-50"
        title="Eliminar columna"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
