import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Home, Umbrella, Laptop, ArrowLeft, Gift, Star, Brain, Sparkles, Shield, BookOpen, Video, Users } from 'lucide-react';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { VacationSuggestionsPanel } from '@/components/VacationSuggestionsPanel';
import { VacationSuggestion } from '@/hooks/useVacationSuggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useWorkCalendar, WorkStatus } from '@/hooks/useWorkCalendar';
import { toast } from 'sonner';
import { CustomEventDialog } from '@/components/CustomEventDialog';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { ptBR } from 'date-fns/locale';

const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Home className="h-4 w-4 text-[#bfae7c]" /> },
  ferias: { label: 'Férias', color: '#ffe6e6', icon: <Umbrella className="h-4 w-4 text-[#e6a1a1]" /> },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Laptop className="h-4 w-4 text-[#7cc3e6]" /> },
  plantao: { label: 'Plantão', color: '#e6ffe6', icon: <Shield className="h-4 w-4 text-[#4caf50]" /> },
  folga: { label: 'Folga', color: '#e0e0e0', icon: <CalendarIcon className="h-4 w-4 text-[#757575]" /> },
  none: { label: '', color: '#fff', icon: null },
};

function CalendarComponent() {
  const today = new Date();
  const [month, setMonth] = useState(today);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  // Usar o hook para buscar/salvar marcações do Supabase
  const { marks, loading: marksLoading, saveMark, removeMark, fetchMarks } = useWorkCalendar(month);
  const { customEvents, fetchCustomEvents, addCustomEvent } = useCustomEvents(month);

  useEffect(() => {
    fetchCustomEvents();
  }, [month]);

  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(month);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  // Organizar eventos por data
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as { [date: string]: typeof events });

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const current = marks[key] || 'none';
    const dayEvents = eventsByDate[key] || [];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFeriado = dayEvents.some(e => e.type === 'feriado');

    if (isWeekend || isFeriado) {
      // Só pode marcar Plantão ou remover
      if (current === 'none') {
        saveMark(key, 'plantao');
      } else if (current === 'plantao') {
        removeMark(key);
      } else {
        toast.warning('Em finais de semana e feriados só é permitido marcar Plantão.');
        saveMark(key, 'plantao');
      }
    } else {
      // Ciclo normal incluindo Folga
      const next: WorkStatus =
        current === 'none' ? 'presencial' :
        current === 'presencial' ? 'ferias' :
        current === 'ferias' ? 'remoto' :
        current === 'remoto' ? 'folga' :
        current === 'folga' ? 'plantao' :
        'none';
      if (next === 'none') {
        removeMark(key);
      } else {
        saveMark(key, next);
      }
    }
  };

  // Remover clearAllMarks pois não faz mais sentido com Supabase (ou implementar para remover todas as marcações do mês via Supabase)

  // Atualizar handleSelectVacationSuggestion para usar saveMark
  const handleSelectVacationSuggestion = (suggestion: VacationSuggestion) => {
    try {
      const startDate = new Date(suggestion.startDate);
      const endDate = new Date(suggestion.endDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const key = format(currentDate, 'yyyy-MM-dd');
        saveMark(key, 'ferias');
        currentDate = addDays(currentDate, 1);
      }
      if (startDate.getMonth() !== month.getMonth() || startDate.getFullYear() !== month.getFullYear()) {
        setMonth(startDate);
      }
      setShowAISuggestions(false);
    } catch (error) {
      console.error('Erro ao aplicar sugestão de férias:', error);
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#f8f5e4] border border-[#e2d8b8] rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-semibold text-[#7c6a3c] text-xl flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-[#bfae7c]" />
            Meu Calendário de Trabalho
          </span>
          <span className="text-[#bfae7c] text-base">{format(month, 'MMMM yyyy', { locale: ptBR })}</span>
        </div>
        <div className="flex gap-2">
          <CustomEventDialog onAdd={async (event) => { await addCustomEvent(event); await fetchCustomEvents(); }} />
          <Button size="sm" variant="outline" className="px-3 py-2" onClick={() => setMonth(addDays(month, -30))}>Anterior</Button>
          <Button size="sm" variant="outline" className="px-3 py-2" onClick={() => setMonth(addDays(month, 30))}>Próximo</Button>
          <Button 
            size="sm" 
            variant={showAISuggestions ? "default" : "outline"}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700" 
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            title="Sugestões inteligentes de férias com IA"
          >
            <Brain className="h-4 w-4 mr-1" />
            IA Férias
          </Button>
          {/* Remover clearAllMarks pois não faz mais sentido com Supabase (ou implementar para remover todas as marcações do mês via Supabase) */}
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-[#bfae7c] font-semibold text-center py-2 text-sm">{d}</div>
        ))}
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={'empty-' + i}></div>
        ))}
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const mark = marks[key] || 'none';
          const isCurrent = isToday(date);
          const dayEvents = eventsByDate[key] || [];
          const hasFeriado = dayEvents.some(e => e.type === 'feriado');
          const hasAniversario = dayEvents.some(e => e.type === 'aniversario');
          const isPlantao = mark === 'plantao';
          const isFolga = mark === 'folga';

          // Eventos personalizados do dia
          const customEventsOfDay = customEvents.filter(ev => ev.date === key);

          // Determinar cor de fundo - priorizar feriados
          let backgroundColor = calendarLabels[mark].color;
          if (hasFeriado && hasAniversario) {
            backgroundColor = 'linear-gradient(45deg, #ffeb3b 50%, #ff9800 50%)'; // Gradiente para ambos
          } else if (hasFeriado) {
            backgroundColor = '#ffeb3b'; // Amarelo para feriados
          } else if (hasAniversario) {
            backgroundColor = '#ff9800'; // Laranja para aniversários
          }

          // Definir classe animada
          let animationClass = '';
          if (hasFeriado) animationClass = 'animate-pulse-slow bg-yellow-100';
          else if (isPlantao) animationClass = 'animate-bounce-slow bg-green-100';
          else if (isFolga) animationClass = 'animate-fade-slow bg-gray-200';
          else if (hasAniversario) animationClass = 'animate-bounce-slow bg-orange-100';

          const eventTitles = dayEvents.map(e => e.title).join('\n');
          const fullTitle = [calendarLabels[mark].label, eventTitles].filter(Boolean).join('\n');

          // Ícone do evento personalizado
          const customEventIcons = {
            curso: <BookOpen className="h-3 w-3 text-blue-600" />,
            webinario: <Video className="h-3 w-3 text-purple-600" />,
            reuniao: <Users className="h-3 w-3 text-green-600" />,
            outro: <Sparkles className="h-3 w-3 text-amber-600" />,
          };

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDayClick(date)}
                    className={`rounded-lg border border-[#e2d8b8] flex flex-col items-center justify-center h-16 w-full transition-all duration-150 focus:outline-none hover:shadow-md relative ${isCurrent ? 'ring-2 ring-[#bfae7c]' : ''} ${animationClass}`}
                    style={{ background: backgroundColor }}
                    title={fullTitle}
                  >
                    <span className="font-semibold text-[#7c6a3c] text-base">{date.getDate()}</span>
                    {/* Ícones de eventos */}
                    <div className="flex gap-1 absolute bottom-1 left-1">
                      {hasFeriado && <Star className="h-3 w-3 text-amber-700" />}
                      {hasAniversario && <Gift className="h-3 w-3 text-orange-700" />}
                      {/* Ícones de eventos personalizados */}
                      {customEventsOfDay.map(ev => (
                        <span key={ev.id} title={ev.title} className="relative group">
                          {customEventIcons[ev.type as keyof typeof customEventIcons]}
                          {/* Tooltip customizada */}
                          <span className="hidden group-hover:block absolute z-50 left-6 top-0 bg-white text-xs text-gray-700 rounded shadow px-2 py-1 min-w-[120px] border border-gray-200">
                            <span className="font-semibold">{ev.title}</span>
                            {ev.description && <><br />{ev.description}</>}
                          </span>
                        </span>
                      ))}
                    </div>
                    {/* Ícone do tipo de trabalho */}
                    <div className="absolute bottom-1 right-1">
                      {calendarLabels[mark].icon}
                    </div>
                  </button>
                </TooltipTrigger>
                {dayEvents.length > 0 && (
                  <TooltipContent>
                    <div className="space-y-1">
                      {dayEvents.map((event, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {event.type === 'feriado' ? (
                            <Star className="h-3 w-3 text-amber-500" />
                          ) : (
                            <Gift className="h-3 w-3 text-orange-500" />
                          )}
                          <span className="text-sm">{event.title}</span>
                        </div>
                      ))}
                      {/* Eventos personalizados no tooltip principal */}
                      {customEventsOfDay.map(ev => (
                        <div key={ev.id} className="flex items-center gap-2">
                          {customEventIcons[ev.type as keyof typeof customEventIcons]}
                          <span className="text-sm font-semibold">{ev.title}</span>
                          {ev.description && <span className="text-xs text-gray-500">{ev.description}</span>}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white/50 p-4 rounded-lg">
        <div className="space-y-2">
          <h4 className="font-semibold text-[#7c6a3c] text-sm">Modalidade de Trabalho</h4>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#f5e7c4] border border-[#e2d8b8]"></span>
              <Home className="h-4 w-4 text-[#bfae7c]" />
              Presencial
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#ffe6e6] border border-[#e2d8b8]"></span>
              <Umbrella className="h-4 w-4 text-[#e6a1a1]" />
              Férias
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#e6f7ff] border border-[#e2d8b8]"></span>
              <Laptop className="h-4 w-4 text-[#7cc3e6]" />
              Remoto
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#e6ffe6] border border-[#e2d8b8]"></span>
              <Shield className="h-4 w-4 text-[#4caf50]" />
              Plantão
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#e0e0e0] border border-[#e2d8b8]"></span>
              <CalendarIcon className="h-4 w-4 text-[#757575]" />
              Folga
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-[#7c6a3c] text-sm">Eventos</h4>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#ffeb3b] border border-[#e2d8b8]"></span>
              <Star className="h-4 w-4 text-amber-700" />
              Feriados
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#ff9800] border border-[#e2d8b8]"></span>
              <Gift className="h-4 w-4 text-orange-700" />
              Aniversários
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-center text-sm text-[#bfae7c]">
          <p>Clique nos dias para marcar seu tipo de trabalho</p>
        </div>
        
        {events.length > 0 && (
          <div className="text-center text-xs text-[#bfae7c] bg-white/30 p-2 rounded">
            <span className="font-medium">
              {events.filter(e => e.type === 'feriado').length} feriado(s) e {events.filter(e => e.type === 'aniversario').length} aniversário(s) este mês
            </span>
          </div>
        )}
        
        {eventsLoading && (
          <div className="text-center text-xs text-[#bfae7c]">
            <span>Carregando eventos...</span>
          </div>
        )}
      </div>
      </div>

      {/* Painel de Sugestões de IA - Flutuante */}
      <div className={`fixed top-4 right-4 w-96 max-h-[90vh] overflow-hidden transition-all duration-500 ease-in-out z-50 ${
        showAISuggestions 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200">
          <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Assistente de Férias</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAISuggestions(false)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
            <p className="text-sm text-purple-100 mt-1">
              Sugestões inteligentes para {month.getFullYear()}
            </p>
          </div>
          
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
            <VacationSuggestionsPanel
              year={month.getFullYear()}
              onSelectSuggestion={handleSelectVacationSuggestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Calendario = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Calendário de Trabalho"
          subtitle="Organize sua agenda de trabalho presencial, remoto e férias"
        />
        
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <CalendarComponent />
      </div>
    </div>
  );
};

export default Calendario;
