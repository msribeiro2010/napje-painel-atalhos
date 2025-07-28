import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
}

export const DashboardActions = ({ actions }: DashboardActionsProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-8 bg-gradient-primary rounded-full"></div>
        <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          action.customComponent ? (
            <div key={action.title}>
              {action.customComponent}
            </div>
          ) : (
            <Card 
              key={action.title} 
              className="group hover:shadow-glow transition-all duration-300 cursor-pointer bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 hover:border-primary/30 hover:-translate-y-1"
              onClick={action.onClick}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Ícone com animação */}
                  <div className="relative">
                    <div className="p-3 bg-gradient-primary rounded-2xl shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                      <action.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                  </div>
                  
                  {/* Título e descrição */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Indicador de ação */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
      
      {/* Gradiente decorativo */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );
};