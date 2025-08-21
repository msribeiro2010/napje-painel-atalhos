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

      const { data, error } = await supabase
        .from('user_shortcuts_preferences')
        .select('group_order, favorite_groups, favorite_buttons')
        .eq('user_id', user.id)
        .single();

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
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<ShortcutsPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedPreferences = { ...preferences, ...newPreferences };

      // Primeiro, verificar se já existe um registro para o usuário
      const { data: existingData } = await supabase
        .from('user_shortcuts_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingData) {
        // Se existe, fazer UPDATE
        const { error } = await supabase
          .from('user_shortcuts_preferences')
          .update({
            group_order: updatedPreferences.groupOrder,
            favorite_groups: updatedPreferences.favoriteGroups,
            favorite_buttons: updatedPreferences.favoriteButtons,
          })
          .eq('user_id', user.id);

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
        const { error } = await supabase
          .from('user_shortcuts_preferences')
          .insert({
            user_id: user.id,
            group_order: updatedPreferences.groupOrder,
            favorite_groups: updatedPreferences.favoriteGroups,
            favorite_buttons: updatedPreferences.favoriteButtons,
          });

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
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências",
        variant: "destructive"
      });
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