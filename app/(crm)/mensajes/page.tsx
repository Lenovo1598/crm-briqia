'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { SeguimientoCard } from '@/components/mensajes/SeguimientoCard';
import { SeguimientoList, SeguimientoAgrupado } from '@/components/mensajes/SeguimientoList';
import { formatPhone } from '@/lib/utils';
import {
  Calendar,
  MessageCircleX,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

// ── Tipos ───────────────────────────────────────────────────────────────────

interface SeguimientosData {
  pendientes: { fecha: string; label: string; mensajes: number }[];
  enviados: SeguimientoAgrupado[];
  totalPendientes: number;
  totalEnviados: number;
}

interface MensajePendiente {
  id: number;
  remote_jid: string;
  mensaje: string;
  push_name: string | null;
  chatwoot_conversation_id: number | null;
  fecha_recibido: string;
  estado: 'pendiente' | 'procesado';
  intentos_procesamiento: number;
}

// ── Página ──────────────────────────────────────────────────────────────────

export default function MensajesPage() {
  const [tab, setTab] = useState<'seguimientos' | 'agente-off'>('seguimientos');

  const [segData, setSegData] = useState<SeguimientosData | null>(null);
  const [mensajes, setMensajes] = useState<MensajePendiente[]>([]);
  const [filtroMsg, setFiltroMsg] = useState<'todos' | 'pendiente' | 'procesado'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [segRes, msgRes] = await Promise.all([
        fetch('/api/seguimientos', { headers }),
        fetch('/api/mensajes-pendientes', { headers }),
      ]);

      if (!segRes.ok || !msgRes.ok) throw new Error('Error en la respuesta del servidor');

      const [seg, msg] = await Promise.all([segRes.json(), msgRes.json()]);
      setSegData(seg);
      setMensajes(Array.isArray(msg) ? msg : []);
    } catch {
      setError('Error al cargar datos. Verificá la conexión con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const msgPendientes = mensajes.filter(m => m.estado === 'pendiente').length;
  const filteredMensajes = mensajes.filter(m =>
    filtroMsg === 'todos' ? true : m.estado === filtroMsg
  );

  return (
    <AuthGuard>
      <div className="flex-1 min-h-screen bg-gray-50">

        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mensajes Programados</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Seguimientos automáticos y mensajes recibidos con agente OFF
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>

          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setTab('seguimientos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'seguimientos' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={15} />
              Seguimiento orgánico
              {(segData?.totalPendientes ?? 0) > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === 'seguimientos' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {segData!.totalPendientes.toLocaleString('es-AR')}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('agente-off')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'agente-off' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircleX size={15} />
              Mensajes con agente OFF
              {msgPendientes > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === 'agente-off' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {msgPendientes}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-5xl">
          {error && (
            <div className="mb-5 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : tab === 'seguimientos' ? (
            <SeguimientosTab data={segData} />
          ) : (
            <AgenteOffTab
              mensajes={filteredMensajes}
              total={mensajes.length}
              pendientes={msgPendientes}
              procesados={mensajes.filter(m => m.estado === 'procesado').length}
              filtro={filtroMsg}
              onFiltro={setFiltroMsg}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

// ── Subcomponente: tab seguimientos ─────────────────────────────────────────

function SeguimientosTab({ data }: { data: SeguimientosData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard value={data.totalPendientes + data.totalEnviados} label="Total" color="gray" />
        <StatCard value={data.totalPendientes} label="Pendientes" color="yellow" />
        <StatCard value={data.totalEnviados}   label="Enviados"   color="green" />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <h3 className="text-base font-bold text-gray-900">
            Seguimiento orgánico
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.totalPendientes.toLocaleString('es-AR')} pendiente{data.totalPendientes !== 1 ? 's' : ''})
            </span>
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Mensajes programados que aún no se han enviado</p>

        {data.pendientes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl text-sm">
            No hay seguimientos pendientes
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.pendientes.map((seg, idx) => (
              <SeguimientoCard
                key={idx}
                fecha={seg.fecha}
                label={seg.label}
                mensajes={seg.mensajes}
                estado="pendiente"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="text-base font-bold text-gray-900">
            Enviados
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.totalEnviados.toLocaleString('es-AR')} en total)
            </span>
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Mensajes que ya fueron enviados — últimas 20 fechas</p>
        <SeguimientoList seguimientos={data.enviados} />
      </section>
    </div>
  );
}

// ── Subcomponente: tab agente off ────────────────────────────────────────────

function AgenteOffTab({
  mensajes, total, pendientes, procesados, filtro, onFiltro,
}: {
  mensajes: MensajePendiente[];
  total: number;
  pendientes: number;
  procesados: number;
  filtro: 'todos' | 'pendiente' | 'procesado';
  onFiltro: (f: 'todos' | 'pendiente' | 'procesado') => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={total}      label="Total"         color="gray"  />
        <StatCard value={pendientes} label="Sin procesar"  color="red"   />
        <StatCard value={procesados} label="Procesados"    color="green" />
      </div>

      <div className="flex gap-2">
        {(['todos', 'pendiente', 'procesado'] as const).map(f => (
          <button
            key={f}
            onClick={() => onFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === f
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Sin procesar' : 'Procesados'}
          </button>
        ))}
      </div>

      {mensajes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageCircleX size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay mensajes en este período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mensajes.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 font-bold text-sm">
                    {(m.push_name || formatPhone(m.remote_jid))[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {m.push_name || formatPhone(m.remote_jid)}
                      </p>
                      <p className="text-xs text-gray-400">{formatPhone(m.remote_jid)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.mensaje}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                    m.estado === 'procesado'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {m.estado === 'procesado'
                      ? <><CheckCircle size={11} /> Procesado</>
                      : <><Clock size={11} /> Pendiente</>
                    }
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(m.fecha_recibido).toLocaleString('es-AR', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  {m.intentos_procesamiento > 0 && (
                    <p className="text-xs text-gray-400">
                      {m.intentos_procesamiento} intento{m.intentos_procesamiento > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Micro-componente stat card ───────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number; label: string; color: 'gray' | 'yellow' | 'green' | 'red' }) {
  const colorMap = {
    gray:   'text-gray-900',
    yellow: 'text-yellow-600',
    green:  'text-green-600',
    red:    'text-red-500',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value.toLocaleString('es-AR')}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
