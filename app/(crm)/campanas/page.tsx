'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Megaphone, Plus, Pencil, Trash2, Users, TrendingUp, DollarSign, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

interface Campana {
  id: number;
  nombre: string;
  plataforma: string;
  estado: 'activa' | 'pausada' | 'terminada';
  presupuesto: number | null;
  gastado: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  meta_campaign_id: string | null;
  descripcion: string | null;
  leads_total: number;
  leads_calientes: number;
  leads_tibios: number;
  leads_frios: number;
  created_at: string;
}

const ESTADO_COLORS = {
  activa:    'bg-green-100 text-green-800',
  pausada:   'bg-yellow-100 text-yellow-800',
  terminada: 'bg-gray-100 text-gray-600',
};

const EMPTY: Partial<Campana> = {
  nombre: '',
  plataforma: 'meta',
  estado: 'activa',
  presupuesto: undefined,
  fecha_inicio: '',
  fecha_fin: '',
  meta_campaign_id: '',
  descripcion: '',
};

export default function CampanasPage() {
  const [campanas, setCampanas]   = useState<Campana[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Campana | null>(null);
  const [form, setForm]           = useState<Partial<Campana>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  });

  const fetchCampanas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/campanas', { headers: authHeader() });
      if (!res.ok) throw new Error();
      setCampanas(await res.json());
    } catch {
      setError('Error al cargar campañas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampanas(); }, [fetchCampanas]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (c: Campana) => {
    setEditing(c);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre?.trim()) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url    = editing ? `/api/campanas/${editing.id}` : '/api/campanas';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setShowModal(false);
      fetchCampanas();
    } catch {
      alert('Error al guardar la campaña.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/campanas/${id}`, { method: 'DELETE', headers: authHeader() });
      setDeleteId(null);
      fetchCampanas();
    } catch {
      alert('Error al eliminar la campaña.');
    }
  };

  const fmt = (n: number | null) =>
    n != null ? `$${Number(n).toLocaleString('es-AR')}` : '—';

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <AuthGuard>
      <div className="flex-1 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Campañas Activas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Campañas publicitarias de Meta Ads y leads atraídos</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCampanas} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Actualizar">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus size={16} /> Nueva campaña
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Resumen global */}
          {campanas.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                label="Campañas activas"
                value={campanas.filter(c => c.estado === 'activa').length}
                icon={<Megaphone size={18} className="text-primary" />}
              />
              <SummaryCard
                label="Total leads"
                value={campanas.reduce((a, c) => a + c.leads_total, 0)}
                icon={<Users size={18} className="text-blue-500" />}
              />
              <SummaryCard
                label="Leads calientes"
                value={campanas.reduce((a, c) => a + c.leads_calientes, 0)}
                icon={<TrendingUp size={18} className="text-red-500" />}
              />
              <SummaryCard
                label="Presupuesto total"
                value={fmt(campanas.reduce((a, c) => a + (c.presupuesto ?? 0), 0))}
                icon={<DollarSign size={18} className="text-green-500" />}
              />
            </div>
          )}

          {/* Estados */}
          {loading && (
            <div className="text-center py-16 text-gray-400">Cargando campañas...</div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {!loading && !error && campanas.length === 0 && (
            <div className="text-center py-20">
              <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No hay campañas todavía</p>
              <p className="text-sm text-gray-400 mt-1">Creá tu primera campaña para empezar a trackear leads</p>
              <button onClick={openCreate} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition">
                Crear campaña
              </button>
            </div>
          )}

          {/* Lista de campañas */}
          {!loading && campanas.length > 0 && (
            <div className="grid gap-4">
              {campanas.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{c.nombre}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[c.estado]}`}>
                          {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium uppercase">
                          {c.plataforma}
                        </span>
                      </div>
                      {c.descripcion && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.descripcion}</p>
                      )}
                      {c.meta_campaign_id && (
                        <p className="text-xs text-gray-400 mt-0.5">ID Meta: {c.meta_campaign_id}</p>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Metric label="Leads totales" value={c.leads_total} color="text-gray-900" />
                    <Metric label="Calientes" value={c.leads_calientes} color="text-red-600" />
                    <Metric label="Tibios" value={c.leads_tibios} color="text-yellow-600" />
                    <Metric label="Fríos" value={c.leads_frios} color="text-blue-600" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} /> Presupuesto: {fmt(c.presupuesto)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} /> Gastado: {fmt(c.gastado)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Inicio: {fmtDate(c.fecha_inicio)}
                    </span>
                    {c.fecha_fin && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Fin: {fmtDate(c.fecha_fin)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">
                {editing ? 'Editar campaña' : 'Nueva campaña'}
              </h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Field label="Nombre *">
                <input
                  type="text"
                  value={form.nombre || ''}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Ej: Meta Leads - Junio 2026"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Plataforma">
                  <select
                    value={form.plataforma || 'meta'}
                    onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="meta">Meta (FB/IG)</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
                <Field label="Estado">
                  <select
                    value={form.estado || 'activa'}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="terminada">Terminada</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Presupuesto (USD)">
                  <input
                    type="number"
                    value={form.presupuesto ?? ''}
                    onChange={e => setForm(f => ({ ...f, presupuesto: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </Field>
                <Field label="Gastado (USD)">
                  <input
                    type="number"
                    value={form.gastado ?? ''}
                    onChange={e => setForm(f => ({ ...f, gastado: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha inicio">
                  <input
                    type="date"
                    value={form.fecha_inicio?.slice(0, 10) || ''}
                    onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value || null }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Fecha fin">
                  <input
                    type="date"
                    value={form.fecha_fin?.slice(0, 10) || ''}
                    onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value || null }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </Field>
              </div>
              <Field label="ID de campaña en Meta (opcional)">
                <input
                  type="text"
                  value={form.meta_campaign_id || ''}
                  onChange={e => setForm(f => ({ ...f, meta_campaign_id: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Ej: 120215..."
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  value={form.descripcion || ''}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </Field>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nombre?.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear campaña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar campaña</h3>
            <p className="text-sm text-gray-600 mb-6">
              Los leads vinculados quedarán sin campaña asignada. ¿Confirmás?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
