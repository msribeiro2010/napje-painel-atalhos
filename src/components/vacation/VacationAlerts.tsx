import { useState } from 'react';
import { useVacations } from '@/hooks/useVacations';
import { VacationAlert, alertTypeLabels } from '@/types/vacation';
import { Bell, BellRing, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VacationAlertsProps {
  compact?: boolean;
}

export function VacationAlerts({ compact = false }: VacationAlertsProps) {
  const { alerts, markAlertAsRead, dismissAlert, isMarkingRead, isDismissing } = useVacations();
  const [isOpen, setIsOpen] = useState(false);

  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];
  const unreadCount = unreadAlerts.length;

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  const handleDismiss = (alertId: string) => {
    dismissAlert(alertId);
  };

  const getAlertIcon = (alert: VacationAlert) => {
    const config = alertTypeLabels[alert.alert_type];
    return config.icon;
  };

  const getAlertColor = (alert: VacationAlert) => {
    const config = alertTypeLabels[alert.alert_type];
    return config.color;
  };

  // Versão compacta - apenas o sino com badge
  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`${unreadCount} alertas não lidos`}
          >
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            ) : (
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Alertas de Férias</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} novos</Badge>
              )}
            </div>
            <Separator />
            <ScrollArea className="h-[400px]">
              {alerts && alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'relative p-3 rounded-lg border transition-all duration-200',
                        alert.is_read
                          ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'
                      )}
                    >
                      {!alert.is_read && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getAlertIcon(alert)}</span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {alertTypeLabels[alert.alert_type].label}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {alert.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(alert.id)}
                            disabled={isMarkingRead}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDismiss(alert.id)}
                          disabled={isDismissing}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Dispensar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Nenhum alerta
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Você receberá alertas sobre suas férias aqui
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Versão completa - Card com lista de alertas
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-600" />
            Alertas de Férias
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} {unreadCount === 1 ? 'novo' : 'novos'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Fique atento aos avisos sobre seus períodos de férias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'relative p-4 rounded-lg border transition-all duration-200',
                  alert.is_read
                    ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-md'
                )}
              >
                {!alert.is_read && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">NOVO</span>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-xl shadow-md',
                    getAlertColor(alert)
                  )}>
                    <span className="text-3xl">{getAlertIcon(alert)}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {alertTypeLabels[alert.alert_type].label}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {format(new Date(alert.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {alert.is_read && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Lido
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {!alert.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                      disabled={isMarkingRead}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como lido
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    disabled={isDismissing}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dispensar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Bell className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Nenhum alerta no momento
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Você será notificado aqui sobre suas férias
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
