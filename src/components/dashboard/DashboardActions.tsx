import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { Sparkles } from 'lucide-react';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
}

export const DashboardActions = ({ actions }: DashboardActionsProps) => {
  return (
    <ModernCard variant="glass" className="mb-8">
      <div className="p-6">
        {/* Header da seção */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Ações Rápidas</h2>
            <p className="text-sm text-gray-500 mt-1">Acesso direto às principais funcionalidades</p>
          </div>
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent flex-1"></div>
        </div>
        
        {/* Grid de ações */}
        <ModernGrid cols={6} gap="md">
          {actions.map((action, index) => {
            // Cores vibrantes alternadas
            const colorVariants = [
              {
                bg: 'from-blue-500 to-blue-600',
                hover: 'hover:from-blue-600 hover:to-blue-700',
                ring: 'focus:ring-blue-300/50'
              },
              {
                bg: 'from-purple-500 to-purple-600',
                hover: 'hover:from-purple-600 hover:to-purple-700',
                ring: 'focus:ring-purple-300/50'
              },
              {
                bg: 'from-green-500 to-green-600',
                hover: 'hover:from-green-600 hover:to-green-700',
                ring: 'focus:ring-green-300/50'
              },
              {
                bg: 'from-orange-500 to-orange-600',
                hover: 'hover:from-orange-600 hover:to-orange-700',
                ring: 'focus:ring-orange-300/50'
              },
              {
                bg: 'from-red-500 to-red-600',
                hover: 'hover:from-red-600 hover:to-red-700',
                ring: 'focus:ring-red-300/50'
              },
              {
                bg: 'from-indigo-500 to-indigo-600',
                hover: 'hover:from-indigo-600 hover:to-indigo-700',
                ring: 'focus:ring-indigo-300/50'
              }
            ];
            
            const colorVariant = colorVariants[index % colorVariants.length];
            
            return action.customComponent ? (
              <ModernGridItem key={action.title}>
                {action.customComponent}
              </ModernGridItem>
            ) : (
              <ModernGridItem key={action.title}>
                <button
                  className={`relative group h-full w-full bg-gradient-to-br ${colorVariant.bg} ${colorVariant.hover} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-4 ${colorVariant.ring}`}
                  onClick={(e) => {
                    console.log('Button clicked:', action.title);
                    e.preventDefault();
                    e.stopPropagation();
                    if (action.onClick) {
                      action.onClick();
                    }
                  }}
                  aria-label={action.title}
                >
                  <div className="flex flex-col items-center text-center space-y-3 h-full justify-center">
                    {/* Ícone */}
                    <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/35 transition-all duration-300 group-hover:scale-105 shadow-lg">
                      <action.icon className="h-7 w-7 text-white drop-shadow-sm" />
                    </div>
                    
                    {/* Título */}
                    <h3 className="font-bold text-sm text-white group-hover:text-white/95 transition-colors duration-300 leading-tight px-2">
                      {action.title}
                    </h3>
                    
                    {/* Efeito de brilho aprimorado */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                  </div>
                </button>
              </ModernGridItem>
            );
          })}
        </ModernGrid>
      </div>
    </ModernCard>
  );
};