import { useState } from 'react';
import { Bell, Clock, Settings, TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeeklyNotifications } from '@/hooks/useWeeklyNotifications';
import { WeeklyNotificationModal } from '@/components/weekly-notifications/WeeklyNotificationModal';

export const WeeklyNotificationSettings = () => {
  const {
    settings,
    updateSettings,
    notificationItems,
    fetchNotificationItems,
    forceNotification,
    getDayName,
    showModal,
    pendingNotifications,
    handleModalClose
  } = useWeeklyNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const timeOptions = [
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' },
    { value: '14:00', label: '14:00' },
    { value: '15:00', label: '15:00' },
    { value: '16:00', label: '16:00' },
  ];

  const dayOptions = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações
            {settings.enabled && (
              <Badge variant="secondary" className="ml-1">
                Ativo
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Notificações Semanais
            </DialogTitle>
            <DialogDescription>
              Configure lembretes automáticos para procedimentos importantes do sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status e Controle Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Status das Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications" className="text-base font-medium">
                      Ativar Notificações Semanais
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receba lembretes automáticos sobre procedimentos importantes
                    </p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enabled}
                    onCheckedChange={(enabled) => updateSettings({ enabled })}
                  />
                </div>
                
                {settings.enabled && (
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="notification-day">Dia da Semana</Label>
                        <Select 
                          value={settings.notificationDay.toString()} 
                          onValueChange={(value) => updateSettings({ notificationDay: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="notification-time">Horário</Label>
                        <Select 
                          value={settings.notificationTime} 
                          onValueChange={(time) => updateSettings({ notificationTime: time })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Próxima notificação:</span>
                        <span>{getDayName(settings.notificationDay)} às {settings.notificationTime}</span>
                      </div>
                      {settings.lastNotificationDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Última notificação: {new Date(settings.lastNotificationDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Itens Monitorados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Itens Monitorados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Itens da base de conhecimento que geram lembretes:
                  </p>
                  
                  {notificationItems.length > 0 ? (
                    <div className="space-y-2">
                      {notificationItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.titulo}</p>
                            {item.categoria && (
                              <Badge variant="outline" className="mt-1">
                                {item.categoria}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item configurado para notificação</p>
                      <p className="text-xs mt-1">
                        Configure notificações ao criar/editar itens na base de conhecimento
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Ações */}
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  fetchNotificationItems();
                }}
                variant="outline"
                className="flex-1"
              >
                Atualizar Lista
              </Button>
              
              <Button 
                onClick={forceNotification}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Testar Notificação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Notificações */}
      <WeeklyNotificationModal
        isOpen={showModal}
        onOpenChange={(open) => !open && handleModalClose()}
        notifications={pendingNotifications}
        onMarkAsRead={handleModalClose}
      />
    </>
  );
};