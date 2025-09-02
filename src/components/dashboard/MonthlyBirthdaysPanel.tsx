import { Gift, Calendar, Users, AlertCircle } from 'lucide-react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const MonthlyBirthdaysPanel = () => {
  const currentMonth = new Date();
  const { data: calendarEvents, isLoading } = useCalendarEvents(currentMonth);

  // Filtrar apenas aniversários do mês atual
  const birthdays = (calendarEvents || [])
    .filter(event => event.type === 'aniversario')
    .map(event => ({
      id: event.id,
      name: event.title,
      date: parseISO(event.date),
      dateStr: event.date
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (isLoading) {
    return (
      <ModernCard variant="glass">
        <ModernCardHeader
          title="Aniversariantes"
          description="Carregando..."
          icon={<Gift className="h-5 w-5 text-white" />}
        />
        <ModernCardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="glass">
      <ModernCardHeader
        title="Aniversariantes"
        description={format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        icon={<Gift className="h-5 w-5 text-white" />}
      />
      <ModernCardContent>
        {birthdays.length > 0 ? (
          <div className="space-y-4">
            {/* Contador */}
            <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 rounded-xl border border-pink-200 dark:border-pink-700">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="text-2xl font-bold text-pink-800 dark:text-pink-200">
                  {birthdays.length}
                </span>
              </div>
              <div className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                Aniversariante{birthdays.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Lista de aniversariantes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {birthdays.slice(0, 8).map((birthday) => {
                const isToday_ = isToday(birthday.date);
                
                return (
                  <div
                    key={birthday.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                      isToday_ 
                        ? "bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300 dark:from-pink-900/50 dark:to-rose-800/50 dark:border-pink-600"
                        : "bg-card/60 backdrop-blur-sm border-border/20 hover:bg-card/80"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full",
                      isToday_ ? "bg-pink-500" : "bg-pink-400"
                    )}>
                      <Gift className="h-3 w-3 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isToday_ ? "text-pink-900 dark:text-pink-100" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {birthday.name}
                        </span>
                        {isToday_ && (
                          <Badge variant="secondary" className="bg-pink-500 text-white text-xs">
                            Hoje!
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(birthday.date, 'dd/MM', { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {birthdays.length > 8 && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  +{birthdays.length - 8} mais aniversariante{birthdays.length - 8 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <div className="text-sm text-muted-foreground">
              Nenhum aniversário este mês
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};