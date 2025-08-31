import { AniversariantesSection } from "@/components/AniversariantesSection";
import { FeriadosSection } from "@/components/FeriadosSection";
import { EventsManagementDialog } from "@/components/EventsManagementDialog";
import { CustomEventDialog } from "@/components/CustomEventDialog";
import { EditCustomEventDialog } from "@/components/EditCustomEventDialog";
import { useCustomEvents } from "@/hooks/useCustomEvents";
import { parseISO, isAfter, startOfDay, format, differenceInDays, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, BookOpen, Video, Users, Sparkles, TrendingUp, Plus, Eye, AlertCircle, Edit, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface EventsPanelsProps {
  className?: string;
}

export const EventsPanels = ({ className = "" }: EventsPanelsProps) => {
  const currentMonth = new Date();
  const navigate = useNavigate();

  // Função para navegar para uma data específica no calendário
  const navigateToCalendarDate = (date?: string) => {
    const targetDate = date ? new Date(date) : new Date();
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1; // getMonth() retorna 0-11
    navigate(`/calendario?year=${year}&month=${month}`);
  };
  const { customEvents, addCustomEvent, updateCustomEvent, removeCustomEvent } = useCustomEvents(currentMonth);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Funções para ações rápidas
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${eventTitle}"?`)) {
      try {
        await removeCustomEvent(eventId);
        toast.success('Evento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        toast.error('Erro ao excluir evento. Tente novamente.');
      }
    }
  };

  const handleUpdateEvent = async (id: string, eventData: any) => {
    try {
      await updateCustomEvent(id, eventData);
      toast.success('Evento atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento. Tente novamente.');
    }
  };
  
  // Filtrar e organizar eventos
  const today = new Date();
  
  // Verificar se customEvents está disponível
  const safeCustomEvents = customEvents || [];
  
  const upcomingEvents = safeCustomEvents
    .filter(event => isAfter(parseISO(event.date), startOfDay(today)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const todayEvents = safeCustomEvents.filter(event => isToday(parseISO(event.date)));
  const tomorrowEvents = safeCustomEvents.filter(event => isTomorrow(parseISO(event.date)));
  const nextThreeEvents = upcomingEvents.slice(0, 3);
  
  // Estatísticas - contar apenas eventos futuros (incluindo hoje)
  const totalEvents = safeCustomEvents.filter(event => {
    const eventDate = parseISO(event.date);
    return isAfter(eventDate, startOfDay(today)) || isToday(eventDate);
  }).length;
  const eventsThisWeek = safeCustomEvents.filter(event => {
    const eventDate = parseISO(event.date);
    const daysUntil = differenceInDays(eventDate, today);
    return daysUntil >= 0 && daysUntil <= 7;
  }).length;
  
  const eventsByType = safeCustomEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventIcons = {
    curso: <BookOpen className="h-4 w-4 text-blue-600" />,
    webinario: <Video className="h-4 w-4 text-purple-600" />,
    reuniao: <Users className="h-4 w-4 text-green-600" />,
    outro: <Sparkles className="h-4 w-4 text-amber-600" />,
  };

  // Função para determinar prioridade e cor do evento
  const getEventPriority = (event: any) => {
    const eventDate = parseISO(event.date);
    const daysUntil = differenceInDays(eventDate, today);
    
    if (isToday(eventDate)) {
      return {
        label: 'Hoje',
        color: 'text-red-600 bg-red-50 border-red-200',
        borderColor: 'border-l-red-500',
        priority: 1
      };
    } else if (isTomorrow(eventDate)) {
      return {
        label: 'Amanhã',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        borderColor: 'border-l-orange-500',
        priority: 2
      };
    } else if (daysUntil <= 7) {
      return {
        label: `${daysUntil}d`,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        borderColor: 'border-l-blue-500',
        priority: 3
      };
    } else {
      return {
        label: `${daysUntil}d`,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        borderColor: 'border-l-gray-500',
        priority: 4
      };
    }
  };

  const aniversariantesPanel = <AniversariantesSection />;
  const feriadosPanel = <FeriadosSection />;
  
  // Se ambos os painéis retornarem null, não renderiza nada
  if (!aniversariantesPanel && !feriadosPanel) {
    return null;
  }
  
  // Se apenas um painel tem conteúdo, usa layout de coluna única
  const hasAniversariantes = aniversariantesPanel !== null;
  const hasFeriados = feriadosPanel !== null;

  return (
    <div className={`mb-8 ${className}`}>
      {/* Título da seção com estatísticas */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-8 bg-gradient-primary rounded-full"></div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Eventos & Calendário</h2>
          {totalEvents > 0 && (
            <Badge variant="secondary" className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              {totalEvents} eventos
            </Badge>
          )}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
        <div className="flex items-center gap-2">
          <CustomEventDialog onAdd={addCustomEvent} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToCalendarDate()}
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
              title="Abrir calendário no mês atual"
            >
              <Calendar className="h-4 w-4" />
              Ver Calendário
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/calendario')}
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
              title="Abrir página completa do calendário"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <EventsManagementDialog />
        </div>
      </div>
      
      {/* Estatísticas rápidas */}
      {totalEvents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-lg font-bold text-blue-900">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Esta Semana</p>
                  <p className="text-lg font-bold text-green-900">{eventsThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Hoje</p>
                  <p className="text-lg font-bold text-orange-900">{todayEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Amanhã</p>
                  <p className="text-lg font-bold text-purple-900">{tomorrowEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Layout adaptativo baseado no conteúdo */}
      {hasAniversariantes && !hasFeriados && (
        <div className="max-w-lg mx-auto">
          {aniversariantesPanel}
        </div>
      )}
      
      {!hasAniversariantes && hasFeriados && (
        <div className="max-w-lg mx-auto">
          {feriadosPanel}
        </div>
      )}
      
      {hasAniversariantes && hasFeriados && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aniversariantesPanel}
          {feriadosPanel}
        </div>
      )}

      {/* Eventos Personalizados */}
      <div className="space-y-4">
        {/* Eventos de Hoje */}
        {todayEvents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-medium text-foreground">Eventos de Hoje</h3>
              <Badge variant="destructive" className="ml-2">
                {todayEvents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {todayEvents.map((event) => {
                const priority = getEventPriority(event);
                return (
                  <Card key={event.id} className="border-l-4 border-l-red-500 bg-gradient-to-r from-orange-50 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {eventIcons[event.type as keyof typeof eventIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.start_time ? `Hoje às ${event.start_time.substring(0, 5)}` : 'Hoje'}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priority.color}>
                            {event.type}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToCalendarDate(event.date)}
                              className="h-8 w-8 p-0 hover:bg-green-100"
                              title="Ver no calendário"
                            >
                              <Calendar className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Eventos de Amanhã */}
        {tomorrowEvents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-foreground">Eventos de Amanhã</h3>
              <Badge variant="secondary" className="ml-2">
                {tomorrowEvents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tomorrowEvents.map((event) => {
                const priority = getEventPriority(event);
                return (
                  <Card key={event.id} className="border-l-4 border-l-orange-500 bg-gradient-to-r from-blue-50 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {eventIcons[event.type as keyof typeof eventIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.start_time ? `Amanhã às ${event.start_time.substring(0, 5)}` : 'Amanhã'}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priority.color}>
                            {event.type}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Próximos Eventos - Só aparece quando há eventos */}
        {nextThreeEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Próximos Eventos
              </h3>
              <span className="text-sm text-muted-foreground">
                {nextThreeEvents.length} de {upcomingEvents.length} eventos
              </span>
            </div>

            <div className="space-y-3">
              {nextThreeEvents.map((event) => {
                const priority = getEventPriority(event);
                const daysUntil = differenceInDays(parseISO(event.date), today);
                
                return (
                  <Card key={event.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {eventIcons[event.type as keyof typeof eventIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(event.date), "dd/MM/yyyy", { locale: ptBR })}
                            {event.start_time && ` às ${event.start_time.substring(0, 5)}`}
                            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                              em {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                            </span>
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priority.color}>
                            {event.type}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {upcomingEvents.length > 3 && (
                <Card className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardContent className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      E mais {upcomingEvents.length - 3} eventos...
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/calendario')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Dialog de Edição */}
       <EditCustomEventDialog
         isOpen={isEditDialogOpen}
         onOpenChange={(open) => {
           setIsEditDialogOpen(open);
           if (!open) {
             setEditingEvent(null);
           }
         }}
         event={editingEvent}
         onUpdate={handleUpdateEvent}
       />
      
      {/* Gradiente decorativo */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );
};