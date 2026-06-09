'use client';

import { useEffect, useRef } from 'react';
import { MessageSquareOff, ChevronUp } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from './ChatHeader';
import { ChatItem } from './ChatList';

interface Message {
  id: number;
  content: string;
  type: 'incoming' | 'outgoing';
  time: string;
}

interface ChatWindowProps {
  chat: ChatItem | null;
  messages: Message[];
  agentActive: boolean;
  isAdmin: boolean;
  onToggleAgent: () => void;
  onLoadMore?: () => void;
}

export function ChatWindow({
  chat,
  messages,
  agentActive,
  isAdmin,
  onToggleAgent,
  onLoadMore,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje cuando cambian los mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#ECE5DD] gap-3">
        <MessageSquareOff size={48} className="text-gray-400 opacity-40" />
        <p className="text-sm text-gray-500">Seleccioná una conversación</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Header */}
      <ChatHeader
        name={chat.name || ''}
        phone={chat.phone || chat.identifier || ''}
        presupuesto={chat.presupuesto}
        zona={chat.zona}
        agentActive={agentActive}
        isAdmin={isAdmin}
        onToggleAgent={onToggleAgent}
      />

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto bg-[#ECE5DD] px-4 py-3 flex flex-col gap-2">
        {/* Botón cargar más */}
        {onLoadMore && (
          <button
            onClick={onLoadMore}
            className="self-center flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <ChevronUp size={12} />
            Cargar mensajes anteriores
          </button>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-500 bg-white/70 px-3 py-1.5 rounded-full">
              No hay mensajes en esta conversación
            </p>
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer — solo lectura */}
      <div className="bg-[#F0F0F0] px-3 py-2.5 border-t border-gray-200 flex items-center gap-2 flex-shrink-0">
        <div className="flex-1 px-4 py-2.5 rounded-full bg-white/80 text-xs text-gray-400 select-none cursor-not-allowed">
          Los mensajes se envían desde n8n vía Chatwoot — solo lectura
        </div>
      </div>
    </div>
  );
}
