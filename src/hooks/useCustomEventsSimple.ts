import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomEvent {
  id: string;
  user_id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  url?: string;
}

export const useCustomEventsSimple = (weekStart: Date, weekEnd: Date) => {
  const { user } = useAuth();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular dados para teste
    setLoading(true);
    setTimeout(() => {
      // Dados mock vazios para testar
      setCustomEvents([]);
      setLoading(false);
    }, 300);
  }, [user, weekStart, weekEnd]);

  return { customEvents, loading, error };
};