import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';
import { EventNotificationBadge } from '@/components/EventNotificationBadge';
import { WeeklyNotificationsManager } from '@/components/weekly-notifications/WeeklyNotificationsManager';
import { PastEventsDialog } from '@/components/PastEventsDialog';
import { EventNotificationSettings } from '@/components/EventNotificationSettings';

interface DashboardHeaderProps {
  isAdmin?: boolean;
}

export const DashboardHeader = ({ isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {/* Seção esquerda - Logo e título */}
      <div className="flex items-center gap-4">
        <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer">
          <img src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" alt="Brasão TRT15" className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" />
        </a>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Painel de Controle - NAPJe
          </h1>
          {/* Data e hora integradas ao título de forma moderna */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DateDisplay />
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-2">
              <Clock />
            </div>
          </div>
        </div>
      </div>
      
      {/* Seção direita - Ferramentas e configurações */}
      <div className="flex items-center gap-2">
        {/* Grupo de notificações e eventos - com destaque */}
        <div className="flex items-center gap-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <EventNotificationBadge />
          <PastEventsDialog />
          <EventNotificationSettings />
        </div>
        
        {/* Notificações semanais - separado */}
        <div className="flex items-center">
          <WeeklyNotificationsManager />
        </div>
        
        {/* Grupo de ferramentas externas */}
        <div className="flex items-center gap-1 border-l border-border/30 pl-2 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
            className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden lg:inline">Central do Núcleo</span>
            <span className="lg:hidden">Central</span>
          </Button>
        </div>
        
        {/* Grupo de configurações pessoais */}
        <div className="flex items-center gap-1 border-l border-border/30 pl-2 ml-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
};