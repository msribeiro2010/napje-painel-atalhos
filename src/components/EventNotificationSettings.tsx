import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Bell, 
  BellOff, 
  Clock, 
  Trash2, 
  RefreshCw,
  BarChart3,
  Calendar,
  Gift,
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { Separator } from '@/components/ui/separator';
import { EventNotificationAdvancedSettings } from './EventNotificationAdvancedSettings';

export const EventNotificationSettings = () => {
  const {
    settings,
    updateSettings,
    clearDismissedEvents,
    stats
  } = useEventNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const snoozeOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 480, label: '8 horas' }
  ];

  const autoHideOptions = [
    { value: 1, label: '1 hora' },
    { value: 2, label: '2 horas' },
    { value: 4, label: '4 horas' },
    { value: 8, label: '8 horas' },
    { value: 12, label: '12 horas' },
    { value: 24, label: '24 horas' }
  ];

  const getStatsColor = (type: 'urgent' | 'today' | 'total') => {
    switch (type) {
      case 'urgent':
        return stats.urgent > 0 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200';
      case 'today':
        return stats.today > 0 ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200';
      case 'total':
        return stats.total > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative bg-white/80 hover:bg-white transition-all duration-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Notificações
          {stats.urgent > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center animate-pulse">
              {stats.urgent}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            Configurações de Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <Badge className={getStatsColor('urgent')}>
                    {stats.urgent} Urgente{stats.urgent !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className={getStatsColor('today')}>
                    {stats.today} Hoje
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {stats.tomorrow} Amanhã
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className={getStatsColor('total')}>
                    {stats.total} Total
                  </Badge>
                </div>
              </div>
              
              {/* Estatísticas de eventos passados */}
              {stats.past > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        {stats.finished} Finalizado{stats.finished !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                        {stats.hidden} Oculto{stats.hidden !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        {stats.past} Passados
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      💡 Acesse "Eventos Passados" no cabeçalho para ver detalhes
                    </p>
                  </div>
                </div>
              )}
              
              {stats.dismissed > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {stats.dismissed} evento{stats.dismissed !== 1 ? 's' : ''} dispensado{stats.dismissed !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearDismissedEvents}
                      className="h-6 px-2 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Restaurar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Configurações de Notificação */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Preferências de Notificação</h4>
            
            <div className="space-y-4">
              {/* Modal para eventos urgentes */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Modal para Eventos Urgentes</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar popup para eventos hoje/amanhã
                  </p>
                </div>
                <Switch
                  checked={settings.showModalForUrgent}
                  onCheckedChange={(checked) => 
                    updateSettings({ showModalForUrgent: checked })
                  }
                />
              </div>

              {/* Toasts para todos os eventos */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Notificações Toast</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar avisos para todos os eventos
                  </p>
                </div>
                <Switch
                  checked={settings.showToastsForAll}
                  onCheckedChange={(checked) => 
                    updateSettings({ showToastsForAll: checked })
                  }
                />
              </div>

              {/* Mostrar eventos passados */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Mostrar Eventos Passados</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibir eventos finalizados no calendário
                  </p>
                </div>
                <Switch
                  checked={settings.showPastEvents}
                  onCheckedChange={(checked) => 
                    updateSettings({ showPastEvents: checked })
                  }
                />
              </div>

              {/* Tempo de snooze */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tempo de Adiamento</Label>
                <Select
                  value={settings.snoozeTime.toString()}
                  onValueChange={(value) => 
                    updateSettings({ snoozeTime: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {snoozeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tempo padrão para adiar notificações
                </p>
              </div>

              {/* Tempo para ocultar eventos finalizados */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Auto-ocultar Eventos Finalizados</Label>
                <Select
                  value={settings.autoHideAfterHours.toString()}
                  onValueChange={(value) => 
                    updateSettings({ autoHideAfterHours: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {autoHideOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tempo para ocultar eventos após finalizar
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status das notificações */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status Atual</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-xs">
                {settings.showModalForUrgent ? (
                  <Bell className="h-3 w-3 text-green-600" />
                ) : (
                  <BellOff className="h-3 w-3 text-gray-400" />
                )}
                <span className={settings.showModalForUrgent ? 'text-green-700' : 'text-gray-500'}>
                  Modais {settings.showModalForUrgent ? 'ativados' : 'desativados'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                {settings.showToastsForAll ? (
                  <Bell className="h-3 w-3 text-green-600" />
                ) : (
                  <BellOff className="h-3 w-3 text-gray-400" />
                )}
                <span className={settings.showToastsForAll ? 'text-green-700' : 'text-gray-500'}>
                  Toasts {settings.showToastsForAll ? 'ativados' : 'desativados'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {settings.showPastEvents ? (
                  <Eye className="h-3 w-3 text-blue-600" />
                ) : (
                  <EyeOff className="h-3 w-3 text-gray-400" />
                )}
                <span className={settings.showPastEvents ? 'text-blue-700' : 'text-gray-500'}>
                  Eventos passados {settings.showPastEvents ? 'visíveis' : 'ocultos'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-blue-700">
                  Adiamento: {settings.snoozeTime}min | Auto-ocultar: {settings.autoHideAfterHours}h
                </span>
              </div>
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="flex justify-center">
            <EventNotificationAdvancedSettings />
          </div>

          {/* Dicas */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="text-lg">💡</div>
                <div>
                  <p className="text-xs font-medium text-blue-800 mb-1">
                    Dica Inteligente
                  </p>
                  <p className="text-xs text-blue-700">
                    Configure as notificações de acordo com sua rotina. Eventos de hoje ficam ativos durante o dia, 
                    podem ser finalizados manualmente e são ocultados automaticamente após algumas horas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
