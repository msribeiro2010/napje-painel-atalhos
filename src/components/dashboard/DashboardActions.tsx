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
          {actions.map((action) => (
            action.customComponent ? (
              <ModernGridItem key={action.title}>
                {action.customComponent}
              </ModernGridItem>
            ) : (
              <ModernGridItem key={action.title}>
                <div className="relative group h-full">
                  <div className="h-full bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 transition-all duration-300 hover:bg-white/80 hover:border-gray-300/60 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center space-y-4 h-full">
                      {/* Ícone moderno e achatado */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300 group-hover:scale-105">
                          <action.icon className="h-7 w-7 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
                        </div>
                        {/* Efeito de brilho sutil */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="space-y-2 flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                          {action.description}
                        </p>
                      </div>
                      
                      {/* Indicador de hover minimalista */}
                      <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"></div>
                    </div>
                  </div>
                  
                  {/* Botão invisível que cobre todo o card */}
                  <button
                    className="absolute inset-0 w-full h-full bg-transparent cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-2xl"
                    onClick={(e) => {
                      console.log('Button clicked:', action.title);
                      e.preventDefault();
                      e.stopPropagation();
                      if (action.onClick) {
                        action.onClick();
                      }
                    }}
                    aria-label={`${action.title} - ${action.description}`}
                  />
                </div>
              </ModernGridItem>
            )
          ))}
        </ModernGrid>
      </div>
    </ModernCard>
  );
};