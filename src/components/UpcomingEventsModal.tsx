import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X, Bell, Sparkles, Play, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isPast, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUpcomingEventsModal, UpcomingEvent } from '@/hooks/useUpcomingEventsModal';
import { useCustomEvents, CustomEvent } from '@/hooks/useCustomEvents';
import { EditCustomEventDialog } from '@/components/EditCustomEventDialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UpcomingEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: UpcomingEvent[];
}

const UpcomingEventsModal: React.FC<UpcomingEventsModalProps> = ({
  isOpen,
  onClose,
  events
}) => {
  const { updateCustomEvent, removeCustomEvent } = useCustomEvents(new Date());
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleEditEvent = (event: UpcomingEvent) => {
    if (event.type === 'custom') {
      const customEvent: CustomEvent = {
        id: event.id.replace('custom-', ''), // Remove o prefixo 'custom-'
        user_id: '', // Será preenchido pelo hook useCustomEvents
        date: event.date,
        type: event.category || 'outro',
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time
      };
      setEditingEvent(customEvent);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteEvent = async (event: UpcomingEvent) => {
    if (event.type === 'custom') {
      const eventId = event.id.replace('custom-', ''); // Remove o prefixo 'custom-'
      setDeletingEventId(event.id);
      try {
        await removeCustomEvent(eventId);
        toast({
          title: "Evento excluído",
          description: "O evento foi removido com sucesso.",
        });
        // Recarregar a página para atualizar a lista de eventos
        window.location.reload();
      } catch (error) {
        toast({
          title: "Erro ao excluir evento",
          description: "Não foi possível remover o evento. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setDeletingEventId(null);
      }
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Omit<CustomEvent, 'id' | 'user_id'>) => {
    try {
      await updateCustomEvent(id, eventData);
      toast({
        title: "Evento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      // Recarregar a página para atualizar a lista de eventos
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro ao atualizar evento",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (format(date, 'yyyy-MM-dd') === format(addDays(new Date(), 2), 'yyyy-MM-dd')) {
      return 'Depois de amanhã';
    }
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const getEventTypeColor = (type: string, category?: string) => {
    if (type === 'custom') {
      const colors = {
        curso: 'bg-blue-100 text-blue-800 border-blue-200',
        webinario: 'bg-purple-100 text-purple-800 border-purple-200',
        reuniao: 'bg-green-100 text-green-800 border-green-200',
        outro: 'bg-amber-100 text-amber-800 border-amber-200'
      };
      return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    if (type === 'holiday') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  const getEventTypeLabel = (type: string, category?: string) => {
    if (type === 'custom') {
      const labels = {
        curso: 'Curso',
        webinario: 'Webinário',
        reuniao: 'Reunião',
        outro: 'Evento'
      };
      return labels[category as keyof typeof labels] || 'Evento';
    }
    if (type === 'holiday') return 'Feriado';
    if (type === 'work') return 'Trabalho';
    return 'Evento';
  };

  const getEventStatus = (event: UpcomingEvent) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((eventDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se o evento tem horário específico
    if (event.start_time && event.end_time) {
      const [startHour, startMinute] = event.start_time.split(':').map(Number);
      const [endHour, endMinute] = event.end_time.split(':').map(Number);
      
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      if (isToday(eventDate)) {
        if (now >= endDateTime) {
          return { status: 'Finalizado', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle };
        } else if (now >= startDateTime) {
          return { status: 'Iniciado', color: 'bg-green-100 text-green-700 border-green-300', icon: Play };
        } else {
          return { status: 'Hoje', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: AlertCircle };
        }
      }
    }
    
    // Para eventos sem horário específico ou em outros dias
    if (daysDiff < 0) {
      return { status: 'Finalizado', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle };
    } else if (daysDiff === 0) {
      return { status: 'Hoje', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: AlertCircle };
    } else if (daysDiff === 1) {
      return { status: 'Amanhã', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertCircle };
    } else if (daysDiff === 2) {
      return { status: 'Em breve', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle };
    } else {
      return { status: 'Em breve', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle };
    }
  };

  const formatEventDateTime = (event: UpcomingEvent) => {
    const eventDate = new Date(event.date);
    const dateStr = format(eventDate, "dd/MM/yyyy", { locale: ptBR });
    
    if (event.start_time && event.end_time) {
      return `${dateStr} • ${event.start_time} às ${event.end_time}`;
    } else if (event.start_time) {
      return `${dateStr} • ${event.start_time}`;
    } else {
      return dateStr;
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const dateLabel = getDateLabel(event.date);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(event);
    return acc;
  }, {} as Record<string, UpcomingEvent[]>);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Eventos Próximos
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {events.length} evento{events.length !== 1 ? 's' : ''} nos próximos dias
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-6 pr-2">
          {Object.entries(groupedEvents).map(([dateLabel, dayEvents]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-lg text-gray-800">{dateLabel}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
              </div>
              
              <div className="space-y-3 ml-6">
                {dayEvents.map((event) => {
                  const eventStatus = getEventStatus(event);
                  const StatusIcon = eventStatus.icon;
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                        "bg-gradient-to-r from-white to-gray-50"
                      )}
                      style={{
                        borderColor: event.color ? `${event.color}80` : '#e5e7eb',
                        backgroundColor: event.color ? `${event.color}20` : '#f9fafb'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-1 animate-bounce">
                          {event.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {event.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-medium border",
                                getEventTypeColor(event.type, event.category)
                              )}
                            >
                              {getEventTypeLabel(event.type, event.category)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-medium border flex items-center gap-1",
                                eventStatus.color
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {eventStatus.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">
                              {formatEventDateTime(event)}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          
                          {/* Botões de ação para eventos personalizados */}
                          {event.type === 'custom' && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                                className="flex items-center gap-1 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEvent(event)}
                                disabled={deletingEventId === event.id}
                                className="flex items-center gap-1 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                                {deletingEventId === event.id ? 'Excluindo...' : 'Excluir'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                     
                       {/* Decorative gradient border */}
                       <div 
                         className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                         style={{
                           background: `linear-gradient(135deg, ${event.color || '#e5e7eb'}, transparent 70%)`
                         }}
                       />
                     </div>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-gray-50"
          >
            Fechar
          </Button>
          <Button
            onClick={() => {
              // Navegar para o calendário
              window.location.href = '/calendario';
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Ver Calendário
          </Button>
        </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição de evento personalizado */}
      <EditCustomEventDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onUpdate={handleUpdateEvent}
        event={editingEvent}
      />
    </>
  );
};

export default UpcomingEventsModal;