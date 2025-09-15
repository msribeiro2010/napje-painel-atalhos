import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface CustomEvent {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  type: string;
  title: string;
  description?: string;
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
}

export const useCustomEventsWeekly = (weekStart: Date, weekEnd: Date) => {
  const { user } = useAuth();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEventsWeek = useCallback(async () => {
    console.log('🚀 fetchCustomEventsWeek called', {
      hasUser: !!user,
      weekStart: weekStart ? format(weekStart, 'yyyy-MM-dd') : null,
      weekEnd: weekEnd ? format(weekEnd, 'yyyy-MM-dd') : null
    });

    if (!user || !weekStart || !weekEnd) {
      console.log('❌ Missing requirements, returning early');
      setLoading(false);
      return;
    }

    console.log('📡 Starting fetch...');
    setLoading(true);
    setError(null);

    try {
      const startDateStr = format(weekStart, 'yyyy-MM-dd');
      const endDateStr = format(weekEnd, 'yyyy-MM-dd');
      
      console.log('📡 Querying Supabase:', { startDateStr, endDateStr, userId: user.id });
      
      // Adicionar timeout para evitar carregamento infinito
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Conexão com banco de dados demorou muito')), 10000)
      );
      
      const queryPromise = supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      const events = data || [];
      console.log('✅ Events fetched:', events.length, events);
      setCustomEvents(events);
      
    } catch (err: unknown) {
      let errorMessage = 'Erro ao buscar eventos personalizados';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
          errorMessage = 'Problema de conectividade. Verifique sua conexão com a internet.';
        } else if (err.message.includes('Timeout')) {
          errorMessage = 'Conexão com banco de dados demorou muito. Tente novamente.';
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('❌ Fetch error:', err);
      setError(errorMessage);
      // Definir eventos vazios em caso de erro para evitar carregamento infinito
      setCustomEvents([]);
    } finally {
      console.log('🏁 Fetch completed, setting loading to false');
      setLoading(false);
    }
  }, [user, weekStart, weekEnd]);

  useEffect(() => {
    if (user && weekStart && weekEnd) {
      fetchCustomEventsWeek();
    }
  }, [fetchCustomEventsWeek]);

  return { customEvents, fetchCustomEventsWeek, loading, error };
};