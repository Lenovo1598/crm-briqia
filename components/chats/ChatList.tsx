'use client';

import { Search, MessageCircle } from 'lucide-react';
import { formatPhone } from '@/lib/utils';

export interface ChatItem {
  id: number;
  display_id: number;
  name: string | null;
  phone: string | null;
  identifier: string | null;
  status: string;
  unread_count: number;
  last_message: string | null;
  updated_at: string;
  presupuesto: number | null;
  zona: string | null;
  propiedad_interes: string | null;
  estado: string | null;
}

interface ChatListProps {
  chats: ChatItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)   return 'ahora';
  if (diffMin < 60)  return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)    return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)     return `${diffD}d`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function ChatList({ chats, selectedId, onSelect, search, onSearchChange }: ChatListProps) {
  return (
    <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle size={16} className="text-[#25D366]" />
            Chats WhatsApp
            <span className="text-xs font-normal text-gray-400">({chats.length})</span>
          </h2>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-4 text-center">
            <MessageCircle size={32} className="opacity-30 mb-2" />
            <p className="text-xs">No hay conversaciones</p>
          </div>
        ) : (
          chats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              selected={selectedId === chat.id}
              onClick={() => onSelect(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ChatListItem({
  chat,
  selected,
  onClick,
}: {
  chat: ChatItem;
  selected: boolean;
  onClick: () => void;
}) {
  const displayName = chat.name || formatPhone(chat.phone || chat.identifier || '');
  const phone = chat.phone || chat.identifier || '';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition text-left ${
        selected ? 'bg-green-50 border-l-2 border-l-primary' : 'hover:bg-gray-50 border-l-2 border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
        {displayName[0]?.toUpperCase() ?? '?'}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(chat.updated_at)}</span>
        </div>

        <p className="text-xs text-gray-500 truncate mt-0.5">
          {chat.last_message || phone}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {(chat.unread_count ?? 0) > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </span>
          )}
          {chat.propiedad_interes && (
            <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
              {chat.propiedad_interes}
            </span>
          )}
          {chat.estado && (
            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[70px]">
              {chat.estado}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
