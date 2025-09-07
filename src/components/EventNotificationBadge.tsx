import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Gift, 
  Heart,
  ExternalLink,
  CheckCircle,
  SkipForward
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { useNavigate } from 'react-router-dom';

export const EventNotificationBadge = () => {
  const { 
    allEvents, 
    urgentEvents, 
    loading, 
    hasUpcomingEvents,
    markEventAsFinished,
    dismissEvent 
  } = useEventNotifications();
  const navigate = useNavigate();

  if (loading || !hasUpcomingEvents) {
    return null;
  }

  const hasUrgent = urgentEvents.length > 0;

  const getBadgeColor = () => {
    if (hasUrgent) return 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse';
    if (allEvents.some(e => e.daysUntil <= 3)) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
  };

  const getEventIcon = (type: 'feriado' | 'aniversario') => {
    return type === 'aniversario' ? 
      <Gift className="h-3 w-3" /> : 
      <Calendar className="h-3 w-3" />;
  };

  const getDaysText = (days: number): string => {
    if (days === 0) return 'hoje';
    if (days === 1) return 'amanhã';
    return `${days}d`;
  };

  const handleMarkAsFinished = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    markEventAsFinished(event.id);
  };

  const handleDismiss = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissEvent(event.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 px-2 hover:bg-transparent"
        >
          <Bell className={`h-4 w-4 ${hasUrgent ? 'text-red-600 animate-ring' : 'text-blue-600'}`} />
          <Badge 
            className={`ml-1 text-xs px-1.5 py-0.5 ${getBadgeColor()}`}
          >
            {allEvents.length}
          </Badge>
          {hasUrgent && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Eventos Próximos</h3>
            <Badge variant="secondary" className="text-xs">
              {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {hasUrgent && (
            <p className="text-xs text-white mt-1">
              🚨 {urgentEvents.length} evento{urgentEvents.length !== 1 ? 's' : ''} urgente{urgentEvents.length !== 1 ? 's' : ''}!
            </p>
          )}
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {allEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${
                  event.type === 'aniversario' 
                    ? 'bg-pink-100 text-pink-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.subtitle}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={event.daysUntil <= 1 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {getDaysText(event.daysUntil)}
                  </Badge>
                  
                  {/* Botões de ação para eventos de hoje */}
                  {event.daysUntil === 0 && (
                    <div className="flex gap-1 ml-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsFinished(event, e)}
                        className="h-6 px-1"
                        title="Marcar como finalizado"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDismiss(event, e)}
                        className="h-6 px-1"
                        title="Dispensar"
                      >
                        <SkipForward className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {allEvents.length > 5 && (
            <div className="p-3 text-center border-t bg-gray-50 dark:bg-gray-700">
              <p className="text-xs text-muted-foreground">
                +{allEvents.length - 5} mais evento{allEvents.length - 5 !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate('/calendario');
            }}
            className="w-full text-xs"
          >
            <Calendar className="h-3 w-3 mr-2" />
            Ver todos no calendário
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
