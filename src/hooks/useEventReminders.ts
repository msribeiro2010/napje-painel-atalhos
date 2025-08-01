import { useState, useEffect, useCallback } from 'react';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { parseISO, isToday, isTomorrow, differenceInHours, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface EventReminder {
  id: string;
  eventId: string;
  title: string;
  date: string;
  type: string;
  reminderTime: Date;
  notified: boolean;
}

export const useEventReminders = () => {
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const currentMonth = new Date();
  const { customEvents } = useCustomEvents(currentMonth);

  // Criar lembretes automáticos para eventos próximos
  const createAutoReminders = useCallback(() => {
    const now = new Date();
    const newReminders: EventReminder[] = [];

    customEvents.forEach(event => {
      const eventDate = parseISO(event.date);
      const hoursUntilEvent = differenceInHours(eventDate, now);

      // Criar lembretes para eventos que acontecem hoje ou amanhã
      if (isToday(eventDate) || isTomorrow(eventDate)) {
        const existingReminder = reminders.find(r => r.eventId === event.id);
        
        if (!existingReminder) {
          newReminders.push({
            id: `reminder-${event.id}`,
            eventId: event.id,
            title: event.title,
            date: event.date,
            type: event.type,
            reminderTime: now,
            notified: false
          });
        }
      }
    });

    if (newReminders.length > 0) {
      setReminders(prev => [...prev, ...newReminders]);
    }
  }, [customEvents, reminders]);

  // Mostrar notificações para eventos próximos
  const showEventNotifications = useCallback(() => {
    const now = new Date();
    
    reminders.forEach(reminder => {
      if (!reminder.notified) {
        const eventDate = parseISO(reminder.date);
        
        if (isToday(eventDate)) {
          toast(`🎯 Evento Hoje: ${reminder.title}`, {
            description: `Seu evento "${reminder.title}" acontece hoje!`,
            duration: 8000,
            action: {
              label: 'Ver Calendário',
              onClick: () => window.location.href = '/calendario'
            }
          });
        } else if (isTomorrow(eventDate)) {
          toast(`⏰ Evento Amanhã: ${reminder.title}`, {
            description: `Lembre-se: "${reminder.title}" acontece amanhã (${format(eventDate, 'dd/MM/yyyy', { locale: ptBR })})`,
            duration: 6000,
            action: {
              label: 'Ver Calendário',
              onClick: () => window.location.href = '/calendario'
            }
          });
        }

        // Marcar como notificado
        setReminders(prev => 
          prev.map(r => 
            r.id === reminder.id ? { ...r, notified: true } : r
          )
        );
      }
    });
  }, [reminders]);

  // Criar lembrete manual para um evento específico
  const createManualReminder = useCallback((eventId: string, reminderDate: Date) => {
    const event = customEvents.find(e => e.id === eventId);
    if (!event) return;

    const newReminder: EventReminder = {
      id: `manual-${eventId}-${Date.now()}`,
      eventId,
      title: event.title,
      date: event.date,
      type: event.type,
      reminderTime: reminderDate,
      notified: false
    };

    setReminders(prev => [...prev, newReminder]);

    // Agendar notificação
    const timeUntilReminder = reminderDate.getTime() - new Date().getTime();
    if (timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000) { // Max 24h
      setTimeout(() => {
        toast(`🔔 Lembrete: ${event.title}`, {
          description: `Evento: ${format(parseISO(event.date), 'dd/MM/yyyy', { locale: ptBR })}`,
          duration: 10000,
          action: {
            label: 'Ver Calendário',
            onClick: () => window.location.href = '/calendario'
          }
        });
      }, timeUntilReminder);
    }

    toast.success(`Lembrete criado para "${event.title}"`, {
      description: `Você será notificado em ${format(reminderDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      duration: 5000,
    });
  }, [customEvents]);

  // Remover lembrete
  const removeReminder = useCallback((reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  }, []);

  // Verificar e criar lembretes automáticos periodicamente
  useEffect(() => {
    createAutoReminders();
    const interval = setInterval(createAutoReminders, 60000); // Verificar a cada minuto
    return () => clearInterval(interval);
  }, [createAutoReminders]);

  // Mostrar notificações periodicamente
  useEffect(() => {
    showEventNotifications();
    const interval = setInterval(showEventNotifications, 30000); // Verificar a cada 30 segundos
    return () => clearInterval(interval);
  }, [showEventNotifications]);

  return {
    reminders,
    createManualReminder,
    removeReminder,
    upcomingEventsCount: reminders.filter(r => !r.notified).length
  };
};