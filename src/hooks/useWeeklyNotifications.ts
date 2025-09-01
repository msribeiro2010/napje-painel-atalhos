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

  // Buscar itens da base de conhecimento (sem filtro de notificação)
  const fetchNotificationItems = useCallback(async () => {
    try {
      // Timeout mais agressivo de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 5 segundos')), 5000)
      );

      const queryPromise = supabase
        .from('base_conhecimento')
        .select('id, titulo, categoria')
        .order('created_at', { ascending: false })
        .limit(5) // Reduzir ainda mais o limite
        .abortSignal(AbortSignal.timeout(4000)); // Timeout nativo do navegador

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('Erro na consulta Supabase:', error);
        setNotificationItems([]);
        return;
      }
      
      setNotificationItems(data || []);
    } catch (error) {
      console.warn('Erro ao buscar itens (fallback para vazio):', error);
      
      // Sempre definir como vazio em caso de qualquer erro
      setNotificationItems([]);
    }
  }, []);

  // Verificar se deve notificar
  const shouldShowNotifications = useCallback((): boolean => {
    if (!settings.enabled || notificationItems.length === 0) return false;

    const now = new Date();
    const today = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Verificar se hoje é um dos dias configurados
    const activeDays = settings.isWeekdayRange 
      ? [1, 2, 3, 4, 5] // Segunda a Sexta
      : (settings.notificationDays?.length > 0 ? settings.notificationDays : [settings.notificationDay]);
    
    if (!activeDays.includes(today)) return false;
    if (currentTime < settings.notificationTime) return false;

    const todayString = now.toISOString().split('T')[0];
    return settings.lastNotificationDate !== todayString;
  }, [settings.enabled, settings.notificationDay, settings.notificationDays, settings.notificationTime, settings.lastNotificationDate, settings.isWeekdayRange, notificationItems.length]);

  // Mostrar notificações
  const showWeeklyNotifications = useCallback(() => {
    if (!shouldShowNotifications()) return;

    notificationItems.forEach((item, index) => {
       setTimeout(() => {
          const message = `📋 Lembrete: ${item.titulo} - Verifique os procedimentos relacionados a ${item.categoria || 'este item'}.`;
          
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
          const message = `Lembrete: ${item.titulo} - Verifique os procedimentos necessários`;
          
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
    getDayName,
    getActiveDaysText
  };
};