import { useState, useEffect } from 'react';
import { useUpcomingEvents } from './useUpcomingEvents';
import { useToast } from './use-toast';

interface NotificationSettings {
  showModalForUrgent: boolean;
  showToastsForAll: boolean;
  snoozeTime: number; // em minutos
  lastShownToast: string | null;
  dismissedEvents: string[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  showModalForUrgent: true,
  showToastsForAll: true,
  snoozeTime: 30,
  lastShownToast: null,
  dismissedEvents: []
};

export const useEventNotifications = () => {
  const { events, loading, hasUpcomingEvents } = useUpcomingEvents();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('event-notification-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('event-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Combinar eventos
  const allEvents = [
    ...events.feriados.map(f => ({
      type: 'feriado' as const,
      title: f.descricao,
      subtitle: f.tipo,
      daysUntil: f.daysUntil,
      id: `feriado-${f.id}`,
      data: f
    })),
    ...events.aniversariantes.map(a => ({
      type: 'aniversario' as const,
      title: a.nome,
      subtitle: `${a.idade} anos`,
      daysUntil: a.daysUntil,
      id: `aniversario-${a.id}`,
      data: a
    }))
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  const urgentEvents = allEvents.filter(e => 
    e.daysUntil <= 1 && !settings.dismissedEvents.includes(e.id)
  );

  // Toast automático para eventos próximos
  useEffect(() => {
    if (!loading && hasUpcomingEvents && settings.showToastsForAll && !hasShownInitialToast) {
      const todayEvents = urgentEvents.filter(e => e.daysUntil === 0);
      const tomorrowEvents = urgentEvents.filter(e => e.daysUntil === 1);
      
      if (todayEvents.length > 0) {
        toast({
          title: "🎉 Eventos Acontecendo HOJE!",
          description: `${todayEvents.map(e => e.title).join(', ')}`,
          duration: 8000,
        });
      } else if (tomorrowEvents.length > 0) {
        toast({
          title: "⏰ Eventos Amanhã!",
          description: `Lembre-se: ${tomorrowEvents.map(e => e.title).join(', ')}`,
          duration: 6000,
        });
      }
      
      setHasShownInitialToast(true);
    }
  }, [events, loading, hasUpcomingEvents, settings.showToastsForAll, hasShownInitialToast, urgentEvents, toast]);

  // Modal automático para eventos urgentes
  useEffect(() => {
    if (!loading && urgentEvents.length > 0 && settings.showModalForUrgent) {
      const now = new Date();
      const lastShown = settings.lastShownToast ? new Date(settings.lastShownToast) : null;
      const snoozeExpired = !lastShown || (now.getTime() - lastShown.getTime()) > (settings.snoozeTime * 60 * 1000);
      
      if (snoozeExpired) {
        setModalOpen(true);
      }
    }
  }, [urgentEvents, loading, settings]);

  const dismissEvent = (eventId: string) => {
    setSettings(prev => ({
      ...prev,
      dismissedEvents: [...prev.dismissedEvents, eventId]
    }));
  };

  const snoozeNotifications = (minutes: number) => {
    setSettings(prev => ({
      ...prev,
      snoozeTime: minutes,
      lastShownToast: new Date().toISOString()
    }));
    setModalOpen(false);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearDismissedEvents = () => {
    setSettings(prev => ({
      ...prev,
      dismissedEvents: []
    }));
  };

  const getNotificationStats = () => {
    const total = allEvents.length;
    const urgent = urgentEvents.length;
    const today = allEvents.filter(e => e.daysUntil === 0).length;
    const tomorrow = allEvents.filter(e => e.daysUntil === 1).length;
    const thisWeek = allEvents.filter(e => e.daysUntil <= 7).length;
    
    return {
      total,
      urgent,
      today,
      tomorrow,
      thisWeek,
      dismissed: settings.dismissedEvents.length
    };
  };

  return {
    // Dados
    allEvents,
    urgentEvents,
    loading,
    hasUpcomingEvents,
    
    // Estado do modal
    modalOpen,
    setModalOpen,
    
    // Configurações
    settings,
    updateSettings,
    
    // Ações
    dismissEvent,
    snoozeNotifications,
    clearDismissedEvents,
    
    // Estatísticas
    stats: getNotificationStats()
  };
};
