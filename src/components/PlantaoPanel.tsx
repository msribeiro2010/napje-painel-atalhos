import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePlantaoNotifications } from '@/hooks/usePlantaoNotifications';
import { Calendar, Clock, AlertTriangle, Settings, X, RotateCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface PlantaoPanelProps {
  className?: string;
}

export const PlantaoPanel: React.FC<PlantaoPanelProps> = ({ className }) => {
  const {
    upcomingPlantoes,
    todayPlantoes,
    tomorrowPlantoes,
    urgentPlantoes,
    settings,
    loading,
    saveSettings,
    dismissPlantao,
    restorePlantao,
    stats
  } = usePlantaoNotifications();

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Plantões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil === 0) return 'destructive';
    if (daysUntil === 1) return 'default';
    if (daysUntil <= 3) return 'secondary';
    return 'outline';
  };

  const getUrgencyIcon = (daysUntil: number) => {
    if (daysUntil === 0) return <AlertTriangle className="h-3 w-3" />;
    if (daysUntil === 1) return <Clock className="h-3 w-3" />;
    return <Calendar className="h-3 w-3" />;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5" />
          Plantões
          {stats.urgent > 0 && (
            <Badge variant="destructive" className="ml-2">
              {stats.urgent}
            </Badge>
          )}
        </CardTitle>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurações de Plantão</DialogTitle>
              <DialogDescription>
                Configure como você quer ser notificado sobre seus plantões.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled" className="text-sm font-medium">
                  Notificações ativadas
                </Label>
                <Switch
                  id="notifications-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => saveSettings({ enabled: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-day-before" className="text-sm font-medium">
                  Avisar um dia antes
                </Label>
                <Switch
                  id="notify-day-before"
                  checked={settings.notifyDayBefore}
                  onCheckedChange={(checked) => saveSettings({ notifyDayBefore: checked })}
                  disabled={!settings.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-on-day" className="text-sm font-medium">
                  Avisar no dia do plantão
                </Label>
                <Switch
                  id="notify-on-day"
                  checked={settings.notifyOnDay}
                  onCheckedChange={(checked) => saveSettings({ notifyOnDay: checked })}
                  disabled={!settings.enabled}
                />
              </div>
              
              {settings.dismissedPlantoes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Plantões dispensados</Label>
                    <div className="space-y-1">
                      {settings.dismissedPlantoes.map((plantaoId) => {
                        const dateMatch = plantaoId.match(/plantao-(\d{4}-\d{2}-\d{2})/);
                        const date = dateMatch ? dateMatch[1] : '';
                        return (
                          <div key={plantaoId} className="flex items-center justify-between text-xs">
                            <span>{date ? format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR }) : plantaoId}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => restorePlantao(plantaoId)}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {upcomingPlantoes.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum plantão agendado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Marque seus plantões no calendário
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Plantões urgentes */}
            {urgentPlantoes.length > 0 && (
              <Alert className={cn(
                'border-l-4',
                urgentPlantoes.some(p => p.isToday) ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
              )}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {urgentPlantoes.some(p => p.isToday) ? (
                    <span className="font-medium text-red-700">
                      Você tem {todayPlantoes.length} plantão{todayPlantoes.length > 1 ? 'es' : ''} HOJE!
                    </span>
                  ) : (
                    <span className="font-medium text-yellow-700">
                      Plantão amanhã: {tomorrowPlantoes[0]?.title}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Lista de plantões */}
            <div className="space-y-2">
              {upcomingPlantoes.slice(0, 5).map((plantao) => {
                const isDismissed = settings.dismissedPlantoes.includes(plantao.id);
                
                return (
                  <div
                    key={plantao.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r',
                      isDismissed && 'opacity-50 bg-muted',
                      plantao.isToday && 'from-red-50 to-red-100 border-red-300 shadow-red-100',
                      plantao.isTomorrow && 'from-yellow-50 to-yellow-100 border-yellow-300 shadow-yellow-100',
                      !plantao.isToday && !plantao.isTomorrow && 'from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100'
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Badge 
                        variant={getUrgencyColor(plantao.daysUntil)} 
                        className="flex items-center gap-1 px-3 py-1.5 font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-200 animate-pulse"
                      >
                        {getUrgencyIcon(plantao.daysUntil)}
                        {plantao.daysUntil === 0 ? 'HOJE' : 
                         plantao.daysUntil === 1 ? 'AMANHÃ' : 
                         `${plantao.daysUntil} dias`}
                      </Badge>
                      <div className="flex-1 ml-2">
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                          {format(parseISO(plantao.date), 'dd/MM', { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-600 font-medium capitalize">
                          {format(parseISO(plantao.date), 'EEEE', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    {plantao.daysUntil <= 1 && !isDismissed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-110 shadow-sm"
                        onClick={() => dismissPlantao(plantao.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estatísticas */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Total: {stats.total} plantões
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg px-3"
                onClick={() => window.location.href = '/calendario'}
              >
                Ver Calendário
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlantaoPanel;