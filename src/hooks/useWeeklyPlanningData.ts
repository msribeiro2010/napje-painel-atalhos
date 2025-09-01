import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCustomEventsWeekly } from '@/hooks/useCustomEventsWeekly';
import { useWorkCalendarSimple as useWorkCalendarWeekly } from '@/hooks/useWorkCalendarSimple';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { useWeeklyNotifications } from '@/hooks/useWeeklyNotifications';
import { startOfWeek, endOfWeek, getWeek, format, isWithinInterval, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeeklyCalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'custom' | 'holiday' | 'birthday';
  category?: string;
  location?: string;
  time?: string;
  allDay?: boolean;
}

export interface WeeklyPlanningData {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
  events: WeeklyCalendarEvent[];
  customEvents: WeeklyCalendarEvent[];
  holidays: WeeklyCalendarEvent[];
  birthdays: WeeklyCalendarEvent[];
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    isActive: boolean;
    selectedDays?: number[];
    dayofweek?: number;
    time: string;
    isWeekdayRange?: boolean;
  }>;
  summary: {
    totalEvents: number;
    workDays: number;
    courses: number;
    meetings: number;
    webinars: number;
    birthdays: number;
    holidays: number;
  };
}

export const useWeeklyPlanningData = (targetDate?: Date) => {
  const currentDate = targetDate || new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 }); // Sábado
  
  const { customEvents: rawCustomEvents, loading: customEventsLoading } = useCustomEventsWeekly(weekStart, weekEnd);
  const { workEvents: rawWorkEvents, loading: workCalendarLoading } = useWorkCalendarWeekly(weekStart, weekEnd);
  const { events: upcomingEvents, loading: upcomingEventsLoading } = useUpcomingEvents();
  const { settings, notificationItems } = useWeeklyNotifications();

  const [loading, setLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Converter eventos customizados para formato padrão
  const customEvents = useMemo(() => {
    if (!rawCustomEvents || rawCustomEvents.length === 0) {
      return [];
    }
    
    // Não precisamos filtrar pois o hook já retorna apenas eventos da semana
    return rawCustomEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: parseISO(event.date),
      type: 'custom' as const,
      category: event.type,
      time: event.start_time,
      location: event.url ? 'Link disponível' : undefined,
      allDay: !event.start_time
    }));
  }, [rawCustomEvents]);

  // Converter eventos do calendário de trabalho para formato padrão
  const workEvents = useMemo(() => {
    if (!rawWorkEvents || rawWorkEvents.length === 0) {
      return [];
    }
    
    return rawWorkEvents.map(event => {
      // Determinar tipo baseado nas notas
      let category = 'work';
      let title = 'Dia de Trabalho';
      
      if (event.notes) {
        const notes = event.notes.toLowerCase();
        if (notes.includes('presencial')) {
          category = 'work_onsite';
          title = 'Trabalho Presencial';
        } else if (notes.includes('remoto') || notes.includes('home office')) {
          category = 'work_remote';
          title = 'Trabalho Remoto';
        } else if (notes.includes('feriado') || notes.includes('folga')) {
          category = 'holiday';
          title = 'Feriado/Folga';
        } else {
          title = event.notes; // Usar as notas como título
        }
      }

      return {
        id: `work-${event.id}`,
        title: title,
        description: event.notes || undefined,
        date: parseISO(event.date),
        type: 'work' as const,
        category: category,
        time: undefined, // Eventos de trabalho são dia inteiro
        location: category === 'work_remote' ? 'Home Office' : category === 'work_onsite' ? 'Escritório' : undefined,
        allDay: true
      };
    });
  }, [rawWorkEvents]);

  // Converter eventos de feriados para formato padrão
  const holidays = useMemo(() => {
    if (!upcomingEvents?.feriados) return [];
    
    return upcomingEvents.feriados
      .filter(holiday => {
        if (!holiday.data_feriado) return false;
        const holidayDate = parseISO(holiday.data_feriado);
        return isWithinInterval(holidayDate, { start: weekStart, end: weekEnd });
      })
      .map(holiday => ({
        id: `holiday-${holiday.id}`,
        title: holiday.descricao || 'Feriado',
        description: holiday.tipo,
        date: parseISO(holiday.data_feriado!),
        type: 'holiday' as const,
        category: 'feriado',
        allDay: true
      }));
  }, [upcomingEvents?.feriados, weekStart, weekEnd]);

  // Converter eventos de aniversários para formato padrão
  const birthdays = useMemo(() => {
    if (!upcomingEvents?.aniversariantes) return [];
    
    return upcomingEvents.aniversariantes
      .filter(birthday => {
        if (!birthday.data_nascimento) return false;
        // Calcular aniversário no ano atual
        const birthDate = parseISO(birthday.data_nascimento);
        const thisYearBirthday = new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        return isWithinInterval(thisYearBirthday, { start: weekStart, end: weekEnd });
      })
      .map(birthday => {
        const birthDate = parseISO(birthday.data_nascimento!);
        const thisYearBirthday = new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        return {
          id: `birthday-${birthday.id}`,
          title: `Aniversário de ${birthday.nome}`,
          description: `${birthday.idade || 'N/A'} anos`,
          date: thisYearBirthday,
          type: 'birthday' as const,
          category: 'aniversario',
          allDay: true
        };
      });
  }, [upcomingEvents?.aniversariantes, weekStart, weekEnd, currentDate]);

  // Combinar todos os eventos
  const allEvents = useMemo(() => {
    return [...customEvents, ...workEvents, ...holidays, ...birthdays]
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [customEvents, workEvents, holidays, birthdays]);

  // Converter notificações para formato do modal
  const notifications = useMemo(() => {
    if (!notificationItems) return [];
    
    return notificationItems.map(item => ({
      id: item.id,
      title: item.titulo,
      message: item.conteudo || `Lembrete: ${item.titulo}`,
      isActive: true,
      selectedDays: settings.notificationDays,
      dayofweek: settings.notificationDay,
      time: settings.notificationTime,
      isWeekdayRange: settings.isWeekdayRange
    }));
  }, [notificationItems, settings]);

  // Calcular resumo da semana
  const summary = useMemo(() => {
    const customEventsSummary = customEvents.reduce((acc, event) => {
      switch (event.category) {
        case 'curso':
          acc.courses += 1;
          break;
        case 'reuniao':
          acc.meetings += 1;
          break;
        case 'webinario':
          acc.webinars += 1;
          break;
        default:
          break;
      }
      return acc;
    }, { courses: 0, meetings: 0, webinars: 0 });

    // Contar eventos de trabalho (presencial + remoto)
    const workEventsSummary = workEvents.reduce((acc, event) => {
      switch (event.category) {
        case 'work_onsite':
          acc.workOnsite += 1;
          break;
        case 'work_remote':
          acc.workRemote += 1;
          break;
        default:
          break;
      }
      return acc;
    }, { workOnsite: 0, workRemote: 0 });

    // Total de dias de trabalho (presencial + remoto + eventos personalizados em dias úteis)
    const customWorkDays = customEvents.filter(event => {
      const dayOfWeek = event.date.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Segunda a Sexta
    }).length;

    const totalWorkDays = workEventsSummary.workOnsite + workEventsSummary.workRemote + customWorkDays;

    return {
      totalEvents: allEvents.length,
      workDays: totalWorkDays,
      workOnsite: workEventsSummary.workOnsite,
      workRemote: workEventsSummary.workRemote,
      courses: customEventsSummary.courses,
      meetings: customEventsSummary.meetings,
      webinars: customEventsSummary.webinars,
      birthdays: birthdays.length,
      holidays: holidays.length
    };
  }, [allEvents, customEvents, workEvents, birthdays, holidays]);

  // Dados principais do planejamento semanal
  const weeklyData: WeeklyPlanningData = useMemo(() => ({
    weekStart,
    weekEnd,
    weekNumber: getWeek(currentDate, { weekStartsOn: 0, locale: ptBR }),
    year: currentDate.getFullYear(),
    events: allEvents || [],
    customEvents: customEvents || [],
    holidays: holidays || [],
    birthdays: birthdays || [],
    notifications: notifications || [],
    summary: summary || {
      totalEvents: 0,
      workDays: 0,
      courses: 0,
      meetings: 0,
      webinars: 0,
      birthdays: 0,
      holidays: 0
    }
  }), [
    weekStart,
    weekEnd,
    currentDate,
    allEvents,
    customEvents,
    holidays,
    birthdays,
    notifications,
    summary
  ]);

  // Função para obter eventos de um dia específico
  const getEventsForDay = useCallback((date: Date): WeeklyCalendarEvent[] => {
    return allEvents.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  }, [allEvents]);

  // Função para obter próximos 7 dias com eventos
  const getNext7Days = useCallback(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayEvents = getEventsForDay(date);
      days.push({
        date,
        dayName: format(date, 'EEEE', { locale: ptBR }),
        dayNumber: format(date, 'd'),
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }
    return days;
  }, [weekStart, getEventsForDay]);

  // Loading state com timeout para evitar loading infinito
  const isLoading = customEventsLoading || workCalendarLoading || upcomingEventsLoading || loading;
  
  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (isLoading && !hasTimedOut) {
      const timeout = setTimeout(() => {
        console.warn('Loading timeout reached - forcing loading to false');
        setHasTimedOut(true);
      }, 10000); // 10 segundos de timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasTimedOut]);

  // Reset timeout quando loading parar naturalmente
  useEffect(() => {
    if (!isLoading && hasTimedOut) {
      setHasTimedOut(false);
    }
  }, [isLoading, hasTimedOut]);
  

  return {
    weeklyData,
    isLoading: hasTimedOut ? false : isLoading, // Força loading false se timeout
    getEventsForDay,
    getNext7Days,
    refresh: useCallback(() => {
      setLoading(true);
      setHasTimedOut(false); // Reset timeout no refresh
      setTimeout(() => setLoading(false), 100); // Trigger re-render
    }, [])
  };
};