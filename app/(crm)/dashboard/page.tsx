'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { Users, Calendar, TrendingUp } from 'lucide-react';

// ── Tipos ───────────────────────────────────────────────────────────────────

type Preset = '7d' | '30d' | '90d';

interface StatsData {
  total: number;
  last7days: number;
  last30days: number;
  byDate: {
    date: string;
    total: number;
    frio: number;
    tibio: number;
    caliente: number;
  }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function presetToDates(preset: Preset): { from: Date; to: Date } {
  const to   = new Date();
  const from = new Date();
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  from.setDate(from.getDate() - days);
  return { from, to };
}

// ── Página ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState<Preset>('30d');
  const [dateRange, setDateRange] = useState(() => presetToDates('30d'));
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async (from: Date, to: Date) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `/api/stats?from=${from.toISOString()}&to=${to.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError('Error al cargar estadísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(dateRange.from, dateRange.to);
  }, [dateRange, fetchStats]);

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    setDateRange(presetToDates(preset));
  };

  const handleCustomRange = (from: Date, to: Date) => {
    setActivePreset(null as any);
    setDateRange({ from, to });
  };

  return (
    <AuthGuard>
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Métricas y estadísticas de leads</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total de Leads"
              value={stats?.total ?? '—'}
              subtitle="Todos los leads registrados"
              icon={<Users size={18} />}
            />
            <StatCard
              title="Últimos 7 días"
              value={stats?.last7days ?? '—'}
              subtitle="Leads ingresados esta semana"
              icon={<Calendar size={18} />}
            />
            <StatCard
              title="Últimos 30 días"
              value={stats?.last30days ?? '—'}
              subtitle="Leads ingresados este mes"
              icon={<TrendingUp size={18} />}
            />
          </div>

          {/* ── Gráfico ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900">Leads por período</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Total, tibios y fríos según fecha de ingreso
              </p>
            </div>

            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              activePreset={activePreset}
              onPreset={handlePreset}
              onRangeChange={handleCustomRange}
            />

            <div className="mt-5">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <LeadsChart data={stats?.byDate ?? []} />
              )}
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
