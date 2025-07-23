import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomEvent {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  type: string;
  title: string;
  description?: string;
}

export const useCustomEvents = (month: Date) => {
  const { user } = useAuth();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const { data, error } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().slice(0, 10))
        .lte('date', monthEnd.toISOString().slice(0, 10))
        .order('date', { ascending: true });
      if (error) throw error;
      setCustomEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar eventos personalizados');
    } finally {
      setLoading(false);
    }
  };

  const addCustomEvent = async (event: Omit<CustomEvent, 'id' | 'user_id'>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_custom_events')
        .insert({ ...event, user_id: user.id });
      if (error) throw error;
      await fetchCustomEvents();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar evento');
    } finally {
      setLoading(false);
    }
  };

  const removeCustomEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_custom_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchCustomEvents();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover evento');
    } finally {
      setLoading(false);
    }
  };

  return { customEvents, fetchCustomEvents, addCustomEvent, removeCustomEvent, loading, error };
}; 