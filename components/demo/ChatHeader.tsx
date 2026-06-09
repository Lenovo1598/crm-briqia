'use client';
import { ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  onReset: () => void;
  onBack: () => void;
}

export default function ChatHeader({ onReset, onBack }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-900">Flip</span>
        <span className="text-xs font-medium text-gray-400 tracking-widest">DEMO</span>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={onReset}
          className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          Reiniciar
        </button>
        <button
          onClick={onBack}
          className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={14} />
          Volver
        </button>
      </div>
    </header>
  );
}
