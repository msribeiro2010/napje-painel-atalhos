import { useMemo, useState, useEffect } from 'react';
import { useCalendarEvents } from './useCalendarEvents';
import { useWorkCalendar } from './useWorkCalendar';
import { useCustomEvents } from './useCustomEvents';
import { useWeeklyNotifications } from './useWeeklyNotifications';
import { startOfWeek, endOfWeek, format, isWithinInterval, parseISO, isSunday, isMonday, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeeklyEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'calendar' | 'work' | 'custom';
  location?: string;
}

export interface WeeklyPlanningData {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  events: WeeklyEvent[];
  notifications: any[];
  isSunday: boolean;
  isMondayMorning: boolean;
  isSundayMorning: boolean;
  isMorning: boolean;
  shouldShowModal: boolean;
}

export const useWeeklyPlanning = () => {
  const now = new Date();
  const { data: calendarEvents } = useCalendarEvents(now);
  const { workMarks } = useWorkCalendar();
  const { events: customEvents } = useCustomEvents();
  const { notifications } = useWeeklyNotifications();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);
  
  // Função para verificar se o modal já foi exibido hoje
  const checkIfShownToday = () => {
    const today = format(now, 'yyyy-MM-dd');
    const lastShown = localStorage.getItem('weeklyPlanningModalLastShown');
    return lastShown === today;
  };
  
  // Função para marcar que o modal foi exibido hoje
  const markAsShownToday = () => {
    const today = format(now, 'yyyy-MM-dd');
    localStorage.setItem('weeklyPlanningModalLastShown', today);
    setHasShownToday(true);
  };
  
  // Verificar no carregamento inicial
  useEffect(() => {
    setHasShownToday(checkIfShownToday());
  }, []);
  
  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    markAsShownToday();
  };



  const getWeekStart = (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  };

  const getWeekEnd = (date: Date) => {
    return endOfWeek(date, { weekStartsOn: 0 }); // Saturday
  };

  const generateWeeklyEvents = (weekStart: Date, weekEnd: Date): WeeklyEvent[] => {


    const events: WeeklyEvent[] = [];

    // Add work marks
    if (workMarks) {
      workMarks.forEach((mark) => {
        try {
          const markDate = parseISO(mark.date);
          if (isWithinInterval(markDate, { start: weekStart, end: weekEnd })) {
            events.push({
              id: `work-${mark.id}`,
              title: mark.is_remote ? 'Trabalho Remoto' : 'Trabalho Presencial',
              description: mark.is_remote ? 'Dia de trabalho remoto' : 'Dia de trabalho presencial',
              date: mark.date,
              type: 'work',
              location: mark.is_remote ? 'Remoto' : 'Presencial'
            });
          }
        } catch (error) {
          console.error('Error processing work mark:', error, mark);
        }
      });
    }

    // Add calendar events
    if (calendarEvents) {
      calendarEvents.forEach((event) => {
        try {
          const eventDate = parseISO(event.date);
          if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
            events.push({
              id: `calendar-${event.id}`,
              title: event.title,
              description: event.description,
              date: event.date,
              type: 'calendar',
              location: event.location
            });
          }
        } catch (error) {
          console.error('Error processing calendar event:', error, event);
        }
      });
    }

    // Add custom events
    if (customEvents) {
      customEvents.forEach((event) => {
        try {
          const eventDate = parseISO(event.date);
          if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
            events.push({
              id: `custom-${event.id}`,
              title: event.title,
              description: event.description,
              date: event.date,
              type: 'custom',
              location: event.location
            });
          }
        } catch (error) {
          console.error('Error processing custom event:', error, event);
        }
      });
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return events;
  };

  const weeklyData = useMemo((): WeeklyPlanningData => {
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);
    const weekNumber = parseInt(format(weekStart, 'w'));
    const events = generateWeeklyEvents(weekStart, weekEnd);
    
    const currentIsSunday = isSunday(now);
    const currentHour = getHours(now);
    const isMorning = currentHour >= 6 && currentHour < 12;
    const currentIsMondayMorning = isMonday(now) && isMorning;
    const currentIsSundayMorning = currentIsSunday && isMorning;
    const shouldShowModal = (currentIsSundayMorning || currentIsMondayMorning) && events.length > 0 && !hasShownToday;
    


    return {
      weekStart,
      weekEnd,
      weekNumber,
      events,
      notifications: notifications || [],
      isSunday: currentIsSunday,
      isMondayMorning: currentIsMondayMorning,
      isSundayMorning: currentIsSundayMorning,
      isMorning,
      shouldShowModal
    };
  }, [calendarEvents, workMarks, customEvents, hasShownToday]);
  
  // Efeito para abrir o modal automaticamente
  useEffect(() => {
    if (weeklyData.shouldShowModal && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [weeklyData.shouldShowModal, isModalOpen]);

  return {
    weeklyData,
    isModalOpen,
    closeModal
  };
};