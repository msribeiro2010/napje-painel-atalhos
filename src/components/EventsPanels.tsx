import { AniversariantesSection } from "@/components/AniversariantesSection";
import { FeriadosSection } from "@/components/FeriadosSection";
import { EventsManagementDialog } from "@/components/EventsManagementDialog";
import { useCustomEvents } from "@/hooks/useCustomEvents";
import { parseISO, isAfter, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, BookOpen, Video, Users, Sparkles } from "lucide-react";

interface EventsPanelsProps {
  className?: string;
}

export const EventsPanels = ({ className = "" }: EventsPanelsProps) => {
  const currentMonth = new Date();
  const { customEvents } = useCustomEvents(currentMonth);
  
  // Filtrar próximos 3 eventos futuros
  const upcomingEvents = customEvents
    .filter(event => isAfter(parseISO(event.date), startOfDay(new Date())))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const eventIcons = {
    curso: <BookOpen className="h-3 w-3 text-blue-600" />,
    webinario: <Video className="h-3 w-3 text-purple-600" />,
    reuniao: <Users className="h-3 w-3 text-green-600" />,
    outro: <Sparkles className="h-3 w-3 text-amber-600" />,
  };

  const aniversariantesPanel = <AniversariantesSection />;
  const feriadosPanel = <FeriadosSection />;
  
  // Se ambos os painéis retornarem null, não renderiza nada
  if (!aniversariantesPanel && !feriadosPanel) {
    return null;
  }
  
  // Se apenas um painel tem conteúdo, usa layout de coluna única
  const hasAniversariantes = aniversariantesPanel !== null;
  const hasFeriados = feriadosPanel !== null;

  return (
    <div className={`mb-8 ${className}`}>
      {/* Título da seção */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-8 bg-gradient-primary rounded-full"></div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Eventos & Calendário</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
        <EventsManagementDialog />
      </div>

      {/* Layout adaptativo baseado no conteúdo */}
      {hasAniversariantes && !hasFeriados && (
        <div className="max-w-lg mx-auto">
          {aniversariantesPanel}
        </div>
      )}
      
      {!hasAniversariantes && hasFeriados && (
        <div className="max-w-lg mx-auto">
          {feriadosPanel}
        </div>
      )}
      
      {hasAniversariantes && hasFeriados && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aniversariantesPanel}
          {feriadosPanel}
        </div>
      )}

      {/* Resumo de eventos futuros */}
      {upcomingEvents.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos Eventos Personalizados
          </h3>
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  {eventIcons[event.type as keyof typeof eventIcons]}
                  <span className="font-medium text-gray-700 dark:text-gray-300">{event.title}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{format(parseISO(event.date), 'dd/MM', { locale: ptBR })}</span>
                  {event.start_time && <span>às {event.start_time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Gradiente decorativo */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );
};