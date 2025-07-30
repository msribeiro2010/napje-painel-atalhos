import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
}

export const DashboardActions = ({ actions }: DashboardActionsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ações Rápidas</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {actions.map((action) => (
          action.customComponent ? (
            <div key={action.title}>
              {action.customComponent}
            </div>
          ) : (
            <Card 
              key={action.title} 
              className="group hover:shadow-glow transition-all duration-300 cursor-pointer bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-900/90 dark:to-slate-800/50 backdrop-blur-sm border-white/20 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:scale-105"
              onClick={action.onClick}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Ícone com animação */}
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                  </div>
                  
                  {/* Título e descrição */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Indicador de ação */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
      
      {/* Gradiente decorativo */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
    </div>
  );
};