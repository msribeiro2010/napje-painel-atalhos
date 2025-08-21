import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AniversarianteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: number | null;
  formData: {
    nome: string;
    data_nascimento: string;
  };
  onFormDataChange: (data: { nome: string; data_nascimento: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetForm: () => void;
  isAdmin: boolean;
}

export const AniversarianteDialog = ({
  isOpen,
  onOpenChange,
  editingId,
  formData,
  onFormDataChange,
  onSubmit,
  onResetForm,
  isAdmin,
}: AniversarianteDialogProps) => {
  if (!isAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-pink-300 text-pink-700 hover:bg-pink-100 mt-2"
          onClick={onResetForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Editar Aniversariante" : "Adicionar Aniversariante"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => onFormDataChange({ ...formData, data_nascimento: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};