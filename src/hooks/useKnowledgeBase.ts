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
      const { data, error } = await supabase
        .from('base_conhecimento')
        .select('categoria')
        .not('categoria', 'is', null)
        .order('categoria');

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
      const { data, error } = await supabase
        .from('base_conhecimento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Processar dados sem media_files
      const processedData = (data || []).map(item => ({
        ...item
      }));
      
      setItems(processedData);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast.error('Erro ao carregar base de conhecimento');
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
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('knowledge-base-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        arquivo_print_url = uploadData.path;
      } else if (formData.arquivo_print) {
        // Fallback para arquivo_print se não houver images
        const fileExt = formData.arquivo_print.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('knowledge-base-files')
          .upload(fileName, formData.arquivo_print);

        if (uploadError) throw uploadError;
        arquivo_print_url = uploadData.path;
      }



      if (editingItem) {
        const { error } = await supabase
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

        if (error) throw error;
        toast.success('Item atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('base_conhecimento')
          .insert({
            titulo: formData.titulo,
            problema_descricao: formData.problema_descricao,
            solucao: formData.solucao,
            categoria: formData.categoria || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
            arquivo_print: arquivo_print_url || null
          });

        if (error) throw error;
        toast.success('Item adicionado com sucesso!');
      }

      fetchItems();
      fetchCategories(); // Atualizar categorias após salvar
      return true;
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.error('Erro ao salvar item');
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('base_conhecimento')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Remove item do estado local sem recarregar tudo
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success('Item excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
      return false;
    }
  };

  const incrementView = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const { error } = await supabase
          .from('base_conhecimento')
          .update({ visualizacoes: (item.visualizacoes || 0) + 1 })
          .eq('id', itemId);
        
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
    } catch (error) {
      console.error('Erro ao incrementar visualização:', error);
    }
  };

  const incrementUtil = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const { error } = await supabase
          .from('base_conhecimento')
          .update({ util_count: (item.util_count || 0) + 1 })
          .eq('id', itemId);
        
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
    } catch (error) {
      console.error('Erro ao marcar como útil:', error);
      toast.error('Erro ao marcar como útil');
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