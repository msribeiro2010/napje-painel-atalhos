import { useState } from 'react';
import { Bell, Plus, Settings, TestTube, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeeklyNotificationsManager, WeeklyNotification, WeeklyNotificationFormData } from '@/hooks/useWeeklyNotificationsManager';
import { WeeklyNotificationDialog } from './WeeklyNotificationDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const WeeklyNotificationsManager = () => {
  const {
    notifications,
    isLoading,
    settings,
    saveSettings,
    saveNotification,
    deleteNotification,
    testNotification
  } = useWeeklyNotificationsManager();
  
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<WeeklyNotification | null>(null);
  const [formData, setFormData] = useState<WeeklyNotificationFormData>({
    titulo: '',
    mensagem: '',
    ativo: true
  });

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

  const activeNotifications = notifications.filter(n => n.ativo);

  const handleEdit = (notification: WeeklyNotification) => {
    setEditingNotification(notification);
    setFormData({
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      ativo: notification.ativo
    });
    setIsNotificationDialogOpen(true);
  };

  const handleSubmit = async () => {
    const success = await saveNotification(formData, editingNotification?.id);
    if (success) {
      setIsNotificationDialogOpen(false);
      setEditingNotification(null);
      setFormData({ titulo: '', mensagem: '', ativo: true });
    }
  };

  const handleCancel = () => {
    setIsNotificationDialogOpen(false);
    setEditingNotification(null);
    setFormData({ titulo: '', mensagem: '', ativo: true });
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  return (
    <>
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações Semanais
            {settings.enabled && activeNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeNotifications.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Gerenciar Notificações Semanais
            </DialogTitle>
            <DialogDescription>
              Configure lembretes automáticos para procedimentos importantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
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
                    onCheckedChange={(checked) => saveSettings({ ...settings, enabled: checked })}
                  />
                </div>
                
                {settings.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select 
                        value={settings.dayOfWeek.toString()} 
                        onValueChange={(value) => saveSettings({ ...settings, dayOfWeek: parseInt(value) })}
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
                    
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Select 
                        value={settings.time} 
                        onValueChange={(value) => saveSettings({ ...settings, time: value })}
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
                )}
              </CardContent>
            </Card>

            {/* Lista de Notificações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações ({notifications.length})
                  </CardTitle>
                  <Button 
                    onClick={() => setIsNotificationDialogOpen(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Notificação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando notificações...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhuma notificação cadastrada</p>
                    <Button 
                      onClick={() => setIsNotificationDialogOpen(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira notificação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="flex items-start justify-between p-4 border rounded-lg bg-card"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{notification.titulo}</h4>
                            <Badge variant={notification.ativo ? "default" : "secondary"}>
                              {notification.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.mensagem}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(notification)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(notification.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {settings.enabled ? (
                  <span>
                    Próxima notificação: {dayOptions.find(d => d.value === settings.dayOfWeek)?.label || 'Dia não definido'} às {settings.time}
                  </span>
                ) : (
                  <span>Notificações desabilitadas</span>
                )}
              </div>
              
              <Button 
                onClick={() => {
                  if (activeNotifications.length > 0) {
                    testNotification(activeNotifications[0]);
                  }
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!settings.enabled || activeNotifications.length === 0}
              >
                <TestTube className="h-4 w-4" />
                Testar Notificação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <WeeklyNotificationDialog
        isOpen={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
        editingNotification={editingNotification}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
};