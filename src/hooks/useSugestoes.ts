import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SugestaoItem {
  valor: string;
  frequencia: number;
  ultimo_uso: string;
}

// Cache para evitar requisições desnecessárias
const cache = new Map<string, { data: SugestaoItem[]; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Throttling para evitar muitas requisições simultâneas
const activeRequests = new Map<string, Promise<SugestaoItem[]>>();

// Função de retry com backoff exponencial
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Se for erro de recursos insuficientes, aguardar mais tempo
      const isResourceError = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') || 
                             error?.message?.includes('Failed to fetch');
      const delay = isResourceError ? baseDelay * Math.pow(2, attempt + 1) : baseDelay * Math.pow(2, attempt);
      
      console.warn(`Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Máximo de tentativas excedido');
};

export const useSugestoes = () => {
  const [loading, setLoading] = useState(false);

  // Buscar sugestões para órgãos julgadores mais utilizados por grau
  const buscarSugestoesOrgaoJulgador = async (grau: string): Promise<SugestaoItem[]> => {
    if (!grau) return [];
    
    const cacheKey = `orgao_julgador_${grau}`;
    
    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Verificar se já existe uma requisição em andamento
    if (activeRequests.has(cacheKey)) {
      return activeRequests.get(cacheKey)!;
    }
    
    const requestPromise = retryWithBackoff(async () => {
      setLoading(true);
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('chamados')
        .select('orgao_julgador, created_at')
        .not('orgao_julgador', 'is', null)
        .eq('grau', grau)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;

      // Agrupar por órgão julgador e contar frequência
      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const orgao = item.orgao_julgador!;
        const atual = contadores.get(orgao) || { count: 0, ultimoUso: item.created_at };
        contadores.set(orgao, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      // Converter para array e ordenar por frequência
      const result = Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10); // Top 10
        
      // Salvar no cache
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }).catch(err => {
      console.error('Erro ao buscar sugestões de órgão julgador:', err);
      // Retornar dados do cache mesmo que expirados, se disponíveis
      return cached?.data || [];
    }).finally(() => {
      setLoading(false);
      activeRequests.delete(cacheKey);
    });
    
    activeRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  // Buscar sugestões para perfis de usuário mais utilizados
  const buscarSugestoesPerfil = async (): Promise<SugestaoItem[]> => {
    const cacheKey = 'perfil_usuario';
    
    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Verificar se já existe uma requisição em andamento
    if (activeRequests.has(cacheKey)) {
      return activeRequests.get(cacheKey)!;
    }
    
    const requestPromise = retryWithBackoff(async () => {
      setLoading(true);
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('chamados')
        .select('perfil_usuario_afetado, created_at')
        .not('perfil_usuario_afetado', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30); // Reduzido de 50 para 30

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const perfil = item.perfil_usuario_afetado!;
        const atual = contadores.get(perfil) || { count: 0, ultimoUso: item.created_at };
        contadores.set(perfil, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      const result = Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
        
      // Salvar no cache
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }).catch(err => {
      console.error('Erro ao buscar sugestões de perfil:', err);
      // Retornar dados do cache mesmo que expirados, se disponíveis
      return cached?.data || [];
    }).finally(() => {
      setLoading(false);
      activeRequests.delete(cacheKey);
    });
    
    activeRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  // Buscar sugestões para chamados origem mais utilizados
  const buscarSugestoesChamadoOrigem = async (): Promise<SugestaoItem[]> => {
    const cacheKey = 'chamado_origem';
    
    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Verificar se já existe uma requisição em andamento
    if (activeRequests.has(cacheKey)) {
      return activeRequests.get(cacheKey)!;
    }
    
    const requestPromise = retryWithBackoff(async () => {
      setLoading(true);
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('chamados')
        .select('chamado_origem, created_at')
        .not('chamado_origem', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30); // Reduzido de 50 para 30

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const origem = item.chamado_origem!;
        const atual = contadores.get(origem) || { count: 0, ultimoUso: item.created_at };
        contadores.set(origem, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      const result = Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
        
      // Salvar no cache
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }).catch(err => {
      console.error('Erro ao buscar sugestões de chamado origem:', err);
      // Retornar dados do cache mesmo que expirados, se disponíveis
      return cached?.data || [];
    }).finally(() => {
      setLoading(false);
      activeRequests.delete(cacheKey);
    });
    
    activeRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  // Buscar sugestões para títulos/resumos mais utilizados
  const buscarSugestoesResumo = async (): Promise<SugestaoItem[]> => {
    try {
      setLoading(true);
      
      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('chamados')
        .select('titulo, created_at')
        .not('titulo', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const titulo = item.titulo!;
        const atual = contadores.get(titulo) || { count: 0, ultimoUso: item.created_at };
        contadores.set(titulo, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      return Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
    } catch (err: any) {
      console.error('Erro ao buscar sugestões de resumo:', err);
      
      // Tratamento específico para erros de conectividade e timeout
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
          console.warn('Problema de conectividade com Supabase - retornando lista vazia');
        } else if (err.message.includes('Timeout')) {
          console.warn('Timeout na busca de sugestões de resumo - retornando lista vazia');
        }
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    buscarSugestoesOrgaoJulgador,
    buscarSugestoesPerfil,
    buscarSugestoesChamadoOrigem,
    buscarSugestoesResumo,
    loading
  };
};