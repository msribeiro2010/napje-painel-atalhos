import { useState, useCallback } from 'react';
import { useCustomEventsWeekly } from '@/hooks/useCustomEventsWeekly';
import { useWorkCalendarSimple as useWorkCalendarWeekly } from '@/hooks/useWorkCalendarSimple';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
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
  
  const [data, setData] = useState<LazyWeeklyPlanningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Timeout de segurança
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao carregar dados')), 5000)
      );

      // Carregar apenas dados essenciais
      const dataPromise = Promise.all([
        // Eventos customizados
        fetch(`/api/custom-events?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`),
        // Calendário de trabalho
        fetch(`/api/work-calendar?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`),
        // Feriados e aniversários apenas para a semana atual
        fetch(`/api/upcoming-events?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`)
      ]);

      const results = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      // Mock data para desenvolvimento - remover em produção
      const mockWorkEvents = [
        {
          id: 'work-1',
          title: 'Trabalho Presencial',
          date: addDays(weekStart, 1),
          type: 'work',
          category: 'work_onsite',
          allDay: true
        },
        {
          id: 'work-2', 
          title: 'Trabalho Remoto',
          date: addDays(weekStart, 3),
          type: 'work',
          category: 'work_remote',
          allDay: true
        }
      ];

      const mockCustomEvents = [
        {
          id: 'custom-1',
          title: 'Curso de React',
          date: addDays(weekStart, 2),
          type: 'custom',
          category: 'curso',
          time: '14:00'
        }
      ];

      const mockHolidays = [];
      const mockBirthdays = [];

      const allEvents = [...mockWorkEvents, ...mockCustomEvents, ...mockHolidays, ...mockBirthdays]
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calcular resumo apenas com dados reais
      const workOnsite = mockWorkEvents.filter(e => e.category === 'work_onsite').length;
      const workRemote = mockWorkEvents.filter(e => e.category === 'work_remote').length;
      const courses = mockCustomEvents.filter(e => e.category === 'curso').length;
      const meetings = mockCustomEvents.filter(e => e.category === 'reuniao').length;
      const webinars = mockCustomEvents.filter(e => e.category === 'webinario').length;

      const weeklyData: LazyWeeklyPlanningData = {
        weekStart,
        weekEnd,
        weekNumber: getWeek(currentDate, { weekStartsOn: 0, locale: ptBR }),
        year: currentDate.getFullYear(),
        events: allEvents,
        summary: {
          totalEvents: allEvents.length,
          workDays: workOnsite + workRemote,
          workOnsite,
          workRemote,
          courses,
          meetings,
          webinars,
          birthdays: mockBirthdays.length,
          holidays: mockHolidays.length
        }
      };

      setData(weeklyData);
    } catch (err) {
      console.error('Erro ao carregar dados semanais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback com dados mínimos
      setData({
        weekStart,
        weekEnd,
        weekNumber: getWeek(currentDate, { weekStartsOn: 0, locale: ptBR }),
        year: currentDate.getFullYear(),
        events: [],
        summary: {
          totalEvents: 0,
          workDays: 0,
          workOnsite: 0,
          workRemote: 0,
          courses: 0,
          meetings: 0,
          webinars: 0,
          birthdays: 0,
          holidays: 0
        }
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate, weekStart, weekEnd]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    loadWeeklyData,
    reset
  };
};
