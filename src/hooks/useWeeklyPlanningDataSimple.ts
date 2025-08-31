import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, getWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeeklyPlanningDataSimple {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
  events: any[];
  notifications: any[];
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

export const useWeeklyPlanningDataSimple = (targetDate?: Date) => {
  const currentDate = targetDate || new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  console.log('📅 Simple hook - dates:', {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd')
  });

  // Mock data simples para teste
  const weeklyData: WeeklyPlanningDataSimple = useMemo(() => ({
    weekStart,
    weekEnd,
    weekNumber: getWeek(currentDate, { weekStartsOn: 0, locale: ptBR }),
    year: currentDate.getFullYear(),
    events: [], // Mock vazio por enquanto
    notifications: [], // Mock vazio por enquanto
    summary: {
      totalEvents: 0,
      workDays: 0,
      courses: 0,
      meetings: 0,
      webinars: 0,
      birthdays: 0,
      holidays: 0
    }
  }), [weekStart, weekEnd, currentDate]);

  console.log('✅ Simple hook - returning data');
  
  return {
    weeklyData,
    isLoading: false // Sempre false para teste
  };
};