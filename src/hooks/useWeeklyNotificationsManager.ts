import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeeklyNotification {
  id: string;
  titulo: string;
  mensagem: string;
  ativo: boolean;
  dayofweek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:MM format
  created_at: string;
  updated_at: string;
}

export interface WeeklyNotificationFormData {
  titulo: string;
  mensagem: string;
  ativo: boolean;
  dayofweek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:MM format
}

export interface WeeklyNotificationSettings {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayofweek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:MM format
}

export const useWeeklyNotificationsManager = () => {
  const [notifications, setNotifications] = useState<WeeklyNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<WeeklyNotificationSettings>({
    enabled: true,
    frequency: 'weekly',
    dayofweek: 1, // Monday
    time: '09:00'
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('weeklyNotificationSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure all required properties exist with defaults
        setSettings({
          enabled: parsedSettings.enabled ?? true,
          frequency: parsedSettings.frequency ?? 'weekly',
          dayofweek: parsedSettings.dayofweek ?? 1,
          time: parsedSettings.time ?? '09:00'
        });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
        // Keep default settings if parsing fails
      }
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
      
      console.log('Fetching notifications...');
      
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
            dayofweek: formData.dayofweek,
            time: formData.time,
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
            ativo: formData.ativo,
            dayofweek: formData.dayofweek,
            time: formData.time
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