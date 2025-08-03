import { useState, useEffect } from 'react';
import { useUpcomingEvents } from './useUpcomingEvents';
import { useToast } from './use-toast';
import { addHours, isAfter, isBefore, parseISO, format, startOfDay } from 'date-fns';

interface EventStatus {
  eventId: string;
  status: 'active' | 'finished' | 'hidden';
  finishedAt?: string;
  hiddenAt?: string;
}

interface NotificationSettings {
  showModalForUrgent: boolean;
  showToastsForAll: boolean;
  snoozeTime: number; // em minutos
  lastShownToast: string | null;
  dismissedEvents: string[];
  eventStatuses: EventStatus[]; // Novo: controle de status dos eventos
  autoHideAfterHours: number; // Novo: horas para ocultar evento após finalizar
  showPastEvents: boolean; // Novo: mostrar eventos passados
}

const DEFAULT_SETTINGS: NotificationSettings = {
  showModalForUrgent: true,
  showToastsForAll: true,
  snoozeTime: 30,
  lastShownToast: null,
  dismissedEvents: [],
  eventStatuses: [],
  autoHideAfterHours: 4, // 4 horas após finalizar
  showPastEvents: false
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
  
  // Debug logs
  useEffect(() => {
    console.log('🔍 useEventNotifications: Estado atual');
    console.log('📊 Loading:', loading);
    console.log('📅 Has upcoming events:', hasUpcomingEvents);
    console.log('⚙️ Show toasts:', settings.showToastsForAll);
    console.log('🔔 Has shown initial toast:', hasShownInitialToast);
    console.log('📋 Events:', events);
  }, [loading, hasUpcomingEvents, settings.showToastsForAll, hasShownInitialToast, events]);

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
      data: f,
      date: f.data
    })),
    ...events.aniversariantes.map(a => ({
      type: 'aniversario' as const,
      title: a.nome,
      subtitle: `${a.idade} anos`,
      daysUntil: a.daysUntil,
      id: `aniversario-${a.id}`,
      data: a,
      date: a.data_nascimento
    }))
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  // Função para obter o status de um evento
  const getEventStatus = (eventId: string): EventStatus | null => {
    return settings.eventStatuses.find(status => status.eventId === eventId) || null;
  };

  // Função para atualizar status de um evento
  const updateEventStatus = (eventId: string, newStatus: 'active' | 'finished' | 'hidden') => {
    setSettings(prev => {
      const updatedStatuses = prev.eventStatuses.filter(s => s.eventId !== eventId);
      const statusUpdate: EventStatus = {
        eventId,
        status: newStatus,
        ...(newStatus === 'finished' && { finishedAt: new Date().toISOString() }),
        ...(newStatus === 'hidden' && { hiddenAt: new Date().toISOString() })
      };
      
      return {
        ...prev,
        eventStatuses: [...updatedStatuses, statusUpdate]
      };
    });
  };

  // Auto-ocultar eventos finalizados após X horas
  useEffect(() => {
    const now = new Date();
    const updatedStatuses = settings.eventStatuses.map(status => {
      if (status.status === 'finished' && status.finishedAt) {
        const finishedTime = new Date(status.finishedAt);
        const hideTime = addHours(finishedTime, settings.autoHideAfterHours);
        
        if (isAfter(now, hideTime)) {
          return { ...status, status: 'hidden' as const, hiddenAt: now.toISOString() };
        }
      }
      return status;
    });
    
    if (JSON.stringify(updatedStatuses) !== JSON.stringify(settings.eventStatuses)) {
      setSettings(prev => ({ ...prev, eventStatuses: updatedStatuses }));
    }
  }, [settings.eventStatuses, settings.autoHideAfterHours]);

  // Eventos filtrados por status
  const activeEvents = allEvents.filter(event => {
    const status = getEventStatus(event.id);
    
    // Se não tem status ou está ativo, mostrar
    if (!status || status.status === 'active') {
      return true;
    }
    
    // Se está finalizado e deve mostrar eventos passados, mostrar
    if (status.status === 'finished' && settings.showPastEvents) {
      return true;
    }
    
    // Se está oculto, não mostrar (exceto se showPastEvents estiver ativo)
    if (status.status === 'hidden') {
      return settings.showPastEvents;
    }
    
    return false;
  });

  // Eventos urgentes (hoje e amanhã) que não foram dispensados e estão ativos
  const urgentEvents = activeEvents.filter(e => {
    const status = getEventStatus(e.id);
    const isNotDismissed = !settings.dismissedEvents.includes(e.id);
    const isNotFinished = !status || status.status !== 'finished';
    
    return e.daysUntil <= 1 && isNotDismissed && isNotFinished;
  });

  // Marcar evento como finalizado automaticamente no dia seguinte
  useEffect(() => {
    const today = startOfDay(new Date());
    
    allEvents.forEach(event => {
      if (event.daysUntil < 0) { // Evento já passou
        const status = getEventStatus(event.id);
        if (!status || status.status === 'active') {
          updateEventStatus(event.id, 'finished');
        }
      }
    });
  }, [allEvents]);

  // Toast automático para eventos do dia - DESABILITADO
  // useEffect(() => {
  //   if (!loading && hasUpcomingEvents && settings.showToastsForAll && !hasShownInitialToast) {
  //     const todayEvents = urgentEvents.filter(e => e.daysUntil === 0);
  //     const tomorrowEvents = urgentEvents.filter(e => e.daysUntil === 1);
  //     
  //     console.log('🔍 useEventNotifications: Verificando eventos para toast');
  //     console.log('📊 Total eventos:', allEvents.length);
  //     console.log('🚨 Eventos urgentes:', urgentEvents.length);
  //     console.log('📅 Eventos hoje:', todayEvents.length);
  //     console.log('⏰ Eventos amanhã:', tomorrowEvents.length);
  //     
  //     if (todayEvents.length > 0) {
  //       // Marcar eventos de hoje como ativos
  //       todayEvents.forEach(event => {
  //         const status = getEventStatus(event.id);
  //         if (!status) {
  //           updateEventStatus(event.id, 'active');
  //         }
  //       });
  //       
  //       toast({
  //         title: "🎉 Eventos Acontecendo HOJE!",
  //         description: `${todayEvents.map(e => e.title).join(', ')}`,
  //         duration: 8000,
  //       });
  //     } else if (tomorrowEvents.length > 0) {
  //       toast({
  //         title: "⏰ Eventos Amanhã!",
  //         description: `Lembre-se: ${tomorrowEvents.map(e => e.title).join(', ')}`,
  //         duration: 6000,
  //       });
  //     } else if (allEvents.length > 0) {
  //       // Mostrar toast informativo se há eventos mas não urgentes
  //       const nextEvent = allEvents[0];
  //       toast({
  //         title: "📅 Próximos Eventos",
  //         description: `${nextEvent.title} em ${nextEvent.daysUntil} dias`,
  //         duration: 5000,
  //       });
  //     }
  //     
  //     setHasShownInitialToast(true);
  //   }
  // }, [events, loading, hasUpcomingEvents, settings.showToastsForAll, hasShownInitialToast, urgentEvents, toast, allEvents]);

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

  // Função para marcar evento como finalizado
  const markEventAsFinished = (eventId: string) => {
    updateEventStatus(eventId, 'finished');
    toast({
      title: "✅ Evento Finalizado",
      description: "O evento foi marcado como finalizado e será ocultado em algumas horas.",
      duration: 3000,
    });
  };

  // Função para restaurar evento
  const restoreEvent = (eventId: string) => {
    updateEventStatus(eventId, 'active');
    toast({
      title: "🔄 Evento Restaurado",
      description: "O evento foi restaurado e voltará a aparecer nas notificações.",
      duration: 3000,
    });
  };

  // Obter eventos passados
  const getPastEvents = () => {
    return settings.eventStatuses
      .filter(status => status.status === 'finished' || status.status === 'hidden')
      .map(status => {
        const event = allEvents.find(e => e.id === status.eventId);
        return event ? { ...event, status } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a!.status.finishedAt || a!.status.hiddenAt || '';
        const bTime = b!.status.finishedAt || b!.status.hiddenAt || '';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
  };

  const getNotificationStats = () => {
    const total = activeEvents.length;
    const urgent = urgentEvents.length;
    const today = activeEvents.filter(e => e.daysUntil === 0).length;
    const tomorrow = activeEvents.filter(e => e.daysUntil === 1).length;
    const thisWeek = activeEvents.filter(e => e.daysUntil <= 7).length;
    const finished = settings.eventStatuses.filter(s => s.status === 'finished').length;
    const hidden = settings.eventStatuses.filter(s => s.status === 'hidden').length;
    
    return {
      total,
      urgent,
      today,
      tomorrow,
      thisWeek,
      dismissed: settings.dismissedEvents.length,
      finished,
      hidden,
      past: finished + hidden
    };
  };

  return {
    // Dados
    allEvents: activeEvents,
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
    markEventAsFinished,
    restoreEvent,
    updateEventStatus,
    
    // Eventos passados
    pastEvents: getPastEvents(),
    
    // Estatísticas
    stats: getNotificationStats()
  };
};
