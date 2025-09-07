import { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Image, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { KnowledgeBaseItem } from '@/types/knowledge-base';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeBaseCardProps {
  item: KnowledgeBaseItem;
  onEdit: (item: KnowledgeBaseItem) => void;
  onDelete?: (itemId: string) => void;
  onIncrementView?: (itemId: string) => void;
  onIncrementUtil?: (itemId: string) => void;
}

export const KnowledgeBaseCard = ({ item, onEdit, onDelete, onIncrementView, onIncrementUtil }: KnowledgeBaseCardProps) => {
  const { user } = useAuth();
  
  // Verificar se o usuário é admin - vamos buscar do perfil
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.is_admin || false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{item.titulo}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onIncrementView?.(item.id)}
                      className="flex items-center gap-1 h-auto p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      {item.visualizacoes || 0} visualizações
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para incrementar visualizações</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onIncrementUtil?.(item.id)}
                      className="flex items-center gap-1 h-auto p-1 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {item.util_count || 0} úteis
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marcar como útil</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {item.categoria && (
                <Badge variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                  {item.categoria}
                </Badge>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(item)}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este item da base de conhecimento? Esta ação não pode ser desfeita.
                        <br /><br />
                        <strong>Título:</strong> {item.titulo}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(item.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-400 pl-4 py-2 rounded-r">
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
              Problema:
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.problema_descricao}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 dark:border-green-400 pl-4 py-2 rounded-r">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              Solução:
            </h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{item.solucao}</p>
          </div>
          {/* Funcionalidade de media_files removida */}
          
          {/* Fallback para arquivo_print (compatibilidade) */}
          {item.arquivo_print && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Image className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Print/Screenshot anexado:</span>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                <img 
                  src={`https://zpufcvesenbhtmizmjiz.supabase.co/storage/v1/object/public/knowledge-base-files/${item.arquivo_print}`}
                  alt="Print do problema/solução"
                  className="w-full max-h-64 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open(`https://zpufcvesenbhtmizmjiz.supabase.co/storage/v1/object/public/knowledge-base-files/${item.arquivo_print}`, '_blank')}
                />
              </div>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};