import { useEffect } from 'react';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { parseISO, isToday, isTomorrow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen, Video, Users, Sparkles } from 'lucide-react';

const EVENT_ICONS = {
  curso: BookOpen,
  webinario: Video,
  reuniao: Users,
  outro: Sparkles,
};

export const EventNotificationToast = () => {
  const currentMonth = new Date();
  const { customEvents } = useCustomEvents(currentMonth);

  useEffect(() => {
    // Verificar eventos de hoje e amanhã
    const todayEvents = customEvents.filter(event => isToday(parseISO(event.date)));
    const tomorrowEvents = customEvents.filter(event => isTomorrow(parseISO(event.date)));

    // Mostrar notificação para eventos de hoje
    if (todayEvents.length > 0) {
      todayEvents.forEach(event => {
        const EventIcon = EVENT_ICONS[event.type as keyof typeof EVENT_ICONS];
        
        toast(`🎯 Evento Hoje: ${event.title}`, {
          description: (
            <div className="flex items-center gap-2">
              <EventIcon className="h-4 w-4" />
              <span>
                {event.description || 'Evento acontece hoje'}
                {event.start_time && (
                  <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                    <Clock className="h-3 w-3" />
                    {event.start_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </div>
                )}
              </span>
            </div>
          ),
          duration: 8000,
          action: {
            label: 'Ver Calendário',
            onClick: () => window.location.href = '/calendario'
          }
        });
      });
    }

    // Mostrar notificação para eventos de amanhã
    if (tomorrowEvents.length > 0) {
      tomorrowEvents.forEach(event => {
        const EventIcon = EVENT_ICONS[event.type as keyof typeof EVENT_ICONS];
        
        toast(`⏰ Evento Amanhã: ${event.title}`, {
          description: (
            <div className="flex items-center gap-2">
              <EventIcon className="h-4 w-4" />
              <span>
                {format(parseISO(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                {event.start_time && (
                  <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                    <Clock className="h-3 w-3" />
                    {event.start_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </div>
                )}
              </span>
            </div>
          ),
          duration: 6000,
          action: {
            label: 'Ver Calendário',
            onClick: () => window.location.href = '/calendario'
          }
        });
      });
    }
  }, [customEvents]);

  return null; // Este componente não renderiza nada visualmente
};