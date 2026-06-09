'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  total: number;
  frio: number;
  tibio: number;
  caliente: number;
}

interface LeadsChartProps {
  data: DataPoint[];
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">
        {new Date(label).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-bold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function LeadsChart({ data }: LeadsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#166534" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#166534" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          stroke="#D1D5DB"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#D1D5DB"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
        />

        <Area
          type="monotone"
          dataKey="total"
          name="Total"
          stroke="#166534"
          strokeWidth={2.5}
          fill="url(#gradTotal)"
          dot={false}
          activeDot={{ r: 4, fill: '#166534' }}
        />
        <Area
          type="monotone"
          dataKey="tibio"
          name="Tibios"
          stroke="#F59E0B"
          strokeWidth={2}
          fill="none"
          dot={false}
          activeDot={{ r: 3, fill: '#F59E0B' }}
        />
        <Area
          type="monotone"
          dataKey="frio"
          name="Fríos"
          stroke="#3B82F6"
          strokeWidth={1.5}
          fill="none"
          dot={false}
          activeDot={{ r: 3, fill: '#3B82F6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
