'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-[32px] font-bold text-gray-900 leading-none">
          {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
        </p>
        {subtitle && (
          <p className="text-[12px] text-gray-400 mt-1.5">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          {icon}
        </div>
      )}
    </div>
  );
}
