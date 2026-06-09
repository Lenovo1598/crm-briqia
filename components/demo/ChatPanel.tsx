'use client';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import SuggestionButtons from './SuggestionButtons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

function DecorativeBackground() {
  const icons = ['♥', '★', '♦', '♪', '☺', '●', '◆'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
      <div className="grid grid-cols-12 gap-8 p-8">
        {Array.from({ length: 72 }).map((_, i) => (
          <span key={i} className="text-2xl text-gray-400 text-center select-none">
            {icons[i % icons.length]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, onSendMessage, loading }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSend() {
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="p-8 border-b border-gray-100">
        <p className="text-xs text-gray-500 italic mb-2">✦ Demo en vivo</p>
        <h1 className="text-4xl text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Conversá con <em>Flip</em>
        </h1>
        <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
          Probá el copiloto en tiempo real. Hacele preguntas, pedile que simule un cliente
          o que califique un lead. La conversación se mantiene mientras no reinicies.
        </p>
      </div>

      {/* Sugerencias (solo sin mensajes) */}
      {messages.length === 0 && (
        <SuggestionButtons onSelect={onSendMessage} />
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {messages.length === 0 && <DecorativeBackground />}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-3">
          <input
            type="text"
            placeholder="Escribí un mensaje"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="flex-1 outline-none text-sm bg-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:opacity-40 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enter para enviar · Shift + Enter para salto de línea
        </p>
      </div>
    </div>
  );
}
