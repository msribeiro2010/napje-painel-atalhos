import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Edit, Trash, Files, ArrowRight, Plus, Sparkles, CheckCircle } from 'lucide-react';
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
    <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-900/90 dark:to-slate-800/50 backdrop-blur-sm border-white/20 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-soft">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chamados Recentes</CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Últimos chamados criados no sistema</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/chamados-recentes')}
            className="flex items-center gap-2 hover:scale-105 transition-all duration-300 bg-white/60 hover:bg-white shadow-sm border-blue-200 hover:border-blue-300 h-8"
          >
            Ver Todos
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="relative">
                <FileText className="h-6 w-6 animate-pulse text-blue-500" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm font-medium">Carregando chamados...</p>
            </div>
          </div>
        ) : chamados.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
              <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum chamado encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed text-sm">
              Comece criando seu primeiro chamado para organizar suas tarefas e acompanhar o progresso dos seus projetos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                onClick={() => navigate('/criar-chamado')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-soft hover:shadow-glow transition-all duration-300 px-6 py-2 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Chamado
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Sistema pronto para uso</span>
              </div>
            </div>
            
            {/* Dicas rápidas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/40">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Organize</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mantenha suas tarefas organizadas</p>
              </div>
              
              <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/40">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Acompanhe</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Monitore o progresso dos chamados</p>
              </div>
              
              <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/40">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                    <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Colabore</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trabalhe em equipe</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chamados.map((chamado) => (
              <Card 
                key={chamado.id} 
                className="group hover:shadow-glow transition-all duration-300 cursor-pointer bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1"
                onClick={() => onEditar(chamado)}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Header do card */}
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-soft">
                        <FileText className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicar(chamado);
                          }}
                          className="h-6 w-6 p-0 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          title="Duplicar"
                        >
                          <Files className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditar(chamado);
                          }}
                          className="h-6 w-6 p-0 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          title="Editar"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                              title="Excluir"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20" onClick={e => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/60 hover:bg-white" onClick={e => e.stopPropagation()}>
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
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xs line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {chamado.assunto || 'Chamado sem título'}
                      </h3>
                      
                      {/* Informações secundárias */}
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(chamado.created_at).toLocaleDateString('pt-BR')} às {' '}
                            {new Date(chamado.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {chamado.categoria && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-xs">
                            <span className="font-medium">Categoria:</span> {chamado.categoria}
                          </div>
                        )}
                        
                        {chamado.usuario_criador_nome && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded text-xs">
                            <span className="font-medium">Criado por:</span> {chamado.usuario_criador_nome}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Indicador de ação */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};