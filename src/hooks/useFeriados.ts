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
      try {
        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const queryPromise = supabase
          .from("feriados" as any)
          .select("id, data, nome, tipo, estado, cidade")
          .order("data", { ascending: true });

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) throw error;
      
        // Atualiza ambos os caches
        feriadosCache = {
          data: data || [],
          timestamp: Date.now()
        };
        saveToLocalStorage(data || []);
        
        return data;
      } catch (error: any) {
        console.error('Erro ao buscar feriados:', error);
        
        // Em caso de erro de conectividade ou timeout, tenta carregar do localStorage
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('Timeout') ||
            error?.name === 'TypeError') {
          const fallbackData = loadFromLocalStorage();
          if (fallbackData) {
            console.log('Carregando feriados do cache local devido a problemas de conectividade');
            return fallbackData;
          }
        }
        
        // Se não há dados em cache, retorna array vazio
        return [];
      }
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
      // Timeout de 10 segundos para criação de feriado
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const insertPromise = supabase
        .from("feriados")
        .insert(feriado)
        .select()
        .single();

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

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
    onError: (error: any) => {
      // Tratamento específico para erros de conectividade e timeout
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('TypeError: Failed to fetch')) {
        toast({
          title: "Erro de Conectividade",
          description: "Problema de conexão com o servidor. Tente novamente.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Timeout')) {
        toast({
          title: "Timeout",
          description: "A operação demorou muito para responder. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao adicionar feriado: " + error.message,
          variant: "destructive",
        });
      }
    },
  });
};

export const useUpdateFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AtualizarFeriado & { id: number }) => {
      // Timeout de 10 segundos para atualização de feriado
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const updatePromise = supabase
        .from("feriados")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

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
    onError: (error: any) => {
      // Tratamento específico para erros de conectividade e timeout
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('TypeError: Failed to fetch')) {
        toast({
          title: "Erro de Conectividade",
          description: "Problema de conexão com o servidor. Tente novamente.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Timeout')) {
        toast({
          title: "Timeout",
          description: "A operação demorou muito para responder. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar feriado: " + error.message,
          variant: "destructive",
        });
      }
    },
  });
};

export const useDeleteFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Timeout de 10 segundos para exclusão de feriado
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const deletePromise = supabase
        .from("feriados")
        .delete()
        .eq("id", id);

      const { error } = await Promise.race([deletePromise, timeoutPromise]) as any;

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
    onError: (error: any) => {
      // Tratamento específico para erros de conectividade e timeout
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('TypeError: Failed to fetch')) {
        toast({
          title: "Erro de Conectividade",
          description: "Problema de conexão com o servidor. Tente novamente.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Timeout')) {
        toast({
          title: "Timeout",
          description: "A operação demorou muito para responder. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao remover feriado: " + error.message,
          variant: "destructive",
        });
      }
    },
  });
};