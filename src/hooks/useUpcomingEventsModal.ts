import { useState, useEffect, useMemo, useCallback } from 'react';
import { addDays, format, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { useCustomEvents } from './useCustomEvents';
import { useFeriados } from './useFeriados';
import { useWorkCalendar } from './useWorkCalendar';

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'custom' | 'holiday' | 'work';
  description?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  icon?: string;
  color?: string;
  url?: string;
}

export const useUpcomingEventsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);
  
  // Buscar eventos dos próximos 2 dias
  const today = useMemo(() => new Date(), []);
  
  // Buscar eventos do mês atual para cobrir todos os próximos dias
  const { customEvents } = useCustomEvents(today);
  const { data: feriados = [] } = useFeriados();
  // Usar apenas um hook useWorkCalendar para o mês atual
  const { marks: workMarks } = useWorkCalendar(today);

  // Combinar todos os eventos usando useMemo para otimização
  const upcomingEvents: UpcomingEvent[] = useMemo(() => {
    const events: UpcomingEvent[] = [];

    // Adicionar eventos personalizados dos próximos 2 dias
    customEvents.forEach(event => {
      const eventDate = startOfDay(new Date(event.date));
      const todayStart = startOfDay(today);
      const daysDiff = differenceInDays(eventDate, todayStart);
      
      if (daysDiff >= 0 && daysDiff <= 2) {
        events.push({
          id: `custom-${event.id}`,
          title: event.title,
          date: event.date,
          type: 'custom',
          description: event.description || undefined,
          start_time: event.start_time || undefined,
          end_time: event.end_time || undefined,
          category: event.type,
          icon: getCustomEventIcon(event.type),
          color: getCustomEventColor(event.type),
          url: event.url || undefined
        });
      }
    });

    // Adicionar feriados
    feriados.forEach(feriado => {
      const feriadoDate = startOfDay(new Date(feriado.data));
      const todayStart = startOfDay(today);
      const daysDiff = differenceInDays(feriadoDate, todayStart);
      
      if (daysDiff >= 0 && daysDiff <= 2) {
        events.push({
          id: `holiday-${feriado.id}`,
          title: feriado.descricao,
          date: format(feriadoDate, 'yyyy-MM-dd'),
          type: 'holiday',
          description: feriado.descricao || undefined,
          icon: '🎉',
          color: '#fef3c7'
        });
      }
    });

    // Adicionar eventos de trabalho especiais
    Object.entries(workMarks).forEach(([date, status]) => {
      const eventDate = startOfDay(new Date(date));
      const todayStart = startOfDay(today);
      const daysDiff = differenceInDays(eventDate, todayStart);
      
      if (daysDiff >= 0 && daysDiff <= 2 && status !== 'presencial') {
        events.push({
          id: `work-${date}`,
          title: getWorkStatusTitle(status),
          date,
          type: 'work',
          description: getWorkStatusDescription(status),
          icon: getWorkStatusIcon(status),
          color: getWorkStatusColor(status)
        });
      }
    });

    // Ordenar eventos por data
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [customEvents, feriados, workMarks, today]);

  // Auto-abrir modal se houver eventos e ainda não foi mostrado hoje
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastShown = localStorage.getItem('upcomingEventsLastShown');
    
    if (upcomingEvents.length > 0 && lastShown !== today && !hasShownToday) {
      setIsOpen(true);
      setHasShownToday(true);
      localStorage.setItem('upcomingEventsLastShown', today);
    }
  }, [upcomingEvents.length, hasShownToday]);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    upcomingEvents,
    openModal,
    closeModal,
    hasEvents: upcomingEvents.length > 0
  };
};

// Funções auxiliares
function getCustomEventIcon(type: string): string {
  const icons = {
    curso: '📚',
    webinario: '🎥',
    reuniao: '👥',
    outro: '✨'
  };
  return icons[type as keyof typeof icons] || '📅';
}

function getCustomEventColor(type: string): string {
  const colors = {
    curso: '#e3f2fd',
    webinario: '#ede7f6',
    reuniao: '#e8f5e9',
    outro: '#fff8e1'
  };
  return colors[type as keyof typeof colors] || '#f5f5f5';
}

function getWorkStatusTitle(status: string): string {
  const titles = {
    ferias: 'Férias',
    remoto: 'Trabalho Remoto',
    plantao: 'Plantão',
    folga: 'Folga'
  };
  return titles[status as keyof typeof titles] || 'Evento de Trabalho';
}

function getWorkStatusDescription(status: string): string {
  const descriptions = {
    ferias: 'Você estará de férias neste dia',
    remoto: 'Trabalho remoto programado',
    plantao: 'Plantão agendado',
    folga: 'Dia de folga'
  };
  return descriptions[status as keyof typeof descriptions] || '';
}

function getWorkStatusIcon(status: string): string {
  const icons = {
    ferias: '🏖️',
    remoto: '💻',
    plantao: '🛡️',
    folga: '😴'
  };
  return icons[status as keyof typeof icons] || '📅';
}

function getWorkStatusColor(status: string): string {
  const colors = {
    ferias: '#ffe6e6',
    remoto: '#e6f7ff',
    plantao: '#e6ffe6',
    folga: '#e0e0e0'
  };
  return colors[status as keyof typeof colors] || '#f5f5f5';
}