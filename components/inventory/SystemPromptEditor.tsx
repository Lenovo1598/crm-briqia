'use client';
import { useState } from 'react';

interface SystemPromptEditorProps {
  initialContent: string;
  isCustomized: boolean;
  onSave: (content: string) => Promise<void>;
  onRestoreDefault: () => Promise<void>;
}

export default function SystemPromptEditor({
  initialContent,
  isCustomized,
  onSave,
  onRestoreDefault,
}: SystemPromptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const hasChanges = content !== initialContent;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(content);
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    if (!confirm('¿Restaurar el prompt al default? Se perderán los cambios no guardados.')) return;
    setRestoring(true);
    try {
      await onRestoreDefault();
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h2 className="text-base font-bold text-gray-900">System prompt del agente</h2>
          <p className="text-xs text-gray-600 mt-1">
            Este es el mensaje de sistema que recibe el agente de IA en cada conversación.
            Los cambios se aplican en el siguiente mensaje del chat.
          </p>
        </div>
        {isCustomized && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full shrink-0 ml-4">
            Personalizado
          </span>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mt-4 px-4 py-3 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-gray-400 transition-colors"
        rows={14}
        spellCheck={false}
      />

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar prompt'}
          </button>
          <button
            onClick={() => setContent(initialContent)}
            disabled={!hasChanges}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Descartar cambios
          </button>
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="px-5 py-2 border border-red-200 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {restoring ? 'Restaurando...' : 'Restaurar default'}
          </button>
        </div>
        <p className="text-xs text-gray-500 shrink-0 ml-4">
          {content.length.toLocaleString('es-AR')} caracteres
        </p>
      </div>
    </div>
  );
}
