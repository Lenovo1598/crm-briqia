'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { ApiKeysManager } from '@/components/configuracion/ApiKeysManager';
import { WebhooksManager } from '@/components/configuracion/WebhooksManager';
import { Webhook } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <AuthGuard>
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ajustes generales del CRM
          </p>
        </div>

        <div className="p-6 max-w-3xl space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Webhook size={18} className="text-primary" />
              <h2 className="text-base font-bold text-gray-900">API y Webhooks</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Conectividad para integraciones externas (n8n, Meta Ads, etc.)
            </p>

            <div className="text-sm text-gray-600 space-y-2 mb-5">
              <p>
                El CRM expone una API REST autenticada (header{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  Authorization: Bearer &lt;token&gt;
                </code>
                ) para leer y modificar leads, columnas y mensajes. Se puede
                usar el JWT de login o una API Key permanente.
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-2">API Keys</h3>
            <ApiKeysManager />

            <h3 className="text-sm font-bold text-gray-900 mt-6 mb-2">Webhooks salientes</h3>
            <WebhooksManager />
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
