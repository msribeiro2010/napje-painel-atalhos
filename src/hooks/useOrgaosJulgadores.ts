import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { orgaosJulgadores } from '@/constants/form-options';

export interface OrgaoJulgador {
  id: string;
  codigo: string;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

// Cache agressivo para órgãos julgadores
interface OrgaoCache {
  [key: string]: {
    data: OrgaoJulgador[];
    timestamp: number;
  };
}

let orgaosCache: OrgaoCache = {};
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 horas (órgãos mudam raramente)
const LOCAL_STORAGE_KEY = 'napje_orgaos_cache';
const LOCAL_STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Funções para localStorage
const saveToLocalStorage = (data: OrgaoJulgador[], grau: string) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${grau}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Erro ao salvar órgãos no localStorage:', error);
  }
};

const loadFromLocalStorage = (grau: string): OrgaoJulgador[] | null => {
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${grau}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > LOCAL_STORAGE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${grau}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Erro ao carregar órgãos do localStorage:', error);
    return null;
  }
};

export interface CreateOrgaoJulgador {
  codigo: string;
  nome: string;
}

export const useOrgaosJulgadores = (grau: '1grau' | '2grau') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tableName = grau === '1grau' ? 'orgaos_julgadores_1grau' : 'orgaos_julgadores_2grau';

  // Query para buscar órgãos julgadores com cache agressivo
  const {
    data: orgaos = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['orgaos-julgadores', grau],
    queryFn: async () => {
      // Verificar cache em memória primeiro
       const cacheKey = grau;
       if (orgaosCache[cacheKey] && Date.now() - orgaosCache[cacheKey].timestamp < CACHE_DURATION) {
         console.log(`🚀 Cache hit para órgãos ${grau}`);
         return orgaosCache[cacheKey].data;
       }
       
       // Verificar localStorage
       const cachedData = loadFromLocalStorage(grau);
       if (cachedData) {
         console.log(`💾 Dados carregados do localStorage para ${grau}`);
         // Atualizar cache em memória
         orgaosCache[cacheKey] = {
           data: cachedData,
           timestamp: Date.now()
         };
         return cachedData;
       }
      
      try {
        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const queryPromise = supabase
          .from(tableName)
          .select('id, codigo, nome');

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) throw error;
        
        let finalData: OrgaoJulgador[];
        
        // Se não há dados no banco, usar dados estáticos como fallback
        if (!data || data.length === 0) {
          console.log(`ℹ️ Tabela ${tableName} vazia, usando dados estáticos como fallback`);
          
          // Filtrar órgãos por grau baseado no código
          const orgaosFiltrados = grau === '1grau' 
            ? orgaosJulgadores.filter(org => parseInt(org.codigo) < 200)
            : orgaosJulgadores.filter(org => parseInt(org.codigo) >= 200);
          
          finalData = orgaosFiltrados.map((orgao, index) => ({
            id: `fallback-${grau}-${index}`,
            codigo: orgao.codigo,
            nome: orgao.nome,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
        } else {
          finalData = data as OrgaoJulgador[];
        }
        
        // Salvar nos caches
         orgaosCache[cacheKey] = {
           data: finalData,
           timestamp: Date.now()
         };
         saveToLocalStorage(finalData, grau);
        
        return finalData;
      } catch (err: any) {
        console.error(`Erro ao carregar órgãos julgadores ${grau} do banco:`, err);
        
        // Em caso de erro de conectividade ou timeout, tenta carregar do localStorage
        if (err?.message?.includes('Failed to fetch') || 
            err?.message?.includes('Timeout') ||
            err?.name === 'TypeError') {
          const fallbackData = loadFromLocalStorage(grau);
          if (fallbackData) {
            console.log(`Carregando órgãos ${grau} do cache local devido a problemas de conectividade`);
            return fallbackData;
          }
        }
        
        // Em caso de erro, usar dados estáticos como fallback
        const orgaosFiltrados = grau === '1grau' 
          ? orgaosJulgadores.filter(org => parseInt(org.codigo) < 200)
          : orgaosJulgadores.filter(org => parseInt(org.codigo) >= 200);
        
        const orgaosFallback = orgaosFiltrados.map((orgao, index) => ({
          id: `fallback-${grau}-${index}`,
          codigo: orgao.codigo,
          nome: orgao.nome,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        return orgaosFallback as OrgaoJulgador[];
      }
    },
    staleTime: CACHE_DURATION, // Dados considerados frescos por 12 horas
    gcTime: CACHE_DURATION * 2, // Manter no cache do React Query por 24 horas
    refetchOnWindowFocus: false, // Não refetch ao focar na janela
    refetchOnMount: false // Não refetch ao montar se já tem dados
  });

  // Mutation para criar órgão julgador
  const createOrgao = useMutation({
    mutationFn: async (orgao: CreateOrgaoJulgador) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const insertPromise = supabase
        .from(tableName)
        .insert([orgao])
        .select()
        .single();

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Limpar caches ao criar
       orgaosCache = {};
       localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${grau}`);
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador criado com sucesso.",
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
          description: error.message || "Erro ao criar órgão julgador.",
          variant: "destructive",
        });
      }
    }
  });

  // Mutation para atualizar órgão julgador
  const updateOrgao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrgaoJulgador> & { id: string }) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const updatePromise = supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Limpar caches ao atualizar
       orgaosCache = {};
       localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${grau}`);
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador atualizado com sucesso.",
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
          description: error.message || "Erro ao atualizar órgão julgador.",
          variant: "destructive",
        });
      }
    }
  });

  // Mutation para deletar órgão julgador
  const deleteOrgao = useMutation({
    mutationFn: async (id: string) => {
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const deletePromise = supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      const { error } = await Promise.race([deletePromise, timeoutPromise]) as any;

      if (error) throw error;
    },
    onSuccess: () => {
      // Limpar caches ao deletar
       orgaosCache = {};
       localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${grau}`);
      queryClient.invalidateQueries({ queryKey: ['orgaos-julgadores', grau] });
      toast({
        title: "Sucesso!",
        description: "Órgão julgador excluído com sucesso.",
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
          description: error.message || "Erro ao excluir órgão julgador.",
          variant: "destructive",
        });
      }
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