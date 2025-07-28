import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type ImportantMemory = Tables<'important_memories'>;

export interface ImportantMemoryFormData {
  title: string;
  description?: string;
  category: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  is_favorite?: boolean;
}

// Função utilitária para retry
const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Backoff exponencial: esperar 1s, 2s, 4s entre tentativas
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms:`, error);
    }
  }
  throw new Error('Máximo de tentativas excedido');
};

export const useImportantMemories = () => {
  const [memories, setMemories] = useState<ImportantMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMemories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const result = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('important_memories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      });

      setMemories(result);
    } catch (error: any) {
      console.error('Erro ao buscar memórias:', error);
      toast.error('Erro ao carregar memórias importantes. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createMemory = useCallback(async (memoryData: ImportantMemoryFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const result = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('important_memories')
          .insert({
            ...memoryData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      setMemories(prev => [result, ...prev]);
      toast.success('Memória importante salva com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao criar memória:', error);
      toast.error('Erro ao salvar memória importante. Tente novamente.');
      return false;
    }
  }, [user]);

  const updateMemory = useCallback(async (id: string, memoryData: Partial<ImportantMemoryFormData>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const result = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('important_memories')
          .update(memoryData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      setMemories(prev => prev.map(memory => 
        memory.id === id ? result : memory
      ));
      toast.success('Memória importante atualizada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar memória:', error);
      toast.error('Erro ao atualizar memória importante. Tente novamente.');
      return false;
    }
  }, [user]);

  const deleteMemory = useCallback(async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('important_memories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      });

      setMemories(prev => prev.filter(memory => memory.id !== id));
      toast.success('Memória importante deletada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar memória:', error);
      toast.error('Erro ao deletar memória importante. Tente novamente.');
      return false;
    }
  }, [user]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    return updateMemory(id, { is_favorite: isFavorite });
  }, [updateMemory]);

  const getMemoriesByCategory = useCallback((category: string) => {
    return memories.filter(memory => memory.category === category);
  }, [memories]);

  const getFavoriteMemories = useCallback(() => {
    return memories.filter(memory => memory.is_favorite);
  }, [memories]);

  const searchMemories = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(term) ||
      memory.description?.toLowerCase().includes(term) ||
      memory.category.toLowerCase().includes(term) ||
      memory.notes?.toLowerCase().includes(term)
    );
  }, [memories]);

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user, fetchMemories]);

  return {
    memories,
    loading,
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
    getMemoriesByCategory,
    getFavoriteMemories,
    searchMemories,
  };
};