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
    <ModernCard className="h-full backdrop-blur-sm bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 shadow-xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <ModernCardHeader title="Ações Rápidas">
        <div className="text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Ações Rápidas
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Acesse rapidamente as funcionalidades mais utilizadas
          </p>
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <ModernGrid className="gap-6">
          {actions.map((action, index) => (
            <ModernGridItem key={index} className="min-w-0">
              <div
                className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-amber-25 via-yellow-25 to-orange-25 dark:from-amber-800/30 dark:via-yellow-800/30 dark:to-orange-800/30 rounded-2xl border border-amber-200/60 dark:border-amber-600/40 hover:from-amber-50 hover:via-yellow-50 hover:to-orange-50 dark:hover:from-amber-800/50 dark:hover:via-yellow-800/50 dark:hover:to-orange-800/50 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
                onClick={action.onClick}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {/* Gradient background effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-amber-100/30 dark:to-amber-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon container with dynamic color */}
                <div className={`relative p-4 ${action.color || 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <action.icon className="h-7 w-7 text-white drop-shadow-sm" />
                </div>
                
                {/* Title */}
                <span className="relative text-sm font-semibold text-center text-amber-900 dark:text-amber-100 group-hover:text-amber-950 dark:group-hover:text-amber-50 transition-colors duration-200 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {action.title}
                </span>
                
                {/* Description */}
                {action.description && (
                  <span className="relative text-xs text-amber-700 dark:text-amber-300 text-center mt-2 opacity-70 group-hover:opacity-100 transition-all duration-200 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {action.description}
                  </span>
                )}
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/10 via-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </ModernGridItem>
          ))}
        </ModernGrid>
      </ModernCardContent>
    </ModernCard>
  );
};