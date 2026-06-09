'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { ChatList, ChatItem } from '@/components/chats/ChatList';
import { ChatWindow } from '@/components/chats/ChatWindow';

interface Message {
  id: number;
  content: string;
  type: 'incoming' | 'outgoing';
  time: string;
}

const POLL_INTERVAL = 10_000;

export default function ChatsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [chats, setChats]               = useState<ChatItem[]>([]);
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [search, setSearch]             = useState('');
  const [agentActive, setAgentActive]   = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  });

  const fetchChats = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/chats?search=${encodeURIComponent(q)}`, {
        headers: authHeader(),
      });
      if (res.ok) setChats(await res.json());
    } catch {
      // silencioso
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId: number) => {
    try {
      const res = await fetch(`/api/messages/${chatId}`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      // silencioso
    }
  }, []);

  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agent', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setAgentActive(data.is_active);
      }
    } catch {}
  }, []);

  const toggleAgent = async () => {
    try {
      const res = await fetch('/api/agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ is_active: !agentActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setAgentActive(data.is_active);
      }
    } catch {}
  };

  useEffect(() => {
    fetchChats('');
    fetchAgentStatus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchChats(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchChats]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedId) { setMessages([]); return; }

    fetchMessages(selectedId);
    pollRef.current = setInterval(() => fetchMessages(selectedId), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedId, fetchMessages]);

  const handleSelectChat = (id: number) => {
    setSelectedId(id);
    setMessages([]);
  };

  const selectedChat = chats.find(c => c.id === selectedId) ?? null;

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">

        {loadingChats ? (
          <div className="w-80 flex-shrink-0 border-r border-gray-200 flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <ChatList
            chats={chats}
            selectedId={selectedId}
            onSelect={handleSelectChat}
            search={search}
            onSearchChange={setSearch}
          />
        )}

        <ChatWindow
          chat={selectedChat}
          messages={messages}
          agentActive={agentActive}
          isAdmin={isAdmin}
          onToggleAgent={toggleAgent}
        />
      </div>
    </AuthGuard>
  );
}
