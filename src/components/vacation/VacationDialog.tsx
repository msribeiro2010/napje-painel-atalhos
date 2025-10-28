import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Palmtree, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useVacations } from '@/hooks/useVacations';
import { VacationType, vacationTypeLabels, CreateVacationDTO } from '@/types/vacation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VacationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function VacationDialog({ open, onOpenChange, initialStartDate, initialEndDate }: VacationDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [type, setType] = useState<VacationType>('regular');
  const [notes, setNotes] = useState('');
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const { createVacation, isCreating, balance } = useVacations();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setType('regular');
      setNotes('');
    }
  }, [open, initialStartDate, initialEndDate]);

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const availableDays = balance?.available_days || 0;
  const exceedsBalance = totalDays > availableDays;

  const handleSubmit = () => {
    if (!startDate || !endDate) return;

    const vacationData: CreateVacationDTO = {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      type,
      notes: notes.trim() || undefined,
    };

    createVacation(vacationData);
    onOpenChange(false);
  };

  const isValid = startDate && endDate && startDate <= endDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palmtree className="h-5 w-5 text-amber-600" />
            Cadastrar Período de Férias
          </DialogTitle>
          <DialogDescription>
            Planeje suas férias e receba alertas automáticos antes do início
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de Férias */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Férias</Label>
            <Select value={type} onValueChange={(value) => setType(value as VacationType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(vacationTypeLabels).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de Início */}
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsStartDateOpen(false);
                    // Auto-ajustar data final se necessário
                    if (date && endDate && date > endDate) {
                      setEndDate(undefined);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data de Término */}
          <div className="space-y-2">
            <Label>Data de Término</Label>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                  disabled={!startDate}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsEndDateOpen(false);
                  }}
                  disabled={(date) => !startDate || date < startDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview de Dias */}
          {startDate && endDate && (
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total de dias:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDays}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Dias disponíveis:</span>
                <span className={cn(
                  'font-semibold',
                  exceedsBalance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                )}>
                  {availableDays} dias
                </span>
              </div>
              {exceedsBalance && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O período selecionado excede seu saldo disponível de férias.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Viagem para praia, visita familiar, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isCreating}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isCreating ? (
              <>
                <span className="mr-2">Cadastrando...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              <>
                <Palmtree className="mr-2 h-4 w-4" />
                Cadastrar Férias
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
