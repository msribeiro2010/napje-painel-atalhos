import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Edit, Trash, Files } from 'lucide-react';
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
    <Card className="bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#bfae7c] dark:text-[#bfae7c]" />
          <CardTitle className="text-[#7c6a3c] dark:text-[#f8f5e4]">Chamados Recentes</CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/chamados-recentes')}
          className="text-[#7c6a3c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] bg-[#f8f5e4] dark:bg-[#2d2717] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]"
        >
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent>
        {chamados.length === 0 ? (
          <div className="text-center py-8 text-[#bfae7c] dark:text-[#bfae7c]">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum chamado encontrado</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/criar-chamado')}
              className="mt-4 text-[#7c6a3c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] bg-[#f8f5e4] dark:bg-[#2d2717] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]"
            >
              Criar Primeiro Chamado
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chamados.map((chamado) => (
              <Card 
                key={chamado.id} 
                className="hover:shadow-glow transition-all cursor-pointer bg-[#f8f5e4] dark:bg-[#23201a] border-[#e2d8b8] dark:border-[#3a3320]"
                onClick={() => onEdit(chamado)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm line-clamp-2 text-[#7c6a3c] dark:text-[#f8f5e4]">{chamado.titulo}</h3>
                    <div className="text-xs text-[#bfae7c] dark:text-[#bfae7c] space-y-1">
                      <p>
                        {new Date(chamado.created_at).toLocaleDateString('pt-BR')} às {' '}
                        {new Date(chamado.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {chamado.chamado_origem && (
                        <p className="line-clamp-1">
                          Origem: {chamado.chamado_origem}
                        </p>
                      )}
                      {chamado.created_by_profile && (
                        <p className="line-clamp-1">
                          Servidor: {chamado.created_by_profile.nome_completo || chamado.created_by_profile.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 pt-2 border-t border-[#e2d8b8] dark:border-[#3a3320]">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(chamado);
                        }}
                        className="h-7 w-7 p-0 text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        title="Duplicar"
                      >
                        <Files className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(chamado);
                        }}
                        className="h-7 w-7 p-0 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 p-0 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Excluir"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#7c6a3c] dark:text-[#f8f5e4]">Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#bfae7c] dark:text-[#bfae7c]">
                              Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-[#7c6a3c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] bg-[#f8f5e4] dark:bg-[#2d2717] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(chamado.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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