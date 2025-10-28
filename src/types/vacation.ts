// Tipos para Sistema de Gestão de Férias

export type VacationType = 'regular' | 'recesso' | 'licenca' | 'abono';
export type VacationStatus = 'planejada' | 'aprovada' | 'em_andamento' | 'concluida' | 'cancelada';
export type AlertType = '30_days_before' | '7_days_before' | '1_day_before' | 'starts_today' | 'ends_today' | 'ended_yesterday';

export interface VacationPeriod {
  id: string;
  user_id: string;
  start_date: string; // ISO date format
  end_date: string;
  type: VacationType;
  status: VacationStatus;
  days_count?: number; // Computed by database
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VacationBalance {
  id: string;
  user_id: string;
  total_days: number;
  used_days: number;
  available_days?: number; // Computed by database
  reference_year: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VacationAlert {
  id: string;
  vacation_id: string;
  user_id: string;
  alert_type: AlertType;
  alert_date: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  // Dados do período de férias (para exibição)
  vacation?: VacationPeriod;
}

export interface VacationStatistics {
  user_id: string;
  total_vacations: number;
  total_days_used: number;
  planned_vacations: number;
  ongoing_vacations: number;
  next_vacation_start?: string;
}

export interface CreateVacationDTO {
  start_date: string;
  end_date: string;
  type: VacationType;
  notes?: string;
}

export interface UpdateVacationDTO extends Partial<CreateVacationDTO> {
  status?: VacationStatus;
}

// Labels e configurações para UI
export const vacationTypeLabels: Record<VacationType, { label: string; color: string; icon: string }> = {
  regular: {
    label: 'Férias Regulares',
    color: 'bg-gradient-to-br from-amber-400 to-orange-500',
    icon: '🌴', // Palmeira
  },
  recesso: {
    label: 'Recesso',
    color: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    icon: '🏖️', // Praia
  },
  licenca: {
    label: 'Licença',
    color: 'bg-gradient-to-br from-purple-400 to-pink-500',
    icon: '🏥', // Hospital
  },
  abono: {
    label: 'Abono Pecuniário',
    color: 'bg-gradient-to-br from-green-400 to-emerald-500',
    icon: '💰', // Dinheiro
  },
};

export const vacationStatusLabels: Record<VacationStatus, { label: string; color: string }> = {
  planejada: {
    label: 'Planejada',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  aprovada: {
    label: 'Aprovada',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  concluida: {
    label: 'Concluída',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export const alertTypeMessages: Record<AlertType, { title: string; message: string; icon: string }> = {
  '30_days_before': {
    title: 'Férias se Aproximam!',
    message: 'Suas férias começam em 30 dias. Hora de se preparar! 🎉',
    icon: '📅',
  },
  '7_days_before': {
    title: 'Férias em Breve',
    message: 'Faltam apenas 7 dias para suas férias! Prepare-se! 🌴',
    icon: '⏰',
  },
  '1_day_before': {
    title: 'Amanhã Começa!',
    message: 'Amanhã começam suas férias! Aproveite muito! ☀️',
    icon: '🎊',
  },
  'starts_today': {
    title: 'Boas Férias!',
    message: 'Hoje começam suas férias! Desfrute cada momento! 🏖️',
    icon: '🌴',
  },
  'ends_today': {
    title: 'Último Dia',
    message: 'Hoje é o último dia de suas férias. Aproveite! 🌅',
    icon: '⏳',
  },
  'ended_yesterday': {
    title: 'Bem-Vindo de Volta!',
    message: 'Suas férias terminaram. Esperamos que tenha aproveitado! 💼',
    icon: '👋',
  },
};

// Helper functions
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos os dias
  return diffDays;
};

export const isVacationActive = (vacation: VacationPeriod): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return vacation.start_date <= today && vacation.end_date >= today && vacation.status === 'em_andamento';
};

export const getDaysUntilVacation = (vacation: VacationPeriod): number => {
  const today = new Date();
  const start = new Date(vacation.start_date);
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getDaysRemainingInVacation = (vacation: VacationPeriod): number => {
  const today = new Date();
  const end = new Date(vacation.end_date);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
