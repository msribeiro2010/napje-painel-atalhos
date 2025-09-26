import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PJE_API_URL = import.meta.env.VITE_PJE_API_URL || 'http://localhost:3001/api/pje';

export interface OrgaoJulgador {
  id: string;
  nome: string;
  sigla: string;
}

export interface Processo {
  numero: string;
  ano: string;
  classe: string;
  data_autuacao: string;
  orgao_julgador: string;
}

export interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  email: string;
}

export const usePJeSearchSecure = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para obter o token de autenticação
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const searchOrgaosJulgadores = useCallback(async (grau: '1' | '2', search?: string): Promise<OrgaoJulgador[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ grau, ...(search && { search }) });
      const response = await fetch(`${PJE_API_URL}/orgaos-julgadores?${params}`, {
        headers,
        credentials: 'include',
      });
      
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (response.status === 403) {
        throw new Error('Você não tem permissão para acessar dados do PJe.');
      }
      
      if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao buscar órgãos julgadores');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchProcessos = useCallback(async (
    grau: '1' | '2',
    filters: { numero?: string; ano?: string; oj?: string }
  ): Promise<Processo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ grau, ...filters });
      const response = await fetch(`${PJE_API_URL}/processos?${params}`, {
        headers,
        credentials: 'include',
      });
      
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (response.status === 403) {
        throw new Error('Você não tem permissão para acessar dados do PJe.');
      }
      
      if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao buscar processos');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchServidores = useCallback(async (
    grau: '1' | '2',
    filters: { nome?: string; cpf?: string; matricula?: string }
  ): Promise<Servidor[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ grau, ...filters });
      const response = await fetch(`${PJE_API_URL}/servidores?${params}`, {
        headers,
        credentials: 'include',
      });
      
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (response.status === 403) {
        throw new Error('Você não tem permissão para acessar dados do PJe.');
      }
      
      if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao buscar servidores');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    searchOrgaosJulgadores,
    searchProcessos,
    searchServidores,
  };
};