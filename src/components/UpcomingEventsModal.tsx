import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X, Bell, Sparkles, Play, CheckCircle, AlertCircle, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isPast, isAfter, isBefore, parseISO, startOfDay, differenceInDays } from 'date-fns';
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
  const navigate = useNavigate();
  const { updateCustomEvent, removeCustomEvent, fetchCustomEvents } = useCustomEvents(new Date());
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do evento foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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
        end_time: event.end_time,
        url: event.url
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
        // Atualizar a lista de eventos sem recarregar a página
        await fetchCustomEvents();
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
      // Atualizar a lista de eventos sem recarregar a página
      await fetchCustomEvents();
    } catch (error) {
      toast({
        title: "Erro ao atualizar evento",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getDateLabel = (dateStr: string) => {
    // Usar parseISO para evitar problemas de fuso horário
    const date = parseISO(dateStr + 'T00:00:00');
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
    const eventDate = parseISO(event.date + 'T00:00:00');
    const today = startOfDay(new Date());
    const eventDateOnly = startOfDay(eventDate);
    
    const daysDiff = differenceInDays(eventDateOnly, today);
    
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
      return { status: 'Amanhã', color: 'bg-orange-100 text-white border-orange-300', icon: AlertCircle };
    } else if (daysDiff === 2) {
      return { status: 'Em breve', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle };
    } else {
      return { status: 'Em breve', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle };
    }
  };

  const formatEventDateTime = (event: UpcomingEvent) => {
    // Usar parseISO para evitar problemas de fuso horário
    const eventDate = parseISO(event.date + 'T00:00:00');
    const dateStr = format(eventDate, "dd/MM/yyyy", { locale: ptBR });
    const dayOfWeek = format(eventDate, "EEEE", { locale: ptBR });
    const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    
    if (event.start_time && event.end_time) {
      return `${capitalizedDayOfWeek}, ${dateStr} • ${event.start_time} às ${event.end_time}`;
    } else if (event.start_time) {
      return `${capitalizedDayOfWeek}, ${dateStr} • ${event.start_time}`;
    } else {
      return `${capitalizedDayOfWeek}, ${dateStr}`;
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
        <DialogHeader className="relative pb-6 border-b border-white/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-500/80 via-purple-500/80 to-indigo-600/80 rounded-2xl shadow-xl backdrop-blur-sm">
                <Bell className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500/90 to-pink-500/90 rounded-full flex items-center justify-center shadow-lg animate-bounce backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                🎯 Eventos Próximos
              </DialogTitle>
              <p className="text-sm text-slate-600/80 font-medium">
                {events.length} evento{events.length !== 1 ? 's' : ''} nos próximos dias • Fique sempre atualizado
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-6 pr-2">
          {Object.entries(groupedEvents).map(([dateLabel, dayEvents]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-md py-2 z-10 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-lg text-gray-800">{dateLabel}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200/60 to-transparent" />
              </div>
              
              <div className="space-y-3 ml-6">
                {dayEvents.map((event) => {
                  const eventStatus = getEventStatus(event);
                  const StatusIcon = eventStatus.icon;
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
                        "bg-white/60 backdrop-blur-md",
                        "border-white/40 shadow-lg"
                      )}
                      style={{
                        boxShadow: `0 8px 32px ${event.color ? `${event.color}30` : 'rgba(0,0,0,0.08)'}`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="text-3xl p-2 rounded-xl bg-gradient-to-br from-white to-slate-100 shadow-md animate-pulse">
                            {event.icon}
                          </div>
                          <div 
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: event.color || '#3b82f6' }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h4 className="font-bold text-lg text-slate-800 truncate">
                              {event.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-semibold border-2 px-2 py-1 rounded-full shadow-sm",
                                getEventTypeColor(event.type, event.category)
                              )}
                            >
                              {getEventTypeLabel(event.type, event.category)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-semibold border-2 flex items-center gap-1 px-2 py-1 rounded-full shadow-sm",
                                eventStatus.color
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {eventStatus.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-700 mb-3 bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">
                              {formatEventDateTime(event)}
                            </span>
                          </div>
                          
                          {event.description && (
                            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/30">
                              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {event.description}
                              </p>
                            </div>
                          )}
                          
                          {/* Link do evento */}
                          {event.url && (
                            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/30">
                              <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-slate-700">Link do evento:</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={event.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline truncate flex-1 font-medium"
                                >
                                  {event.url}
                                </a>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyUrl(event.url!)}
                                  className="flex items-center gap-1 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-full px-3 py-1 transition-all duration-200 shadow-sm"
                                >
                                  <Copy className="h-3 w-3" />
                                  Copiar
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Botões de ação para eventos personalizados */}
                          {event.type === 'custom' && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                                className="flex items-center gap-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-full px-4 py-2 transition-all duration-200 shadow-sm"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEvent(event)}
                                disabled={deletingEventId === event.id}
                                className="flex items-center gap-2 text-xs font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-full px-4 py-2 transition-all duration-200 shadow-sm"
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
                         className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
                         style={{
                           background: `linear-gradient(135deg, ${event.color || '#3b82f6'}, transparent 60%)`
                         }}
                       />
                       
                       {/* Subtle glow effect */}
                       <div 
                         className="absolute -inset-1 rounded-2xl opacity-20 blur-sm pointer-events-none"
                         style={{
                           background: `linear-gradient(135deg, ${event.color || '#3b82f6'}20, transparent 50%)`
                         }}
                       />
                     </div>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center gap-4 pt-6 border-t border-white/30 bg-white/40 backdrop-blur-md -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
          <div className="flex items-center gap-2 text-sm text-slate-600/80">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Mantenha-se sempre atualizado</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-white/50 border-white/40 text-slate-700 font-semibold px-6 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                // Navegar para o calendário usando navigate
                navigate('/calendario');
              }}
              className="bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 hover:from-blue-700/90 hover:via-purple-700/90 hover:to-indigo-700/90 text-white font-semibold px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              📅 Ver Calendário
            </Button>
          </div>
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