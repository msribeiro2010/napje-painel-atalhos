import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Assunto {
  id: string;
  nome: string;
  categoria: string | null;
}

export const useAssuntos = () => {
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssuntos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assuntos')
        .select('id, nome, categoria')
        .order('nome');

      if (error) throw error;
      setAssuntos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assuntos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssuntos();
  }, []);

  return { assuntos, loading, error, refetch: fetchAssuntos };
};