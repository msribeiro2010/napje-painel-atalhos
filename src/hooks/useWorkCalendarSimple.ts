import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface WorkCalendarEvent {
  id: string;
  user_id: string;
  date: string;
  is_working_day: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useWorkCalendarSimple = (weekStart: Date, weekEnd: Date) => {
  const { user } = useAuth();
  const [workEvents, setWorkEvents] = useState<WorkCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular dados para teste com timeout mais rápido
    setLoading(true);
    const timeout = setTimeout(() => {
      // Dados mock para testar
      const mockEvents: WorkCalendarEvent[] = [
        {
          id: '1',
          user_id: user?.id || '',
          date: format(new Date(), 'yyyy-MM-dd'),
          is_working_day: true,
          notes: 'Presencial',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setWorkEvents(mockEvents);
      setLoading(false);
    }, 200); // Reduzido de 500ms para 200ms

    // Cleanup do timeout se o componente for desmontado
    return () => clearTimeout(timeout);
  }, [user, weekStart, weekEnd]);

  return { workEvents, loading, error };
};