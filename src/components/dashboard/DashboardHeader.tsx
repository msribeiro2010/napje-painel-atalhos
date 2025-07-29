import { Button } from '@/components/ui/button';
import { ExternalLink, Settings, Bell } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';
import { EventNotificationBadge } from '@/components/EventNotificationBadge';
import { WeeklyNotificationsManager } from '@/components/weekly-notifications/WeeklyNotificationsManager';
import { PastEventsDialog } from '@/components/PastEventsDialog';


interface DashboardHeaderProps {
  isAdmin?: boolean;
}

export const DashboardHeader = ({ isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-soft">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Seção esquerda - Logo e título */}
        <div className="flex items-center gap-4">
          <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer" className="group">
            <div className="relative">
              <img 
                src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" 
                alt="Brasão TRT15" 
                className="h-14 w-14 cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg rounded-xl" 
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
            </div>
          </a>
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Painel de Controle - NAPJe
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Central de gerenciamento e suporte técnico
            </p>
          </div>
        </div>
        
        {/* Seção direita - Ferramentas principais */}
        <div className="flex items-center gap-3">
          {/* Central do Núcleo - Destaque */}
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
            className="flex items-center gap-2 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Central do Núcleo</span>
            <span className="sm:hidden">Central</span>
          </Button>
          
          {/* Configurações e Perfil */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
      
      {/* Barra de informações e notificações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/30">
        {/* Data e Hora */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
            <DateDisplay />
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
            <Clock />
          </div>
        </div>
        
        {/* Notificações e Eventos */}
        <div className="flex items-center gap-2">
          {/* Grupo de notificações */}
          <div className="flex items-center gap-1 bg-primary/5 border border-primary/20 rounded-lg p-1">
            <EventNotificationBadge />
            <PastEventsDialog />
          </div>
          
          {/* Notificações semanais */}
          <div className="bg-accent/50 border border-accent/30 rounded-lg p-1">
            <WeeklyNotificationsManager />
          </div>
        </div>
      </div>
    </div>
  );
};