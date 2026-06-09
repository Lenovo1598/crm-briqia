'use client';

interface SuggestionButtonsProps {
  onSelect: (text: string) => void;
}

const SUGGESTIONS = [
  'Busco un 2 ambientes en Palermo',
  '¿Qué tenés disponible hasta 150 mil dólares?',
  'Necesito una casa con jardín en zona norte',
  'Estoy mirando para invertir, ¿qué me recomendás?',
];

export default function SuggestionButtons({ onSelect }: SuggestionButtonsProps) {
  return (
    <div className="px-8 py-6">
      <p className="text-xs text-gray-400 mb-3">Sugerencias para empezar:</p>
      <div className="grid grid-cols-2 gap-2 max-w-lg">
        {SUGGESTIONS.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(text)}
            className="px-4 py-2 text-xs text-green-700 border border-green-200 rounded-full bg-white hover:bg-green-50 transition-colors text-left"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
