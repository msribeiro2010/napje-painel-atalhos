import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2, 
  Bell, 
  Palette, 
  Volume2, 
  Mail,
  Smartphone,
  Clock,
  Filter,
  Save,
  RotateCcw
} from 'lucide-react';
import { useEventNotifications } from '@/hooks/useEventNotifications';

export const EventNotificationAdvancedSettings = () => {
  const { settings, updateSettings } = useEventNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [notificationDays, setNotificationDays] = useState([7]);

  const handleSaveCustomMessage = () => {
    // Aqui você pode implementar salvamento de mensagens personalizadas
    console.log('Mensagem personalizada salva:', customMessage);
  };

  const resetToDefaults = () => {
    updateSettings({
      showModalForUrgent: true,
      showToastsForAll: true,
      snoozeTime: 30,
      dismissedEvents: []
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs bg-white/60 hover:bg-white/80"
        >
          <Settings2 className="h-3 w-3 mr-1" />
          Avançado
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            Configurações Avançadas de Notificação
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="behavior" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="behavior">
              <Bell className="h-3 w-3 mr-1" />
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-3 w-3 mr-1" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="h-3 w-3 mr-1" />
              Timing
            </TabsTrigger>
            <TabsTrigger value="filters">
              <Filter className="h-3 w-3 mr-1" />
              Filtros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Comportamento das Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notificações Sonoras</Label>
                    <p className="text-xs text-muted-foreground">Som para eventos urgentes</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notificações do Navegador</Label>
                    <p className="text-xs text-muted-foreground">Notificações nativas do browser</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Auto-reposição de Modal</Label>
                    <p className="text-xs text-muted-foreground">Reabrir modal após snooze</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Persistência de Modal (segundos)</Label>
                  <Slider
                    defaultValue={[30]}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo para fechar automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Personalização Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tema de Cores</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="h-12 bg-gradient-to-r from-blue-400 to-purple-500">
                      Padrão
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 bg-gradient-to-r from-green-400 to-blue-500">
                      Natureza
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 bg-gradient-to-r from-pink-400 to-red-500">
                      Vibrante
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Animações Reduzidas</Label>
                    <p className="text-xs text-muted-foreground">Para melhor performance</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Opacidade do Background</Label>
                  <Slider
                    defaultValue={[80]}
                    max={100}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Configurações de Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Dias de Antecedência para Notificar</Label>
                  <Slider
                    value={notificationDays}
                    onValueChange={setNotificationDays}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Notificar eventos com até {notificationDays[0]} dias de antecedência
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Horário Preferido para Notificações</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" defaultValue="09:00" />
                    <Input type="time" defaultValue="17:00" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Horários de início e fim para notificações automáticas
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notificações em Fins de Semana</Label>
                    <p className="text-xs text-muted-foreground">Incluir sábados e domingos</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Filtros de Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Apenas Feriados</Label>
                    <p className="text-xs text-muted-foreground">Notificar somente feriados</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Apenas Aniversários</Label>
                    <p className="text-xs text-muted-foreground">Notificar somente aniversários</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Palavras-chave para Filtrar</Label>
                  <Textarea
                    placeholder="Ex: nacional, municipal, estadual..."
                    className="h-20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Eventos contendo essas palavras serão priorizados
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Mensagem Personalizada</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Digite uma mensagem personalizada para suas notificações..."
                    className="h-20"
                  />
                  <Button onClick={handleSaveCustomMessage} size="sm" className="w-full">
                    <Save className="h-3 w-3 mr-2" />
                    Salvar Mensagem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrões
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
