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
    <ModernCard className="h-full">
      <ModernCardHeader title="Ações Rápidas">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ações Rápidas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Acesse rapidamente as funcionalidades mais utilizadas
        </p>
      </ModernCardHeader>
      <ModernCardContent>
        <ModernGrid className="gap-4">
          {actions.map((action, index) => (
            <ModernGridItem key={index} className="min-w-0">
              <div
                className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 cursor-pointer group hover:shadow-md"
                onClick={action.onClick}
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 group-hover:scale-105 transition-transform">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {action.title}
                </span>
                {action.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.description}
                  </span>
                )}
              </div>
            </ModernGridItem>
          ))}
        </ModernGrid>
      </ModernCardContent>
    </ModernCard>
  );
};