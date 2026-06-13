'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Compass,
  Megaphone,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Shield,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sections = [
    {
      label: 'GENERAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'leads', label: 'Leads', icon: Users, href: '/leads' },
      ],
    },
    {
      label: 'MENSAJERÍA',
      items: [
        { id: 'chats', label: 'Chats', icon: MessageSquare, href: '/chats' },
        { id: 'mensajes', label: 'Mensajes Programados', icon: Calendar, href: '/mensajes' },
      ],
    },
    {
      label: 'CARTERA',
      items: [
        { id: 'busquedas', label: 'Búsquedas', icon: Compass, href: '/busquedas' },
        { id: 'campanas', label: 'Campañas Activas', icon: Megaphone, href: '/campanas' },
      ],
    },
    {
      label: 'ASISTENTES',
      items: [
        { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText, href: '/cotizaciones' },
        { id: 'documentacion', label: 'Documentación', icon: BookOpen, href: '/documentacion' },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`
        ${collapsed ? 'w-16' : 'w-64'} 
        min-h-screen bg-white border-r border-gray-200
        flex flex-col transition-all duration-200 sticky top-0
      `}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-gray-200 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        {!collapsed && <span className="font-bold text-gray-900">Stragora Alliance</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 hover:bg-gray-100 rounded transition"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition
                    ${
                      active
                        ? 'bg-primary-light text-primary font-semibold border-r-4 border-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <UserCircle size={20} className="text-gray-600" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.nombre || user?.username}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                {user?.role === 'admin' && <Shield size={12} />}
                {user?.role === 'admin' ? 'Admin' : 'Usuario'}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm transition">
              <Settings size={16} />
              Configuración
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 text-sm transition"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}

        {collapsed && (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-danger hover:bg-danger/10 transition"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerrar sesión</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que querés cerrar sesión?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-danger hover:bg-danger/90 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
