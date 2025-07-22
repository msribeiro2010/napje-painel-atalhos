import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddShortcutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupTitle: string;
}

// Lista de ícones disponíveis
const availableIcons = [
  { value: '📅', label: '📅 Calendário' },
  { value: '✅', label: '✅ Check' },
  { value: '🔍', label: '🔍 Busca' },
  { value: '🏢', label: '🏢 Empresa' },
  { value: '🎧', label: '🎧 Headset' },
  { value: '🚶', label: '🚶 Pessoa' },
  { value: '💰', label: '💰 Dinheiro' },
  { value: '📄', label: '📄 Documento' },
  { value: '👥', label: '👥 Usuários' },
  { value: '🌐', label: '🌐 Globo' },
  { value: '💯', label: '💯 100%' },
  { value: '🐛', label: '🐛 Bug' },
  { value: '🌍', label: '🌍 Terra' },
  { value: '🔒', label: '🔒 Segurança' },
  { value: '📞', label: '📞 Telefone' },
  { value: '📧', label: '📧 Email' },
  { value: '🤖', label: '🤖 Bot' },
  { value: '📁', label: '📁 Pasta' },
  { value: '💼', label: '💼 Maleta' },
  { value: '❓', label: '❓ Pergunta' },
  { value: '💬', label: '💬 Chat' },
  { value: '⚠️', label: '⚠️ Aviso' },
  { value: '🏛️', label: '🏛️ Banco' },
  { value: '👤', label: '👤 Usuário' },
  { value: '👤👤', label: '👤👤 Usuários' },
  { value: '📊', label: '📊 Gráfico' },
  { value: '💳', label: '💳 Cartão' },
  { value: '🔗', label: '🔗 Link' },
  { value: '⚖️', label: '⚖️ Justiça' }
];

export const AddShortcutDialog = ({ isOpen, onOpenChange, groupId, groupTitle }: AddShortcutDialogProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('🔗');
  
  const queryClient = useQueryClient();

  // Mutation para criar novo atalho
  const createShortcutMutation = useMutation({
    mutationFn: async (shortcutData: { title: string; url: string; icon: string; group_id: string }) => {
      // Buscar o próximo order (último atalho do grupo + 1)
      const { data: lastShortcut } = await supabase
        .from('shortcuts')
        .select('order')
        .eq('group_id', groupId)
        .order('order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = lastShortcut ? lastShortcut.order + 1 : 0;

      const { data, error } = await supabase
        .from('shortcuts')
        .insert({
          ...shortcutData,
          order: nextOrder
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] });
      toast.success('Atalho criado com sucesso!');
      handleClose();
    },
    onError: (error) => {
      console.error('Erro ao criar atalho:', error);
      toast.error('Erro ao criar atalho. Tente novamente.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      toast.error('Por favor, insira uma URL válida.');
      return;
    }

    createShortcutMutation.mutate({
      title: title.trim(),
      url: url.trim(),
      icon,
      group_id: groupId
    });
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setIcon('🔗');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Atalho
          </DialogTitle>
          <DialogDescription>
            Adicionar um novo atalho ao grupo "{groupTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Google Drive"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex: https://drive.google.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    {iconOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createShortcutMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createShortcutMutation.isPending}
            >
              {createShortcutMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Atalho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
