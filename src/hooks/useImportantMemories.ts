import { useState, useEffect } from 'react';
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

export const useImportantMemories = () => {
  const [memories, setMemories] = useState<ImportantMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMemories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('important_memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar memórias:', error);
        toast.error('Erro ao carregar memórias importantes');
        return;
      }

      setMemories(data || []);
    } catch (error) {
      console.error('Erro ao buscar memórias:', error);
      toast.error('Erro ao carregar memórias importantes');
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memoryData: ImportantMemoryFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('important_memories')
        .insert({
          ...memoryData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar memória:', error);
        toast.error('Erro ao salvar memória importante');
        return false;
      }

      setMemories(prev => [data, ...prev]);
      toast.success('Memória importante salva com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar memória:', error);
      toast.error('Erro ao salvar memória importante');
      return false;
    }
  };

  const updateMemory = async (id: string, memoryData: Partial<ImportantMemoryFormData>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('important_memories')
        .update(memoryData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar memória:', error);
        toast.error('Erro ao atualizar memória importante');
        return false;
      }

      setMemories(prev => prev.map(memory => 
        memory.id === id ? data : memory
      ));
      toast.success('Memória importante atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar memória:', error);
      toast.error('Erro ao atualizar memória importante');
      return false;
    }
  };

  const deleteMemory = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('important_memories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar memória:', error);
        toast.error('Erro ao deletar memória importante');
        return false;
      }

      setMemories(prev => prev.filter(memory => memory.id !== id));
      toast.success('Memória importante deletada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar memória:', error);
      toast.error('Erro ao deletar memória importante');
      return false;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    return updateMemory(id, { is_favorite: isFavorite });
  };

  const getMemoriesByCategory = (category: string) => {
    return memories.filter(memory => memory.category === category);
  };

  const getFavoriteMemories = () => {
    return memories.filter(memory => memory.is_favorite);
  };

  const searchMemories = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(term) ||
      memory.description?.toLowerCase().includes(term) ||
      memory.category.toLowerCase().includes(term) ||
      memory.notes?.toLowerCase().includes(term)
    );
  };

  useEffect(() => {
    fetchMemories();
  }, [user]);

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