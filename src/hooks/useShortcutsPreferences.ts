import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShortcutsPreferences {
  groupOrder?: string[];
  favoriteGroups?: string[];
  favoriteButtons?: string[];
}

export const useShortcutsPreferences = () => {
  const [preferences, setPreferences] = useState<ShortcutsPreferences>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('user_shortcuts_preferences')
        .select('group_order, favorite_groups, favorite_buttons')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          groupOrder: data.group_order || [],
          favoriteGroups: data.favorite_groups || [],
          favoriteButtons: data.favorite_buttons || []
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      
      // Tratamento específico para erros de conectividade e timeout
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          console.warn('Problema de conectividade com Supabase - usando preferências padrão');
        } else if (error.message.includes('Timeout')) {
          console.warn('Timeout na busca de preferências - usando preferências padrão');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<ShortcutsPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedPreferences = { ...preferences, ...newPreferences };

      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      // Primeiro, verificar se já existe um registro para o usuário
      const checkPromise = supabase
        .from('user_shortcuts_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: existingData } = await Promise.race([checkPromise, timeoutPromise]) as any;

      if (existingData) {
        // Se existe, fazer UPDATE
        const updatePromise = supabase
          .from('user_shortcuts_preferences')
          .update({
            group_order: updatedPreferences.groupOrder,
            favorite_groups: updatedPreferences.favoriteGroups,
            favorite_buttons: updatedPreferences.favoriteButtons,
          })
          .eq('user_id', user.id);

        const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) {
          console.error('Error updating preferences:', error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar as preferências",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Se não existe, fazer INSERT
        const insertPromise = supabase
          .from('user_shortcuts_preferences')
          .insert({
            user_id: user.id,
            group_order: updatedPreferences.groupOrder,
            favorite_groups: updatedPreferences.favoriteGroups,
            favorite_buttons: updatedPreferences.favoriteButtons,
          });

        const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

        if (error) {
          console.error('Error inserting preferences:', error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar as preferências",
            variant: "destructive"
          });
          return;
        }
      }

      setPreferences(updatedPreferences);
      toast({
        title: "Sucesso",
        description: "Preferências salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      
      // Tratamento específico para erros de conectividade e timeout
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          toast({
            title: "Erro de Conectividade",
            description: "Problema de conexão com o servidor. Tente novamente.",
            variant: "destructive"
          });
        } else if (error.message.includes('Timeout')) {
          toast({
            title: "Timeout",
            description: "A operação demorou muito para responder. Tente novamente.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível salvar as preferências",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as preferências",
          variant: "destructive"
        });
      }
    }
  };

  const updateGroupOrder = (newOrder: string[]) => {
    savePreferences({ groupOrder: newOrder });
  };

  const toggleFavoriteGroup = (groupId: string) => {
    const currentFavorites = preferences.favoriteGroups || [];
    const newFavorites = currentFavorites.includes(groupId)
      ? currentFavorites.filter(id => id !== groupId)
      : [...currentFavorites, groupId];
    
    savePreferences({ favoriteGroups: newFavorites });
  };

  const toggleFavoriteButton = (buttonId: string) => {
    const currentFavorites = preferences.favoriteButtons || [];
    const newFavorites = currentFavorites.includes(buttonId)
      ? currentFavorites.filter(id => id !== buttonId)
      : [...currentFavorites, buttonId];
    
    savePreferences({ favoriteButtons: newFavorites });
  };

  const updateFavoriteButtonsOrder = (newOrder: string[]) => {
    savePreferences({ favoriteButtons: newOrder });
  };

  return {
    preferences,
    loading,
    updateGroupOrder,
    toggleFavoriteGroup,
    toggleFavoriteButton,
    updateFavoriteButtonsOrder,
    refresh: loadPreferences
  };
};