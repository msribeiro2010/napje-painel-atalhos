import { useMemo } from 'react';
import { useWorkCalendar, WorkStatus } from './useWorkCalendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, isFuture, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WorkStats {
  presencial: {
    thisWeek: number;
    thisMonth: number;
    nextEvent: string | null;
  };
  remoto: {
    thisWeek: number;
    thisMonth: number;
    nextEvent: string | null;
  };
}

export const useWorkStats = (): WorkStats => {
  const currentDate = new Date();
  const { marks } = useWorkCalendar(currentDate);

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const weekEnd = endOfWeek(today, { locale: ptBR });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    let presencialThisWeek = 0;
    let presencialThisMonth = 0;
    let remotoThisWeek = 0;
    let remotoThisMonth = 0;
    let nextPresencialEvent: string | null = null;
    let nextRemotoEvent: string | null = null;

    // Processar marcações existentes
    Object.entries(marks).forEach(([dateStr, status]) => {
      const date = new Date(dateStr);
      
      // Contar dias desta semana
      if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
        if (status === 'presencial') presencialThisWeek++;
        if (status === 'remoto') remotoThisWeek++;
      }
      
      // Contar dias deste mês
      if (isWithinInterval(date, { start: monthStart, end: monthEnd })) {
        if (status === 'presencial') presencialThisMonth++;
        if (status === 'remoto') remotoThisMonth++;
      }
    });

    // Encontrar próximos eventos de forma ordenada
    const futureEvents = Object.entries(marks)
      .map(([dateStr, status]) => ({ date: new Date(dateStr), dateStr, status }))
      .filter(({ date }) => isFuture(date) || isToday(date))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Encontrar próximo evento presencial
    const nextPresencial = futureEvents.find(({ status }) => status === 'presencial');
    if (nextPresencial) {
      nextPresencialEvent = format(nextPresencial.date, "dd 'de' MMMM", { locale: ptBR });
    }

    // Encontrar próximo evento remoto
    const nextRemoto = futureEvents.find(({ status }) => status === 'remoto');
    if (nextRemoto) {
      nextRemotoEvent = format(nextRemoto.date, "dd 'de' MMMM", { locale: ptBR });
    }

    return {
      presencial: {
        thisWeek: presencialThisWeek,
        thisMonth: presencialThisMonth,
        nextEvent: nextPresencialEvent,
      },
      remoto: {
        thisWeek: remotoThisWeek,
        thisMonth: remotoThisMonth,
        nextEvent: nextRemotoEvent,
      },
    };
  }, [marks]);

  return stats;
};