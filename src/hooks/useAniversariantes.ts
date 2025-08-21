import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Aniversariante = Tables<"aniversariantes">;
type NovoAniversariante = TablesInsert<"aniversariantes">;
type AtualizarAniversariante = TablesUpdate<"aniversariantes">;

export const useAniversariantes = () => {
  return useQuery({
    queryKey: ["aniversariantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aniversariantes")
        .select("*")
        .order("data_nascimento", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAniversariantesDoMes = () => {
  return useQuery({
    queryKey: ["aniversariantes-mes"],
    queryFn: async () => {
      const mesAtual = new Date().getMonth() + 1;
      const { data, error } = await supabase
        .from("aniversariantes")
        .select("*")
        .filter("data_nascimento", "like", `%-${mesAtual.toString().padStart(2, '0')}-%`)
        .order("data_nascimento", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aniversariante: NovoAniversariante) => {
      const { data, error } = await supabase
        .from("aniversariantes")
        .insert(aniversariante)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes-mes"] });
      toast({
        title: "Sucesso",
        description: "Aniversariante adicionado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar aniversariante: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AtualizarAniversariante & { id: number }) => {
      const { data, error } = await supabase
        .from("aniversariantes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes-mes"] });
      toast({
        title: "Sucesso",
        description: "Aniversariante atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar aniversariante: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("aniversariantes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes-mes"] });
      toast({
        title: "Sucesso",
        description: "Aniversariante removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover aniversariante: " + error.message,
        variant: "destructive",
      });
    },
  });
};