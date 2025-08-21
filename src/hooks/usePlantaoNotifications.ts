import { useState, useEffect, useCallback } from 'react';
import { useWorkCalendar } from './useWorkCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, addDays, isToday, isTomorrow, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PlantaoEvent {
  id: string;
  date: string; // yyyy-MM-dd
  title: string;
  daysUntil: number;
  isToday: boolean;
  isTomorrow: boolean;
}

export interface PlantaoNotificationSettings {
  enabled: boolean;
  notifyDayBefore: boolean;
  notifyOnDay: boolean;
  lastNotificationDate: string | null;
  dismissedPlantoes: string[];
}

const DEFAULT_SETTINGS: PlantaoNotificationSettings = {
  enabled: true,
  notifyDayBefore: true,
  notifyOnDay: true,
  lastNotificationDate: null,
  dismissedPlantoes: []
};

export const usePlantaoNotifications = () => {
  const { user } = useAuth();
  const currentMonth = new Date();
  const { marks, loading } = useWorkCalendar(currentMonth);
  
  const [settings, setSettings] = useState<PlantaoNotificationSettings>(DEFAULT_SETTINGS);
  const [notifiedPlantoes, setNotifiedPlantoes] = useState<Set<string>>(() => {
    // Carregar plantões já notificados da sessão atual
    const sessionKey = `notified_plantoes_${new Date().toDateString()}`;
    const saved = sessionStorage.getItem(sessionKey);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Carregar configurações do localStorage
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`plantao_notifications_${user.id}`);
      if (savedSettings) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        } catch (error) {
          console.error('Erro ao carregar configurações de plantão:', error);
        }
      }
    }
  }, [user]);

  // Salvar configurações no localStorage
  const saveSettings = useCallback((newSettings: Partial<PlantaoNotificationSettings>) => {
    if (!user) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(`plantao_notifications_${user.id}`, JSON.stringify(updatedSettings));
  }, [user, settings]);

  // Buscar plantões dos próximos 30 dias
  const getUpcomingPlantoes = useCallback((): PlantaoEvent[] => {
    if (!marks || loading) return [];

    const today = startOfDay(new Date());
    const plantoes: PlantaoEvent[] = [];

    // Verificar plantões nos próximos 30 dias
    for (let i = 0; i < 30; i++) {
      const checkDate = addDays(today, i);
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      
      if (marks[dateKey] === 'plantao') {
        const daysUntil = differenceInDays(checkDate, today);
        
        plantoes.push({
          id: `plantao-${dateKey}`,
          date: dateKey,
          title: `Plantão - ${format(checkDate, 'dd/MM/yyyy (EEEE)', { locale: ptBR })}`,
          daysUntil,
          isToday: isToday(checkDate),
          isTomorrow: isTomorrow(checkDate)
        });
      }
    }

    return plantoes.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [marks, loading]);

  // Plantões próximos
  const upcomingPlantoes = getUpcomingPlantoes();
  const todayPlantoes = upcomingPlantoes.filter(p => p.isToday);
  const tomorrowPlantoes = upcomingPlantoes.filter(p => p.isTomorrow);
  const urgentPlantoes = upcomingPlantoes.filter(p => p.daysUntil <= 1 && !settings.dismissedPlantoes.includes(p.id));

  // Mostrar notificações
  const showPlantaoNotifications = useCallback(() => {
    if (!settings.enabled || loading) return;

    urgentPlantoes.forEach(plantao => {
      if (!notifiedPlantoes.has(plantao.id)) {
        if (plantao.isToday && settings.notifyOnDay) {
          toast(`🚨 Plantão HOJE!`, {
            description: `Você tem plantão hoje: ${format(parseISO(plantao.date), 'dd/MM/yyyy (EEEE)', { locale: ptBR })}`,
            duration: 10000,
            action: {
              label: 'Ver Calendário',
              onClick: () => window.location.href = '/calendario'
            }
          });
          
          // Marcar como notificado
          setNotifiedPlantoes(prev => {
            const newSet = new Set([...prev, plantao.id]);
            const sessionKey = `notified_plantoes_${new Date().toDateString()}`;
            sessionStorage.setItem(sessionKey, JSON.stringify([...newSet]));
            return newSet;
          });
        } else if (plantao.isTomorrow && settings.notifyDayBefore) {
          toast(`⏰ Plantão Amanhã!`, {
            description: `Lembre-se: você tem plantão amanhã (${format(parseISO(plantao.date), 'dd/MM/yyyy (EEEE)', { locale: ptBR })})`,
            duration: 8000,
            action: {
              label: 'Ver Calendário',
              onClick: () => window.location.href = '/calendario'
            }
          });
          
          // Marcar como notificado
          setNotifiedPlantoes(prev => {
            const newSet = new Set([...prev, plantao.id]);
            const sessionKey = `notified_plantoes_${new Date().toDateString()}`;
            sessionStorage.setItem(sessionKey, JSON.stringify([...newSet]));
            return newSet;
          });
        }
      }
    });
  }, [settings, loading, urgentPlantoes, notifiedPlantoes]);

  // Dispensar plantão das notificações
  const dismissPlantao = useCallback((plantaoId: string) => {
    saveSettings({
      dismissedPlantoes: [...settings.dismissedPlantoes, plantaoId]
    });
  }, [settings.dismissedPlantoes, saveSettings]);

  // Restaurar plantão dispensado
  const restorePlantao = useCallback((plantaoId: string) => {
    saveSettings({
      dismissedPlantoes: settings.dismissedPlantoes.filter(id => id !== plantaoId)
    });
  }, [settings.dismissedPlantoes, saveSettings]);

  // Verificar notificações automaticamente
  useEffect(() => {
    if (!loading && upcomingPlantoes.length > 0) {
      const timer = setTimeout(() => {
        showPlantaoNotifications();
      }, 2000); // Aguardar 2 segundos após carregar

      return () => clearTimeout(timer);
    }
  }, [loading, upcomingPlantoes.length, showPlantaoNotifications]);

  // Limpar plantões dispensados antigos (mais de 7 dias)
  useEffect(() => {
    const today = new Date();
    const validDismissed = settings.dismissedPlantoes.filter(plantaoId => {
      const dateMatch = plantaoId.match(/plantao-(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const plantaoDate = parseISO(dateMatch[1]);
        return differenceInDays(today, plantaoDate) <= 7;
      }
      return false;
    });

    if (validDismissed.length !== settings.dismissedPlantoes.length) {
      saveSettings({ dismissedPlantoes: validDismissed });
    }
  }, [settings.dismissedPlantoes, saveSettings]);

  return {
    // Estados
    upcomingPlantoes,
    todayPlantoes,
    tomorrowPlantoes,
    urgentPlantoes,
    settings,
    loading,

    // Métodos
    saveSettings,
    dismissPlantao,
    restorePlantao,
    showPlantaoNotifications,

    // Estatísticas
    stats: {
      total: upcomingPlantoes.length,
      today: todayPlantoes.length,
      tomorrow: tomorrowPlantoes.length,
      urgent: urgentPlantoes.length,
      dismissed: settings.dismissedPlantoes.length
    }
  };
};