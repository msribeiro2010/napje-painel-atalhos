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
      {/* Background Pattern - Cores mais vibrantes e elegantes */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-orange-500/8 to-red-500/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/8 via-blue-500/6 to-cyan-400/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.12),transparent_50%)]" />
      
      <div className="relative">
        {/* Header Principal */}
        <div className="p-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Seção esquerda - Logo e título */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-5">
                <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer" className="group flex-shrink-0">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <img 
                        src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" 
                        alt="Brasão TRT15" 
                        className="h-12 w-12 drop-shadow-2xl filter brightness-110" 
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-3 border-white shadow-xl animate-pulse" />
                  </div>
                </a>
                
                <div className="flex flex-col justify-center min-h-[4rem]">
                  <div className="mb-2">
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent leading-tight drop-shadow-sm">
                      NAPJe - Controle V.10
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-500/30 shadow-lg">
                      <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                      <span className="text-sm font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                        Central Inteligente
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-sm" />
                      <span className="font-medium text-emerald-700">Sistema Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção direita - Ferramentas principais */}
            <div className="lg:col-span-1 flex justify-end">
              <div className="flex items-center gap-3">
                {/* Grupo de Ações Principais */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-red-500/10 backdrop-blur-xl rounded-3xl p-2 border border-amber-500/25 shadow-2xl">
                  {/* Busca Inteligente */}
                  {onSearch && (
                    <ModernButton
                      variant="glass"
                      size="sm"
                      onClick={onSearch}
                      className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20"
                    >
                      <Brain className="h-4 w-4 mr-2 group-hover:animate-pulse text-purple-600" />
                      <span className="hidden sm:inline font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Busca IA</span>
                      <span className="sm:hidden font-semibold text-purple-600">IA</span>
                    </ModernButton>
                  )}
                  
                  {/* Separador visual */}
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
                  
                  {/* Central do Núcleo - Destaque */}
                  <ModernButton
                    variant="gradient"
                    size="sm"
                    onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
                    className="relative overflow-hidden shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ExternalLink className="h-4 w-4 mr-2 relative z-10 text-white" />
                    <span className="hidden md:inline font-bold relative z-10 text-white">Central do Núcleo</span>
                    <span className="md:hidden font-bold relative z-10 text-white">Central</span>
                  </ModernButton>
                </div>
                
                {/* Grupo de Configurações e Perfil */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500/10 via-blue-500/15 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-2 border border-purple-500/25 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="relative">
                    <ThemeToggle />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-80 animate-pulse shadow-sm" />
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-purple-500/40 to-transparent" />
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de informações e status */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/8 via-orange-500/12 to-red-500/8 backdrop-blur-sm border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Informações de Data e Hora */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/15 to-orange-500/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-lg" />
                  <DateDisplay />
                </div>
                <div className="w-px h-4 bg-amber-500/40" />
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <Clock />
                </div>
              </div>
            </div>
            
            {/* Área de Notificações */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500/15 to-blue-500/15 backdrop-blur-md border border-purple-500/30 rounded-2xl p-3 shadow-xl">
                <WeeklyNotificationsManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};