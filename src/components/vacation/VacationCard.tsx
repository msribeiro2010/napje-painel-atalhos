import { VacationPeriod, vacationTypeLabels, vacationStatusLabels, getDaysRemainingInVacation, isVacationActive } from '@/types/vacation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VacationCardProps {
  vacation: VacationPeriod;
  onEdit?: (vacation: VacationPeriod) => void;
  onDelete?: (vacation: VacationPeriod) => void;
  compact?: boolean;
}

export function VacationCard({ vacation, onEdit, onDelete, compact = false }: VacationCardProps) {
  const typeConfig = vacationTypeLabels[vacation.type];
  const statusConfig = vacationStatusLabels[vacation.status];
  const isActive = isVacationActive(vacation);
  const daysRemaining = isActive ? getDaysRemainingInVacation(vacation) : 0;

  const startDate = new Date(vacation.start_date);
  const endDate = new Date(vacation.end_date);

  if (compact) {
    // Versão compacta para o calendário
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative p-2 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg',
                typeConfig.color
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl drop-shadow-sm">{typeConfig.icon}</span>
                {isActive && daysRemaining > 0 && (
                  <span className="text-white text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full">
                    {daysRemaining}d
                  </span>
                )}
              </div>
              <p className="text-white text-xs mt-1 font-semibold drop-shadow-sm">
                {typeConfig.label}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeConfig.icon}</span>
                <span className="font-semibold">{typeConfig.label}</span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Início:</span>{' '}
                  {format(startDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p>
                  <span className="font-medium">Término:</span>{' '}
                  {format(endDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p>
                  <span className="font-medium">Total:</span> {vacation.days_count} dias
                </p>
                {isActive && (
                  <p className="text-amber-400 font-semibold">
                    {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                  </p>
                )}
              </div>
              {vacation.notes && (
                <p className="text-xs text-slate-300 italic border-t border-slate-600 pt-2">
                  {vacation.notes}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Versão completa para listas
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300',
        isActive && 'ring-2 ring-amber-400 ring-offset-2'
      )}
    >
      {/* Header colorido */}
      <div className={cn('h-2', typeConfig.color)} />

      <div className="p-4 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-xl text-white shadow-md', typeConfig.color)}>
              <span className="text-3xl">{typeConfig.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {typeConfig.label}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                {isActive && daysRemaining > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          {vacation.status !== 'concluida' && vacation.status !== 'cancelada' && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(vacation)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(vacation)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Informações de Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Data de Início</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {format(startDate, "dd/MM/yyyy")}
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {format(startDate, "EEEE", { locale: ptBR })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Data de Término</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {format(endDate, "dd/MM/yyyy")}
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {format(endDate, "EEEE", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Total de Dias */}
        <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {vacation.days_count}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {vacation.days_count === 1 ? 'dia' : 'dias'} de férias
            </p>
          </div>
        </div>

        {/* Observações */}
        {vacation.notes && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
              Observações:
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {vacation.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
