import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SmartNotification {
  id: string;
  type: 'reminder' | 'suggestion' | 'alert' | 'prediction' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  category: 'deadline' | 'meeting' | 'task' | 'system' | 'personal' | 'calendar';
  predictedRelevance: number;
  triggerConditions: {
    timeBasedTrigger?: string;
    eventBasedTrigger?: string;
    contextualTrigger?: string;
  };
  actionButtons?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  smartFeatures: {
    autoSnooze?: boolean;
    adaptiveTiming?: boolean;
    contextualVisibility?: boolean;
    learningEnabled?: boolean;
  };
  metadata: {
    createdAt: Date;
    scheduledFor?: Date;
    expiresAt?: Date;
    aiGenerated: boolean;
    userInteraction?: 'seen' | 'dismissed' | 'acted' | 'snoozed';
    source: 'ai_prediction' | 'user_pattern' | 'system_rule' | 'calendar_analysis';
  };
}

export interface NotificationContext {
  currentTime: Date;
  userActivity: {
    isActive: boolean;
    lastActivity: Date;
    currentPage: string;
  };
  workContext: {
    isWorkingHours: boolean;
    isBusinessDay: boolean;
    currentWorkStatus?: string;
  };
  calendarEvents: any[];
  recentActions: string[];
}

export interface NotificationSettings {
  enableAIPredictions: boolean;
  adaptiveTimings: boolean;
  smartFiltering: boolean;
  personalizedContent: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    [key: string]: {
      enabled: boolean;
      priority: 'low' | 'medium' | 'high';
      delivery: 'immediate' | 'batched' | 'smart';
    };
  };
}

export const useSmartNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<NotificationContext | null>(null);

  // Gerar notificações preditivas baseadas em padrões
  const generatePredictiveNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-predictive-notifications', {
        body: {
          userId: user.id,
          context: {
            currentTime: new Date(),
            lookAheadDays: 7,
            includePatterns: true,
            includeCalendarAnalysis: true
          }
        }
      });

      if (error) throw error;

      const newNotifications = data.notifications?.map((notif: any) => ({
        ...notif,
        metadata: {
          ...notif.metadata,
          createdAt: new Date(notif.metadata.createdAt),
          scheduledFor: notif.metadata.scheduledFor ? new Date(notif.metadata.scheduledFor) : undefined,
          expiresAt: notif.metadata.expiresAt ? new Date(notif.metadata.expiresAt) : undefined
        }
      })) || [];

      setNotifications(prev => [...newNotifications, ...prev]);

      return newNotifications;
    } catch (err) {
      console.error('Erro ao gerar notificações preditivas:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Analisar contexto atual para notificações inteligentes
  const analyzeNotificationContext = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-notification-context', {
        body: {
          userId: user.id,
          includeActivity: true,
          includeCalendar: true,
          includeWorkStatus: true
        }
      });

      if (error) throw error;

      const analysisContext: NotificationContext = {
        currentTime: new Date(),
        userActivity: data.userActivity || { isActive: true, lastActivity: new Date(), currentPage: window.location.pathname },
        workContext: data.workContext || { isWorkingHours: true, isBusinessDay: true },
        calendarEvents: data.calendarEvents || [],
        recentActions: data.recentActions || []
      };

      setContext(analysisContext);
      return analysisContext;
    } catch (err) {
      console.error('Erro ao analisar contexto:', err);
      return null;
    }
  }, [user]);

  // Filtrar notificações baseado em contexto inteligente
  const filterNotificationsByContext = useCallback((
    notifications: SmartNotification[],
    currentContext: NotificationContext
  ) => {
    return notifications.filter(notification => {
      // Filtro por horário de trabalho
      if (!currentContext.workContext.isWorkingHours && 
          notification.category === 'meeting') {
        return false;
      }

      // Filtro por relevância preditiva
      if (notification.predictedRelevance < 0.3) {
        return false;
      }

      // Filtro por contexto de atividade
      if (!currentContext.userActivity.isActive && 
          notification.priority === 'low') {
        return false;
      }

      // Filtro por expiração
      if (notification.metadata.expiresAt && 
          notification.metadata.expiresAt < new Date()) {
        return false;
      }

      return true;
    });
  }, []);

  // Otimizar timing de notificações baseado em padrões de usuário
  const optimizeNotificationTiming = useCallback(async (
    notification: SmartNotification
  ) => {
    if (!user || !notification.smartFeatures.adaptiveTiming) return notification;

    try {
      const { data, error } = await supabase.functions.invoke('optimize-notification-timing', {
        body: {
          userId: user.id,
          notification,
          userPatterns: true,
          contextAnalysis: true
        }
      });

      if (error) throw error;

      return {
        ...notification,
        metadata: {
          ...notification.metadata,
          scheduledFor: new Date(data.optimizedTime)
        }
      };
    } catch (err) {
      console.error('Erro ao otimizar timing:', err);
      return notification;
    }
  }, [user]);

  // Personalizar conteúdo de notificação com IA
  const personalizeNotificationContent = useCallback(async (
    baseNotification: Partial<SmartNotification>
  ) => {
    if (!user) return baseNotification;

    try {
      const { data, error } = await supabase.functions.invoke('personalize-notification', {
        body: {
          userId: user.id,
          baseNotification,
          userProfile: true,
          recentActivity: true,
          communicationStyle: true
        }
      });

      if (error) throw error;

      return {
        ...baseNotification,
        title: data.personalizedTitle || baseNotification.title,
        message: data.personalizedMessage || baseNotification.message,
        actionButtons: data.personalizedActions || baseNotification.actionButtons
      };
    } catch (err) {
      console.error('Erro ao personalizar notificação:', err);
      return baseNotification;
    }
  }, [user]);

  // Executar ação de notificação
  const executeNotificationAction = useCallback(async (
    notificationId: string,
    actionType: string,
    payload?: any
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('execute-notification-action', {
        body: {
          notificationId,
          actionType,
          payload,
          userId: user?.id
        }
      });

      if (error) throw error;

      // Marcar notificação como acionada
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, metadata: { ...notif.metadata, userInteraction: 'acted' } }
          : notif
      ));

      return data;
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      throw err;
    }
  }, [user]);

  // Feedback de aprendizado de IA
  const provideFeedback = useCallback(async (
    notificationId: string,
    feedback: 'helpful' | 'not_helpful' | 'spam' | 'wrong_timing',
    details?: string
  ) => {
    try {
      await supabase.functions.invoke('notification-feedback', {
        body: {
          notificationId,
          feedback,
          details,
          userId: user?.id,
          context: context
        }
      });

      // Atualizar notificação localmente
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { 
              ...notif, 
              metadata: { 
                ...notif.metadata, 
                userInteraction: feedback === 'helpful' ? 'acted' : 'dismissed'
              }
            }
          : notif
      ));
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }
  }, [user, context]);

  // Snooze inteligente baseado em contexto
  const smartSnooze = useCallback(async (
    notificationId: string,
    customDuration?: number
  ) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    try {
      const { data, error } = await supabase.functions.invoke('smart-snooze', {
        body: {
          notificationId,
          customDuration,
          userId: user?.id,
          context: context,
          notification
        }
      });

      if (error) throw error;

      // Reagendar notificação
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { 
              ...notif, 
              metadata: { 
                ...notif.metadata, 
                scheduledFor: new Date(data.newScheduleTime),
                userInteraction: 'snoozed'
              }
            }
          : notif
      ));
    } catch (err) {
      console.error('Erro no snooze inteligente:', err);
    }
  }, [notifications, user, context]);

  // Carregar configurações de notificação
  const loadNotificationSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('load-notification-settings', {
        body: { userId: user.id }
      });

      if (error) throw error;

      setSettings(data.settings || {
        enableAIPredictions: true,
        adaptiveTimings: true,
        smartFiltering: true,
        personalizedContent: true,
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        categories: {}
      });
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  }, [user]);

  // Salvar configurações de notificação
  const saveNotificationSettings = useCallback(async (newSettings: NotificationSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('save-notification-settings', {
        body: {
          userId: user.id,
          settings: newSettings
        }
      });

      if (error) throw error;

      setSettings(newSettings);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    }
  }, [user]);

  // Marcar notificação como vista
  const markAsViewed = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, metadata: { ...notif.metadata, userInteraction: 'seen' } }
        : notif
    ));
  }, []);

  // Dismiss notificação
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Inicialização
  useEffect(() => {
    if (user) {
      loadNotificationSettings();
      analyzeNotificationContext();
      generatePredictiveNotifications();
    }
  }, [user, loadNotificationSettings, analyzeNotificationContext, generatePredictiveNotifications]);

  // Filtrar notificações visíveis baseado em contexto
  const visibleNotifications = context 
    ? filterNotificationsByContext(notifications, context)
    : notifications;

  return {
    // Estados
    notifications: visibleNotifications,
    allNotifications: notifications,
    settings,
    context,
    isLoading,

    // Métodos de geração
    generatePredictiveNotifications,
    analyzeNotificationContext,
    personalizeNotificationContent,

    // Métodos de interação
    executeNotificationAction,
    provideFeedback,
    smartSnooze,
    markAsViewed,
    dismissNotification,

    // Configurações
    loadNotificationSettings,
    saveNotificationSettings,

    // Utilitários
    optimizeNotificationTiming,
    filterNotificationsByContext
  };
};