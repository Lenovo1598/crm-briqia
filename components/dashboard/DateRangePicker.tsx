'use client';

type Preset = '7d' | '30d' | '90d';

interface DateRangePickerProps {
  from: Date;
  to: Date;
  activePreset: Preset | null;
  onPreset: (preset: Preset) => void;
  onRangeChange: (from: Date, to: Date) => void;
}

function toInputValue(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function DateRangePicker({ from, to, activePreset, onPreset, onRangeChange }: DateRangePickerProps) {
  const presets: { label: string; value: Preset }[] = [
    { label: '7 días',  value: '7d'  },
    { label: '30 días', value: '30d' },
    { label: '90 días', value: '90d' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Botones predefinidos */}
      <div className="flex gap-1.5">
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => onPreset(p.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activePreset === p.value
                ? 'bg-primary text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Separador */}
      <span className="text-gray-300 text-sm hidden sm:inline">|</span>

      {/* Rango custom */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Desde</span>
        <input
          type="date"
          value={toInputValue(from)}
          max={toInputValue(to)}
          onChange={e => onRangeChange(new Date(e.target.value), to)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <span className="text-xs text-gray-500 font-medium">Hasta</span>
        <input
          type="date"
          value={toInputValue(to)}
          min={toInputValue(from)}
          max={toInputValue(new Date())}
          onChange={e => onRangeChange(from, new Date(e.target.value))}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>
    </div>
  );
}
