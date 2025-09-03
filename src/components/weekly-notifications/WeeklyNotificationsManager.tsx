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
      selectedDays: [],
      isWeekdayRange: false,
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

  const handleSubmit = async (e: React.FormEvent | any) => {
    e.preventDefault();
    
    // Tentar pegar formData atualizado do evento, se disponível
    const currentFormData = (e.target?.formData) || formData;
    
    console.log('FormData recebido:', currentFormData); // Debug
    console.log('É weekday range?', currentFormData.isWeekdayRange); // Debug
    
    // Validação mais flexível - só precisa de título e mensagem
    if (!currentFormData.titulo.trim() || !currentFormData.mensagem.trim()) {
      return;
    }

    try {
      // Se for período seg-sex, criar uma notificação para cada dia
      if (currentFormData.isWeekdayRange) {
        const weekdays = [1, 2, 3, 4, 5]; // Segunda a Sexta
        
        if (editingNotification) {
          // Para edição de uma notificação existente para período seg-sex:
          // 1. Excluir a notificação original
          console.log('Convertendo notificação única para período seg-sex. Excluindo original...'); // Debug
          await deleteNotification(editingNotification.id);
          
          // 2. Criar 5 novas notificações (uma para cada dia)
          console.log('Criando 5 notificações para seg-sex (edição)...'); // Debug
          for (const day of weekdays) {
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const notificationData = {
              titulo: `${currentFormData.titulo.trim()} - ${dayNames[day]}`,
              mensagem: currentFormData.mensagem.trim(),
              ativo: currentFormData.ativo,
              dayofweek: day,
              time: currentFormData.time
            };
            console.log(`Criando notificação para ${dayNames[day]} (edição):`, notificationData); // Debug
            await createNotification(notificationData);
          }
        } else {
          // Para criação, criar uma notificação para cada dia da semana
          console.log('Criando notificações para seg-sex (nova)...'); // Debug
          for (const day of weekdays) {
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const notificationData = {
              titulo: `${currentFormData.titulo.trim()} - ${dayNames[day]}`,
              mensagem: currentFormData.mensagem.trim(),
              ativo: currentFormData.ativo,
              dayofweek: day,
              time: currentFormData.time
            };
            console.log(`Criando notificação para ${dayNames[day]} (nova):`, notificationData); // Debug
            await createNotification(notificationData);
          }
        }
      } else {
        // Lógica normal para dias individuais
        const sortedDays = (currentFormData.selectedDays || [currentFormData.dayofweek]).sort((a, b) => a - b);
        console.log('Criando notificações para dias individuais:', sortedDays); // Debug
        
        if (editingNotification) {
          // Verificar se a notificação sendo editada fazia parte de um grupo seg-sex
          const baseTitle = editingNotification.titulo.replace(/ - (Seg|Ter|Qua|Qui|Sex|Sáb|Dom)$/, '');
          const relatedNotifications = notifications.filter(n => 
            n.id !== editingNotification.id && 
            n.titulo.startsWith(baseTitle) && 
            n.titulo.match(/ - (Seg|Ter|Qua|Qui|Sex|Sáb|Dom)$/)
          );
          
          if (relatedNotifications.length > 0) {
            console.log(`Detectado grupo seg-sex relacionado (${relatedNotifications.length} notificações). Excluindo...`); // Debug
            // Excluir todas as notificações relacionadas do grupo
            for (const related of relatedNotifications) {
              await deleteNotification(related.id);
            }
          }
          
          await updateNotification(editingNotification.id, {
            titulo: currentFormData.titulo.trim(),
            mensagem: currentFormData.mensagem.trim(),
            ativo: currentFormData.ativo,
            dayofweek: sortedDays[0] || 1,
            time: currentFormData.time
          });
        } else {
          // Criar uma notificação para cada dia selecionado
          for (const day of sortedDays) {
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const suffix = sortedDays.length > 1 ? ` - ${dayNames[day]}` : '';
            const notificationData = {
              titulo: `${currentFormData.titulo.trim()}${suffix}`,
              mensagem: currentFormData.mensagem.trim(),
              ativo: currentFormData.ativo,
              dayofweek: day,
              time: currentFormData.time
            };
            console.log(`Criando notificação para ${dayNames[day]}:`, notificationData); // Debug
            await createNotification(notificationData);
          }
        }
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
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Notificações Semanais
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
              Configure lembretes automáticos para dias específicos da semana.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status e Controles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status das Notificações */}
              <Card className="border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {activeNotifications.length} ativas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {notifications.length - activeNotifications.length} inativas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Sistema Global</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                        disabled={isLoading}
                      />
                      <Label className="text-sm font-medium">
                        {settings.enabled ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ações Rápidas */}
              <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">Ações Rápidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCreate}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova
                    </Button>
                    <Button
                      onClick={() => {
                        if (activeNotifications.length > 0) {
                          testNotification(activeNotifications[0]);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!settings.enabled || activeNotifications.length === 0}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Testar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Notificações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Suas Notificações
                  <Badge variant="outline" className="ml-2">
                    {notifications.length}
                  </Badge>
                </h3>
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
                <div className="space-y-3">
                  {(notifications || []).sort((a, b) => a.dayofweek - b.dayofweek).map((notification) => {
                    const isActive = notification.ativo;
                    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    const dayName = dayLabels[notification.dayofweek] || 'N/A';

                    return (
                      <Card key={notification.id} className={cn(
                        "transition-all duration-200 hover:shadow-md border-l-4",
                        isActive 
                          ? "border-l-green-500 border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20" 
                          : "border-l-gray-400 border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 font-roboto">
                                  {(() => {
                                    // Remover duplicação de dias no título (ex: "Relatório - Seg - Ter" → "Relatório - Ter")
                                    const titulo = notification.titulo;
                                    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                                    const currentDay = dayLabels[notification.dayofweek] || 'N/A';
                                    
                                    // Padrão para capturar e usar o segundo dia (correto)
                                    const anyDayPattern = / - (Dom|Seg|Ter|Qua|Qui|Sex|Sáb) - (Dom|Seg|Ter|Qua|Qui|Sex|Sáb)$/;
                                    const match = titulo.match(anyDayPattern);
                                    if (match) {
                                      // Usar o segundo dia capturado (match[2]) que é o correto
                                      return titulo.replace(anyDayPattern, ` - ${match[2]}`);
                                    }
                                    
                                    return titulo;
                                  })()}
                                </h4>
                                <Badge variant={isActive ? "default" : "secondary"} className={cn(
                                  "text-xs",
                                  isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                                )}>
                                  {isActive ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm font-roboto">
                                {notification.mensagem}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-purple-700 dark:text-purple-300 font-roboto">
                                    {notification.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-blue-700 dark:text-blue-300 font-roboto">
                                    {dayName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => handleToggleNotification(notification)}
                                disabled={isLoading}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(notification)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir a notificação "{notification.titulo}"?
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