import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Feriado = Tables<"feriados">;
type NovoFeriado = TablesInsert<"feriados">;
type AtualizarFeriado = TablesUpdate<"feriados">;

export interface FeriadoEssencial {
  data: string;
  descricao: string;
  tipo: 'nacional' | 'estadual' | 'municipal';
}

// Lista de feriados essenciais para 2025
export const feriadosEssenciais2025: FeriadoEssencial[] = [
  { data: '2025-01-01', descricao: 'Ano Novo', tipo: 'nacional' },
  { data: '2025-01-25', descricao: 'Aniversário de São Paulo', tipo: 'municipal' },
  { data: '2025-02-17', descricao: 'Carnaval', tipo: 'nacional' },
  { data: '2025-02-18', descricao: 'Carnaval', tipo: 'nacional' },
  { data: '2025-03-19', descricao: 'Dia de São José', tipo: 'municipal' },
  { data: '2025-04-18', descricao: 'Sexta-feira Santa', tipo: 'nacional' },
  { data: '2025-04-21', descricao: 'Tiradentes', tipo: 'nacional' },
  { data: '2025-05-01', descricao: 'Dia do Trabalho', tipo: 'nacional' },
  { data: '2025-06-12', descricao: 'Corpus Christi', tipo: 'nacional' },
  { data: '2025-07-09', descricao: 'Revolução Constitucionalista', tipo: 'estadual' },
  { data: '2025-08-11', descricao: 'Dia do Estudante', tipo: 'nacional' }, // ← ESTE ESTAVA FALTANDO
  { data: '2025-09-07', descricao: 'Independência do Brasil', tipo: 'nacional' },
  { data: '2025-10-12', descricao: 'Nossa Senhora Aparecida', tipo: 'nacional' },
  { data: '2025-11-02', descricao: 'Finados', tipo: 'nacional' },
  { data: '2025-11-15', descricao: 'Proclamação da República', tipo: 'nacional' },
  { data: '2025-11-20', descricao: 'Dia da Consciência Negra', tipo: 'municipal' },
  { data: '2025-12-25', descricao: 'Natal', tipo: 'nacional' },
];

export const useFeriados = () => {
  return useQuery({
    queryKey: ["feriados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feriados")
        .select("*")
        .order("data", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useFeriadosDoAno = () => {
  const anoAtual = new Date().getFullYear();
  return useFeriados();
};

export const useCreateFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feriado: NovoFeriado) => {
      const { data, error } = await supabase
        .from("feriados")
        .insert(feriado)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado adicionado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar feriado: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AtualizarFeriado & { id: number }) => {
      const { data, error } = await supabase
        .from("feriados")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar feriado: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("feriados")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover feriado: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useVerificarFeriadosFaltantes = () => {
  return useQuery({
    queryKey: ["feriados-faltantes"],
    queryFn: async () => {
      // Buscar todos os feriados de 2025
      const { data: feriados, error } = await supabase
        .from('feriados')
        .select('*')
        .gte('data', '2025-01-01')
        .lte('data', '2025-12-31');

      if (error) throw error;

      // Encontrar feriados faltantes
      const faltantes = feriadosEssenciais2025.filter(essencial => 
        !feriados?.some(f => f.data === essencial.data)
      );

      return faltantes;
    },
  });
};

export const useCorrigirFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feriado: FeriadoEssencial) => {
      const { data, error } = await supabase
        .from("feriados")
        .insert({
          data: feriado.data,
          descricao: feriado.descricao,
          tipo: feriado.tipo
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      queryClient.invalidateQueries({ queryKey: ["feriados-faltantes"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast({
        title: "Feriado Corrigido",
        description: `${variables.descricao} foi adicionado com sucesso!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao corrigir feriado: " + error.message,
        variant: "destructive",
      });
    },
  });
};