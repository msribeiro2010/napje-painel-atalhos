import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  CalendarDays, 
  Bell, 
  Gift, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Coffee,
  Heart
} from 'lucide-react';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { EventNotificationSettings } from './EventNotificationSettings';

interface SmartEventNotificationsProps {
  compact?: boolean;
}

const getDaysText = (days: number): string => {
  if (days === 0) return 'HOJE';
  if (days === 1) return 'AMANHÃ';
  return `${days} DIAS`;
};

const getDaysColor = (days: number): string => {
  if (days === 0) return 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse';
  if (days === 1) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
  if (days <= 3) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
  return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
};

const getEventIcon = (type: 'feriado' | 'aniversario', daysUntil: number) => {
  if (type === 'aniversario') {
    return daysUntil === 0 ? 
      <Gift className="h-4 w-4 animate-bounce" /> : 
      <Heart className="h-4 w-4" />;
  }
  return daysUntil === 0 ? 
    <Calendar className="h-4 w-4 animate-pulse" /> : 
    <CalendarDays className="h-4 w-4" />;
};

const getEventEmoji = (type: 'feriado' | 'aniversario', daysUntil: number): string => {
  if (type === 'aniversario') {
    return daysUntil === 0 ? '🎉' : daysUntil === 1 ? '🎂' : '🎈';
  }
  return daysUntil === 0 ? '🏖️' : daysUntil === 1 ? '📅' : '⭐';
};

const getMotivationalMessage = (events: { feriados: Array<{ daysUntil: number }>, aniversariantes: Array<{ daysUntil: number }> }): string => {
  const urgentEvents = [...events.feriados, ...events.aniversariantes].filter((e) => e.daysUntil <= 1);
  const hasToday = urgentEvents.some((e) => e.daysUntil === 0);
  const hasTomorrow = urgentEvents.some((e) => e.daysUntil === 1);
  
  if (hasToday) {
    return "🎊 Dia especial! Aproveite e celebre os momentos importantes!";
  }
  if (hasTomorrow) {
    return "⏰ Não esqueça dos eventos de amanhã! Que tal se preparar hoje?";
  }
  return "📋 Fique de olho na agenda! Planejamento é a chave do sucesso.";
};

export const SmartEventNotifications = ({ compact = false }: SmartEventNotificationsProps) => {
  const { events, loading, hasUpcomingEvents } = useUpcomingEvents();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [hasShownUrgentToast, setHasShownUrgentToast] = useState(false);

  // Toast para eventos urgentes
  useEffect(() => {
    if (!loading && hasUpcomingEvents && !hasShownUrgentToast) {
      // Verificar se os arrays estão disponíveis
      const safeFeriados = events.feriados || [];
      const safeAniversariantes = events.aniversariantes || [];
      
      const urgentEvents = [...safeFeriados, ...safeAniversariantes].filter(e => e.daysUntil <= 1);
      
      if (urgentEvents.length > 0) {
        const todayEvents = urgentEvents.filter(e => e.daysUntil === 0);
        const tomorrowEvents = urgentEvents.filter(e => e.daysUntil === 1);
        
        if (todayEvents.length > 0) {
          toast({
            title: "🎉 Eventos Acontecendo HOJE!",
            description: `${todayEvents.map((e) => e.title || e.descricao).join(', ')}`,
            duration: 8000,
          });
        } else if (tomorrowEvents.length > 0) {
          toast({
            title: "⏰ Eventos Amanhã!",
            description: `Lembre-se: ${tomorrowEvents.map((e) => e.title || e.descricao).join(', ')}`,
            duration: 6000,
          });
        }
        
        setHasShownUrgentToast(true);
      }
    }
  }, [events, loading, hasUpcomingEvents, hasShownUrgentToast, toast]);

  if (loading || !hasUpcomingEvents) {
    return null;
  }

  // Combinar e ordenar todos os eventos por proximidade
  const safeFeriados = events.feriados || [];
  const safeAniversariantes = events.aniversariantes || [];
  
  const allEvents = [
    ...safeFeriados.map(f => ({
      type: 'feriado' as const,
      title: f.descricao,
      subtitle: f.tipo,
      daysUntil: f.daysUntil,
      id: `feriado-${f.id}`
    })),
    ...safeAniversariantes.map(a => ({
      type: 'aniversario' as const,
      title: a.nome,
      subtitle: `${a.idade} anos`,
      daysUntil: a.daysUntil,
      id: `aniversario-${a.id}`
    }))
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  const urgentCount = allEvents.filter(e => e.daysUntil <= 1).length;
  const hasUrgent = urgentCount > 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className={`mb-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              hasUrgent ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50' : 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {hasUrgent ? <Bell className="h-4 w-4 text-orange-600 animate-ring" /> : <Calendar className="h-4 w-4 text-blue-600" />}
                    <span className={hasUrgent ? 'text-orange-800' : 'text-blue-800'}>
                      {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''} próximo{allEvents.length !== 1 ? 's' : ''}
                    </span>
                    {hasUrgent && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                        {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {allEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="flex items-center gap-2 text-xs">
                        <span className="text-lg">{getEventEmoji(event.type, event.daysUntil)}</span>
                        <span className="font-medium truncate">{event.title}</span>
                        <Badge className={`${getDaysColor(event.daysUntil)} text-xs px-1.5 py-0.5 ml-auto`}>
                          {getDaysText(event.daysUntil)}
                        </Badge>
                      </div>
                    ))}
                    {allEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center pt-1">
                        +{allEvents.length - 2} mais evento{allEvents.length - 2 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clique para ver detalhes dos eventos próximos</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={`mb-6 overflow-hidden transition-all duration-500 ${
      hasUrgent 
        ? 'border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 shadow-lg' 
        : 'border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <CardHeader className={`${hasUrgent ? 'bg-gradient-to-r from-orange-100 to-yellow-100' : 'bg-gradient-to-r from-blue-100 to-indigo-100'}`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hasUrgent ? 'bg-orange-500 animate-glow' : 'bg-blue-500'} transition-all duration-300`}>
              {hasUrgent ? (
                <Bell className="h-5 w-5 text-white animate-ring" />
              ) : (
                <Sparkles className="h-5 w-5 text-white animate-float" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${hasUrgent ? 'text-orange-800' : 'text-blue-800'}`}>
                {hasUrgent ? '🚨 Eventos Urgentes!' : '📅 Eventos Próximos'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''} nos próximos 7 dias
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <EventNotificationSettings />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/calendario')}
                    className="bg-white/80 hover:bg-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Calendário
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Abrir calendário completo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-3">
          {allEvents.map((event) => (
            <div 
              key={event.id} 
              className="group relative p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-slide-in-up"
              style={{animationDelay: `${allEvents.indexOf(event) * 0.1}s`}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    event.type === 'aniversario' 
                      ? 'bg-gradient-to-br from-pink-400 to-red-400' 
                      : 'bg-gradient-to-br from-green-400 to-blue-400'
                  }`}>
                    {getEventIcon(event.type, event.daysUntil)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getEventEmoji(event.type, event.daysUntil)}</span>
                      <span className="font-semibold text-gray-800">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-gray-100 text-xs">
                        {event.subtitle}
                      </Badge>
                      {event.type === 'aniversario' && event.daysUntil === 0 && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs animate-pulse">
                          🎂 Parabéns!
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${getDaysColor(event.daysUntil)} font-bold text-sm px-3 py-1 shadow-md`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {getDaysText(event.daysUntil)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={`mt-6 p-4 rounded-lg ${
          hasUrgent 
            ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200' 
            : 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <Coffee className={`h-5 w-5 mt-0.5 ${hasUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${hasUrgent ? 'text-orange-800' : 'text-blue-800'}`}>
                💡 Dica Inteligente
              </p>
              <p className={`text-xs mt-1 ${hasUrgent ? 'text-white' : 'text-white'}`}>
                {getMotivationalMessage(events)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
