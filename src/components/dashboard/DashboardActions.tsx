import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
  favorites: string[];
  onToggleFavorite: (actionId: string) => void;
}

export const DashboardActions = ({ actions, favorites, onToggleFavorite }: DashboardActionsProps) => {
  return (
    <ModernCard className="h-full backdrop-blur-sm bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900/40 dark:via-blue-900/20 dark:to-slate-900/40 border border-slate-200/60 dark:border-slate-700/40 shadow-xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <ModernCardHeader title="Ações Rápidas" />
      <div className="px-6 pb-2">
        <div className="text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Ações Rápidas
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Acesse rapidamente as funcionalidades mais utilizadas
          </p>
        </div>
      </div>
      <ModernCardContent>
        <ModernGrid className="gap-6">
          {actions.map((action, index) => (
            <ModernGridItem key={index} className="min-w-0">
              <div
                className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105 backdrop-blur-sm"
                onClick={action.onClick}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {/* Gradient background effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-blue-50/30 to-indigo-50/30 dark:from-transparent dark:via-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon container with dynamic color */}
                <div className={`relative p-4 ${action.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <action.icon className="h-7 w-7 text-white drop-shadow-sm" />
                </div>

                {/* Title */}
                <span className="relative text-sm font-semibold text-center text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {action.title}
                </span>

                {/* Description */}
                {action.description && (
                  <span className="relative text-xs text-slate-600 dark:text-slate-400 text-center mt-2 opacity-70 group-hover:opacity-100 transition-all duration-200 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {action.description}
                  </span>
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </ModernGridItem>
          ))}
        </ModernGrid>
      </ModernCardContent>
    </ModernCard>
  );
};