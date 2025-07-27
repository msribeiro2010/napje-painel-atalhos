import { useState } from 'react';
import { Bell, Plus, Settings, TestTube, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    ativo: true,
    dayofweek: 1,
    time: '09:00'
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
      ativo: notification.ativo || false,
      dayofweek: notification.dayofweek || 1, // Default to Monday
      time: notification.time || '09:00'
    });
    setIsNotificationDialogOpen(true);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called with formData:', formData);
    console.log('editingNotification:', editingNotification);
    
    try {
      const success = await saveNotification(formData, editingNotification?.id);
      console.log('saveNotification result:', success);
      
      if (success) {
        setIsNotificationDialogOpen(false);
        setEditingNotification(null);
        setFormData({ titulo: '', mensagem: '', ativo: true, dayofweek: 1, time: '09:00' });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleCancel = () => {
    setIsNotificationDialogOpen(false);
    setEditingNotification(null);
    setFormData({ titulo: '', mensagem: '', ativo: true, dayofweek: 1, time: '09:00' });
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
            className={cn(
              "flex items-center gap-2 transition-all duration-200 hover:shadow-md",
              settings.enabled && activeNotifications.length > 0 && "border-blue-200 bg-blue-50 hover:bg-blue-100"
            )}
          >
            <div className="relative">
              <Bell className="h-4 w-4" />
              {settings.enabled && activeNotifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            Notificações Semanais
            {settings.enabled && activeNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                {activeNotifications.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Notificações Semanais
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1">
                    Configure lembretes automáticos para procedimentos importantes
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.enabled ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm">
                  {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configurações Gerais */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors duration-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-md shadow-sm">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full transition-colors duration-200",
                      settings.enabled ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {settings.enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="enable-notifications" className="text-base font-medium cursor-pointer">
                        Ativar Notificações Semanais
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receba lembretes automáticos sobre procedimentos importantes
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enabled}
                    onCheckedChange={(checked) => saveSettings({ ...settings, enabled: checked })}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                
                {settings.enabled && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Configurações de Agendamento
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Dia da Semana
                        </Label>
                        <Select 
                          value={settings.dayofweek?.toString() || '1'}
                onValueChange={(value) => saveSettings({ ...settings, dayofweek: parseInt(value) })}
                        >
                          <SelectTrigger className="h-11 border-2 hover:border-blue-300 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()} className="py-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  {day.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-green-500" />
                          Horário
                        </Label>
                        <Select 
                          value={settings.time} 
                          onValueChange={(value) => saveSettings({ ...settings, time: value })}
                        >
                          <SelectTrigger className="h-11 border-2 hover:border-green-300 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time.value} value={time.value} className="py-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-500" />
                                  {time.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">
                          Próxima notificação: {dayOptions.find(d => d.value === (settings.dayofweek || 1))?.label || 'Dia não definido'} às {settings.time || '09:00'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Notificações */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors duration-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-md shadow-sm">
                      <Bell className="h-4 w-4 text-purple-600" />
                    </div>
                    Suas Notificações
                    <Badge variant="outline" className="ml-2 bg-white">
                      {notifications.length}
                    </Badge>
                  </CardTitle>
                  <Button 
                    onClick={() => setIsNotificationDialogOpen(true)}
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Notificação
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando notificações...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Bell className="h-10 w-10 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma notificação ainda</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Crie sua primeira notificação semanal para receber lembretes automáticos sobre procedimentos importantes.
                    </p>
                    <Button 
                      onClick={() => setIsNotificationDialogOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira notificação
                    </Button>
                  </div>
                ) : (
                  <div className={cn(
                    "grid gap-4",
                    notifications.length === 1 ? "grid-cols-1" :
                    notifications.length === 2 ? "grid-cols-1 lg:grid-cols-2" :
                    "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                  )}>
                    {notifications.map((notification, index) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "group relative p-5 border-2 rounded-xl transition-all duration-200 hover:shadow-lg",
                          notification.ativo 
                            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300" 
                            : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-300"
                        )}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            notification.ativo ? "bg-green-100" : "bg-gray-100"
                          )}>
                            {notification.ativo ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <Badge 
                            variant={notification.ativo ? "default" : "secondary"}
                            className={cn(
                              "transition-all duration-200",
                              notification.ativo 
                                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                          >
                            {notification.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                            {notification.titulo}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {notification.mensagem}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="text-xs text-muted-foreground">
                            Criado em {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(notification)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a notificação "{notification.titulo}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(notification.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
                    Próxima notificação: {dayOptions.find(d => d.value === settings.dayofweek)?.label || 'Dia não definido'} às {settings.time}
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