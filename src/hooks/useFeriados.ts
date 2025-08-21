import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Feriado = Tables<"feriados">;
type NovoFeriado = TablesInsert<"feriados">;
type AtualizarFeriado = TablesUpdate<"feriados">;

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