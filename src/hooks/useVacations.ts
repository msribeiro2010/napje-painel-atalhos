import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  VacationPeriod,
  VacationBalance,
  VacationAlert,
  VacationStatistics,
  CreateVacationDTO,
  UpdateVacationDTO,
  vacationTypeLabels,
  alertTypeMessages,
} from '@/types/vacation';

export const useVacations = (year?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = year || new Date().getFullYear();

  // Buscar períodos de férias
  const { data: vacations = [], isLoading: loadingVacations, error: vacationsError } = useQuery({
    queryKey: ['vacations', user?.id, currentYear],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('vacation_periods')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', `${currentYear}-01-01`)
        .lte('end_date', `${currentYear}-12-31`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as VacationPeriod[];
    },
    enabled: !!user?.id,
  });

  // Buscar saldo de férias
  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ['vacation_balance', user?.id, currentYear],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('vacation_balance')
        .select('*')
        .eq('user_id', user.id)
        .eq('reference_year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignora erro se não encontrar
      return data as VacationBalance | null;
    },
    enabled: !!user?.id,
  });

  // Buscar alertas pendentes
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['vacation_alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('vacation_alerts')
        .select('*, vacation:vacation_periods(*)')
        .eq('user_id', user.id)
        .lte('alert_date', today)
        .eq('is_sent', false)
        .order('alert_date', { ascending: true });

      if (error) throw error;
      return data as VacationAlert[];
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch a cada minuto
  });

  // Buscar estatísticas
  const { data: statistics } = useQuery({
    queryKey: ['vacation_statistics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('vacation_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as VacationStatistics | null;
    },
    enabled: !!user?.id,
  });

  // Criar novo período de férias
  const createVacation = useMutation({
    mutationFn: async (data: CreateVacationDTO) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data: vacation, error } = await supabase
        .from('vacation_periods')
        .insert({
          user_id: user.id,
          ...data,
          status: 'planejada',
        })
        .select()
        .single();

      if (error) throw error;
      return vacation as VacationPeriod;
    },
    onSuccess: (vacation) => {
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_alerts'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_statistics'] });

      const type = vacationTypeLabels[vacation.type];
      toast.success(`${type.icon} Férias cadastradas com sucesso!`, {
        description: `Período: ${new Date(vacation.start_date).toLocaleDateString('pt-BR')} até ${new Date(vacation.end_date).toLocaleDateString('pt-BR')}`,
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao criar férias:', error);
      if (error.message.includes('no_overlap')) {
        toast.error('⚠️ Período conflitante', {
          description: 'Já existe um período de férias cadastrado para estas datas.',
        });
      } else {
        toast.error('Erro ao cadastrar férias', {
          description: error.message,
        });
      }
    },
  });

  // Atualizar período de férias
  const updateVacation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVacationDTO }) => {
      const { data: vacation, error } = await supabase
        .from('vacation_periods')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return vacation as VacationPeriod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_alerts'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_statistics'] });
      toast.success('✅ Férias atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar férias:', error);
      toast.error('Erro ao atualizar férias', {
        description: error.message,
      });
    },
  });

  // Excluir período de férias
  const deleteVacation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vacation_periods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_alerts'] });
      queryClient.invalidateQueries({ queryKey: ['vacation_statistics'] });
      toast.success('🗑️ Férias removidas com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao remover férias:', error);
      toast.error('Erro ao remover férias', {
        description: error.message,
      });
    },
  });

  // Marcar alerta como enviado
  const markAlertAsSent = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('vacation_alerts')
        .update({ is_sent: true, sent_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation_alerts'] });
    },
  });

  // Mostrar alertas pendentes
  const showPendingAlerts = () => {
    alerts.forEach((alert) => {
      const config = alertTypeMessages[alert.alert_type];
      const vacation = alert.vacation;

      if (!vacation) return;

      const type = vacationTypeLabels[vacation.type];

      toast.info(`${config.icon} ${config.title}`, {
        description: `${config.message}\n${type.label}: ${new Date(vacation.start_date).toLocaleDateString('pt-BR')} - ${new Date(vacation.end_date).toLocaleDateString('pt-BR')}`,
        duration: 8000,
      });

      // Marcar como enviado
      markAlertAsSent.mutate(alert.id);
    });
  };

  // Buscar férias para um mês específico
  const getVacationsForMonth = (month: Date) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();

    return vacations.filter(vacation => {
      const start = new Date(vacation.start_date);
      const end = new Date(vacation.end_date);

      return (
        (start.getFullYear() === year && start.getMonth() === monthNum) ||
        (end.getFullYear() === year && end.getMonth() === monthNum) ||
        (start < month && end > month)
      );
    });
  };

  // Buscar férias para uma data específica
  const getVacationForDate = (date: Date | string): VacationPeriod | null => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    return vacations.find(vacation => {
      return vacation.start_date <= dateStr && vacation.end_date >= dateStr && vacation.status !== 'cancelada';
    }) || null;
  };

  // Verificar se uma data está em período de férias
  const isDateInVacation = (date: Date | string): boolean => {
    return getVacationForDate(date) !== null;
  };

  return {
    // Dados
    vacations,
    balance,
    alerts,
    statistics,

    // Estados de carregamento
    loading: loadingVacations || loadingBalance || loadingAlerts,
    loadingVacations,
    loadingBalance,
    loadingAlerts,

    // Mutations
    createVacation: createVacation.mutate,
    updateVacation: updateVacation.mutate,
    deleteVacation: deleteVacation.mutate,
    markAlertAsSent: markAlertAsSent.mutate,

    // Estados das mutations
    isCreating: createVacation.isPending,
    isUpdating: updateVacation.isPending,
    isDeleting: deleteVacation.isPending,

    // Helpers
    showPendingAlerts,
    getVacationsForMonth,
    getVacationForDate,
    isDateInVacation,

    // Errors
    error: vacationsError,
  };
};
