import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Home, Sun, Laptop, ArrowLeft, Gift, Star, Brain, Sparkles, Shield, BookOpen, Video, Users, Edit, Trash2, Building2, HardHat, Umbrella, Briefcase, Coffee, Palmtree, BriefcaseBusiness, ShieldAlert, BedDouble } from 'lucide-react';
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
import { useVacations } from '@/hooks/useVacations';
import { VacationDialog } from '@/components/vacation/VacationDialog';
import { VacationAlerts } from '@/components/vacation/VacationAlerts';
import { ModernPageHeader } from '@/components/ModernPageHeader';

import { ptBR } from 'date-fns/locale';

const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <BriefcaseBusiness className="h-5 w-5 text-[#8b7355] drop-shadow-sm" /> },
  ferias: { label: 'Férias', color: '#ffe6e6', icon: <span className="text-2xl drop-shadow-sm">🌴</span> },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Laptop className="h-5 w-5 text-[#5ba3d4] drop-shadow-sm" /> },
  plantao: { label: 'Plantão', color: '#e6ffe6', icon: <ShieldAlert className="h-5 w-5 text-[#2e7d32] drop-shadow-sm" /> },
  folga: { label: 'Folga', color: '#e0e0e0', icon: <BedDouble className="h-5 w-5 text-[#424242] drop-shadow-sm" /> },
  none: { label: '', color: '#fff', icon: null },
};

function CalendarComponent() {
  const [searchParams] = useSearchParams();
  const today = new Date();
  
  // Inicializar o mês com base nos parâmetros de URL ou data atual
  const getInitialMonth = () => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam) - 1; // Date usa 0-11 para meses
      if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
        return new Date(year, month, 1);
      }
    }
    return today;
  };
  
  const [month, setMonth] = useState(getInitialMonth);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [selectedVacationDates, setSelectedVacationDates] = useState<{ start?: Date; end?: Date }>({});

  // Usar o hook para buscar/salvar marcações do Supabase
  const { marks, loading: marksLoading, saveMark, removeMark, fetchMarks } = useWorkCalendar(month);
  const { customEvents, addCustomEvent, updateCustomEvent, removeCustomEvent, loading: customEventsLoading } = useCustomEvents(month);
  const { vacations, getVacationForDate, isDateInVacation } = useVacations(month.getFullYear());

  // Atualizar o mês quando os parâmetros de URL mudarem
  useEffect(() => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const monthIndex = parseInt(monthParam) - 1;
      if (!isNaN(year) && !isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
        const newDate = new Date(year, monthIndex, 1);
        setMonth(newDate);
      }
    }
  }, [searchParams]);

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

    // Lógica para finais de semana e feriados
    // Permite: férias (porque é período corrente) e plantão
    if (isWeekend || isFeriado) {
      const next: WorkStatus | null =
        current === null ? 'ferias' :        // Primeiro clique: férias
        current === 'ferias' ? 'plantao' :   // Segundo clique: plantão
        current === 'plantao' ? null :       // Terceiro clique: remove
        null;

      if (next === null) {
        removeMark(key);
      } else {
        saveMark(key, next);
      }
      return;
    }

    // Ciclo completo de modalidades para dias úteis
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
      if (month && (startDate.getMonth() !== month.getMonth() || startDate.getFullYear() !== month.getFullYear())) {
        setMonth(startDate);
      }
      setShowAISuggestions(false);
    } catch (error) {
      console.error('Erro ao aplicar sugestão de férias:', error);
      toast.error('Erro ao aplicar sugestão de férias');
    }
  };

  // Calcular estatísticas do mês
  const monthStats = {
    presencial: Object.values(marks).filter(m => m === 'presencial').length,
    remoto: Object.values(marks).filter(m => m === 'remoto').length,
    ferias: Object.values(marks).filter(m => m === 'ferias').length + (vacations?.reduce((acc, v) => {
      const start = new Date(v.start_date);
      const end = new Date(v.end_date);
      if (start.getMonth() === month.getMonth() && start.getFullYear() === month.getFullYear()) {
        return acc + (v.days_count || 0);
      }
      return acc;
    }, 0) || 0),
    plantao: Object.values(marks).filter(m => m === 'plantao').length,
    folga: Object.values(marks).filter(m => m === 'folga').length,
  };

  return (
    <div className="relative space-y-6">
      {/* Header Moderno com Estatísticas */}
      <ModernPageHeader
        title="Calendário de Trabalho"
        subtitle={format(month, "MMMM 'de' yyyy", { locale: ptBR })}
        icon={<CalendarIcon className="h-6 w-6 text-white" />}
        actions={
          <>
            <VacationAlerts compact />

            <Button
              size="sm"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              onClick={() => setIsVacationDialogOpen(true)}
            >
              <Palmtree className="h-4 w-4 mr-2" />
              Férias
            </Button>

            <CustomEventDialog onAdd={async (event) => { await addCustomEvent(event); }} />

            <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-md">
              <Button
                size="sm"
                variant="ghost"
                className="px-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setMonth(addDays(month, -30))}
              >
                ← Anterior
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="px-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setMonth(addDays(month, 30))}
              >
                Próximo →
              </Button>
            </div>

            <Button
              size="sm"
              variant={showAISuggestions ? "default" : "outline"}
              className={`px-4 py-2 ${showAISuggestions ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''} text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200`}
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              title="Sugestões inteligentes de férias com IA"
            >
              <Brain className="h-4 w-4 mr-2" />
              IA Férias
            </Button>
          </>
        }
      >
        {/* Mini Estatísticas do Mês */}
        <div className="grid grid-cols-5 gap-3 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{monthStats.presencial}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">Presencial</p>
                </div>
                <BriefcaseBusiness className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{monthStats.remoto}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">Home Office</p>
                </div>
                <Laptop className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{monthStats.ferias}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500 font-medium">Férias</p>
                </div>
                <span className="text-3xl opacity-50">🌴</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{monthStats.plantao}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 font-medium">Plantão</p>
                </div>
                <ShieldAlert className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-400">{monthStats.folga}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-500 font-medium">Folga</p>
                </div>
                <BedDouble className="h-8 w-8 text-slate-500 opacity-50" />
              </div>
            </div>
          </div>
      </ModernPageHeader>

      {/* Grid Moderno do Calendário */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 gap-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-px">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
            <div
              key={d}
              className={`bg-gradient-to-br ${
                i === 0 || i === 6
                  ? 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50'
                  : 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50'
              } font-bold text-center py-4 text-sm ${
                i === 0 || i === 6
                  ? 'text-purple-700 dark:text-purple-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid de Dias */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 p-px">
          {/* Dias vazios antes do início do mês */}
          {Array(days[0].getDay()).fill(null).map((_, i) => (
            <div key={'empty-' + i} className="bg-slate-50 dark:bg-slate-900/50 min-h-[100px]"></div>
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

          // Verificar se o dia está em período de férias cadastrado
          const isInVacation = isDateInVacation(date);
          const vacationForDay = getVacationForDate(date);

          // Eventos personalizados do dia
          const customEventsOfDay = (customEvents || []).filter(ev => ev.date === key);

          // Determinar estilo moderno baseado no tipo
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          let dayStyle = {
            bg: 'bg-white dark:bg-slate-900',
            border: 'border-slate-200 dark:border-slate-700',
            text: 'text-slate-900 dark:text-slate-100',
            hover: 'hover:shadow-lg hover:scale-[1.02]',
          };

          if (mark === 'presencial') {
            dayStyle = {
              bg: 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-orange-950/30',
              border: 'border-amber-300 dark:border-amber-700',
              text: 'text-amber-900 dark:text-amber-100',
              hover: 'hover:shadow-amber-200 dark:hover:shadow-amber-900/50 hover:scale-[1.02]',
            };
          } else if (mark === 'remoto') {
            dayStyle = {
              bg: 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-cyan-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-cyan-950/30',
              border: 'border-blue-300 dark:border-blue-700',
              text: 'text-blue-900 dark:text-blue-100',
              hover: 'hover:shadow-blue-200 dark:hover:shadow-blue-900/50 hover:scale-[1.02]',
            };
          } else if (mark === 'ferias' || (isInVacation && !mark)) {
            dayStyle = {
              bg: 'bg-gradient-to-br from-orange-50 via-red-100/50 to-pink-50 dark:from-orange-950/30 dark:via-red-900/20 dark:to-pink-950/30',
              border: 'border-orange-300 dark:border-orange-700',
              text: 'text-orange-900 dark:text-orange-100',
              hover: 'hover:shadow-orange-200 dark:hover:shadow-orange-900/50 hover:scale-[1.02]',
            };
          } else if (mark === 'plantao') {
            dayStyle = {
              bg: 'bg-gradient-to-br from-green-50 via-emerald-100/50 to-teal-50 dark:from-green-950/30 dark:via-emerald-900/20 dark:to-teal-950/30',
              border: 'border-green-300 dark:border-green-700',
              text: 'text-green-900 dark:text-green-100',
              hover: 'hover:shadow-green-200 dark:hover:shadow-green-900/50 hover:scale-[1.02]',
            };
          } else if (mark === 'folga') {
            dayStyle = {
              bg: 'bg-gradient-to-br from-slate-100 via-gray-100/50 to-slate-50 dark:from-slate-800/30 dark:via-gray-800/20 dark:to-slate-900/30',
              border: 'border-slate-300 dark:border-slate-600',
              text: 'text-slate-700 dark:text-slate-300',
              hover: 'hover:shadow-slate-200 dark:hover:shadow-slate-800/50 hover:scale-[1.02]',
            };
          } else if (isWeekend) {
            dayStyle = {
              bg: 'bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-purple-950/20',
              border: 'border-purple-200 dark:border-purple-800',
              text: 'text-purple-700 dark:text-purple-300',
              hover: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/30 hover:scale-[1.02]',
            };
          }

          // Feriados e aniversários
          if (hasFeriado) {
            dayStyle.bg = 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 dark:from-yellow-900/40 dark:via-amber-900/40 dark:to-orange-900/40';
            dayStyle.border = 'border-yellow-400 dark:border-yellow-600';
          }
          if (hasAniversario && !hasFeriado) {
            dayStyle.bg = 'bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 dark:from-orange-900/40 dark:via-red-900/40 dark:to-pink-900/40';
            dayStyle.border = 'border-orange-400 dark:border-orange-600';
          }

          // Ícone do evento personalizado
          const customEventIcons = {
            curso: <BookOpen className="h-4 w-4 text-blue-700 drop-shadow-sm" />,
            webinario: <Video className="h-4 w-4 text-purple-700 drop-shadow-sm" />,
            reuniao: <Users className="h-4 w-4 text-green-700 drop-shadow-sm" />,
            outro: <Sparkles className="h-4 w-4 text-white drop-shadow-sm" />,
          };

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDayClick(date)}
                    className={`
                      ${dayStyle.bg}
                      ${dayStyle.border}
                      ${dayStyle.text}
                      ${dayStyle.hover}
                      min-h-[100px] w-full
                      border-2
                      transition-all duration-300 ease-out
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      relative group
                      ${isCurrent ? 'ring-4 ring-blue-500 ring-offset-2 shadow-2xl scale-[1.05]' : ''}
                    `}
                  >
                    {/* Indicador de dia atual */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-xs font-bold">●</span>
                      </div>
                    )}

                    {/* Número do dia */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-lg font-bold ${dayStyle.text}`}>
                        {date.getDate()}
                      </span>
                    </div>
                    {/* Ícone Principal no Centro */}
                    {(mark || isInVacation) && (
                      <div className="flex items-center justify-center h-full">
                        <div className="transform group-hover:scale-110 transition-transform duration-200">
                          {mark ? calendarLabels[mark].icon : calendarLabels.ferias.icon}
                        </div>
                      </div>
                    )}

                    {/* Badges de Eventos (Feriados e Aniversários) */}
                    <div className="flex gap-1 absolute top-2 right-2">
                      {hasFeriado && (
                        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg p-1.5 shadow-lg animate-pulse">
                          <Star className="h-3 w-3 text-white drop-shadow-sm" />
                        </div>
                      )}
                      {hasAniversario && (
                        <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg p-1.5 shadow-lg animate-bounce">
                          <Gift className="h-3 w-3 text-white drop-shadow-sm" />
                        </div>
                      )}
                    </div>

                    {/* Badges de Eventos Personalizados (inferior) */}
                    <div className="flex gap-1 absolute bottom-2 left-2">
                      {customEventsOfDay.map(ev => (
                        <div
                          key={ev.id}
                          className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg p-1.5 shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title={ev.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(ev);
                          }}
                        >
                          {customEventIcons[ev.type as keyof typeof customEventIcons]}
                        </div>
                      ))}
                    </div>
                  </button>
                </TooltipTrigger>
                {(dayEvents.length > 0 || isInVacation) && (
                  <TooltipContent>
                    <div className="space-y-1">
                      {/* Exibir férias cadastradas */}
                      {isInVacation && vacationForDay && (
                        <div className="flex items-center gap-2 border-b pb-1 mb-1">
                          <span className="text-lg">🌴</span>
                          <div>
                            <span className="text-sm font-semibold">Férias</span>
                            {vacationForDay.notes && (
                              <span className="text-xs text-gray-500 block">{vacationForDay.notes}</span>
                            )}
                          </div>
                        </div>
                      )}
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
      </div>

      {/* Legenda Moderna */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/30 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            📋 Legenda
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Clique nos dias para alternar entre as modalidades
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Presencial */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <BriefcaseBusiness className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Presencial</span>
          </div>

          {/* Home Office */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Laptop className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Home Office</span>
          </div>

          {/* Férias */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <span className="text-2xl flex-shrink-0">🌴</span>
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Férias</span>
          </div>

          {/* Plantão */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-xl border border-green-200 dark:border-green-800">
            <ShieldAlert className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Plantão</span>
          </div>

          {/* Folga */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/20 dark:to-gray-900/20 rounded-xl border border-slate-200 dark:border-slate-700">
            <BedDouble className="h-6 w-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Folga</span>
          </div>
        </div>

        {/* Eventos Especiais */}
        <div className="mt-4 flex items-center gap-4 justify-center flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-900 dark:text-amber-100">Feriado</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-lg border border-orange-300 dark:border-orange-700">
            <Gift className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-orange-900 dark:text-orange-100">Aniversário</span>
          </div>
          {events.length > 0 && (
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {events.filter(e => e.type === 'feriado').length} feriados | {events.filter(e => e.type === 'aniversario').length} aniversários
              </span>
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

      {/* Dialog para cadastrar férias */}
      <VacationDialog
        open={isVacationDialogOpen}
        onOpenChange={setIsVacationDialogOpen}
        initialStartDate={selectedVacationDates.start}
        initialEndDate={selectedVacationDates.end}
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
              Sugestões inteligentes para {month ? month.getFullYear() : new Date().getFullYear()}
            </p>
          </div>
          
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
            <VacationSuggestionsPanel
              year={month ? month.getFullYear() : new Date().getFullYear()}
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

        <CalendarComponent />
      </div>
    </div>
  );
};

export default Calendario;