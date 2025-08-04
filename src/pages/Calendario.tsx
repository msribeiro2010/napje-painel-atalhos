import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Home, Sun, Laptop, ArrowLeft, Gift, Star, Brain, Sparkles, Shield, BookOpen, Video, Users, Edit, Trash2, Building2, HardHat, Umbrella, Briefcase, Coffee } from 'lucide-react';
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
import { EditCustomEventDialog } from '@/components/EditCustomEventDialog';
import { useCustomEvents } from '@/hooks/useCustomEvents';

import { ptBR } from 'date-fns/locale';

const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Building2 className="h-5 w-5 text-[#8b7355] drop-shadow-sm" /> },
  ferias: { label: 'Férias', color: '#ffe6e6', icon: <Umbrella className="h-5 w-5 text-[#d4756b] drop-shadow-sm" /> },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Coffee className="h-5 w-5 text-[#5ba3d4] drop-shadow-sm" /> },
  plantao: { label: 'Plantão', color: '#e6ffe6', icon: <HardHat className="h-5 w-5 text-[#2e7d32] drop-shadow-sm" /> },
  folga: { label: 'Folga', color: '#e0e0e0', icon: <Umbrella className="h-5 w-5 text-[#424242] drop-shadow-sm" /> },
  none: { label: '', color: '#fff', icon: null },
};

function CalendarComponent() {
  const today = new Date();
  const [month, setMonth] = useState(today);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  
  // Usar o hook para buscar/salvar marcações do Supabase
  const { marks, loading: marksLoading, saveMark, removeMark, fetchMarks } = useWorkCalendar(month);
  const { customEvents, addCustomEvent, updateCustomEvent, removeCustomEvent, loading: customEventsLoading } = useCustomEvents(month);

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
    const current = marks[key] || null;
    const dayEvents = eventsByDate[key] || [];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFeriado = dayEvents.some(e => e.type === 'feriado');

    // Ciclo completo de modalidades para todos os dias
    const next: WorkStatus | null =
      current === null ? 'presencial' :
      current === 'presencial' ? 'ferias' :
      current === 'ferias' ? 'remoto' :
      current === 'remoto' ? 'folga' :
      current === 'folga' ? 'plantao' :
      current === 'plantao' ? null :
      null;

    // Aplicar a próxima modalidade ou remover
    if (next === null) {
      removeMark(key);
    } else {
      // Validação especial para finais de semana e feriados
      if ((isWeekend || isFeriado) && next !== 'plantao') {
        toast.warning('Em finais de semana e feriados só é permitido marcar Plantão.');
        return;
      }
      saveMark(key, next);
    }
  };

  // Funções para gerenciar eventos personalizados
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir o evento "${eventTitle}"?`)) {
      try {
        await removeCustomEvent(eventId);
        toast.success('Evento excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir evento');
      }
    }
  };

  // Atualizar handleSelectVacationSuggestion para usar saveMark
  const handleSelectVacationSuggestion = (suggestion: VacationSuggestion) => {
    try {
      // Validate that suggestion and dates exist
      if (!suggestion || !suggestion.startDate || !suggestion.endDate) {
        console.error('Sugestão de férias inválida:', suggestion);
        toast.error('Erro: dados da sugestão de férias são inválidos');
        return;
      }

      const startDate = new Date(suggestion.startDate);
      const endDate = new Date(suggestion.endDate);
      
      // Validate that dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Datas inválidas na sugestão:', { startDate: suggestion.startDate, endDate: suggestion.endDate });
        toast.error('Erro: datas da sugestão são inválidas');
        return;
      }

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
      toast.error('Erro ao aplicar sugestão de férias');
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
          <CustomEventDialog onAdd={async (event) => { await addCustomEvent(event); }} />
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3 py-2 hover:bg-gray-50 transition-colors" 
            onClick={() => setMonth(addDays(month, -30))}
          >
            Anterior
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3 py-2 hover:bg-gray-50 transition-colors" 
            onClick={() => setMonth(addDays(month, 30))}
          >
            Próximo
          </Button>
          <Button 
            size="sm" 
            variant={showAISuggestions ? "default" : "outline"}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg" 
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            title="Sugestões inteligentes de férias com IA"
          >
            <Brain className="h-4 w-4 mr-1" />
            IA Férias
          </Button>
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
          const mark = marks[key];
          const isCurrent = isToday(date);
          const dayEvents = eventsByDate[key] || [];
          const hasFeriado = dayEvents.some(e => e.type === 'feriado');
          const hasAniversario = dayEvents.some(e => e.type === 'aniversario');
          const isPlantao = mark === 'plantao';
          const isFolga = mark === 'folga';

          // Eventos personalizados do dia
          const customEventsOfDay = customEvents.filter(ev => ev.date === key);

          // Determinar cor de fundo - priorizar feriados
          let backgroundColor = mark ? calendarLabels[mark].color : calendarLabels.presencial.color;
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
          const fullTitle = [mark ? calendarLabels[mark].label : '', eventTitles].filter(Boolean).join('\n');

          // Ícone do evento personalizado
          const customEventIcons = {
            curso: <BookOpen className="h-4 w-4 text-blue-700 drop-shadow-sm" />,
            webinario: <Video className="h-4 w-4 text-purple-700 drop-shadow-sm" />,
            reuniao: <Users className="h-4 w-4 text-green-700 drop-shadow-sm" />,
            outro: <Sparkles className="h-4 w-4 text-amber-700 drop-shadow-sm" />,
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
                      {hasFeriado && (
                        <div className="bg-white/90 rounded-full p-1 shadow-md">
                          <Star className="h-4 w-4 text-amber-600 drop-shadow-sm" />
                        </div>
                      )}
                      {hasAniversario && (
                        <div className="bg-white/90 rounded-full p-1 shadow-md">
                          <Gift className="h-4 w-4 text-orange-600 drop-shadow-sm" />
                        </div>
                      )}
                      {/* Ícones de eventos personalizados */}
                      {customEventsOfDay.map(ev => (
                        <span key={ev.id} title={ev.title} className="relative group">
                          <div className="bg-white/90 rounded-full p-1 shadow-md">
                            {customEventIcons[ev.type as keyof typeof customEventIcons]}
                          </div>
                          {/* Tooltip customizada com botões de ação */}
                          <div className="hidden group-hover:block absolute z-50 left-6 top-0 bg-white text-xs text-gray-700 rounded shadow border border-gray-200 min-w-[160px]">
                            <div className="p-2">
                              <div className="font-semibold mb-1">{ev.title}</div>
                              {ev.description && <div className="mb-2 text-gray-600">{ev.description}</div>}
                              <div className="flex gap-1 pt-1 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEvent(ev);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                  title="Editar evento"
                                >
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(ev.id, ev.title);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                  title="Excluir evento"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Excluir
                                </button>
                              </div>
                            </div>
                          </div>
                        </span>
                      ))}
                    </div>
                    {/* Ícone do tipo de trabalho */}
                    {mark && (
                      <div className="absolute bottom-1 right-1">
                        <div className="bg-white/90 rounded-full p-1 shadow-md">
                          {calendarLabels[mark].icon}
                        </div>
                      </div>
                    )}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white/70 dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="space-y-2">
          <h4 className="font-semibold text-[#7c6a3c] dark:text-amber-300 text-sm">Modalidade de Trabalho</h4>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#f5e7c4] dark:bg-amber-200 border border-[#e2d8b8] dark:border-amber-300 shadow-sm"></span>
              <Building2 className="h-5 w-5 text-amber-700 dark:text-amber-400 drop-shadow-sm" />
              Presencial (TRT15)
            </span>
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#ffe6e6] dark:bg-red-200 border border-[#e2d8b8] dark:border-red-300 shadow-sm"></span>
              <Umbrella className="h-5 w-5 text-red-600 dark:text-red-400 drop-shadow-sm" />
              Férias
            </span>
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#e6f7ff] dark:bg-blue-200 border border-[#e2d8b8] dark:border-blue-300 shadow-sm"></span>
              <Coffee className="h-5 w-5 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
              Home Office
            </span>
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#e6ffe6] dark:bg-green-200 border border-[#e2d8b8] dark:border-green-300 shadow-sm"></span>
              <HardHat className="h-5 w-5 text-green-600 dark:text-green-400 drop-shadow-sm" />
              Plantão
            </span>
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#e0e0e0] dark:bg-gray-300 border border-[#e2d8b8] dark:border-gray-400 shadow-sm"></span>
              <Umbrella className="h-5 w-5 text-gray-600 dark:text-gray-400 drop-shadow-sm" />
              Folga
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-[#7c6a3c] dark:text-amber-300 text-sm">Eventos</h4>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#ffeb3b] dark:bg-yellow-300 border border-[#e2d8b8] dark:border-yellow-400 shadow-sm"></span>
              <div className="bg-white/90 dark:bg-gray-700/90 rounded-full p-1 shadow-sm">
                <Star className="h-4 w-4 text-amber-600 dark:text-yellow-400 drop-shadow-sm" />
              </div>
              Feriados
            </span>
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className="inline-block w-4 h-4 rounded bg-[#ff9800] dark:bg-orange-300 border border-[#e2d8b8] dark:border-orange-400 shadow-sm"></span>
              <div className="bg-white/90 dark:bg-gray-700/90 rounded-full p-1 shadow-sm">
                <Gift className="h-4 w-4 text-orange-600 dark:text-orange-400 drop-shadow-sm" />
              </div>
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

      {/* Dialog para editar eventos personalizados */}
      <EditCustomEventDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={editingEvent}
        onUpdate={updateCustomEvent}
      />



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