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
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from("aniversariantes")
        .select("*")
        .order("data_nascimento", { ascending: true });

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        if (error) throw error;
        return data;
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
            console.warn('Problema de conectividade com Supabase - retornando lista vazia');
          } else if (err.message.includes('Timeout')) {
            console.warn('Timeout na busca de aniversariantes - retornando lista vazia');
          }
        }
        return [];
      }
    },
  });
};

export const useAniversariantesDoMes = () => {
  return useQuery({
    queryKey: ["aniversariantes-mes"],
    queryFn: async () => {
      const mesAtual = new Date().getMonth() + 1;
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from("aniversariantes")
        .select("*")
        .filter("data_nascimento", "like", `%-${mesAtual.toString().padStart(2, '0')}-%`)
        .order("data_nascimento", { ascending: true });

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        if (error) throw error;
        return data;
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
            console.warn('Problema de conectividade com Supabase - retornando lista vazia');
          } else if (err.message.includes('Timeout')) {
            console.warn('Timeout na busca de aniversariantes do mês - retornando lista vazia');
          }
        }
        return [];
      }
    },
  });
};

export const useCreateAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aniversariante: NovoAniversariante) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from("aniversariantes")
        .insert(aniversariante)
        .select()
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
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
      let errorMessage = "Erro ao adicionar aniversariante: " + error.message;
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          errorMessage = "Problema de conectividade. Verifique sua conexão.";
        } else if (error.message.includes('Timeout')) {
          errorMessage = "Operação demorou muito. Tente novamente.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AtualizarAniversariante & { id: number }) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from("aniversariantes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
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
      let errorMessage = "Erro ao atualizar aniversariante: " + error.message;
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          errorMessage = "Problema de conectividade. Verifique sua conexão.";
        } else if (error.message.includes('Timeout')) {
          errorMessage = "Operação demorou muito. Tente novamente.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAniversariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from("aniversariantes")
        .delete()
        .eq("id", id);

      const { error } = await Promise.race([queryPromise, timeoutPromise]) as any;
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
      let errorMessage = "Erro ao remover aniversariante: " + error.message;
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          errorMessage = "Problema de conectividade. Verifique sua conexão.";
        } else if (error.message.includes('Timeout')) {
          errorMessage = "Operação demorou muito. Tente novamente.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};