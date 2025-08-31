import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeBaseItem, KnowledgeBaseFormData } from '@/types/knowledge-base';

export const useKnowledgeBase = () => {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('base_conhecimento')
        .select('categoria')
        .not('categoria', 'is', null)
        .order('categoria');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      // Categorias padrão para sempre estar disponível
      const defaultCategories = [
        'PJe-1o.Grau',
        'PJe-2o.Grau',
        'Outros'
      ];
      
      // Extrair categorias únicas do banco
      const dbCategories = [...new Set(data.map(item => item.categoria))].filter(Boolean);
      
      // Combinar categorias padrão com as do banco, removendo duplicatas
      const allCategories = [...new Set([...defaultCategories, ...dbCategories])];
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      // Em caso de erro, usar apenas as categorias padrão
      setCategories([
        'PJe-1o.Grau',
        'PJe-2o.Grau',
        'Outros'
      ]);
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('base_conhecimento')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      // Processar dados sem media_files
      const processedData = (data || []).map(item => ({
        ...item
      }));
      
      setItems(processedData);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      
      // Tratamento específico para erros de conectividade e timeout
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          toast.error('Problema de conectividade. Verifique sua conexão.');
        } else if (error.message.includes('Timeout')) {
          toast.error('Operação demorou muito. Tente novamente.');
        } else {
          toast.error('Erro ao carregar base de conhecimento');
        }
      } else {
        toast.error('Erro ao carregar base de conhecimento');
      }
      
      // Definir como vazio em caso de erro
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveItem = async (formData: KnowledgeBaseFormData, editingItem: KnowledgeBaseItem | null) => {
    try {
      if (!formData.titulo || !formData.problema_descricao || !formData.solucao) {
        toast.error('Preencha todos os campos obrigatórios');
        return false;
      }

      let arquivo_print_url = '';

      // Upload da primeira imagem como arquivo_print (compatibilidade)
      if (formData.images && formData.images.length > 0) {
        const file = formData.images[0]; // Usar apenas a primeira imagem
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        // Timeout de 30 segundos para upload de arquivo
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Upload demorou mais de 30 segundos')), 30000)
        );

        const uploadPromise = supabase.storage
          .from('knowledge-base-files')
          .upload(fileName, file);

        const { data: uploadData, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

        if (uploadError) throw uploadError;
        arquivo_print_url = uploadData.path;
      } else if (formData.arquivo_print) {
        // Fallback para arquivo_print se não houver images
        const fileExt = formData.arquivo_print.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        // Timeout de 30 segundos para upload de arquivo
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Upload demorou mais de 30 segundos')), 30000)
        );

        const uploadPromise = supabase.storage
          .from('knowledge-base-files')
          .upload(fileName, formData.arquivo_print);

        const { data: uploadData, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

        if (uploadError) throw uploadError;
        arquivo_print_url = uploadData.path;
      }



      if (editingItem) {
        // Timeout de 10 segundos para update
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const updatePromise = supabase
          .from('base_conhecimento')
          .update({
            titulo: formData.titulo,
            problema_descricao: formData.problema_descricao,
            solucao: formData.solucao,
            categoria: formData.categoria || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
            arquivo_print: arquivo_print_url || null
          })
          .eq('id', editingItem.id);

        const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) throw error;
        toast.success('Item atualizado com sucesso!');
      } else {
        // Timeout de 10 segundos para insert
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const insertPromise = supabase
          .from('base_conhecimento')
          .insert({
            titulo: formData.titulo,
            problema_descricao: formData.problema_descricao,
            solucao: formData.solucao,
            categoria: formData.categoria || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
            arquivo_print: arquivo_print_url || null
          });

        const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

        if (error) throw error;
        toast.success('Item adicionado com sucesso!');
      }

      fetchItems();
      fetchCategories(); // Atualizar categorias após salvar
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      
      if (error?.message?.includes('Timeout') || error?.message?.includes('Failed to fetch') || error instanceof TypeError) {
        toast.error('Erro de conectividade. Verifique sua conexão e tente novamente.');
      } else {
        toast.error('Erro ao salvar item');
      }
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      // Timeout de 10 segundos para delete
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const deletePromise = supabase
        .from('base_conhecimento')
        .delete()
        .eq('id', itemId);

      const { error } = await Promise.race([deletePromise, timeoutPromise]) as any;

      if (error) throw error;
      
      // Remove item do estado local sem recarregar tudo
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success('Item excluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      
      if (error?.message?.includes('Timeout') || error?.message?.includes('Failed to fetch') || error instanceof TypeError) {
        toast.error('Erro de conectividade. Verifique sua conexão e tente novamente.');
      } else {
        toast.error('Erro ao excluir item');
      }
      return false;
    }
  };

  const incrementView = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (item) {
        // Timeout de 10 segundos para update
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const updatePromise = supabase
          .from('base_conhecimento')
          .update({ visualizacoes: (item.visualizacoes || 0) + 1 })
          .eq('id', itemId);

        const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;
        
        if (error) throw error;
        
        // Atualiza item no estado local sem recarregar tudo
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === itemId 
              ? { ...prevItem, visualizacoes: (prevItem.visualizacoes || 0) + 1 }
              : prevItem
          )
        );
      }
    } catch (error: any) {
      if (error?.message?.includes('Timeout') || error?.message?.includes('Failed to fetch') || error instanceof TypeError) {
        console.warn('Erro de conectividade ao incrementar visualização:', error);
      } else {
        console.error('Erro ao incrementar visualização:', error);
      }
    }
  };

  const incrementUtil = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (item) {
        // Timeout de 10 segundos para update
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const updatePromise = supabase
          .from('base_conhecimento')
          .update({ util_count: (item.util_count || 0) + 1 })
          .eq('id', itemId);

        const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;
        
        if (error) throw error;
        toast.success('Marcado como útil!');
        
        // Atualiza item no estado local sem recarregar tudo
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === itemId 
              ? { ...prevItem, util_count: (prevItem.util_count || 0) + 1 }
              : prevItem
          )
        );
      }
    } catch (error: any) {
      console.error('Erro ao marcar como útil:', error);
      
      if (error?.message?.includes('Timeout') || error?.message?.includes('Failed to fetch') || error instanceof TypeError) {
        toast.error('Erro de conectividade. Verifique sua conexão e tente novamente.');
      } else {
        toast.error('Erro ao marcar como útil');
      }
    }
  };

  return {
    items,
    categories,
    isLoading,
    fetchItems,
    saveItem,
    deleteItem,
    incrementView,
    incrementUtil
  };
};