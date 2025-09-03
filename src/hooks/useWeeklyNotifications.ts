import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationItem {
  id: string;
  titulo: string;
  categoria?: string;
}

interface WeeklyNotificationSettings {
  enabled: boolean;
  lastNotificationDate: string | null;
  notificationDay: number; // Mantido para compatibilidade
  notificationDays: number[]; // Novo: array de dias
  notificationTime: string;
  isWeekdayRange: boolean; // Novo: indica se é período seg-sex
}

export const useWeeklyNotifications = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WeeklyNotificationSettings>({
    enabled: true,
    lastNotificationDate: null,
    notificationDay: 1, // Mantido para compatibilidade
    notificationDays: [1], // Segunda-feira por padrão
    notificationTime: '09:00',
    isWeekdayRange: false
  });
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState<NotificationItem[]>([]);

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

  // Buscar notificações ativas configuradas
  const fetchNotificationItems = useCallback(async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 5 segundos')), 5000)
      );

      const queryPromise = supabase
        .from('weekly_notifications')
        .select('id, titulo, mensagem')
        .eq('ativo', true)
        .order('created_at', { ascending: false })
        .abortSignal(AbortSignal.timeout(4000));

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('Erro na consulta de notificações:', error);
        setNotificationItems([]);
        return;
      }
      
      // Transformar para o formato esperado
      const transformedItems = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        categoria: 'notification'
      }));
      
      setNotificationItems(transformedItems);
    } catch (error) {
      console.warn('Erro ao buscar notificações ativas:', error);
      setNotificationItems([]);
    }
  }, []);

  // Verificar se há notificações para o horário atual
  const shouldShowNotifications = useCallback(async (): Promise<boolean> => {
    if (!settings.enabled) return false;

    const now = new Date();
    const today = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const todayString = now.toISOString().split('T')[0];
    
    // Se já notificou hoje, não notificar novamente
    if (settings.lastNotificationDate === todayString) return false;

    try {
      // Buscar notificações ativas para hoje
      const { data: activeNotifications, error } = await supabase
        .from('weekly_notifications')
        .select('*')
        .eq('ativo', true)
        .eq('dayofweek', today);

      if (error) {
        console.warn('Erro ao verificar notificações agendadas:', error);
        return false;
      }

      if (!activeNotifications || activeNotifications.length === 0) return false;

      // Verificar se alguma notificação deve ser exibida agora (com tolerância de 5 minutos)
      const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      
      return activeNotifications.some(notif => {
        const notifMinutes = parseInt(notif.time.split(':')[0]) * 60 + parseInt(notif.time.split(':')[1]);
        // Mostrar notificação se estamos no horário correto (com tolerância de 5 minutos após)
        return currentMinutes >= notifMinutes && currentMinutes <= notifMinutes + 5;
      });
    } catch (error) {
      console.warn('Erro na verificação de agendamento:', error);
      return false;
    }
  }, [settings.enabled, settings.lastNotificationDate]);

  // Mostrar notificações no modal
  const showWeeklyNotifications = useCallback(async () => {
    const shouldShow = await shouldShowNotifications();
    if (!shouldShow) return;
    
    // Buscar notificações ativas para mostrar
    try {
      const now = new Date();
      const today = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      
      const { data: activeNotifications, error } = await supabase
        .from('weekly_notifications')
        .select('*')
        .eq('ativo', true)
        .eq('dayofweek', today);

      if (!error && activeNotifications && activeNotifications.length > 0) {
        // Filtrar notificações que devem ser exibidas agora
        const notificationsToShow = activeNotifications.filter(notif => {
          const notifMinutes = parseInt(notif.time.split(':')[0]) * 60 + parseInt(notif.time.split(':')[1]);
          return currentMinutes >= notifMinutes && currentMinutes <= notifMinutes + 5;
        });

        if (notificationsToShow.length > 0) {
          // Transformar para o formato do modal
          const notificationItems = notificationsToShow.map(notif => ({
            id: notif.id,
            titulo: notif.titulo,
            categoria: 'notification'
          }));
          
          setPendingNotifications(notificationItems);
          setShowModal(true);
          
          const todayString = now.toISOString().split('T')[0];
          setSettings(prev => ({ ...prev, lastNotificationDate: todayString }));
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar notificações para exibir:', error);
    }
  }, [shouldShowNotifications]);

  // Forçar notificação (para teste)
  const forceNotification = useCallback(async () => {
    try {
      // Buscar notificações ativas diretamente
      const { data: activeNotifications, error } = await supabase
        .from('weekly_notifications')
        .select('*')
        .eq('ativo', true);

      if (error || !activeNotifications || activeNotifications.length === 0) {
        toast({
          title: "ℹ️ Nenhuma notificação ativa",
          description: "Não há notificações semanais ativas configuradas.",
          duration: 5000,
        });
        return;
      }

      // Mostrar todas as notificações ativas como teste
      const testItems = activeNotifications.map(notif => ({
        id: notif.id,
        titulo: notif.titulo,
        categoria: 'notification'
      }));
      
      setPendingNotifications(testItems);
      setShowModal(true);
    } catch (error) {
      console.warn('Erro ao forçar notificação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar as notificações para teste.",
        duration: 5000,
      });
    }
  }, [toast]);

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<WeeklyNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getDayName = (dayNumber: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNumber] || 'Desconhecido';
  };

  const getActiveDaysText = (): string => {
    if (settings.isWeekdayRange) {
      return 'Segunda a Sexta-feira';
    }
    
    const activeDays = settings.notificationDays?.length > 0 
      ? settings.notificationDays 
      : [settings.notificationDay];
    
    if (activeDays.length === 1) {
      return getDayName(activeDays[0]);
    }
    
    // Ordenar os dias e converter para nomes
    const sortedDays = [...activeDays].sort((a, b) => a - b);
    const dayNames = sortedDays.map(getDayName);
    
    if (dayNames.length === 2) {
      return dayNames.join(' e ');
    }
    
    return dayNames.slice(0, -1).join(', ') + ' e ' + dayNames[dayNames.length - 1];
  };

  // Verificação automática
  useEffect(() => {
    fetchNotificationItems();
  }, [fetchNotificationItems]);

  // Configurar intervalo de verificação apenas quando habilitado (verificação a cada 1 minuto)
  useEffect(() => {
    if (!settings.enabled) return;
    
    // Verificar a cada 1 minuto para maior precisão nos horários
    const interval = setInterval(() => {
      showWeeklyNotifications();
    }, 60 * 1000); // 1 minuto

    // Verificação inicial após 5 segundos
    const timeout = setTimeout(showWeeklyNotifications, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [settings.enabled, showWeeklyNotifications]);

  // Fechar modal e marcar como lida
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setPendingNotifications([]);
  }, []);

  return {
    settings,
    updateSettings,
    notificationItems,
    fetchNotificationItems,
    forceNotification,
    getDayName,
    getActiveDaysText,
    // Modal state
    showModal,
    pendingNotifications,
    handleModalClose
  };
};