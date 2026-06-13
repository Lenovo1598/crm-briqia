'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

interface WebhookRow {
  id: number;
  nombre: string;
  url: string;
  eventos: string[];
  secret: string;
  activo: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_status: number | null;
}

const EVENTOS_DISPONIBLES: { value: string; label: string }[] = [
  { value: 'lead.created', label: 'Lead creado' },
  { value: 'lead.updated', label: 'Lead actualizado' },
];

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  });

  const fetchWebhooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/webhooks', { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al obtener los webhooks');
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreate = async (nombre: string, url: string, eventos: string[]) => {
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, url, eventos }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Error al crear el webhook');
    }
    setShowCreate(false);
    fetchWebhooks();
  };

  const handleToggle = async (id: number, activo: boolean) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo }),
      });
      if (!res.ok) throw new Error('Error al actualizar el webhook');
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el webhook');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este webhook?')) return;
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Error al eliminar el webhook');
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el webhook');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Notificá a sistemas externos (ej. n8n) cuando se crea o actualiza un lead.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition flex-shrink-0 ml-4"
        >
          <Plus size={15} />
          Nuevo Webhook
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl text-sm">
          No hay webhooks configurados todavía
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <WebhookCard
              key={wh.id}
              webhook={wh}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateWebhookModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

function WebhookCard({
  webhook,
  onToggle,
  onDelete,
}: {
  webhook: WebhookRow;
  onToggle: (id: number, activo: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhook.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-gray-900">{webhook.nombre}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                webhook.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {webhook.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs text-gray-500 break-all mt-0.5">{webhook.url}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {webhook.eventos.map((e) => (
              <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(webhook.id, !webhook.activo)}
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            {webhook.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={() => onDelete(webhook.id)}
            className="text-gray-400 hover:text-danger p-1"
            title="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0">Secret (HMAC SHA-256):</span>
          <code className="bg-gray-50 px-1.5 py-0.5 rounded truncate">{webhook.secret}</code>
          <button onClick={handleCopySecret} className="text-gray-400 hover:text-primary p-0.5 flex-shrink-0">
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          </button>
        </div>
        <div className="flex-shrink-0">
          {webhook.last_triggered_at ? (
            <>
              Último disparo: {new Date(webhook.last_triggered_at).toLocaleString('es-AR')}
              {webhook.last_status != null && (
                <span className={webhook.last_status < 400 ? 'text-green-600 ml-1' : 'text-red-500 ml-1'}>
                  ({webhook.last_status})
                </span>
              )}
            </>
          ) : (
            'Sin disparos'
          )}
        </div>
      </div>
    </div>
  );
}

function CreateWebhookModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (nombre: string, url: string, eventos: string[]) => Promise<void>;
}) {
  const [nombre, setNombre] = useState('');
  const [url, setUrl] = useState('');
  const [eventos, setEventos] = useState<string[]>(['lead.created', 'lead.updated']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleEvento = (value: string) => {
    setEventos((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !url.trim()) {
      setError('Completá nombre y URL');
      return;
    }
    if (eventos.length === 0) {
      setError('Seleccioná al menos un evento');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreate(nombre.trim(), url.trim(), eventos);
    } catch (err: any) {
      setError(err.message || 'Error al crear el webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Webhook</h3>

        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. n8n - notificaciones de leads"
          autoFocus
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://briqia-n8n.duckdns.org/webhook/..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="block text-xs font-medium text-gray-600 mb-1.5">Eventos</label>
        <div className="space-y-1.5 mb-3">
          {EVENTOS_DISPONIBLES.map((e) => (
            <label key={e.value} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={eventos.includes(e.value)}
                onChange={() => toggleEvento(e.value)}
                className="rounded border-gray-300"
              />
              {e.label}
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}
