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
      const url = `${PJE_API_URL}/servidores?${params}`;
      console.log('🔍 Fazendo requisição para:', url);
      
      const response = await fetch(url);
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta de erro:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📄 Texto da resposta (primeiros 200 chars):', responseText.substring(0, 200));
      
      // Check if response looks like JSON before parsing
      const trimmed = responseText.trim();
      if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
        console.error('❌ Resposta não parece ser JSON:', trimmed.substring(0, 100));
        throw new Error('Servidor retornou resposta inválida (não é JSON)');
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON parseado com sucesso:', Array.isArray(data) ? data.length : 'objeto', 'resultado(s)');
        return Array.isArray(data) ? data : [];
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Resposta completa (primeiros 500 chars):', responseText.substring(0, 500));
        console.error('📄 Últimos 100 chars:', responseText.slice(-100));
        
        // Try to provide more specific error information
        if (responseText.includes('<!DOCTYPE')) {
          throw new Error('Servidor retornou página HTML em vez de dados JSON');
        } else if (responseText.includes('Error:')) {
          throw new Error('Servidor retornou erro em formato texto');
        } else if (responseText.includes('Cannot GET')) {
          throw new Error('Endpoint não encontrado no servidor');
        } else {
          throw new Error(`Resposta inválida do servidor: ${parseError.message}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na busca de servidores:', err);
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