import { useState, useEffect } from 'react';
import { Bell, Plus, Settings, TestTube, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeeklyNotificationsManager, WeeklyNotification, WeeklyNotificationFormData } from '@/hooks/useWeeklyNotificationsManager';
import { WeeklyNotificationDialog } from './WeeklyNotificationDialog';
import { WeeklyPlanningModal } from './WeeklyPlanningModal';
import { useWeeklyPlanningLazy } from '@/hooks/useWeeklyPlanningLazy';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export const WeeklyNotificationsManager = () => {
  const {
    notifications,
    settings,
    isLoading,
    createNotification,
    updateNotification,
    deleteNotification,
    updateSettings,
    testNotification
  } = useWeeklyNotificationsManager();

  // Usar o hook lazy para carregar dados apenas quando necessário
  const { data: weeklyData, loading: planningLoading, error: planningError, loadWeeklyData, reset } = useWeeklyPlanningLazy();
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  

  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<WeeklyNotification | null>(null);
  const [formData, setFormData] = useState<WeeklyNotificationFormData>({
    titulo: '',
    mensagem: '',
    ativo: true,
    dayofweek: 1, // Segunda-feira por padrão
    selectedDays: [1, 2, 3, 4, 5], // Segunda a sexta por padrão
    isWeekdayRange: true, // Período seg-sex ativo por padrão
    time: '09:00'
  });

  const activeNotifications = (notifications || []).filter(n => n.ativo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  // Show service unavailable message if no notifications and not loading
  if (!isLoading && (!notifications || notifications.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notificações Semanais</h2>
            <p className="text-muted-foreground">
              Configure notificações para serem exibidas em dias específicos da semana
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Notificação
          </Button>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
          <p className="text-muted-foreground mb-4">
            O serviço pode estar temporariamente indisponível ou você ainda não criou nenhuma notificação.
          </p>
          <Button 
             variant="outline" 
             onClick={fetchNotifications}
             className="mr-2"
           >
             <RefreshCw className="mr-2 h-4 w-4" />
             Tentar Novamente
           </Button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      mensagem: '',
      ativo: true,
      dayofweek: 1,
      selectedDays: [1, 2, 3, 4, 5], // Segunda a sexta por padrão
      isWeekdayRange: true,
      time: '09:00'
    });
    setEditingNotification(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsNotificationDialogOpen(true);
  };

  const handleEdit = (notification: WeeklyNotification) => {
    setEditingNotification(notification);
    setFormData({
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      ativo: notification.ativo,
      dayofweek: notification.dayofweek,
      selectedDays: notification.selectedDays || [notification.dayofweek],
      isWeekdayRange: notification.isWeekdayRange || false,
      time: notification.time
    });
    setIsNotificationDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação mais flexível - só precisa de título e mensagem
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      return;
    }

    try {
      const notificationData = {
        titulo: formData.titulo.trim(),
        mensagem: formData.mensagem.trim(),
        ativo: formData.ativo,
        dayofweek: formData.selectedDays[0] || 0,
        selectedDays: formData.selectedDays || [],
        isWeekdayRange: formData.isWeekdayRange || false,
        time: formData.time
      };

      if (editingNotification) {
        await updateNotification(editingNotification.id, notificationData);
      } else {
        await createNotification(notificationData);
      }
      
      setIsNotificationDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  };

  const handleCancel = () => {
    setIsNotificationDialogOpen(false);
    resetForm();
  };

  const handleToggleNotification = async (notification: WeeklyNotification) => {
    await updateNotification(notification.id, {
      ...notification,
      ativo: !notification.ativo
    });
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-950",
                "dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
                settings.enabled && activeNotifications.length > 0 && "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/40"
              )}
            >
              <div className="relative">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {settings.enabled && activeNotifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="font-medium">Notificações Semanais</span>
              {settings.enabled && activeNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:text-white dark:border-green-500">
                  {activeNotifications.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
        </Dialog>
        
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!weeklyData) {
              await loadWeeklyData();
            }
            setIsPlanningModalOpen(true);
          }}
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:bg-green-50 dark:hover:bg-green-950 border-green-200 hover:border-green-300 dark:border-green-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
          disabled={planningLoading}
        >
          {planningLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
          ) : (
            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <span className="font-medium">
            {planningLoading ? 'Carregando...' : 'Planejamento Semanal'}
          </span>
        </Button>
      </div>
      
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Gerenciar Notificações Semanais
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
              Configure suas notificações semanais para receber lembretes importantes.
            </DialogDescription>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  {activeNotifications.length} ativa{activeNotifications.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {notifications.length - activeNotifications.length} inativa{notifications.length - activeNotifications.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configurações Globais */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Configurações Globais</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Ativar ou desativar todas as notificações semanais
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                  disabled={isLoading}
                />
                <Label className="text-sm font-medium">
                  {settings.enabled ? 'Ativado' : 'Desativado'}
                </Label>
              </div>
            </div>

            {settings.enabled && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Sistema de notificações ativo
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    As notificações serão enviadas conforme configurado
                  </p>
                </div>
              </div>
            )}

            {/* Lista de Notificações */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Suas Notificações</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {notifications.length > 0 
                        ? `${notifications.length} notificação${notifications.length > 1 ? 'ões' : ''} configurada${notifications.length > 1 ? 's' : ''}`
                        : 'Nenhuma notificação configurada'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Nova Notificação
                </Button>
              </div>

              {notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md">
                    <div className="mx-auto mb-6">
                      <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors duration-200 dark:border-gray-700 dark:hover:border-purple-500">
                        <CardContent className="text-center py-16">
                          <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
                            <Bell className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Nenhuma notificação configurada</h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto dark:text-gray-300">
                            Crie sua primeira notificação semanal para receber lembretes importantes em dias específicos da semana.
                          </p>
                          <Button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Notificação
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {(notifications || []).map((notification) => {
                    const isActive = notification.ativo;
                    const dayNames = {
                      'segunda': 'Seg',
                      'terca': 'Ter', 
                      'quarta': 'Qua',
                      'quinta': 'Qui',
                      'sexta': 'Sex',
                      'sabado': 'Sáb',
                      'domingo': 'Dom'
                    };

                    return (
                      <Card key={notification.id} className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        isActive ? "border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20" : "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                      )}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={cn(
                                "p-2 rounded-lg",
                                isActive ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
                              )}>
                                <Bell className={cn(
                                  "h-5 w-5",
                                  isActive ? "text-green-600 dark:text-green-400" : "text-gray-400"
                                )} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    {notification.titulo}
                                  </h4>
                                  <Badge variant={isActive ? "default" : "secondary"} className={cn(
                                    isActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-400 text-white"
                                  )}>
                                    {isActive ? 'Ativa' : 'Inativa'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                  {notification.mensagem}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-purple-700 dark:text-purple-300">
                                    {notification.time}
                                  </span>
                                  <span className="text-gray-400 mx-2">•</span>
                                  <span className="font-medium text-purple-700 dark:text-purple-300">
                                    {(notification.selectedDays || []).map(dia => {
                                      const dayName = Object.keys(dayNames)[dia] as keyof typeof dayNames;
                                      return dayNames[dayName];
                                    }).join(', ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => handleToggleNotification(notification)}
                                disabled={isLoading}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(notification)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seção de Teste */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {settings.enabled ? (
                  <span>
                    {activeNotifications.length > 0 
                      ? `${activeNotifications.length} notificação${activeNotifications.length > 1 ? 'ões' : ''} ativa${activeNotifications.length > 1 ? 's' : ''}`
                      : 'Nenhuma notificação ativa'
                    }
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
      
      {weeklyData && (
        <WeeklyPlanningModal
          isOpen={isPlanningModalOpen}
          onClose={() => {
            setIsPlanningModalOpen(false);
            reset(); // Limpar dados ao fechar para economizar memória
          }}
          weeklyData={weeklyData}
        />
      )}
    </>
  );
};