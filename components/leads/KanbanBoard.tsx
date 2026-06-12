'use client';

import { useState } from 'react';
import { Lead, KanbanColumn, resolveColumnName, getUniquePaises, columnNameToTemperatura } from '@/lib/leads';
import { KanbanColumn as KanbanColumnComponent } from './KanbanColumn';
import { LeadModal } from './LeadModal';
import { AddColumnModal } from './AddColumnModal';
import { ColumnSelectorModal } from './ColumnSelectorModal';
import { Search, Plus, Power, Columns } from 'lucide-react';

interface KanbanBoardProps {
  initialLeads: Lead[];
  initialColumns: KanbanColumn[];
  isAdmin: boolean;
  agentActive: boolean;
  onAgentToggle: (active: boolean) => void;
}

export function KanbanBoard({
  initialLeads,
  initialColumns,
  isAdmin,
  agentActive,
  onAgentToggle,
}: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [columns, setColumns] = useState<KanbanColumn[]>(
    [...initialColumns].sort((a, b) => a.orden - b.orden)
  );
  const [search, setSearch] = useState('');
  const [selectedPais, setSelectedPais] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const paises = ['Todos', ...getUniquePaises(leads)];

  // Solo columnas visibles en el tablero
  const visibleColumns = columns.filter(c => c.visible);

  // Filtrar leads
  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      !search ||
      (lead.nombre?.toLowerCase().includes(search.toLowerCase())) ||
      lead.whatsapp_id.includes(search);
    const matchPais =
      selectedPais === 'Todos' || lead.pais_residencia === selectedPais;
    return matchSearch && matchPais;
  });

  // Drop de lead en otra columna
  const handleDrop = async (columnId: number) => {
    if (!draggedLead) return;
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${draggedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperatura: columnNameToTemperatura(column.nombre) }),
      });
      if (response.ok) {
        const updated = await response.json();
        setLeads(prev => prev.map(l => l.id === draggedLead.id ? updated : l));
      }
    } catch (error) {
      console.error('Error actualizando lead:', error);
    } finally {
      setDraggedLead(null);
      setDragOverColumnId(null);
      setLoading(false);
    }
  };

  // Guardar lead editado
  const handleSaveLead = async (updated: Lead) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        const result = await response.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? result : l));
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error guardando lead:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Agregar columna nueva
  const handleAddColumn = async (nombre: string, color: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, color }),
      });
      if (response.ok) {
        const newColumn = await response.json();
        setColumns(prev => [...prev, newColumn].sort((a, b) => a.orden - b.orden));
      }
    } catch (error) {
      console.error('Error creando columna:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Guardar orden y visibilidad desde el modal selector
  const handleSaveColumns = async (updatedColumns: KanbanColumn[]) => {
    const updates = updatedColumns.map((c, i) => ({ id: c.id, orden: i + 1, visible: c.visible }));
    const response = await fetch('/api/columns/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    if (response.ok) {
      const saved: KanbanColumn[] = await response.json();
      setColumns(saved.sort((a, b) => a.orden - b.orden));
    }
  };

  // Eliminar columna (con opción de mover leads)
  const handleDeleteColumn = async (columnId: number, moveTo?: string) => {
    const params = new URLSearchParams({ force: 'true' });
    if (moveTo) params.set('moveTo', moveTo);

    const response = await fetch(`/api/columns/${columnId}?${params}`, { method: 'DELETE' });
    if (response.ok) {
      setColumns(prev => prev.filter(c => c.id !== columnId));
      if (moveTo) {
        // Actualizar estado de leads localmente
        const col = columns.find(c => c.id === columnId);
        if (col) {
          const newTemperatura = columnNameToTemperatura(moveTo);
          setLeads(prev => prev.map(l =>
            resolveColumnName(l.temperatura, columns) === col.nombre
              ? { ...l, temperatura: newTemperatura }
              : l
          ));
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tablero de Leads</h1>
          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o teléfono..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Botón Seleccionar columnas */}
            <button
              onClick={() => setShowColumnSelector(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
              title="Configurar columnas"
            >
              <Columns size={16} />
              <span className="hidden sm:inline">Columnas</span>
            </button>

            {/* Agregar columna */}
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              title="Nueva columna"
            >
              <Plus size={16} />
            </button>

            {/* ON/OFF agente (solo admin) */}
            {isAdmin && (
              <button
                onClick={() => onAgentToggle(!agentActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  agentActive ? 'bg-primary' : 'bg-gray-400'
                }`}
              >
                <Power size={16} />
                {agentActive ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>

        {/* Filtros por país de residencia */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="text-sm text-gray-600 font-medium self-center whitespace-nowrap">
            País:
          </span>
          {paises.map((pais) => (
            <button
              key={pais}
              onClick={() => setSelectedPais(pais)}
              className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedPais === pais
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {pais}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban — solo columnas visibles */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4">
          {visibleColumns.map((column) => {
            const columnLeads = filteredLeads.filter(
              l => resolveColumnName(l.temperatura, columns) === column.nombre
            );
            return (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                leads={columnLeads}
                onLeadOpen={setSelectedLead}
                onDragStart={(_, lead) => setDraggedLead(lead)}
                onDragOver={() => setDragOverColumnId(column.id)}
                onDragLeave={() => setDragOverColumnId(null)}
                onDrop={() => handleDrop(column.id)}
                isDraggedOver={dragOverColumnId === column.id}
              />
            );
          })}

          {visibleColumns.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No hay columnas visibles.{' '}
              <button
                onClick={() => setShowColumnSelector(true)}
                className="ml-1 text-primary underline"
              >
                Configurar columnas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          columns={columns}
          onClose={() => setSelectedLead(null)}
          onSave={handleSaveLead}
        />
      )}

      {showAddColumn && (
        <AddColumnModal
          onClose={() => setShowAddColumn(false)}
          onAdd={handleAddColumn}
        />
      )}

      {showColumnSelector && (
        <ColumnSelectorModal
          columns={columns}
          leads={leads}
          onClose={() => setShowColumnSelector(false)}
          onSave={handleSaveColumns}
          onDeleteColumn={handleDeleteColumn}
        />
      )}
    </div>
  );
}
