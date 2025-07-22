import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrgaoJulgador {
  id: string;
  codigo: string;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrgaoJulgador {
  codigo: string;
  nome: string;
}

export const useOrgaosJulgadores = (grau: '1grau' | '2grau') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tableName = grau === '1grau' ? 'orgaos_julgadores_1grau' : 'orgaos_julgadores_2grau';

  // Query para buscar órgãos julgadores
  const {
    data: orgaos = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['orgaos-julgadores', grau],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('codigo', { ascending: true });

      if (error) throw error;
      return data as OrgaoJulgador[];
    }
  });

  // Mutation para criar órgão julgador
  const createOrgao = useMutation({
    mutationFn: async (orgao: CreateOrgaoJulgador) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert([orgao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar órgão julgador.",
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar órgão julgador
  const updateOrgao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrgaoJulgador> & { id: string }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar órgão julgador.",
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar órgão julgador
  const deleteOrgao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir órgão julgador.",
        variant: "destructive",
      });
    }
  });

  return {
    orgaos,
    isLoading,
    error,
    createOrgao,
    updateOrgao,
    deleteOrgao
  };
};