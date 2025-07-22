import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, X, Clock, Shield, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  email: string;
  nome_completo: string | null;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  approved_at: string | null;
  is_admin: boolean;
}

const AdminUsers = () => {
  const [filter, setFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('pendente');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', filter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'aprovado' | 'rejeitado' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          approved_at: status === 'aprovado' ? new Date().toISOString() : null,
          approved_by: status === 'aprovado' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(
        variables.status === 'aprovado' 
          ? 'Usuário aprovado com sucesso!' 
          : 'Usuário rejeitado!'
      );
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status do usuário');
      console.error(error);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="warning" className="animate-pulse"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="success"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = users?.filter(u => u.status === 'pendente').length || 0;

  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Gerenciamento de Usuários
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Aprove ou rejeite novos usuários do sistema
              </p>
            </div>
          </div>
          
          {pendingCount > 0 && (
            <div className="mt-6 p-5 bg-gradient-accent border border-warning/20 rounded-xl shadow-medium">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                <p className="text-warning-foreground font-medium">
                  <strong className="text-lg">{pendingCount}</strong> usuário(s) aguardando aprovação
                </p>
              </div>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  Gerencie o acesso dos usuários ao sistema
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'pendente' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pendente')}
                >
                  Pendentes ({users?.filter(u => u.status === 'pendente').length || 0})
                </Button>
                <Button
                  variant={filter === 'aprovado' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('aprovado')}
                >
                  Aprovados
                </Button>
                <Button
                  variant={filter === 'rejeitado' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('rejeitado')}
                >
                  Rejeitados
                </Button>
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.nome_completo || 'Nome não informado'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {user.is_admin && <Badge variant="outline">Admin</Badge>}
                      </TableCell>
                      <TableCell>
                        {user.status === 'pendente' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateUserStatus.mutate({ userId: user.id, status: 'aprovado' })}
                              disabled={updateUserStatus.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateUserStatus.mutate({ userId: user.id, status: 'rejeitado' })}
                              disabled={updateUserStatus.isPending}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                        {user.status === 'rejeitado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus.mutate({ userId: user.id, status: 'aprovado' })}
                            disabled={updateUserStatus.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;