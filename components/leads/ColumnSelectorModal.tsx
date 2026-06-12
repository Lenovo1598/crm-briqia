'use client';

import { useState, useCallback } from 'react';
import { X, Columns } from 'lucide-react';
import { KanbanColumn, Lead, resolveColumnName } from '@/lib/leads';
import { ColumnOrderItem } from './ColumnOrderItem';

interface DeleteConfirmState {
  column: KanbanColumn;
  leadCount: number;
}

interface ColumnSelectorModalProps {
  columns: KanbanColumn[];
  leads: Lead[];
  onClose: () => void;
  onSave: (updatedColumns: KanbanColumn[]) => Promise<void>;
  onDeleteColumn: (columnId: number, moveTo?: string) => Promise<void>;
}

export function ColumnSelectorModal({
  columns: initialColumns,
  leads,
  onClose,
  onSave,
  onDeleteColumn,
}: ColumnSelectorModalProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    [...initialColumns].sort((a, b) => a.orden - b.orden)
  );
  const [draggingColumn, setDraggingColumn] = useState<KanbanColumn | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [moveToColumn, setMoveToColumn] = useState('');

  // ── Visibilidad ──────────────────────────────────────────────
  const handleToggleVisible = (id: number) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const handleSelectAll = () => setColumns(prev => prev.map(c => ({ ...c, visible: true })));
  const handleDeselectAll = () => setColumns(prev => prev.map(c => ({ ...c, visible: false })));

  // ── Reordenamiento con flechas ────────────────────────────────
  const handleMoveUp = (id: number) => {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (id: number) => {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  // ── Drag & Drop ───────────────────────────────────────────────
  const handleDragStart = useCallback((_: React.DragEvent, column: KanbanColumn) => {
    setDraggingColumn(column);
  }, []);

  const handleDragOver = useCallback((_: React.DragEvent, column: KanbanColumn) => {
    if (draggingColumn?.id !== column.id) setDragOverColumn(column);
  }, [draggingColumn]);

  const handleDrop = useCallback((_: React.DragEvent, target: KanbanColumn) => {
    if (!draggingColumn || draggingColumn.id === target.id) return;
    setColumns(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(c => c.id === draggingColumn.id);
      const toIdx = next.findIndex(c => c.id === target.id);
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggingColumn(null);
    setDragOverColumn(null);
  }, [draggingColumn]);

  const handleDragEnd = useCallback(() => {
    setDraggingColumn(null);
    setDragOverColumn(null);
  }, []);

  // ── Eliminar ──────────────────────────────────────────────────
  const handleDeleteRequest = async (column: KanbanColumn) => {
    const count = leads.filter(l => resolveColumnName(l.temperatura, columns) === column.nombre).length;
    if (count > 0) {
      setDeleteConfirm({ column, leadCount: count });
      setMoveToColumn('');
    } else {
      await onDeleteColumn(column.id);
      setColumns(prev => prev.filter(c => c.id !== column.id));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    await onDeleteColumn(deleteConfirm.column.id, moveToColumn || undefined);
    setColumns(prev => prev.filter(c => c.id !== deleteConfirm.column.id));
    setDeleteConfirm(null);
  };

  // ── Guardar ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = columns.map((c, i) => ({ ...c, orden: i + 1 }));
      await onSave(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // ── Vista previa ──────────────────────────────────────────────
  const visibleColumns = columns.filter(c => c.visible);

  const getLeadsForColumn = (columnName: string) =>
    leads.filter(l => resolveColumnName(l.temperatura, columns) === columnName).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Columns size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Seleccionar columnas visibles</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-green-50 transition"
            >
              Seleccionar todas
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Deseleccionar todas
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Sección 1: Orden de columnas */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Orden de columnas
            </h3>
            <div className="space-y-1.5">
              {columns.map((col, idx) => (
                <ColumnOrderItem
                  key={col.id}
                  column={col}
                  index={idx}
                  total={columns.length}
                  isDragging={draggingColumn?.id === col.id}
                  isDragOver={dragOverColumn?.id === col.id}
                  onToggleVisible={handleToggleVisible}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={handleDeleteRequest}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </section>

          {/* Sección 2: Vista previa del Kanban */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Vista previa del Kanban
            </h3>
            {visibleColumns.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                No hay columnas visibles. Activá al menos una.
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(visibleColumns.length, 6)}, minmax(140px, 1fr))`,
                  }}
                >
                  {visibleColumns.map(col => {
                    const colLeads = getLeadsForColumn(col.nombre);
                    const totalCount = leads.filter(l => resolveColumnName(l.temperatura, columns) === col.nombre).length;
                    return (
                      <div
                        key={col.id}
                        className="bg-gray-50 rounded-xl border border-gray-100 p-3 min-w-[140px]"
                      >
                        {/* Header columna */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: col.color }}
                          />
                          <span className="text-xs font-semibold text-gray-700 truncate leading-tight">
                            {col.nombre}
                          </span>
                          <span className="ml-auto bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {totalCount}
                          </span>
                        </div>
                        {/* Mini tarjetas */}
                        <div className="space-y-1">
                          {colLeads.map(lead => (
                            <div
                              key={lead.id}
                              className="bg-white border border-gray-100 rounded-lg px-2 py-1.5"
                            >
                              <p className="text-[11px] font-medium text-gray-800 truncate">
                                {lead.nombre || lead.whatsapp_id}
                              </p>
                              {lead.pais_residencia && (
                                <p className="text-[10px] text-gray-400 truncate">{lead.pais_residencia}</p>
                              )}
                            </div>
                          ))}
                          {totalCount === 0 && (
                            <div className="text-[10px] text-gray-300 text-center py-1">
                              Sin leads
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar columna con leads */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Eliminar columna "{deleteConfirm.column.nombre}"
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta columna tiene <strong>{deleteConfirm.leadCount} lead{deleteConfirm.leadCount !== 1 ? 's' : ''}</strong>.
              ¿Qué hacemos con ellos?
            </p>

            {/* Opción: mover a otra columna */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Mover leads a otra columna (opcional)
              </label>
              <select
                value={moveToColumn}
                onChange={e => setMoveToColumn(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">— No mover (los leads quedarán huérfanos) —</option>
                {columns
                  .filter(c => c.id !== deleteConfirm.column.id)
                  .map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Eliminar columna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
