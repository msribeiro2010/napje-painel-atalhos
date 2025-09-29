import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const PJE_API_URL = import.meta.env.VITE_PJE_API_URL || 'http://localhost:3001/api/pje';

export interface OrgaoJulgador {
  id: string;
  nome: string;
  sigla: string;
  cidade?: string;
  uf?: string;
  // Campos adicionais para compatibilidade com a API do PJe
  id_orgao_julgador?: number | string;
  ds_orgao_julgador?: string;
  ds_sigla?: string;
}

export interface ProcessoParte {
  in_participacao?: string;
  in_situacao?: string;
  ds_polo_parte?: string;
  nome_parte?: string;
  cpf?: string;
  cnpj?: string;
  tipo_parte?: string;
  polo?: string;
  situacao_parte?: string;
  dt_inclusao?: string;
  dt_desativacao?: string;
}

export interface TarefaHistorico {
  nome_tarefa?: string;
  responsavel?: string;
  data_inicio?: string;
  data_fim?: string;
  status_tarefa?: string;
  dias_na_tarefa?: number;
  prioridade?: number;
}

export interface TarefaAtual extends TarefaHistorico {
  nome_tarefa?: string;
  responsavel?: string;
  data_inicio?: string;
  dias_na_tarefa?: number;
}

export interface ProcessoDocumento {
  id_processo_documento?: number;
  dt_juntada?: string;
  nr_ordem_documento?: number;
  tipo_documento?: string;
  ds_identificador_unico?: string;
  juntado_por?: string;
}

export interface Processo {
  id_processo?: number;
  numero: string;
  ano: string;
  numero_unico?: string;
  vara?: number;
  classe?: string;
  classe_judicial?: string;
  data_autuacao?: string;
  prioridade?: string;
  orgao_julgador?: string;
  nome_orgao_julgador?: string; // Campo adicional para o nome completo do órgão julgador
  valor_causa?: number;
  partes?: ProcessoParte[];
  tarefa_atual?: TarefaAtual | null;
  historico_tarefas?: TarefaHistorico[];
  documentos?: ProcessoDocumento[];
}

export interface Servidor {
  id: string;
  nome: string;
  cpf?: string;
  matricula?: string;
  email?: string;
  tipo?: string;
  lotacao?: string;
  ativo?: boolean;
}

export const usePJeSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchOrgaosJulgadores = useCallback(async (grau: '1' | '2', cidade?: string): Promise<OrgaoJulgador[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ grau, ...(cidade && { cidade }) });
      const response = await fetch(`${PJE_API_URL}/orgaos-julgadores?${params}`);
      
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
      const params = new URLSearchParams({ grau, ...filters });
      const response = await fetch(`${PJE_API_URL}/processos?${params}`);
      
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
      const params = new URLSearchParams({ grau, ...filters });
      const response = await fetch(`${PJE_API_URL}/servidores?${params}`);
      
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