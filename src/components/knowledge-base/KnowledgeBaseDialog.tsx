import { X, Image } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';
import { KnowledgeBaseFormData, KnowledgeBaseItem } from '@/types/knowledge-base';

interface KnowledgeBaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: KnowledgeBaseItem | null;
  formData: KnowledgeBaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<KnowledgeBaseFormData>>;
  categories: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

export const KnowledgeBaseDialog = ({
  isOpen,
  onOpenChange,
  editingItem,
  formData,
  setFormData,
  categories,
  onSubmit,
  onCancel
}: KnowledgeBaseDialogProps) => {

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Item' : 'Novo Item da Base de Conhecimento'}
          </DialogTitle>
          <DialogDescription>
            Adicione informações para ajudar na resolução de problemas futuros
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título descritivo do problema/solução"
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="problema">Descrição do Problema *</Label>
            <Textarea
              id="problema"
              value={formData.problema_descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, problema_descricao: e.target.value }))}
              placeholder="Descreva detalhadamente o problema..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="solucao">Solução *</Label>
            <Textarea
              id="solucao"
              value={formData.solucao}
              onChange={(e) => setFormData(prev => ({ ...prev, solucao: e.target.value }))}
              placeholder="Descreva a solução passo a passo..."
              rows={6}
            />
          </div>
          <div>
            <MediaUpload
              files={formData.images || []}
              onFilesChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
              maxFiles={3}
              maxFileSize={10}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Digite uma tag e pressione Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          

        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {editingItem ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};