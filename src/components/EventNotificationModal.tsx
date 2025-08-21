import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  X, 
  Bell, 
  BellOff, 
  Gift, 
  Heart,
  PartyPopper,
  Cake,
  Coffee,
  CalendarDays,
  CheckCircle,
  SkipForward
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { format, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventNotificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getEventAnimation = (type: 'feriado' | 'aniversario', daysUntil: number): string => {
  if (type === 'aniversario' && daysUntil === 0) {
    return 'animate-bounce';
  }
  if (daysUntil === 0) {
    return 'animate-pulse';
  }
  return '';
};

const getEventGradient = (type: 'feriado' | 'aniversario', daysUntil: number): string => {
  if (type === 'aniversario') {
    if (daysUntil === 0) return 'bg-gradient-to-br from-pink-500 via-red-500 to-purple-600';
    return 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-500';
  }
  if (daysUntil === 0) return 'bg-gradient-to-br from-green-500 via-teal-500 to-blue-600';
  if (daysUntil === 1) return 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500';
  return 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500';
};

const getEventMessage = (type: 'feriado' | 'aniversario', daysUntil: number, title: string): string => {
  if (type === 'aniversario') {
    if (daysUntil === 0) return `🎉 Hoje é aniversário de ${title}! Que tal enviar uma mensagem especial?`;
    if (daysUntil === 1) return `🎂 Amanhã é aniversário de ${title}! Lembre-se de parabenizar!`;
    return `🎈 Aniversário de ${title} se aproxima em ${daysUntil} dias`;
  }
  
  if (daysUntil === 0) return `🏖️ Hoje é ${title}! Aproveite este dia especial!`;
  if (daysUntil === 1) return `📅 Amanhã é ${title}! Prepare-se para o feriado!`;
  return `⭐ ${title} se aproxima em ${daysUntil} dias`;
};

export const EventNotificationModal = ({ isOpen, onOpenChange }: EventNotificationModalProps) => {
  const { 
    urgentEvents, 
    loading, 
    snoozeNotifications, 
    markEventAsFinished,
    dismissEvent 
  } = useEventNotifications();
  
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const currentEvent = urgentEvents[currentEventIndex];

  // Reset index when events change
  useEffect(() => {
    if (currentEventIndex >= urgentEvents.length) {
      setCurrentEventIndex(0);
    }
  }, [urgentEvents.length, currentEventIndex]);

  const handleSnooze = (minutes: number) => {
    snoozeNotifications(minutes);
  };

  const handleFinishEvent = () => {
    if (currentEvent) {
      markEventAsFinished(currentEvent.id);
      handleNext();
    }
  };

  const handleDismissEvent = () => {
    if (currentEvent) {
      dismissEvent(currentEvent.id);
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentEventIndex < urgentEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
    } else {
      onOpenChange(false);
      setCurrentEventIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1);
    }
  };

  if (loading || urgentEvents.length === 0 || !currentEvent) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <Card className={`${getEventGradient(currentEvent.type, currentEvent.daysUntil)} text-white border-0 shadow-2xl ${getEventAnimation(currentEvent.type, currentEvent.daysUntil)}`}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  {currentEvent.type === 'aniversario' ? 
                    (currentEvent.daysUntil === 0 ? <PartyPopper className="h-6 w-6" /> : <Cake className="h-6 w-6" />) :
                    <Calendar className="h-6 w-6" />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {currentEvent.daysUntil === 0 ? 'HOJE!' : currentEvent.daysUntil === 1 ? 'AMANHÃ!' : `${currentEvent.daysUntil} DIAS`}
                  </h3>
                  <p className="text-sm opacity-90">
                    {urgentEvents.length > 1 ? `${currentEventIndex + 1} de ${urgentEvents.length}` : 'Evento Urgente'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {/* Evento Principal */}
              <div className="text-center space-y-2">
                <div className="text-4xl mb-2">
                  {currentEvent.type === 'aniversario' ? 
                    (currentEvent.daysUntil === 0 ? '🎉' : currentEvent.daysUntil === 1 ? '🎂' : '🎈') :
                    (currentEvent.daysUntil === 0 ? '🏖️' : currentEvent.daysUntil === 1 ? '📅' : '⭐')
                  }
                </div>
                <h4 className="text-xl font-bold">{currentEvent.title}</h4>
                <Badge className="bg-white/20 text-white border-white/30">
                  {currentEvent.subtitle}
                </Badge>
              </div>

              {/* Mensagem Personalizada */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-center">
                  {getEventMessage(currentEvent.type, currentEvent.daysUntil, currentEvent.title)}
                </p>
              </div>

              {/* Botões de Ação Principal */}
              {currentEvent.daysUntil === 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFinishEvent}
                    className="bg-green-600/80 text-white border-green-500 hover:bg-green-700/80"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizado
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDismissEvent}
                    className="bg-gray-600/80 text-white border-gray-500 hover:bg-gray-700/80"
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Dispensar
                  </Button>
                </div>
              )}

              {/* Botões de Snooze */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSnooze(30)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  30min
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSnooze(120)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  2h
                </Button>
              </div>

              {/* Navegação entre eventos */}
              {urgentEvents.length > 1 && (
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentEventIndex === 0}
                    className="text-white hover:bg-white/20"
                  >
                    ← Anterior
                  </Button>
                  <div className="text-xs opacity-75">
                    {currentEventIndex + 1} / {urgentEvents.length}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="text-white hover:bg-white/20"
                  >
                    {currentEventIndex === urgentEvents.length - 1 ? 'Fechar' : 'Próximo →'}
                  </Button>
                </div>
              )}

              {/* Botão principal */}
              <Button
                onClick={urgentEvents.length === 1 ? () => onOpenChange(false) : handleNext}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 font-bold"
              >
                {urgentEvents.length === 1 ? 'Entendi!' : 
                 currentEventIndex === urgentEvents.length - 1 ? 'Finalizar' : 'Próximo Evento →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
