'use client';

import { UserCircle, Power, Phone } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  phone: string;
  presupuesto?: number | null;
  zona?: string | null;
  agentActive: boolean;
  isAdmin: boolean;
  onToggleAgent: () => void;
}

export function ChatHeader({
  name,
  phone,
  presupuesto,
  zona,
  agentActive,
  isAdmin,
  onToggleAgent,
}: ChatHeaderProps) {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
        <UserCircle size={22} color="white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name || 'Sin nombre'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Phone size={10} className="text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">{phone}</p>
          {zona && <span className="text-xs text-gray-400">· {zona}</span>}
          {presupuesto && (
            <span className="text-xs text-gray-400">
              · US$ {presupuesto >= 1000 ? `${(presupuesto / 1000).toFixed(0)}k` : presupuesto}
            </span>
          )}
        </div>
      </div>

      {/* ON/OFF solo admin */}
      {isAdmin && (
        <button
          onClick={onToggleAgent}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
            agentActive ? 'bg-primary text-white' : 'bg-gray-500 text-white'
          }`}
        >
          <Power size={13} />
          {agentActive ? 'ON' : 'OFF'}
        </button>
      )}
    </div>
  );
}
