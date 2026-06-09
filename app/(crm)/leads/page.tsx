'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { KanbanBoard } from '@/components/leads/KanbanBoard';
import { Lead, KanbanColumn } from '@/lib/leads';

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [agentActive, setAgentActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        const leadsResponse = await fetch('/api/leads', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const leadsData = await leadsResponse.json();
        setLeads(leadsData);

        const columnsResponse = await fetch('/api/columns', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const columnsData = await columnsResponse.json();
        setColumns(columnsData);

        const agentResponse = await fetch('/api/agent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const agentData = await agentResponse.json();
        setAgentActive(agentData.is_active);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAgentToggle = async (active: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/agent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: active }),
      });

      if (response.ok) {
        setAgentActive(active);
      }
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-gray-50">
        {error && (
          <div className="bg-danger/10 border-b border-danger/30 p-4 text-danger text-sm">
            {error}
          </div>
        )}

        <KanbanBoard
          initialLeads={leads}
          initialColumns={columns}
          isAdmin={user?.role === 'admin'}
          agentActive={agentActive}
          onAgentToggle={handleAgentToggle}
        />
      </div>
    </AuthGuard>
  );
}
