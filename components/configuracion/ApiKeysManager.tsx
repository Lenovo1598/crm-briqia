'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, KeyRound } from 'lucide-react';

interface ApiKey {
  id: number;
  nombre: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  });

  const fetchKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/api-keys', { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al obtener las API Keys');
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar API Keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (nombre: string) => {
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Error al crear la API Key');
    }
    const data = await res.json();
    setNewKey(data.api_key);
    setShowCreate(false);
    fetchKeys();
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('¿Revocar esta API Key? Las integraciones que la usen dejarán de funcionar de inmediato.')) {
      return;
    }
    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Error al revocar la API Key');
      fetchKeys();
    } catch (err: any) {
      setError(err.message || 'Error al revocar la API Key');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          API Keys permanentes para que sistemas externos (n8n, etc.) accedan a la API sin usar el login.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition flex-shrink-0 ml-4"
        >
          <Plus size={15} />
          Nueva API Key
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
      ) : keys.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl text-sm">
          No hay API Keys creadas todavía
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Nombre</th>
                <th className="text-left px-4 py-2 font-medium">Key</th>
                <th className="text-left px-4 py-2 font-medium">Creada</th>
                <th className="text-left px-4 py-2 font-medium">Último uso</th>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{k.nombre}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{k.key_prefix}…</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {new Date(k.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString('es-AR') : 'Nunca'}
                  </td>
                  <td className="px-4 py-2.5">
                    {k.revoked ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Revocada
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Activa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!k.revoked && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="text-gray-400 hover:text-danger p-1"
                        title="Revocar"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateKeyModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      {newKey && (
        <NewKeyModal apiKey={newKey} onClose={() => setNewKey(null)} />
      )}
    </div>
  );
}

function CreateKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (nombre: string) => Promise<void>;
}) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('Ingresá un nombre para identificar esta API Key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreate(nombre.trim());
    } catch (err: any) {
      setError(err.message || 'Error al crear la API Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nueva API Key</h3>
        <p className="text-sm text-gray-600 mb-4">
          Asignale un nombre descriptivo (ej. &quot;n8n - agente001&quot;) para identificarla luego.
        </p>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la integración"
          autoFocus
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
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

function NewKeyModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">API Key creada</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Copiá esta key ahora: por seguridad no se va a volver a mostrar.
        </p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
          <code className="text-xs text-gray-800 break-all flex-1">{apiKey}</code>
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-primary p-1 flex-shrink-0"
            title="Copiar"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
