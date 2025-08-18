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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-purple-500/5 to-blue-500/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative">
        {/* Header Principal */}
        <div className="p-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Seção esquerda - Logo e título */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-5">
                <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer" className="group flex-shrink-0">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-primary via-primary/90 to-purple-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <img 
                        src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" 
                        alt="Brasão TRT15" 
                        className="h-12 w-12 drop-shadow-lg" 
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white shadow-lg animate-pulse" />
                  </div>
                </a>
                
                <div className="flex flex-col justify-center min-h-[4rem]">
                  <div className="mb-2">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                      NAPJe Dashboard
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">
                        Central Inteligente
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span>Sistema Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção direita - Ferramentas principais */}
            <div className="lg:col-span-1 flex justify-end">
              <div className="flex items-center gap-3">
                {/* Grupo de Ações Principais */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-card/50 via-card/70 to-card/50 backdrop-blur-xl rounded-3xl p-2 border border-border/20 shadow-xl">
                  {/* Busca Inteligente */}
                  {onSearch && (
                    <ModernButton
                      variant="glass"
                      size="sm"
                      onClick={onSearch}
                      className="group hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Brain className="h-4 w-4 mr-2 group-hover:animate-pulse text-primary" />
                      <span className="hidden sm:inline font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Busca IA</span>
                      <span className="sm:hidden font-medium text-primary">IA</span>
                    </ModernButton>
                  )}
                  
                  {/* Separador visual */}
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/40 to-transparent" />
                  
                  {/* Central do Núcleo - Destaque */}
                  <ModernButton
                    variant="gradient"
                    size="sm"
                    onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
                    className="relative overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ExternalLink className="h-4 w-4 mr-2 relative z-10" />
                    <span className="hidden md:inline font-semibold relative z-10">Central do Núcleo</span>
                    <span className="md:hidden font-semibold relative z-10">Central</span>
                  </ModernButton>
                </div>
                
                {/* Grupo de Configurações e Perfil */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-card/60 via-card/80 to-card/60 backdrop-blur-xl rounded-3xl p-2 border border-border/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="relative">
                    <ThemeToggle />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-60 animate-pulse" />
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/40 to-transparent" />
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de informações e status */}
        <div className="px-6 py-4 bg-gradient-to-r from-card/40 via-card/60 to-card/40 backdrop-blur-sm border-t border-border/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Informações de Data e Hora */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-border/30 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
                  <DateDisplay />
                </div>
                <div className="w-px h-4 bg-border/40" />
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <Clock />
                </div>
              </div>
            </div>
            
            {/* Área de Notificações */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-accent/30 to-accent/20 backdrop-blur-md border border-accent/40 rounded-2xl p-3 shadow-lg">
                <WeeklyNotificationsManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};