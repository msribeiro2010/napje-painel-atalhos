import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { FileText, Clock, Edit, Trash, Files, ArrowRight, Plus, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChamadoComPerfil } from '@/types/dashboard';

interface RecentChamadosProps {
  chamados: ChamadoComPerfil[];
  isLoading?: boolean;
  onDuplicar: (chamado: any) => void;
  onEditar: (chamado: any) => void;
  onExcluir: (id: string) => void;
}

export const RecentChamados = ({ 
  chamados, 
  isLoading = false, 
  onDuplicar, 
  onEditar, 
  onExcluir 
}: RecentChamadosProps) => {
  const navigate = useNavigate();

  return (
    <ModernCard variant="glass" className="overflow-hidden">
      <ModernCardHeader
        title="Chamados Recentes"
        description="Últimos chamados criados no sistema"
        icon={<TrendingUp className="h-5 w-5 text-white" />}
        action={
          <ModernButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/chamados-recentes')}
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Ver Todos
          </ModernButton>
        }
      />
      <ModernCardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-primary rounded-2xl opacity-20 animate-ping"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Carregando chamados...</p>
                <p className="text-sm text-muted-foreground">Aguarde um momento</p>
              </div>
            </div>
          </div>
        ) : chamados.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mx-auto w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <FileText className="h-12 w-12 text-white" />
              <div className="absolute -inset-2 bg-gradient-primary rounded-3xl opacity-20 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Nenhum chamado encontrado</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Comece criando seu primeiro chamado para organizar suas tarefas e acompanhar o progresso dos seus projetos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <ModernButton 
                variant="gradient"
                onClick={() => navigate('/criar-chamado')}
                icon={<Plus className="h-4 w-4" />}
                className="px-8 py-3"
              >
                Criar Primeiro Chamado
              </ModernButton>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-xl border border-border/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sistema pronto para uso</span>
              </div>
            </div>
            
            {/* Dicas rápidas */}
            <ModernGrid cols={3} gap="md" className="max-w-2xl mx-auto">
              <ModernGridItem>
                <ModernCard variant="glass" className="text-center p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-blue rounded-xl">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Organize</h4>
                      <p className="text-sm text-muted-foreground">Mantenha suas tarefas organizadas</p>
                    </div>
                  </div>
                </ModernCard>
              </ModernGridItem>
              
              <ModernGridItem>
                <ModernCard variant="glass" className="text-center p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-purple rounded-xl">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Acompanhe</h4>
                      <p className="text-sm text-muted-foreground">Monitore o progresso dos chamados</p>
                    </div>
                  </div>
                </ModernCard>
              </ModernGridItem>
              
              <ModernGridItem>
                <ModernCard variant="glass" className="text-center p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-green rounded-xl">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Colabore</h4>
                      <p className="text-sm text-muted-foreground">Trabalhe em equipe</p>
                    </div>
                  </div>
                </ModernCard>
              </ModernGridItem>
            </ModernGrid>
          </div>
        ) : (
          <ModernGrid cols={3} gap="md">
            {chamados.map((chamado) => (
              <ModernGridItem key={chamado.id}>
                <ModernCard 
                  variant="glass"
                  hover={true}
                  glow={true}
                  className="group cursor-pointer h-full"
                  onClick={() => onEditar(chamado)}
                >
                  <ModernCardContent className="p-4">
                    <div className="space-y-4 h-full flex flex-col">
                      {/* Header do card */}
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-gradient-primary rounded-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicar(chamado);
                            }}
                            className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Duplicar"
                          >
                            <Files className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditar(chamado);
                            }}
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Excluir"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/20" onClick={e => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={e => e.stopPropagation()}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={e => { e.stopPropagation(); onExcluir(chamado.id); }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {/* Conteúdo principal */}
                      <div className="space-y-3 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
                          {chamado.assunto || 'Chamado sem título'}
                        </h3>
                        
                        {/* Resumo do chamado */}
                        {chamado.descricao && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-muted/30 p-4 rounded-lg border border-border/20 cursor-help hover:bg-muted/40 transition-colors relative">
                                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                                    {chamado.descricao.length > 250 
                                      ? `${chamado.descricao.substring(0, 250)}...` 
                                      : chamado.descricao
                                    }
                                  </p>
                                  {chamado.descricao.length > 250 && (
                                    <div className="absolute top-2 right-2 text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded-full">
                                      Ver mais
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                align="start"
                                className="max-w-lg p-4 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg z-[9999]"
                                sideOffset={12}
                                avoidCollisions={true}
                                collisionPadding={16}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <h4 className="font-semibold text-sm text-foreground">Descrição Completa</h4>
                                  </div>
                                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                      {chamado.descricao}
                                    </p>
                                  </div>
                                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                                    {chamado.descricao.length} caracteres
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {/* Informações secundárias */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(chamado.created_at).toLocaleDateString('pt-BR')} às {' '}
                              {new Date(chamado.created_at).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {chamado.categoria && (
                              <div className="bg-primary/10 px-2 py-1 rounded-md text-xs">
                                <span className="font-medium">Categoria:</span> {chamado.categoria}
                              </div>
                            )}
                            
                            {chamado.status && (
                              <div className="bg-blue-500/10 px-2 py-1 rounded-md text-xs">
                                <span className="font-medium">Status:</span> {chamado.status}
                              </div>
                            )}
                            
                            {chamado.prioridade && (
                              <div className={`px-2 py-1 rounded-md text-xs ${
                                chamado.prioridade.toLowerCase() === 'alta' ? 'bg-red-500/10 text-red-700 dark:text-red-300' :
                                chamado.prioridade.toLowerCase() === 'média' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' :
                                'bg-green-500/10 text-green-700 dark:text-green-300'
                              }`}>
                                <span className="font-medium">Prioridade:</span> {chamado.prioridade}
                              </div>
                            )}
                          </div>
                          
                          {chamado.usuario_criador_nome && (
                            <div className="bg-purple-500/10 px-3 py-1 rounded-lg text-xs">
                              <span className="font-medium">Criado por:</span> {chamado.usuario_criador_nome}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Indicador de ação */}
                      <div className="h-1 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"></div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </ModernGridItem>
            ))}
          </ModernGrid>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};