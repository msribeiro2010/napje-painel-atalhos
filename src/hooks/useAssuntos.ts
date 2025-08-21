import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resumosPadroes } from '@/constants/form-options';

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
      
      // Se não há dados no banco, usar resumos padrões como fallback
      if (!data || data.length === 0) {
        console.log('ℹ️ Tabela assuntos vazia, usando resumos padrões como fallback');
        const assuntosFallback = resumosPadroes.map((resumo, index) => ({
          id: `fallback-${index}`,
          nome: resumo,
          categoria: null
        }));
        setAssuntos(assuntosFallback);
      } else {
        setAssuntos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar assuntos do banco, usando fallback:', err);
      // Em caso de erro, usar resumos padrões como fallback
      const assuntosFallback = resumosPadroes.map((resumo, index) => ({
        id: `fallback-${index}`,
        nome: resumo,
        categoria: null
      }));
      setAssuntos(assuntosFallback);
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