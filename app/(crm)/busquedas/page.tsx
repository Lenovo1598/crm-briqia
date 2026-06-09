'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { BusquedasTable } from '@/components/busquedas/BusquedasTable';
import { NuevaBusquedaModal, BusquedaData } from '@/components/busquedas/NuevaBusquedaModal';
import { Plus, Upload, Download, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface BusquedaRow extends BusquedaData {
  matches_count: number;
}

const TIPOS = ['','CASA','DEPTO','PH','LOTE','LOCAL','GALPON','OFICINA'];

export default function BusquedasPage() {
  const [busquedas, setBusquedas]     = useState<BusquedaRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [tipoFilter, setTipoFilter]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<BusquedaData | null>(null);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  });

  const fetchBusquedas = useCallback(async (q = search, tipo = tipoFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q)    params.set('search', q);
      if (tipo) params.set('tipo', tipo);
      const res = await fetch(`/api/busquedas?${params}`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      setBusquedas(await res.json());
    } catch {
      setError('Error al cargar búsquedas.');
    } finally {
      setLoading(false);
    }
  }, [search, tipoFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchBusquedas(search, tipoFilter), 300);
    return () => clearTimeout(t);
  }, [search, tipoFilter]);

  const handleSave = async (data: Record<string, any>) => {
    const method = editing ? 'PUT' : 'POST';
    const url    = editing ? `/api/busquedas/${editing.id}` : '/api/busquedas';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowModal(false);
      setEditing(null);
      await fetchBusquedas();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta búsqueda?')) return;
    await fetch(`/api/busquedas/${id}`, { method: 'DELETE', headers: authHeader() });
    setBusquedas(prev => prev.filter(b => b.id !== id));
  };

  const handleExport = () => {
    const token = localStorage.getItem('auth_token');
    window.open(`/api/busquedas/export?token=${token}`, '_blank');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/busquedas/import', {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      });
      const result = await res.json();
      setImportResult(result);
      await fetchBusquedas();
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 min-h-screen bg-gray-50">

        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Búsquedas</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {busquedas.length} registro{busquedas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                <Upload size={14} />
                {importing ? 'Importando...' : 'Importar CSV'}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Download size={14} />
                Exportar CSV
              </button>

              <button
                onClick={() => fetchBusquedas()}
                disabled={loading}
                className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                title="Actualizar"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
              </button>

              <button
                onClick={() => { setEditing(null); setShowModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                <Plus size={15} />
                Nueva búsqueda
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por agente, zona, dirección..."
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-72 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <select
              value={tipoFilter}
              onChange={e => setTipoFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {TIPOS.map(t => (
                <option key={t} value={t}>{t || 'Todos los tipos'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {importResult && (
            <div className={`mb-4 flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${
              importResult.errors.length > 0
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{importResult.imported} búsqueda{importResult.imported !== 1 ? 's' : ''} importada{importResult.imported !== 1 ? 's' : ''}.</p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 text-xs space-y-0.5">
                    {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                    {importResult.errors.length > 5 && <li>... y {importResult.errors.length - 5} errores más.</li>}
                  </ul>
                )}
              </div>
              <button onClick={() => setImportResult(null)} className="ml-auto text-current opacity-50 hover:opacity-100">✕</button>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <BusquedasTable
              busquedas={busquedas}
              onEdit={b => { setEditing(b); setShowModal(true); }}
              onDelete={handleDelete}
            />
          )}
        </div>

        {showModal && (
          <NuevaBusquedaModal
            busqueda={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </AuthGuard>
  );
}
