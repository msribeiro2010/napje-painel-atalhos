import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      console.log('🔄 Buscando marcações do calendário para:', format(month, 'yyyy-MM'));
      console.log('🔄 Usuário autenticado:', user.id);
      
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      console.log('🔄 Range de datas:', {
        start: monthStart.toISOString().slice(0, 10),
        end: monthEnd.toISOString().slice(0, 10)
      });

      // Primeiro, verificar se a tabela existe e tem a estrutura correta
      const { data: testData, error: testError } = await supabase
        .from('user_work_calendar')
        .select('id, date, status')
        .limit(1);

      if (testError) {
        console.error('❌ Erro na estrutura da tabela:', testError);
        throw new Error(`Problema na estrutura da tabela: ${testError.message}`);
      }

      console.log('✅ Estrutura da tabela verificada');
      
      const { data, error } = await supabase
        .from('user_work_calendar')
        .select('id, date, status')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().slice(0, 10))
        .lte('date', monthEnd.toISOString().slice(0, 10));
        
      if (error) {
        console.error('❌ Erro ao buscar marcações:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      const marksObj: { [date: string]: WorkStatus } = {};
      (data || []).forEach((item: WorkCalendarMark) => {
        marksObj[item.date] = item.status;
      });
      
      console.log('✅ Marcações carregadas:', Object.keys(marksObj).length, 'dias');
      console.log('✅ Marcações detalhadas:', marksObj);
      setMarks(marksObj);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar marcações';
      console.error('❌ Erro ao buscar marcações:', err);
      setError(errorMessage);
      toast.error('Erro ao carregar marcações do calendário', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user, month.getFullYear(), month.getMonth()]);

  const saveMark = useCallback(async (date: string, status: WorkStatus) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (loading) {
      console.log('⏳ Operação já em andamento, ignorando...');
      return;
    }
    
    console.log('🔄 Salvando modalidade:', { date, status, userId: user.id });
    
    // Feedback imediato na UI
    setMarks((prev) => ({ ...prev, [date]: status }));
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_work_calendar')
        .upsert({ 
          user_id: user.id, 
          date, 
          status,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id, date'
        })
        .select('id, date, status');
        
      if (error) {
        console.error('❌ Erro ao salvar modalidade:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Modalidade salva com sucesso:', data);
      
      // Labels para o toast
      const statusLabels = {
        presencial: 'Presencial',
        ferias: 'Férias', 
        remoto: 'Remoto',
        folga: 'Folga',
        plantao: 'Plantão'
      };
      
      toast.success(`${statusLabels[status]} marcado!`, {
        description: `Data: ${format(new Date(date), 'dd/MM/yyyy')}`
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar marcação';
      console.error('❌ Erro ao salvar modalidade:', err);
      setError(errorMessage);
      
      // Reverter mudança na UI em caso de erro
      setMarks((prev) => {
        const newMarks = { ...prev };
        delete newMarks[date];
        return newMarks;
      });
      
      toast.error('Erro ao salvar modalidade', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeMark = useCallback(async (date: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (loading) {
      console.log('⏳ Operação já em andamento, ignorando...');
      return;
    }
    
    console.log('🔄 Removendo modalidade:', { date, userId: user.id });
    
    // Feedback imediato na UI
    const previousMark = marks[date];
    setMarks((prev) => {
      const newMarks = { ...prev };
      delete newMarks[date];
      return newMarks;
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_work_calendar')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);
        
      if (error) {
        console.error('❌ Erro ao remover modalidade:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Modalidade removida com sucesso');
      toast.success('Modalidade removida!', {
        description: `Data: ${format(new Date(date), 'dd/MM/yyyy')}`
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover marcação';
      console.error('❌ Erro ao remover modalidade:', err);
      setError(errorMessage);
      
      // Reverter mudança na UI em caso de erro
      if (previousMark) {
        setMarks((prev) => ({ ...prev, [date]: previousMark }));
      }
      
      toast.error('Erro ao remover modalidade', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user, marks]);

  // Buscar marcações apenas quando user ou month mudarem
  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();
  
  useEffect(() => {
    if (user) {
      fetchMarks();
    }
  }, [user, currentYear, currentMonth, fetchMarks]);

  return { marks, loading, error, fetchMarks, saveMark, removeMark };
}; 