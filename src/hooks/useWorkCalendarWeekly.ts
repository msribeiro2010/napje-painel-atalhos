import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface WorkCalendarEvent {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  is_working_day: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useWorkCalendarWeekly = (weekStart: Date, weekEnd: Date) => {
  const { user } = useAuth();
  const [workEvents, setWorkEvents] = useState<WorkCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkCalendarWeek = useCallback(async () => {
    console.log('🏢 fetchWorkCalendarWeek called', {
      hasUser: !!user,
      weekStart: weekStart ? format(weekStart, 'yyyy-MM-dd') : null,
      weekEnd: weekEnd ? format(weekEnd, 'yyyy-MM-dd') : null
    });

    if (!user || !weekStart || !weekEnd) {
      console.log('❌ Missing requirements for work calendar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateStr = format(weekStart, 'yyyy-MM-dd');
      const endDateStr = format(weekEnd, 'yyyy-MM-dd');
      
      console.log('📡 Querying user_work_calendar:', { startDateStr, endDateStr, userId: user.id });
      
      const { data, error } = await supabase
        .from('user_work_calendar')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });
        
      if (error) {
        console.error('❌ Supabase work calendar error:', error);
        throw error;
      }
      
      const events = data || [];
      console.log('✅ Work calendar events found:', events.length, events);
      setWorkEvents(events);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar calendário de trabalho';
      console.error('❌ Error fetching work calendar:', err);
      setError(errorMessage);
    } finally {
      console.log('🏁 Work calendar fetch completed');
      setLoading(false);
    }
  }, [user, weekStart, weekEnd]);

  useEffect(() => {
    if (user && weekStart && weekEnd) {
      fetchWorkCalendarWeek();
    }
  }, [fetchWorkCalendarWeek]);

  return { workEvents, fetchWorkCalendarWeek, loading, error };
};