import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard } from '@/components/ui/modern-card';
import { ExternalLink, Settings, Bell, Search, Brain, Sparkles, Zap } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';
// import { EventNotificationBadge } from '@/components/EventNotificationBadge';
import { WeeklyNotificationsManager } from '@/components/weekly-notifications/WeeklyNotificationsManager';



interface DashboardHeaderProps {
  user?: any;
  isBusinessDay?: boolean;
  nextBusinessDay?: Date;
  onSearch?: () => void;
}

export const DashboardHeader = ({ user, isBusinessDay, nextBusinessDay, onSearch }: DashboardHeaderProps) => {
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  return (
    <ModernCard variant="glass" className="mb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
      
      <div className="relative p-6">
        {/* Header Principal */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          {/* Seção esquerda - Logo e título */}
          <div className="flex items-center gap-4">
            <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer" className="group">
              <div className="relative">
                <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                  <img 
                    src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" 
                    alt="Brasão TRT15" 
                    className="h-10 w-10 filter brightness-0 invert" 
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </a>
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                NAPJe Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Central de gerenciamento inteligente
                </p>
              </div>
            </div>
          </div>
          
          {/* Seção direita - Ferramentas principais */}
          <div className="flex items-center gap-3">
            {/* Busca Inteligente */}
            {onSearch && (
              <ModernButton
                variant="glass"
                size="sm"
                onClick={onSearch}
                icon={<Brain className="h-4 w-4" />}
                className="group"
              >
                <Search className="h-4 w-4 group-hover:animate-pulse" />
                <span className="hidden sm:inline">Busca IA</span>
              </ModernButton>
            )}
            
            {/* Central do Núcleo - Destaque */}
            <ModernButton
              variant="gradient"
              size="sm"
              onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
              icon={<ExternalLink className="h-4 w-4" />}
              className="shadow-lg"
            >
              <span className="hidden sm:inline">Central do Núcleo</span>
              <span className="sm:hidden">Central</span>
            </ModernButton>
            
            {/* Configurações e Perfil */}
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/20">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Barra de informações e notificações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border/20">
          {/* Data e Hora */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-card/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <DateDisplay />
            </div>
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/20">
              <Zap className="h-4 w-4 text-primary" />
              <Clock />
            </div>
          </div>
          
          {/* Notificações e Eventos */}
          <div className="flex items-center gap-3">
            {/* Grupo de notificações - REMOVIDO */}
            
            {/* Notificações semanais */}
            <div className="bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-xl p-2">
              <WeeklyNotificationsManager />
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};