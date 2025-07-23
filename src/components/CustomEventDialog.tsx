import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, BookOpen, Video, Users, Sparkles, Plus } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_TYPES = [
  { value: 'curso', label: 'Curso', icon: <BookOpen className="h-4 w-4 mr-1 text-blue-600" /> },
  { value: 'webinario', label: 'Webinário', icon: <Video className="h-4 w-4 mr-1 text-purple-600" /> },
  { value: 'reuniao', label: 'Reunião', icon: <Users className="h-4 w-4 mr-1 text-green-600" /> },
  { value: 'outro', label: 'Outro', icon: <Sparkles className="h-4 w-4 mr-1 text-amber-600" /> },
];

export function CustomEventDialog({ onAdd }: { onAdd: (event: { date: string, type: string, title: string, description?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [type, setType] = useState('curso');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAdd({ date, type, title, description });
    setLoading(false);
    setOpen(false);
    setDate('');
    setType('curso');
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-sm font-medium px-3 py-2 border-dashed border-2 border-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" />
          Adicionar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Evento Personalizado
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required min={format(new Date(), 'yyyy-MM-dd')} />
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
            <Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={256} placeholder="Detalhes, link, local, etc." />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !date || !title} className="bg-primary text-white hover:bg-primary/90">
              Salvar Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 