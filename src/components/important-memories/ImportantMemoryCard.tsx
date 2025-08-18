import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  Star, 
  ExternalLink,
  User,
  Lock,
  Globe,
  StickyNote
} from 'lucide-react';
import { ImportantMemory } from '@/hooks/useImportantMemories';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ImportantMemoryCardProps {
  memory: ImportantMemory;
  onEdit: (memory: ImportantMemory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'sistemas': 'bg-blue-100 text-blue-800',
    'pessoal': 'bg-green-100 text-green-800',
    'trabalho': 'bg-purple-100 text-purple-800',
    'financeiro': 'bg-yellow-100 text-yellow-800',
    'geral': 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors['geral'];
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'sistemas': <Globe className="w-3 h-3" />,
    'pessoal': <User className="w-3 h-3" />,
    'trabalho': <Lock className="w-3 h-3" />,
    'financeiro': <StickyNote className="w-3 h-3" />,
    'geral': <StickyNote className="w-3 h-3" />,
  };
  return icons[category] || icons['geral'];
};

export const ImportantMemoryCard: React.FC<ImportantMemoryCardProps> = ({
  memory,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado para a área de transferência`);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const openUrl = () => {
    if (memory.url) {
      window.open(memory.url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{memory.title}</CardTitle>
            {memory.is_favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(memory.id, !memory.is_favorite)}
              className="h-8 w-8 p-0"
            >
              <Star 
                className={`w-4 h-4 ${
                  memory.is_favorite 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-400'
                }`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(memory)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a memória "{memory.title}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(memory.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(memory.category)}>
            {getCategoryIcon(memory.category)}
            <span className="ml-1 capitalize">{memory.category}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {memory.description && (
          <p className="text-sm text-gray-600">{memory.description}</p>
        )}

        {memory.url && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">URL:</span>
            <Button
              variant="link"
              size="sm"
              onClick={openUrl}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Abrir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(memory.url!, 'URL')}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}

        {memory.username && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Usuário:</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm ${showUsername ? '' : 'blur-sm'}`}>
                {memory.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUsername(!showUsername)}
                className="h-6 w-6 p-0"
              >
                {showUsername ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(memory.username!, 'Usuário')}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {memory.password && (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Senha:</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-mono ${showPassword ? '' : 'blur-sm'}`}>
                {showPassword ? memory.password : '••••••••'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-6 w-6 p-0"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(memory.password!, 'Senha')}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {memory.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Notas:</span>
            </div>
            <p className="text-sm text-gray-600 pl-6">{memory.notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2 border-t">
          Criado em: {formatDate(memory.created_at)}
          {memory.updated_at !== memory.created_at && (
            <span className="ml-2">
              • Atualizado em: {formatDate(memory.updated_at)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};