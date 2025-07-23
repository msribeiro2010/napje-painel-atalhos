import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Copy, RefreshCw, Edit, Trash, Files } from 'lucide-react';
import { Chamado } from '@/hooks/useChamados';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatarUsuario, getStatusColor } from '@/utils/chamado-utils';
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

interface ChamadoCardProps {
  chamado: Chamado;
  onCopiar: (chamado: Chamado) => void;
  onTemplate: (chamado: Chamado) => void;
  onDuplicar: (chamado: Chamado) => void;
  onEditar: (chamado: Chamado) => void;
  onExcluir: (id: string) => void;
}

export const ChamadoCard = ({ 
  chamado, 
  onCopiar, 
  onTemplate, 
  onDuplicar,
  onEditar, 
  onExcluir 
}: ChamadoCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-[#7c6a3c] dark:text-[#f8f5e4]">{chamado.titulo}</CardTitle>
            <CardDescription className="flex items-center mt-2 text-[#bfae7c] dark:text-[#bfae7c]">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(chamado.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </CardDescription>
          </div>
          <Badge 
            className={`${getStatusColor(chamado.status)} text-white`}
          >
            {chamado.status || 'Sem status'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4] mb-1">Descrição do Problema</h4>
            <p className="text-[#7c6a3c] dark:text-[#f8f5e4] text-sm bg-[#f3ecd2] dark:bg-[#23201a] p-3 rounded border border-[#e2d8b8] dark:border-[#3a3320]">
              {chamado.descricao}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#e2d8b8] dark:border-[#3a3320]">
            {chamado.grau && (
              <div>
                <span className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4]">Grau:</span>
                <span className="ml-2 text-[#bfae7c] dark:text-[#bfae7c]">{chamado.grau}</span>
              </div>
            )}
            
            {chamado.numero_processo && (
              <div>
                <span className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4]">Processo:</span>
                <span className="ml-2 text-[#bfae7c] dark:text-[#bfae7c] font-mono">
                  {chamado.numero_processo}
                </span>
              </div>
            )}

            {chamado.chamado_origem && (
              <div>
                <span className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4]">Chamado Origem:</span>
                <span className="ml-2 text-[#bfae7c] dark:text-[#bfae7c] font-mono">
                  {chamado.chamado_origem}
                </span>
              </div>
            )}
            
            {chamado.orgao_julgador && (
              <div className="md:col-span-2">
                <span className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4]">Órgão Julgador:</span>
                <span className="ml-2 text-[#bfae7c] dark:text-[#bfae7c]">{chamado.orgao_julgador}</span>
              </div>
            )}
          </div>

          {formatarUsuario(chamado) && (
            <div className="border-t border-[#e2d8b8] dark:border-[#3a3320] pt-3">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-[#bfae7c] dark:text-[#bfae7c]" />
                <span className="font-medium text-[#7c6a3c] dark:text-[#f8f5e4]">Usuário:</span>
                <span className="ml-2 text-[#bfae7c] dark:text-[#bfae7c] text-sm">
                  {formatarUsuario(chamado)}
                </span>
              </div>
            </div>
          )}

          {/* Ações do Chamado */}
          <div className="border-t border-[#e2d8b8] dark:border-[#3a3320] pt-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopiar(chamado)}
                className="text-[#7c6a3c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] bg-[#f8f5e4] dark:bg-[#2d2717] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTemplate(chamado)}
                className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicar(chamado)}
                className="text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Files className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditar(chamado)}
                className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Excluir
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
                      onClick={() => onExcluir(chamado.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};