import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Edit, Trash, Files, ArrowRight } from 'lucide-react';
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
  onEdit: (chamado: any) => void;
  onDuplicate: (chamado: any) => void;
  onDelete: (id: string) => void;
}

export const RecentChamados = ({ chamados, onEdit, onDuplicate, onDelete }: RecentChamadosProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 shadow-soft mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-soft">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Chamados Recentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Últimos chamados criados no sistema</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/chamados-recentes')}
            className="flex items-center gap-2 hover:scale-105 transition-all duration-300 bg-white/60 hover:bg-white shadow-sm"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chamados.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum chamado encontrado</h3>
            <p className="text-muted-foreground mb-6">Comece criando seu primeiro chamado no sistema</p>
            <Button 
              onClick={() => navigate('/criar-chamado')}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
            >
              Criar Primeiro Chamado
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chamados.map((chamado) => (
              <Card 
                key={chamado.id} 
                className="group hover:shadow-glow transition-all duration-300 cursor-pointer bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 hover:border-primary/30 hover:-translate-y-1"
                onClick={() => onEdit(chamado)}
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header do card */}
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gradient-secondary rounded-lg">
                        <FileText className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(chamado);
                          }}
                          className="h-7 w-7 p-0 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          title="Duplicar"
                        >
                          <Files className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(chamado);
                          }}
                          className="h-7 w-7 p-0 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                              className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                                onClick={e => { e.stopPropagation(); onDelete(chamado.id); }}
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
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
                        {chamado.titulo}
                      </h3>
                      
                      {/* Informações secundárias */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(chamado.created_at).toLocaleDateString('pt-BR')} às {' '}
                            {new Date(chamado.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {chamado.chamado_origem && (
                          <div className="bg-muted/30 px-2 py-1 rounded text-xs">
                            <span className="font-medium">Origem:</span> {chamado.chamado_origem}
                          </div>
                        )}
                        
                        {chamado.created_by_profile && (
                          <div className="bg-primary/5 px-2 py-1 rounded text-xs">
                            <span className="font-medium">Servidor:</span> {chamado.created_by_profile.nome_completo || chamado.created_by_profile.email}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Indicador de ação */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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