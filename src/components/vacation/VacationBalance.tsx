import { useVacations } from '@/hooks/useVacations';
import { Calendar, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationBalanceProps {
  year?: number;
  compact?: boolean;
}

export function VacationBalance({ year, compact = false }: VacationBalanceProps) {
  const { balance, statistics, loading } = useVacations(year);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDays = balance?.total_days || 30;
  const usedDays = balance?.used_days || 0;
  const availableDays = balance?.available_days || totalDays;
  const usagePercentage = (usedDays / totalDays) * 100;
  const hasExpiration = balance?.expires_at;

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (usagePercentage >= 90) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (usagePercentage >= 70) return <TrendingDown className="h-5 w-5 text-amber-500" />;
    return <TrendingUp className="h-5 w-5 text-green-500" />;
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Saldo de Férias {year}
            </span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Disponíveis</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {availableDays} dias
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" indicatorClassName={getProgressColor()} />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Usados: {usedDays}</span>
            <span>Total: {totalDays}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Saldo de Férias {year || new Date().getFullYear()}
        </CardTitle>
        <CardDescription>
          Acompanhe seus dias de férias disponíveis e utilizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalDays}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">dias/ano</p>
          </div>

          {/* Usados */}
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Usados</p>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{usedDays}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">dias</p>
          </div>

          {/* Disponíveis */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Disponíveis</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{availableDays}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">dias</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Utilização</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {usagePercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={usagePercentage} className="h-3" indicatorClassName={getProgressColor()} />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {usedDays} de {totalDays} dias utilizados
          </p>
        </div>

        {/* Alertas */}
        {usagePercentage >= 90 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Atenção! Você já utilizou mais de 90% dos seus dias de férias.
            </AlertDescription>
          </Alert>
        )}

        {availableDays > 0 && usagePercentage < 50 && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Você tem {availableDays} dias de férias disponíveis para usar!
            </AlertDescription>
          </Alert>
        )}

        {hasExpiration && (
          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Seus dias expiram em {format(new Date(balance.expires_at!), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas Adicionais */}
        {statistics && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Estatísticas
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <span className="text-xs text-slate-600 dark:text-slate-400">Total de períodos</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {statistics.total_vacations}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <span className="text-xs text-slate-600 dark:text-slate-400">Planejadas</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {statistics.planned_vacations}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <span className="text-xs text-slate-600 dark:text-slate-400">Em andamento</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {statistics.ongoing_vacations}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <span className="text-xs text-slate-600 dark:text-slate-400">Total de dias</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {statistics.total_days_used}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
