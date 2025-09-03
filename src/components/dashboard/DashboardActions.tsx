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
    <ModernCard className="h-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
      <ModernCardHeader title="Ações Rápidas">
        <div className="text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ações Rápidas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Acesse rapidamente as funcionalidades mais utilizadas
          </p>
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <ModernGrid className="gap-6">
          {actions.map((action, index) => (
            <ModernGridItem key={index} className="min-w-0">
              <div
                className="group relative flex flex-col items-center p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
                onClick={action.onClick}
              >
                {/* Gradient background effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon container with dynamic color */}
                <div className={`relative p-4 ${action.color || 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <action.icon className="h-7 w-7 text-white drop-shadow-sm" />
                </div>
                
                {/* Title */}
                <span className="relative text-sm font-semibold text-center text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 leading-tight">
                  {action.title}
                </span>
                
                {/* Description */}
                {action.description && (
                  <span className="relative text-xs text-gray-500 dark:text-gray-400 text-center mt-2 opacity-70 group-hover:opacity-100 transition-all duration-200 leading-relaxed">
                    {action.description}
                  </span>
                )}
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </ModernGridItem>
          ))}
        </ModernGrid>
      </ModernCardContent>
    </ModernCard>
  );
};