'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/layout/AuthGuard';
import SystemPromptEditor from '@/components/inventory/SystemPromptEditor';
import NuevaPropiedadForm from '@/components/inventory/NuevaPropiedadForm';
import ImportCSVJSONForm from '@/components/inventory/ImportCSVJSONForm';
import InventoryTable from '@/components/inventory/InventoryTable';
import BorrarTodoModal from '@/components/inventory/BorrarTodoModal';

interface PromptData {
  content: string;
  is_customized: boolean;
  character_count: number;
  version: number;
}

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

function InventoryPageContent() {
  const { token } = useAuth();
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showBorrarModal, setShowBorrarModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchPrompt = useCallback(async () => {
    const res = await fetch('/api/system-prompt', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setPromptData(await res.json());
  }, [token]);

  const fetchInventory = useCallback(async () => {
    const res = await fetch('/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchPrompt(), fetchInventory()]).finally(() => setLoading(false));
  }, [token, fetchPrompt, fetchInventory]);

  async function handleSavePrompt(content: string) {
    await fetch('/api/system-prompt', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    await fetchPrompt();
  }

  async function handleRestoreDefault() {
    await fetch('/api/system-prompt/restore-default', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchPrompt();
  }

  async function handleNuevaPropiedad(data: Parameters<typeof NuevaPropiedadForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) {
    await fetch('/api/inventory', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    await fetchInventory();
  }

  async function handleImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/inventory/import', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await res.json();
    await fetchInventory();
    return result;
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchInventory();
  }

  async function handleBorrarTodo() {
    await fetch('/api/inventory?confirm=YES_DELETE_ALL', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowBorrarModal(false);
    await fetchInventory();
  }

  function handleExport() {
    const link = document.createElement('a');
    link.href = `/api/inventory/export`;
    link.setAttribute('Authorization', `Bearer ${token ?? ''}`);
    window.open(`/api/inventory/export?token=${token}`, '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 italic mb-2">✦ Admin</p>
        <h1 className="text-3xl text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Inventario
        </h1>
        <p className="text-sm text-gray-600">
          Subí ítems en formato CSV o JSON. Los errores por fila se muestran debajo del formulario.
        </p>
      </div>

      {/* System Prompt */}
      {promptData && (
        <div className="mb-6">
          <SystemPromptEditor
            initialContent={promptData.content}
            isCustomized={promptData.is_customized}
            onSave={handleSavePrompt}
            onRestoreDefault={handleRestoreDefault}
          />
        </div>
      )}

      {/* Nueva propiedad */}
      <div className="mb-3">
        <NuevaPropiedadForm onSubmit={handleNuevaPropiedad} />
      </div>

      {/* Importar */}
      <div className="mb-8">
        <ImportCSVJSONForm onImport={handleImport} />
      </div>

      {/* Tabla */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Ítems actuales ({items.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => setShowBorrarModal(true)}
              disabled={items.length === 0}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Borrar todo
            </button>
          </div>
        </div>

        <InventoryTable items={items} onDelete={handleDeleteItem} />
      </div>

      {showBorrarModal && (
        <BorrarTodoModal
          count={items.length}
          onConfirm={handleBorrarTodo}
          onClose={() => setShowBorrarModal(false)}
        />
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <AuthGuard requiredRole="admin">
      <InventoryPageContent />
    </AuthGuard>
  );
}
