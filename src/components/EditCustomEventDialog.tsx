import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, BookOpen, Video, Users, Sparkles, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { CustomEvent } from '@/hooks/useCustomEvents';

const EVENT_TYPES = [
  { value: 'curso', label: 'Curso', icon: <BookOpen className="h-4 w-4 mr-1 text-blue-600" /> },
  { value: 'webinario', label: 'Webinário', icon: <Video className="h-4 w-4 mr-1 text-purple-600" /> },
  { value: 'reuniao', label: 'Reunião', icon: <Users className="h-4 w-4 mr-1 text-green-600" /> },
  { value: 'outro', label: 'Outro', icon: <Sparkles className="h-4 w-4 mr-1 text-amber-600" /> },
];

interface EditCustomEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: CustomEvent | null;
  onUpdate: (id: string, event: Omit<CustomEvent, 'id' | 'user_id'>) => Promise<void>;
}

export function EditCustomEventDialog({ isOpen, onOpenChange, event, onUpdate }: EditCustomEventDialogProps) {
  const [date, setDate] = useState('');
  const [type, setType] = useState('curso');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Preencher o formulário quando o evento for carregado
  useEffect(() => {
    if (event) {
      setDate(event.date);
      setType(event.type);
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(event.start_time || '');
      setEndTime(event.end_time || '');
      setUrl(event.url || '');
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    console.log('📝 Iniciando submissão do formulário:', {
      eventId: event.id,
      formData: { date, type, title, description, startTime, endTime, url }
    });
    
    setLoading(true);
    try {
      await onUpdate(event.id, {
        date,
        type,
        title,
        description: description || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        url: url || undefined
      });
      console.log('✅ Formulário submetido com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erro no formulário:', error);
      // Mostrar toast de erro
      import('sonner').then(({ toast }) => {
        toast.error('Não foi possível salvar as alterações. Tente novamente.');
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setType('curso');
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setUrl('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Editar Evento Personalizado
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required min={format(new Date(), 'yyyy-MM-dd')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Horário de Início (opcional)</label>
              <Input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
                placeholder="HH:MM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário de Fim (opcional)</label>
              <Input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
                placeholder="HH:MM"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <div className="flex gap-2">
              {EVENT_TYPES.map(opt => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={type === opt.value ? 'default' : 'outline'}
                  className={`flex items-center gap-1 px-3 py-1 text-xs ${type === opt.value ? '' : 'bg-white'}`}
                  onClick={() => setType(opt.value)}
                >
                  {opt.icon}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required maxLength={64} placeholder="Ex: Curso de Atualização" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={256} placeholder="Detalhes, local, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link/URL (opcional)</label>
            <Input value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://exemplo.com" />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !date || !title} 
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}