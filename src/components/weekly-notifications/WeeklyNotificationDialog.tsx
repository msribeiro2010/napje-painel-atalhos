import { Bell, Clock, Calendar, CalendarDays, Sparkles, CheckCircle2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WeeklyNotification, WeeklyNotificationFormData } from '@/hooks/useWeeklyNotificationsManager';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface WeeklyNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotification: WeeklyNotification | null;
  formData: WeeklyNotificationFormData;
  setFormData: React.Dispatch<React.SetStateAction<WeeklyNotificationFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

interface ExtendedFormData extends WeeklyNotificationFormData {
  selectedDays?: number[];
  isWeekdayRange?: boolean;
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
  const [extendedFormData, setExtendedFormData] = useState<ExtendedFormData>({
    ...formData,
    selectedDays: formData.selectedDays || [],
    isWeekdayRange: formData.isWeekdayRange || false
  });

  // Sincronizar extendedFormData quando formData mudar (para edição)
  useEffect(() => {
    setExtendedFormData({
      ...formData,
      selectedDays: formData.selectedDays || [],
      isWeekdayRange: formData.isWeekdayRange || false
    });
  }, [formData, editingNotification]);
  const timeOptions = [
    { value: '07:00', label: '07:00' },
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
    { value: '18:00', label: '18:00' },
  ];

  const dayOptions = [
    { value: 0, label: 'Domingo', short: 'Dom' },
    { value: 1, label: 'Segunda-feira', short: 'Seg' },
    { value: 2, label: 'Terça-feira', short: 'Ter' },
    { value: 3, label: 'Quarta-feira', short: 'Qua' },
    { value: 4, label: 'Quinta-feira', short: 'Qui' },
    { value: 5, label: 'Sexta-feira', short: 'Sex' },
    { value: 6, label: 'Sábado', short: 'Sáb' },
  ];

  const weekdayOptions = [1, 2, 3, 4, 5]; // Segunda a Sexta

  const toggleWeekdayRange = () => {
    if (extendedFormData.isWeekdayRange) {
      // Desativar período seg-sex
      setExtendedFormData(prev => ({
        ...prev,
        isWeekdayRange: false,
        selectedDays: []
      }));
      setFormData(prev => ({ ...prev, dayofweek: 1 }));
    } else {
      // Ativar período seg-sex
      setExtendedFormData(prev => ({
        ...prev,
        isWeekdayRange: true,
        selectedDays: [...weekdayOptions].sort((a, b) => a - b)
      }));
    }
  };

  const toggleDay = (dayValue: number) => {
    if (extendedFormData.isWeekdayRange) return; // Não permitir alteração individual quando período está ativo
    
    const currentDays = extendedFormData.selectedDays || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort((a, b) => a - b);
    
    setExtendedFormData(prev => ({
      ...prev,
      selectedDays: newDays
    }));
  };

  const getSelectedDaysText = () => {
    if (extendedFormData.isWeekdayRange) {
      return 'Segunda a Sexta-feira';
    }
    if (!extendedFormData.selectedDays?.length) {
      return 'Nenhum dia selecionado';
    }
    return extendedFormData.selectedDays
      .sort((a, b) => a - b)
      .map(day => dayOptions.find(d => d.value === day)?.short)
      .join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      return;
    }
    
    // Usar apenas campos básicos que existem no banco
    const updatedFormData = {
      ...formData,
      // Usar o primeiro dia selecionado ou segunda-feira se for período seg-sex
      dayofweek: extendedFormData.isWeekdayRange 
        ? 1 // Segunda-feira para período seg-sex
        : (extendedFormData.selectedDays?.[0] || formData.dayofweek || 1)
    };
    
    // Atualizar formData
    setFormData(updatedFormData);
    
    // Chamar onSubmit com dados básicos
    await onSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            {editingNotification ? 'Editar Notificação Semanal' : 'Nova Notificação Semanal'}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400 text-base">
            {editingNotification 
              ? 'Edite as informações da notificação semanal e configure quando ela deve ser enviada'
              : 'Crie uma nova notificação para lembretes automáticos semanais com agendamento inteligente'
            }
          </DialogDescription>
          <Separator />
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:border-blue-700 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-200">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Informações da Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo" className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                  Título da Notificação *
                  <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                </Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Verificar suspensão de prazos no PJe"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="mensagem" className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                  Mensagem de Lembrete *
                  <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                </Label>
                <Textarea
                  id="mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Ex: IMPORTANTE: Sempre que houver uma paralização no sistema, temos que publicar no calendário do PJE que os prazos têm que ficar suspensos"
                  rows={4}
                  className="resize-none mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Esta mensagem será exibida nas notificações semanais
                </p>
              </div>
            </CardContent>
          </Card>
            
          {/* Agendamento Inteligente */}
          <Card className="border-2 border-dashed border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:border-green-700 dark:bg-gradient-to-r dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-200">
                <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                Agendamento Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Período Segunda-Sexta */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período Segunda a Sexta-feira
                    </Label>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Ativar notificação automática de segunda a sexta-feira
                    </p>
                  </div>
                  <Switch
                    checked={extendedFormData.isWeekdayRange}
                    onCheckedChange={toggleWeekdayRange}
                  />
                </div>
                
                {extendedFormData.isWeekdayRange && (
                  <div className="p-4 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Período ativo: Segunda a Sexta-feira
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOptions.map(day => (
                        <Badge key={day} variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                          {dayOptions.find(d => d.value === day)?.short}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seleção Individual de Dias */}
              {!extendedFormData.isWeekdayRange && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium dark:text-gray-300">Dias da Semana (Seleção Individual)</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayOptions.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={extendedFormData.selectedDays?.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-12 flex flex-col items-center justify-center text-xs",
                          extendedFormData.selectedDays?.includes(day.value) && "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={() => toggleDay(day.value)}
                      >
                        <span className="font-medium">{day.short}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Selecionados: {getSelectedDaysText()}
                  </p>
                </div>
              )}
              
              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário da Notificação *
                </Label>
                <Select 
                  value={formData.time || '09:00'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger className="w-full">
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
                <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  A notificação será enviada no(s) dia(s) e horário especificados
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Status e Configurações Avançadas */}
          <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:border-purple-700 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-200">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Status e Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/10">
                <div className="space-y-1">
                  <Label className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Status da Notificação
                  </Label>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {formData.ativo ? 'Notificação ativa e funcionando' : 'Notificação pausada'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={formData.ativo ? "default" : "secondary"} className={cn(
                    "text-xs",
                    formData.ativo ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"
                  )}>
                    {formData.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!formData.titulo.trim() || !formData.mensagem.trim()}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {editingNotification ? 'Atualizar Notificação' : 'Criar Notificação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};