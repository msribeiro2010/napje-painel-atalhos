import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CalendarDays } from 'lucide-react';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getDaysText = (days: number): string => {
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  return `em ${days} dias`;
};

const getDaysColor = (days: number): string => {
  if (days === 0) return 'bg-red-100 text-red-800 border-red-200';
  if (days === 1) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (days <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const getAlertColor = (events: any): string => {
  const allDays = [...events.feriados, ...events.aniversariantes].map(e => e.daysUntil);
  const minDays = Math.min(...allDays);
  
  if (minDays === 0) return 'border-red-200 bg-red-50 text-red-900';
  if (minDays === 1) return 'border-orange-200 bg-orange-50 text-orange-900';
  if (minDays <= 3) return 'border-yellow-200 bg-yellow-50 text-yellow-900';
  return 'border-blue-200 bg-blue-50 text-blue-900';
};

export const UpcomingEventsAlert = () => {
  const { events, loading, hasUpcomingEvents } = useUpcomingEvents();

  if (loading || !hasUpcomingEvents) {
    return null;
  }

  // Combinar e ordenar todos os eventos por proximidade
  const allEvents = [
    ...events.feriados.map(f => ({
      type: 'feriado' as const,
      title: f.descricao,
      subtitle: f.tipo,
      daysUntil: f.daysUntil,
      id: `feriado-${f.id}`
    })),
    ...events.aniversariantes.map(a => ({
      type: 'aniversario' as const,
      title: a.nome,
      subtitle: `${a.idade} anos`,
      daysUntil: a.daysUntil,
      id: `aniversario-${a.id}`
    }))
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  const alertColor = getAlertColor(events);

  return (
    <Alert className={`mb-6 ${alertColor}`}>
      <Calendar className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <span>Eventos Próximos</span>
        <CalendarDays className="h-4 w-4" />
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="grid gap-2">
          {allEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-2.5 bg-white/40 rounded-md border border-white/20">
              <div className="flex items-center gap-2">
                {event.type === 'feriado' ? (
                  <Calendar className="h-4 w-4 text-current" />
                ) : (
                  <CalendarDays className="h-4 w-4 text-current" />
                )}
                <span className="font-medium text-sm">{event.title}</span>
                <Badge variant="secondary" className="bg-white/50 text-xs px-1.5 py-0.5">
                  {event.subtitle}
                </Badge>
              </div>
              <Badge 
                variant="outline" 
                className={`${getDaysColor(event.daysUntil)} font-medium text-xs px-2 py-1`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {getDaysText(event.daysUntil)}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs opacity-75 flex items-center gap-1">
          <span>💡</span>
          <span>
            {allEvents.some(e => e.daysUntil <= 1) 
              ? 'Eventos muito próximos! Verifique preparativos e possíveis mudanças no expediente.'
              : 'Eventos chegando! Lembre-se de se preparar com antecedência.'
            }
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};