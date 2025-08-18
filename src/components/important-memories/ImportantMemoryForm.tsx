import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImportantMemory, ImportantMemoryFormData } from '@/hooks/useImportantMemories';
import { Eye, EyeOff, Save, X } from 'lucide-react';

interface ImportantMemoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ImportantMemoryFormData) => Promise<boolean>;
  editingMemory?: ImportantMemory | null;
  isLoading?: boolean;
}

const categories = [
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'geral', label: 'Geral' },
];

const initialFormData: ImportantMemoryFormData = {
  title: '',
  description: '',
  category: 'geral',
  username: '',
  password: '',
  url: '',
  notes: '',
  is_favorite: false,
};

export const ImportantMemoryForm: React.FC<ImportantMemoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingMemory,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ImportantMemoryFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingMemory) {
      setFormData({
        title: editingMemory.title,
        description: editingMemory.description || '',
        category: editingMemory.category,
        username: editingMemory.username || '',
        password: editingMemory.password || '',
        url: editingMemory.url || '',
        notes: editingMemory.notes || '',
        is_favorite: editingMemory.is_favorite || false,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setShowPassword(false);
  }, [editingMemory, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'URL inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  const handleInputChange = (field: keyof ImportantMemoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMemory ? 'Editar Memória Importante' : 'Nova Memória Importante'}
          </DialogTitle>
          <DialogDescription>
            Armazene informações importantes como senhas, logins e dados pessoais de forma segura.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: PJe Homologação"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição detalhada da memória"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://exemplo.com"
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && (
                <p className="text-sm text-red-500 mt-1">{errors.url}</p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Usuário/Login</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Nome de usuário"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notas Adicionais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais, observações, etc."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_favorite"
                  checked={formData.is_favorite}
                  onCheckedChange={(checked) => handleInputChange('is_favorite', checked as boolean)}
                />
                <Label htmlFor="is_favorite">Marcar como favorito</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : editingMemory ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};