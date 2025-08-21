import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrgaoJulgador } from '@/hooks/useOrgaosJulgadores';

interface OrgaoJulgadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgao?: OrgaoJulgador | null;
  onSave: (data: { codigo: string; nome: string }) => void;
  isLoading?: boolean;
}

export const OrgaoJulgadorDialog = ({
  open,
  onOpenChange,
  orgao,
  onSave,
  isLoading = false
}: OrgaoJulgadorDialogProps) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (orgao) {
      setCodigo(orgao.codigo);
      setNome(orgao.nome);
    } else {
      setCodigo('');
      setNome('');
    }
  }, [orgao, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.trim() && nome.trim()) {
      onSave({ codigo: codigo.trim(), nome: nome.trim() });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {orgao ? 'Editar Órgão Julgador' : 'Novo Órgão Julgador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Digite o código"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do órgão julgador"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};