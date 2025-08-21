import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationItem {
  id: string;
  titulo: string;
  categoria?: string;
  mensagem_notificacao?: string;
  notificacao_semanal: boolean;
}

interface WeeklyNotificationSettings {
  enabled: boolean;
  lastNotificationDate: string | null;
  notificationDay: number;
  notificationTime: string;
}

export const useWeeklyNotifications = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WeeklyNotificationSettings>({
    enabled: true,
    lastNotificationDate: null,
    notificationDay: 1,
    notificationTime: '09:00'
  });
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);

  // Carregar configurações
  useEffect(() => {
    const saved = localStorage.getItem('weekly-notification-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
  }, []);

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('weekly-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Buscar itens com notificação ativada
  const fetchNotificationItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('base_conhecimento')
        .select('id, titulo, categoria, mensagem_notificacao, notificacao_semanal')
        .eq('notificacao_semanal', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotificationItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  }, []);

  // Verificar se deve notificar
  const shouldShowNotifications = useCallback((): boolean => {
    if (!settings.enabled || notificationItems.length === 0) return false;

    const now = new Date();
    const today = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (today !== settings.notificationDay) return false;
    if (currentTime < settings.notificationTime) return false;

    const todayString = now.toISOString().split('T')[0];
    return settings.lastNotificationDate !== todayString;
  }, [settings.enabled, settings.notificationDay, settings.notificationTime, settings.lastNotificationDate, notificationItems.length]);

  // Mostrar notificações
  const showWeeklyNotifications = useCallback(() => {
    if (!shouldShowNotifications()) return;

    notificationItems.forEach((item, index) => {
       setTimeout(() => {
          const message = item.mensagem_notificacao || 
            `📋 Lembrete: ${item.titulo} - Verifique os procedimentos relacionados a ${item.categoria || 'este item'}.`;
          
          toast({
            title: "🔔 Notificação Semanal",
            description: message,
            duration: 8000,
          });
        }, index * 2000);
    });

    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    setSettings(prev => ({ ...prev, lastNotificationDate: todayString }));
  }, [notificationItems, shouldShowNotifications, toast]);

  // Forçar notificação
  const forceNotification = useCallback(() => {
    if (notificationItems.length === 0) {
      toast({
        title: "ℹ️ Nenhum item configurado",
        description: "Não há itens com notificação semanal ativada.",
        duration: 5000,
      });
      return;
    }

    notificationItems.forEach((item, index) => {
       setTimeout(() => {
          const message = item.mensagem_notificacao || 
            `Lembrete: ${item.titulo} - Verifique os procedimentos necessários`;
          
          toast({
            title: "📅 Lembrete Semanal (Teste)",
            description: message,
            duration: 8000,
          });
        }, index * 1500);
     });
  }, [notificationItems, toast]);

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<WeeklyNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getDayName = (dayNumber: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNumber] || 'Desconhecido';
  };

  // Verificação automática
  useEffect(() => {
    fetchNotificationItems();
  }, [fetchNotificationItems]);

  // Configurar intervalo de verificação apenas quando habilitado (reduzido para 2 horas)
  useEffect(() => {
    if (!settings.enabled) return;
    
    // Reduzir polling de 30 minutos para 2 horas para diminuir requisições
    const interval = setInterval(() => {
      showWeeklyNotifications();
    }, 2 * 60 * 60 * 1000); // 2 horas

    // Verificação inicial após 10 segundos (aumentado de 5 segundos)
    const timeout = setTimeout(showWeeklyNotifications, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [settings.enabled, showWeeklyNotifications]);

  return {
    settings,
    updateSettings,
    notificationItems,
    fetchNotificationItems,
    forceNotification,
    getDayName
  };
};