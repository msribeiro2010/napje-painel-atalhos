import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type WorkStatus = 'presencial' | 'remoto' | 'ferias' | 'folga' | 'plantao';

export interface WorkCalendarMark {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  status: WorkStatus;
}

export const useWorkCalendar = (month: Date) => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<{ [date: string]: WorkStatus }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarks = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    setError(null);
    try {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const { data, error } = await supabase
        .from('user_work_calendar')
        .select('id, date, status')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().slice(0, 10))
        .lte('date', monthEnd.toISOString().slice(0, 10));
      if (error) throw error;
      const marksObj: { [date: string]: WorkStatus } = {};
      (data || []).forEach((item: any) => {
        marksObj[item.date] = item.status;
      });
      setMarks(marksObj);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar marcações');
    } finally {
      setLoading(false);
    }
  }, [user, month, loading]);

  const saveMark = useCallback(async (date: string, status: WorkStatus) => {
    if (!user || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Upsert (insert ou update)
      const { error } = await supabase
        .from('user_work_calendar')
        .upsert({ user_id: user.id, date, status }, { onConflict: ['user_id', 'date'] });
      if (error) throw error;
      setMarks((prev) => ({ ...prev, [date]: status }));
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar marcação');
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  const removeMark = useCallback(async (date: string) => {
    if (!user || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_work_calendar')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);
      if (error) throw error;
      setMarks((prev) => {
        const newMarks = { ...prev };
        delete newMarks[date];
        return newMarks;
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao remover marcação');
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  // Buscar marcações apenas quando user ou month mudarem
  useEffect(() => {
    if (user) {
      fetchMarks();
    }
  }, [user, month.getFullYear(), month.getMonth()]);

  return { marks, loading, error, fetchMarks, saveMark, removeMark };
}; 