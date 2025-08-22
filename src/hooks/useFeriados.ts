import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Feriado = Tables<"feriados">;
type NovoFeriado = TablesInsert<"feriados">;
type AtualizarFeriado = TablesUpdate<"feriados">;

// Cache agressivo para feriados
interface FeriadoCache {
  data: Feriado[];
  timestamp: number;
}

let feriadosCache: FeriadoCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas (feriados mudam raramente)
const LOCAL_STORAGE_KEY = 'napje_feriados_cache';
const LOCAL_STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Funções para localStorage
const saveToLocalStorage = (data: Feriado[]) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Erro ao salvar feriados no localStorage:', error);
  }
};

const loadFromLocalStorage = (): Feriado[] | null => {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > LOCAL_STORAGE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Erro ao carregar feriados do localStorage:', error);
    return null;
  }
};

export const useFeriados = () => {
  return useQuery({
    queryKey: ["feriados"],
    queryFn: async () => {
      // Verifica cache em memória primeiro
      if (feriadosCache && Date.now() - feriadosCache.timestamp < CACHE_DURATION) {
        return feriadosCache.data;
      }

      // Verifica localStorage
      const cachedData = loadFromLocalStorage();
      if (cachedData) {
        feriadosCache = {
          data: cachedData,
          timestamp: Date.now()
        };
        return cachedData;
      }

      // Busca do servidor apenas se não houver cache válido
       const { data, error } = await supabase
         .from("feriados" as any)
         .select("id, data, nome, tipo, estado, cidade")
         .order("data", { ascending: true });

      if (error) throw error;
      
      // Atualiza ambos os caches
      feriadosCache = {
        data: data || [],
        timestamp: Date.now()
      };
      saveToLocalStorage(data || []);
      
      return data;
    },
    staleTime: CACHE_DURATION, // Considera os dados frescos por 24h
    gcTime: CACHE_DURATION * 2, // Mantém no cache do React Query por 48h
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
      // Limpa todos os caches
      feriadosCache = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
      // Limpa todos os caches
      feriadosCache = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
      // Limpa todos os caches
      feriadosCache = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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