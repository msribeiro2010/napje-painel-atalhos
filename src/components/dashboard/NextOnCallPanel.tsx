import { Shield, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { useWorkCalendar } from '@/hooks/useWorkCalendar';
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export const NextOnCallPanel = () => {
  const { marks, loading } = useWorkCalendar(new Date());

  // Encontrar próximo plantão
  const nextOnCall = (() => {
    if (!marks) return null;
    
    const today = new Date();
    const onCallDates = Object.entries(marks)
      .filter(([_, status]) => status === 'plantao')
      .map(([dateStr, _]) => ({
        date: parseISO(dateStr),
        dateStr
      }))
      .filter(({ date }) => isAfter(date, today))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return onCallDates[0] || null;
  })();

  if (loading) {
    return (
      <ModernCard variant="glass">
        <ModernCardHeader
          title="Próximo Plantão"
          description="Verificando agenda..."
          icon={<Shield className="h-5 w-5 text-white" />}
        />
        <ModernCardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="glass">
      <ModernCardHeader
        title="Próximo Plantão"
        description="Agenda de plantões"
        icon={<Shield className="h-5 w-5 text-white" />}
      />
      <ModernCardContent>
        {nextOnCall ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-yellow-500 rounded-full">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                {format(nextOnCall.date, 'dd', { locale: ptBR })}
              </div>
              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                {format(nextOnCall.date, 'MMMM', { locale: ptBR })}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                {format(nextOnCall.date, 'EEEE', { locale: ptBR })}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(nextOnCall.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <div className="text-sm text-muted-foreground">
              Nenhum plantão agendado
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};