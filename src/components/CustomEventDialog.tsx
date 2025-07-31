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

export function CustomEventDialog({ onAdd }: { onAdd: (event: { date: string, type: string, title: string, description?: string, start_time?: string, end_time?: string, url?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [type, setType] = useState('curso');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !title) {
      console.error('❌ Dados obrigatórios faltando:', { date, title });
      return;
    }
    
    // Validação adicional do formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.error('❌ Formato de data inválido:', date);
      alert('Formato de data inválido. Use o formato YYYY-MM-DD');
      return;
    }
    
    // Permitir criar eventos no passado para casos especiais (eventos recorrentes, correções, etc.)
    // Removida a validação restritiva de data passada
    
    console.log('🔄 Enviando evento personalizado:', { 
      date, type, title, description, 
      start_time: startTime || undefined, 
      end_time: endTime || undefined, 
      url: url || undefined 
    });
    
    console.log('📅 Data específica sendo enviada:', date);
    console.log('📅 Data convertida:', new Date(date));
    
    setLoading(true);
    
    try {
      await onAdd({ 
        date, 
        type, 
        title, 
        description: description || undefined, 
        start_time: startTime || undefined, 
        end_time: endTime || undefined, 
        url: url || undefined 
      });
      
      // Só limpar e fechar se der certo
      setOpen(false);
      setDate('');
      setType('curso');
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setUrl('');
      
      console.log('✅ Evento enviado com sucesso para a data:', date);
    } catch (error) {
      console.error('❌ Erro ao enviar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md text-green-700 hover:text-green-800"
        >
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
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
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