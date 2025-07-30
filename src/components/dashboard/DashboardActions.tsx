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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-primary rounded-xl shadow-soft">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Ações Rápidas</h2>
            <p className="text-sm text-muted-foreground">Acesso direto às principais funcionalidades</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
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
                  <ModernCard 
                    variant="glass"
                    hover={true}
                    glow={true}
                    className="h-full"
                  >
                    <ModernCardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3 h-full">
                        {/* Ícone com animação */}
                        <div className="relative">
                          <div className="p-3 bg-gradient-primary rounded-2xl shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          {/* Efeito de brilho */}
                          <div className="absolute -inset-1 bg-gradient-primary rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300"></div>
                        </div>
                        
                        {/* Conteúdo */}
                        <div className="space-y-2 flex-1 flex flex-col justify-center">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                        
                        {/* Indicador de hover */}
                        <div className="w-full h-1 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"></div>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                  
                  {/* Botão invisível que cobre todo o card */}
                  <button
                    className="absolute inset-0 w-full h-full bg-transparent cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
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