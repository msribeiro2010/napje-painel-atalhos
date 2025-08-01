import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
      console.log('🔄 Buscando eventos personalizados para:', format(month, 'yyyy-MM'));
      console.log('🔄 Usuário autenticado:', user.id);
      
      // Buscar eventos de um período mais amplo (6 meses antes e depois)
      const startDate = new Date(month.getFullYear(), month.getMonth() - 6, 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 6, 0);
      
      console.log('🔄 Range de datas:', {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10)
      });

      // Primeiro, verificar se a tabela existe e tem a estrutura correta
      const { data: testData, error: testError } = await supabase
        .from('user_custom_events')
        .select('id, date, type, title')
        .limit(1);

      if (testError) {
        console.error('❌ Erro na estrutura da tabela user_custom_events:', testError);
        throw new Error(`Problema na estrutura da tabela: ${testError.message}`);
      }

      console.log('✅ Estrutura da tabela user_custom_events verificada');
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().slice(0, 10))
        .lte('date', endDate.toISOString().slice(0, 10))
        .order('date', { ascending: true });
        
      if (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Eventos carregados:', data?.length || 0, 'eventos');
      console.log('✅ Eventos detalhados:', data);
      setCustomEvents(data || []);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos personalizados';
      console.error('❌ Erro ao buscar eventos personalizados:', err);
      setError(errorMessage);
      toast.error('Erro ao carregar eventos personalizados', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user, month.getFullYear(), month.getMonth()]);

  const addCustomEvent = useCallback(async (event: Omit<CustomEvent, 'id' | 'user_id'>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    if (loading) {
      console.log('⏳ Operação já em andamento, ignorando...');
      return;
    }
    
    // Validação adicional de dados
    if (!event.date || !event.title || !event.type) {
      console.error('❌ Dados obrigatórios faltando:', { date: event.date, title: event.title, type: event.type });
      toast.error('Dados obrigatórios faltando (data, título ou tipo)');
      throw new Error('Dados obrigatórios não preenchidos');
    }

    // Verificação do formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(event.date)) {
      console.error('❌ Formato de data inválido:', event.date);
      toast.error('Formato de data inválido. Use YYYY-MM-DD');
      throw new Error('Formato de data inválido');
    }
    
    console.log('🔄 Salvando evento personalizado:', { event, userId: user.id });
    console.log('🔄 Data específica a ser salva:', event.date);
    setLoading(true);
    setError(null);
    
    try {
      const eventToInsert = { 
        ...event, 
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Dados completos para inserção:', eventToInsert);
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .insert([eventToInsert])
        .select()
        .single();
        
      if (error) {
        console.error('❌ Erro ao salvar evento:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint, message: error.message });
        
        // Verificar tipos específicos de erro
        if (error.code === 'PGRST301') {
          throw new Error('Erro de permissões. Verifique as políticas RLS da tabela.');
        } else if (error.code === '23503') {
          throw new Error('Erro de referência. Verifique se o user_id existe na tabela profiles.');
        } else if (error.message.includes('violates not-null constraint')) {
          throw new Error('Campo obrigatório não preenchido. Verifique os dados do evento.');
        }
        
        throw error;
      }
      
      console.log('✅ Evento salvo com sucesso:', data);
      console.log('✅ ID do evento criado:', data.id);
      console.log('✅ Data do evento salvo:', data.date);
      
      // Atualizar lista local
      setCustomEvents(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
      // Labels para o toast
      const typeLabels = {
        webinario: 'Webinário',
        reuniao: 'Reunião',
        curso: 'Curso',
        outro: 'Evento'
      };
      
      const eventTypeLabel = typeLabels[event.type as keyof typeof typeLabels] || 'Evento';
      
      toast.success(`${eventTypeLabel} adicionado!`, {
        description: `"${event.title}" - ${format(new Date(event.date), 'dd/MM/yyyy')}`
      });
      
      // Recarregar eventos para garantir sincronização
      setTimeout(() => {
        console.log('🔄 Recarregando eventos após criação...');
        fetchCustomEvents();
      }, 500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar evento';
      console.error('❌ Erro ao adicionar evento:', err);
      setError(errorMessage);
      toast.error('Erro ao salvar evento', {
        description: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCustomEvents]);

  const updateCustomEvent = useCallback(async (id: string, event: Omit<CustomEvent, 'id' | 'user_id'>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    if (loading) {
      console.log('⏳ Operação já em andamento, ignorando...');
      return;
    }
    
    console.log('🔄 Atualizando evento:', { id, event, userId: user.id });
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o evento existe e pertence ao usuário
      const { data: existingEvent, error: checkError } = await supabase
        .from('user_custom_events')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (checkError || !existingEvent) {
        console.error('❌ Evento não encontrado ou não pertence ao usuário:', checkError);
        throw new Error('Evento não encontrado ou sem permissão');
      }
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .update({
          ...event,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Erro ao atualizar evento:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Evento atualizado com sucesso:', data);
      
      // Atualizar lista local
      setCustomEvents(prev => prev.map(e => e.id === id ? data : e));
      
      toast.success('Evento atualizado!', {
        description: `"${event.title}" foi modificado com sucesso`
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      console.error('❌ Erro ao atualizar evento:', err);
      setError(errorMessage);
      toast.error('Erro ao atualizar evento', {
        description: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeCustomEvent = useCallback(async (id: string) => {
    if (loading) return;
    
    console.log('🔄 Removendo evento:', { id, userId: user?.id });
    
    // Backup do evento para reverter em caso de erro
    const eventToRemove = customEvents.find(e => e.id === id);
    
    // Feedback imediato na UI
    setCustomEvents(prev => prev.filter(e => e.id !== id));
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_custom_events')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('❌ Erro ao remover evento:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Evento removido com sucesso');
      toast.success('Evento removido!', {
        description: eventToRemove ? `"${eventToRemove.title}" foi excluído` : 'Evento excluído com sucesso'
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover evento';
      console.error('❌ Erro ao remover evento:', err);
      setError(errorMessage);
      
      // Reverter mudança na UI em caso de erro
      if (eventToRemove) {
        setCustomEvents(prev => [...prev, eventToRemove].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
      
      toast.error('Erro ao remover evento', {
        description: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loading, customEvents, user]);

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