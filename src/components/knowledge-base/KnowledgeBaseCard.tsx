import { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Image, Edit, Trash2, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { KnowledgeBaseItem, MediaFile } from '@/types/knowledge-base';
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
    <Card className="hover:shadow-large transition-all duration-300 hover:scale-[1.02] border-0 shadow-soft bg-card/90 backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors duration-200">{item.titulo}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onIncrementView?.(item.id)}
                      className="flex items-center gap-1 h-auto p-1 hover:text-primary hover:bg-primary/10 transition-all duration-200"
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
                      className="flex items-center gap-1 h-auto p-1 hover:text-green-600 hover:bg-green-500/10 transition-all duration-200"
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
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
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
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
          <div className="bg-destructive/5 border-l-4 border-destructive pl-4 py-2 rounded-r">
            <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              Problema:
            </h4>
            <p className="text-foreground/80 leading-relaxed">{item.problema_descricao}</p>
          </div>
          <div className="bg-green-500/5 border-l-4 border-green-500 pl-4 py-2 rounded-r">
            <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Solução:
            </h4>
            <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{item.solucao}</p>
          </div>
          {/* Exibir múltiplas mídias se disponíveis */}
          {item.media_files && (() => {
            try {
              const mediaFiles: MediaFile[] = typeof item.media_files === 'string' 
                ? JSON.parse(item.media_files) 
                : item.media_files;
              
              if (mediaFiles && mediaFiles.length > 0) {
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Image className="h-4 w-4 text-primary" />
                      <span>Mídias anexadas ({mediaFiles.length}):</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {mediaFiles.map((media, index) => (
                        <div key={media.id || index} className="border rounded-lg overflow-hidden bg-muted/20 relative group">
                          {media.type === 'image' ? (
                            <img 
                              src={`https://zpufcvesenbhtmizmjiz.supabase.co/storage/v1/object/public/knowledge-base-files/${media.url}`}
                              alt={media.name}
                              className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                              onClick={() => window.open(`https://zpufcvesenbhtmizmjiz.supabase.co/storage/v1/object/public/knowledge-base-files/${media.url}`, '_blank')}
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                                 onClick={() => window.open(`https://zpufcvesenbhtmizmjiz.supabase.co/storage/v1/object/public/knowledge-base-files/${media.url}`, '_blank')}>
                              <Play className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                            {media.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (error) {
              console.error('Erro ao parsear media_files:', error);
            }
            return null;
          })()}
          
          {/* Fallback para arquivo_print (compatibilidade) */}
          {!item.media_files && item.arquivo_print && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Image className="h-4 w-4 text-primary" />
                <span>Print/Screenshot anexado:</span>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted/20">
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
                <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200">
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