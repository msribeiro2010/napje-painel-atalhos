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
}

// Cache simples para reduzir consultas
const eventsCache = new Map<string, { data: CustomEvent[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useCustomEvents = (month: Date) => {
  const { user } = useAuth();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEvents = useCallback(async () => {
    if (!user || !month) return;
    
    // Verificar cache primeiro
    const cacheKey = `${user.id}-${month?.getFullYear()}-${month?.getMonth()}`;
    const cached = eventsCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setCustomEvents(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar apenas eventos do mês atual para reduzir consumo
      const startDate = new Date(month?.getFullYear() || new Date().getFullYear(), month?.getMonth() || new Date().getMonth(), 1);
      const endDate = new Date(month?.getFullYear() || new Date().getFullYear(), (month?.getMonth() || new Date().getMonth()) + 1, 0);
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().slice(0, 10))
        .lte('date', endDate.toISOString().slice(0, 10))
        .order('date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      const events = data || [];
      setCustomEvents(events);
      
      // Salvar no cache
      eventsCache.set(cacheKey, { data: events, timestamp: now });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos personalizados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, month?.getFullYear(), month?.getMonth()]);

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

    // Validação do tipo de evento
    const validTypes = ['curso', 'webinario', 'reuniao', 'outro'];
    if (!validTypes.includes(event.type)) {
      console.error('❌ Tipo de evento inválido:', event.type);
      toast.error('Tipo de evento inválido');
      throw new Error('Tipo de evento inválido');
    }

    // Validação do tamanho dos campos
    if (event.title.length > 128) {
      toast.error('Título muito longo (máximo 128 caracteres)');
      throw new Error('Título muito longo');
    }

    if (event.description && event.description.length > 1000) {
      toast.error('Descrição muito longa (máximo 1000 caracteres)');
      throw new Error('Descrição muito longa');
    }
    
    console.log('🔄 Salvando evento personalizado:', { event, userId: user.id });
    console.log('🔄 Data específica a ser salva:', event.date);
    setLoading(true);
    setError(null);
    
    try {
      // Preparar dados para inserção, removendo campos undefined
      const eventToInsert: any = {
        user_id: user.id,
        date: event.date,
        type: event.type,
        title: event.title
      };

      // Adicionar campos opcionais apenas se existirem
      if (event.description) {
        eventToInsert.description = event.description;
      }
      if (event.start_time) {
        eventToInsert.start_time = event.start_time;
      }
      if (event.end_time) {
        eventToInsert.end_time = event.end_time;
      }
      
      // Debug: log apenas se VITE_DEBUG estiver habilitado
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('🔄 Dados para inserção:', eventToInsert);
      }
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .insert(eventToInsert)
        .select()
        .single();
        
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('📥 Resposta do Supabase:', { data, error });
      }
        
      if (error) {
        console.error('❌ Erro ao salvar evento:', error);
        
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
      
      // Debug: verificar se o evento foi salvo corretamente
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('✅ Evento salvo com sucesso:', data);
      }
      
      // Atualizar lista local
      setCustomEvents(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
      // Limpar cache para forçar atualização na próxima consulta
      if (month) {
        const cacheKey = `${user.id}-${month?.getFullYear()}-${month?.getMonth()}`;
        eventsCache.delete(cacheKey);
      }
      
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
      // Remover verificação extra para economizar consultas
      
      const { data, error } = await supabase
        .from('user_custom_events')
        .update(event)
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
      
      // Limpar cache para forçar atualização na próxima consulta
      if (month) {
        const cacheKey = `${user.id}-${month?.getFullYear()}-${month?.getMonth()}`;
        eventsCache.delete(cacheKey);
      }
      
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
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    if (loading) return;
    
    console.log('🔄 Removendo evento:', { id, userId: user.id });
    
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
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('❌ Erro ao remover evento:', error);
        console.error('❌ Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }
      
      console.log('✅ Evento removido com sucesso');
      
      // Limpar cache para forçar atualização na próxima consulta
      if (month) {
        const cacheKey = `${user.id}-${month?.getFullYear()}-${month?.getMonth()}`;
        eventsCache.delete(cacheKey);
      }
      
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
  const currentYear = month?.getFullYear();
  const currentMonth = month?.getMonth();
  
  useEffect(() => {
    if (user) {
      fetchCustomEvents();
    }
  }, [user, currentYear, currentMonth, fetchCustomEvents]);

  return { customEvents, fetchCustomEvents, addCustomEvent, updateCustomEvent, removeCustomEvent, loading, error };
};