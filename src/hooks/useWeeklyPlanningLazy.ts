import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useWorkCalendar } from '@/hooks/useWorkCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { startOfWeek, endOfWeek, getWeek, format, isWithinInterval, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface LazyWeeklyPlanningData {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
  events: WeeklyCalendarEvent[];
  summary: {
    totalEvents: number;
    workDays: number;
    workOnsite: number;
    workRemote: number;
    vacation: number;
    timeOff: number;
    onCall: number;
    courses: number;
    meetings: number;
    webinars: number;
    birthdays: number;
    holidays: number;
  };
}

export interface WeeklyCalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'custom' | 'holiday' | 'birthday' | 'work';
  category?: string;
  location?: string;
  time?: string;
  allDay?: boolean;
}

export const useWeeklyPlanningLazy = (targetDate?: Date) => {
  const currentDate = targetDate || new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Usar hooks reais existentes para buscar dados
  const { customEvents, loading: customLoading } = useCustomEvents(currentDate);
  const { marks: workMarks, loading: workLoading } = useWorkCalendar(currentDate);
  const { data: calendarEvents, isLoading: calendarLoading } = useCalendarEvents(currentDate);

  // Computar dados automaticamente quando dados estão prontos
  const data = useMemo(() => {
    // Se ainda está carregando, retornar null
    if (customLoading || workLoading || calendarLoading) {
      return null;
    }
      
    const allEvents: WeeklyCalendarEvent[] = [];
    
    // 1. Processar eventos de trabalho (presencial, remoto, férias, folga, plantão)
    Object.entries(workMarks || {}).forEach(([dateStr, status]) => {
      const eventDate = parseISO(dateStr);
      if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
        let title = '';
        let category = '';
        
        switch (status) {
          case 'presencial':
            title = 'Trabalho Presencial';
            category = 'work_onsite';
            break;
          case 'remoto':
            title = 'Trabalho Remoto';
            category = 'work_remote';
            break;
          case 'ferias':
            title = 'Férias';
            category = 'vacation';
            break;
          case 'folga':
            title = 'Folga';
            category = 'time_off';
            break;
          case 'plantao':
            title = 'Plantão';
            category = 'on_call';
            break;
        }
        
        allEvents.push({
          id: `work-${dateStr}`,
          title,
          date: eventDate,
          type: 'work',
          category,
          allDay: true
        });
      }
    });

    // 2. Processar eventos customizados (cursos, reuniões, webinários)
    (customEvents || []).forEach(event => {
      const eventDate = parseISO(event.date);
      if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
        allEvents.push({
          id: event.id,
          title: event.title,
          description: event.description,
          date: eventDate,
          type: 'custom',
          category: event.type,
          time: event.start_time,
          allDay: !event.start_time
        });
      }
    });

    // 3. Processar feriados e aniversários do calendário
    (calendarEvents || []).forEach(event => {
      const eventDate = parseISO(event.date);
      if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
        allEvents.push({
          id: `calendar-${event.id}`,
          title: event.title,
          description: event.description,
          date: eventDate,
          type: event.type === 'feriado' ? 'holiday' : 'birthday',
          allDay: true
        });
      }
    });

    // Ordenar eventos por data
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calcular resumo com dados reais
    const workOnsite = allEvents.filter(e => e.category === 'work_onsite').length;
    const workRemote = allEvents.filter(e => e.category === 'work_remote').length;
    const vacation = allEvents.filter(e => e.category === 'vacation').length;
    const timeOff = allEvents.filter(e => e.category === 'time_off').length;
    const onCall = allEvents.filter(e => e.category === 'on_call').length;
    const courses = allEvents.filter(e => e.category === 'curso').length;
    const meetings = allEvents.filter(e => e.category === 'reuniao').length;
    const webinars = allEvents.filter(e => e.category === 'webinario').length;
    const birthdays = allEvents.filter(e => e.type === 'birthday').length;
    const holidays = allEvents.filter(e => e.type === 'holiday').length;

    return {
      weekStart,
      weekEnd,
      weekNumber: getWeek(currentDate, { weekStartsOn: 0, locale: ptBR }),
      year: currentDate.getFullYear(),
      events: allEvents,
      summary: {
        totalEvents: allEvents.length,
        workDays: workOnsite + workRemote + vacation + timeOff + onCall,
        workOnsite,
        workRemote,
        vacation,
        timeOff,
        onCall,
        courses,
        meetings,
        webinars,
        birthdays,
        holidays
      }
    };
  }, [customEvents, workMarks, calendarEvents, weekStart, weekEnd, currentDate]);

  const loading = customLoading || workLoading || calendarLoading;
  const hasError = false; // Os hooks individuais lidam com seus próprios erros

  return {
    data,
    loading,
    error: hasError ? 'Erro ao carregar dados' : null
  };
};
