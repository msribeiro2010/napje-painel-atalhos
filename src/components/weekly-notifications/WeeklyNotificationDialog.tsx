import { Bell, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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