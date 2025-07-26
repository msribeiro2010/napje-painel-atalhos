import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeeklyNotification {
  id: string;
  titulo: string;
  mensagem: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyNotificationFormData {
  titulo: string;
  mensagem: string;
  ativo: boolean;
}

export interface WeeklyNotificationSettings {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:MM format
}

export const useWeeklyNotificationsManager = () => {
  const [notifications, setNotifications] = useState<WeeklyNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<WeeklyNotificationSettings>({
    enabled: true,
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    time: '09:00'
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('weeklyNotificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: WeeklyNotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('weeklyNotificationSettings', JSON.stringify(newSettings));
    toast.success('Configurações salvas com sucesso!');
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error in fetchNotifications:', authError);
        toast.error('Erro de autenticação ao carregar notificações.');
        return;
      }
      
      console.log('Fetching notifications for user:', user?.id);
      
      const { data, error } = await supabase
        .from('weekly_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }
      
      console.log('Notifications fetched successfully:', data);
      setNotifications((data as WeeklyNotification[]) || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', { message: error, details: error });
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Erro de conexão ao carregar notificações. Verifique sua internet.');
      } else {
        toast.error(`Erro ao carregar notificações: ${error?.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification to database
  const saveNotification = async (formData: WeeklyNotificationFormData, editingId?: string) => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Erro de autenticação. Faça login novamente.');
        return false;
      }
      
      if (!user) {
        console.error('User not authenticated');
        toast.error('Usuário não autenticado. Faça login.');
        return false;
      }

      console.log('Saving notification for user:', user.id);
      console.log('Form data:', formData);
      console.log('Editing ID:', editingId);

      if (editingId) {
        // Update existing notification
        const { data, error } = await supabase
          .from('weekly_notifications')
          .update({
            titulo: formData.titulo,
            mensagem: formData.mensagem,
            ativo: formData.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        console.log('Update successful:', data);
        toast.success('Notificação atualizada com sucesso!');
      } else {
        // Create new notification
        const { data, error } = await supabase
          .from('weekly_notifications')
          .insert({
            titulo: formData.titulo,
            mensagem: formData.mensagem,
            ativo: formData.ativo
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Insert successful:', data);
        toast.success('Notificação criada com sucesso!');
      }

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao salvar notificação:', { message: error, details: error });
      
      // More specific error handling
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error?.message?.includes('JWT')) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (error?.message?.includes('permission')) {
        toast.error('Sem permissão para realizar esta ação.');
      } else {
        toast.error(`Erro ao salvar notificação: ${error?.message || 'Erro desconhecido'}`);
      }
      
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Notificação excluída com sucesso!');
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  // Test notification (simulate sending)
  const testNotification = (notification: WeeklyNotification) => {
    toast.info(`Teste: ${notification.titulo}`, {
      description: notification.mensagem,
      duration: 5000
    });
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    settings,
    saveSettings,
    saveNotification,
    deleteNotification,
    testNotification,
    fetchNotifications
  };
};