import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Calendar, 
  Clock, 
  Gift, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PastEventsDialog = () => {
  const { 
    pastEvents, 
    restoreEvent, 
    updateEventStatus,
    stats,
    settings,
    updateSettings
  } = useEventNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

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

  if (stats.past === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 hover:bg-white transition-all duration-200"
          >
            <History className="h-4 w-4 mr-2" />
            Eventos Passados
            <Badge className="ml-2 bg-gray-100 text-gray-600">0</Badge>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                <History className="h-5 w-5 text-white" />
              </div>
              Eventos Passados
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-sm text-muted-foreground">
              Nenhum evento passado encontrado.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white transition-all duration-200"
        >
          <History className="h-4 w-4 mr-2" />
          Eventos Passados
          <Badge className="ml-2 bg-blue-100 text-blue-800">{stats.past}</Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <History className="h-5 w-5 text-white" />
            </div>
            Eventos Passados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          <Separator />

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
        </div>
      </DialogContent>
    </Dialog>
  );
};