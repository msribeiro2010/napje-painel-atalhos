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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{chamado.titulo}</CardTitle>
            <CardDescription className="flex items-center mt-2">
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
            <h4 className="font-medium text-gray-900 mb-1">Descrição do Problema</h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded border">
              {chamado.descricao}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
            {chamado.grau && (
              <div>
                <span className="font-medium text-gray-900">Grau:</span>
                <span className="ml-2 text-gray-700">{chamado.grau}</span>
              </div>
            )}
            
            {chamado.numero_processo && (
              <div>
                <span className="font-medium text-gray-900">Processo:</span>
                <span className="ml-2 text-gray-700 font-mono">
                  {chamado.numero_processo}
                </span>
              </div>
            )}

            {chamado.chamado_origem && (
              <div>
                <span className="font-medium text-gray-900">Chamado Origem:</span>
                <span className="ml-2 text-gray-700 font-mono">
                  {chamado.chamado_origem}
                </span>
              </div>
            )}
            
            {chamado.orgao_julgador && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-900">Órgão Julgador:</span>
                <span className="ml-2 text-gray-700">{chamado.orgao_julgador}</span>
              </div>
            )}
          </div>

          {formatarUsuario(chamado) && (
            <div className="border-t pt-3">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-900">Usuário:</span>
                <span className="ml-2 text-gray-700 text-sm">
                  {formatarUsuario(chamado)}
                </span>
              </div>
            </div>
          )}

          {/* Ações do Chamado */}
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopiar(chamado)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTemplate(chamado)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicar(chamado)}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Files className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditar(chamado)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
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