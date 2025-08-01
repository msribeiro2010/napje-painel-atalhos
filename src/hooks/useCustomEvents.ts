import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomEvent {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  type: string;
  title: string;
  description?: string;
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  url?: string; // URL/link do evento
}

export const useCustomEvents = (month: Date) => {
  const { user } = useAuth();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Buscar eventos de um período mais amplo (6 meses antes e depois)
      const startDate = new Date(month.getFullYear(), month.getMonth() - 6, 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 6, 0);
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().slice(0, 10))
        .lte('date', endDate.toISOString().slice(0, 10))
        .order('date', { ascending: true });
      if (error) throw error;
      setCustomEvents(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos personalizados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, month.getFullYear(), month.getMonth()]);

  const addCustomEvent = useCallback(async (event: Omit<CustomEvent, 'id' | 'user_id'>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_custom_events')
        .insert({ ...event, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      
      // Atualizar lista local ao invés de fazer nova requisição
      setCustomEvents(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar evento';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCustomEvent = useCallback(async (id: string, event: Omit<CustomEvent, 'id' | 'user_id'>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_custom_events')
        .update(event)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local ao invés de fazer nova requisição
      setCustomEvents(prev => prev.map(e => e.id === id ? data : e));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      setError(errorMessage);
      throw err; // Re-throw para que o componente possa capturar o erro
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeCustomEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_custom_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar lista local ao invés de fazer nova requisição
      setCustomEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover evento';
      setError(errorMessage);
      throw err; // Re-throw para que o componente possa capturar o erro
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar eventos apenas quando user ou month mudarem
  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();
  
  useEffect(() => {
    if (user) {
      fetchCustomEvents();
    }
  }, [user, currentYear, currentMonth, fetchCustomEvents]);

  return { customEvents, fetchCustomEvents, addCustomEvent, updateCustomEvent, removeCustomEvent, loading, error };
};