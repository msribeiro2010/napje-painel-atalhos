import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Calendar, 
  Clock, 
  Gift, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Trash2,
  Edit,
  Bell,
  ExternalLink,
  BookOpen,
  Video,
  Users,
  Sparkles
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useEventReminders } from '@/hooks/useEventReminders';
import { EditCustomEventDialog } from '@/components/EditCustomEventDialog';
import { format, parseISO, isAfter, startOfDay, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const EVENT_ICONS = {
  curso: <BookOpen className="h-4 w-4 text-blue-600" />,
  webinario: <Video className="h-4 w-4 text-purple-600" />,
  reuniao: <Users className="h-4 w-4 text-green-600" />,
  outro: <Sparkles className="h-4 w-4 text-amber-600" />,
};

const EVENT_COLORS = {
  curso: 'bg-blue-100 text-blue-800 border-blue-200',
  webinario: 'bg-purple-100 text-purple-800 border-purple-200',
  reuniao: 'bg-green-100 text-green-800 border-green-200',
  outro: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const EventsManagementDialog = () => {
  const { 
    pastEvents, 
    restoreEvent, 
    updateEventStatus,
    stats,
    settings,
    updateSettings
  } = useEventNotifications();
  
  const currentMonth = new Date();
  const { customEvents, updateCustomEvent, removeCustomEvent } = useCustomEvents(currentMonth);
  const { createManualReminder, upcomingEventsCount } = useEventReminders();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filtrar eventos futuros
  const futureEvents = customEvents.filter(event => {
    const eventDate = parseISO(event.date);
    return isAfter(eventDate, startOfDay(new Date()));
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getEventIcon = (type: 'feriado' | 'aniversario') => {
    return type === 'aniversario' ? 
      <Gift className="h-4 w-4" /> : 
      <Calendar className="h-4 w-4" />;
  };

  const getStatusIcon = (status: 'finished' | 'hidden') => {
    return status === 'finished' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <EyeOff className="h-4 w-4 text-gray-500" />;
  };

  const getStatusLabel = (status: 'finished' | 'hidden') => {
    return status === 'finished' ? 'Finalizado' : 'Oculto';
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatStatusDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const handleToggleShowPastEvents = () => {
    updateSettings({ showPastEvents: !settings.showPastEvents });
  };

  const handleHideEvent = (eventId: string) => {
    updateEventStatus(eventId, 'hidden');
  };

  // Funções para eventos futuros
  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir o evento "${eventTitle}"?`)) {
      try {
        await removeCustomEvent(eventId);
        toast.success('Evento excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir evento');
      }
    }
  };

  const handleSetReminder = (event: any) => {
    const eventDate = parseISO(event.date);
    const now = new Date();
    
    if (isAfter(eventDate, now)) {
      // Criar lembrete para 2 horas antes do evento (ou agora se for muito próximo)
      const reminderTime = addHours(eventDate, -2);
      const finalReminderTime = isAfter(reminderTime, now) ? reminderTime : now;
      
      createManualReminder(event.id, finalReminderTime);
    } else {
      toast.error('Não é possível criar lembrete para eventos passados');
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const formatEventTime = (startTime?: string, endTime?: string) => {
    if (!startTime && !endTime) return null;
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    if (startTime) return `${startTime}`;
    return null;
  };

  const totalEvents = stats.past + futureEvents.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 hover:bg-white transition-all duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Gerenciar Eventos
            <Badge className="ml-2 bg-blue-100 text-blue-800">{totalEvents}</Badge>
            {upcomingEventsCount > 0 && (
              <Badge className="ml-1 bg-red-100 text-red-800 animate-pulse">
                {upcomingEventsCount} 🔔
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Gerenciar Eventos
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="future" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="future" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Eventos Futuros
                <Badge className="ml-1 bg-blue-100 text-blue-800">{futureEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Eventos Passados
                <Badge className="ml-1 bg-gray-100 text-gray-800">{stats.past}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Aba de Eventos Futuros */}
            <TabsContent value="future" className="space-y-4 mt-4">
              {futureEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum evento futuro encontrado.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use o botão "Adicionar Evento" no calendário para criar novos eventos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {futureEvents.map((event) => (
                    <Card key={event.id} className="hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full bg-white border-2 ${EVENT_COLORS[event.type as keyof typeof EVENT_COLORS].replace('bg-', 'border-').replace('-100', '-200')}`}>
                              {EVENT_ICONS[event.type as keyof typeof EVENT_ICONS]}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate">{event.title}</h3>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${EVENT_COLORS[event.type as keyof typeof EVENT_COLORS]}`}
                                >
                                  {event.type}
                                </Badge>
                              </div>
                              
                              {event.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatEventDate(event.date)}</span>
                                </div>
                                
                                {formatEventTime(event.start_time, event.end_time) && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatEventTime(event.start_time, event.end_time)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetReminder(event)}
                              className="h-8 w-8 p-0"
                              title="Criar lembrete"
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                            
                            {event.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenUrl(event.url!)}
                                className="h-8 w-8 p-0"
                                title="Abrir link"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(event)}
                              className="h-8 w-8 p-0"
                              title="Editar evento"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(event.id, event.title)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir evento"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba de Eventos Passados */}
            <TabsContent value="past" className="space-y-4 mt-4">
              {/* Estatísticas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Resumo</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleShowPastEvents}
                        className="h-6 px-2 text-xs"
                      >
                        {settings.showPastEvents ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {settings.showPastEvents ? 'Ocultar no calendário' : 'Mostrar no calendário'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {stats.finished} Finalizado{stats.finished !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        {stats.hidden} Oculto{stats.hidden !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {stats.past} Total
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de eventos passados */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium">Histórico de Eventos</h4>
                
                {pastEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-sm text-muted-foreground">
                      Nenhum evento passado encontrado.
                    </p>
                  </div>
                ) : (
                  pastEvents.map((event: any) => (
                    <Card key={event.id} className="hover:bg-gray-50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              event.type === 'aniversario' 
                                ? 'bg-pink-100 text-pink-600' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {getEventIcon(event.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{event.title}</p>
                                {getStatusIcon(event.status.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">{event.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatEventDate(event.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {getStatusLabel(event.status.status)}
                            </Badge>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreEvent(event.id)}
                                className="h-6 px-2"
                                title="Restaurar evento"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              
                              {event.status.status === 'finished' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleHideEvent(event.id)}
                                  className="h-6 px-2"
                                  title="Ocultar evento"
                                >
                                  <EyeOff className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Data de finalização/ocultação */}
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            {event.status.status === 'finished' && event.status.finishedAt && (
                              <>Finalizado em: {formatStatusDate(event.status.finishedAt)}</>
                            )}
                            {event.status.status === 'hidden' && event.status.hiddenAt && (
                              <>Ocultado em: {formatStatusDate(event.status.hiddenAt)}</>
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Dicas */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-lg">💡</div>
                    <div>
                      <p className="text-xs font-medium text-blue-800 mb-1">
                        Dica sobre Eventos Passados
                      </p>
                      <p className="text-xs text-blue-700">
                        Eventos finalizados são ocultados automaticamente após {settings.autoHideAfterHours} horas. 
                        Use o botão "Restaurar" para reativar um evento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EditCustomEventDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={editingEvent}
        onUpdate={updateCustomEvent}
      />
    </>
  );
};