import { Bell, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyNotification, WeeklyNotificationFormData } from '@/hooks/useWeeklyNotificationsManager';

interface WeeklyNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotification: WeeklyNotification | null;
  formData: WeeklyNotificationFormData;
  setFormData: React.Dispatch<React.SetStateAction<WeeklyNotificationFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export const WeeklyNotificationDialog = ({
  isOpen,
  onOpenChange,
  editingNotification,
  formData,
  setFormData,
  onSubmit,
  onCancel
}: WeeklyNotificationDialogProps) => {
  const timeOptions = [
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' },
    { value: '12:00', label: '12:00' },
    { value: '13:00', label: '13:00' },
    { value: '14:00', label: '14:00' },
    { value: '15:00', label: '15:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
  ];

  const dayOptions = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      return;
    }
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {editingNotification ? 'Editar Notificação' : 'Nova Notificação Semanal'}
          </DialogTitle>
          <DialogDescription>
            {editingNotification 
              ? 'Edite as informações da notificação semanal'
              : 'Crie uma nova notificação para lembretes semanais'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Verificar suspensão de prazos no PJe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="mensagem">Mensagem de Lembrete *</Label>
              <Textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Ex: IMPORTANTE: Sempre que houver uma paralização no sistema, temos que publicar no calendário do PJE que os prazos têm que ficar suspensos"
                rows={4}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta mensagem será exibida nas notificações semanais
              </p>
            </div>
            
            {/* Campos de Agendamento */}
            <Card className="border-2 border-dashed border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Agendamento da Notificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Dia da Semana *</Label>
                    <Select 
                      value={formData.dayofweek?.toString() || '1'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, dayofweek: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Select 
                      value={formData.time || '09:00'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  A notificação será enviada no dia e horário especificados
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Status da Notificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notificação ativa</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando ativa, esta notificação será incluída nos lembretes semanais
                  </p>
                </div>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ativo: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!formData.titulo.trim() || !formData.mensagem.trim()}
            >
              {editingNotification ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};