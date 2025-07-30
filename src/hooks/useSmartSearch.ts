import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  type: 'chamado' | 'conhecimento' | 'atalho';
  title: string;
  description: string;
  url?: string;
  score: number;
  metadata?: Record<string, any>;
}

export const useSmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (err) {
        console.warn('Erro ao carregar histórico de busca:', err);
      }
    }
  }, []);

  // Busca em chamados
  const searchChamados = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🔍 Buscando em chamados:', query);
    
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id,
          assunto,
          descricao,
          status,
          categoria,
          created_at,
          usuario_criador_nome
        `)
        .or(`assunto.ilike.%${query}%,descricao.ilike.%${query}%,categoria.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar chamados:', error);
        return [];
      }

      console.log('✅ Chamados encontrados:', data?.length || 0);

      return (data || []).map((chamado, index) => ({
        id: chamado.id,
        type: 'chamado' as const,
        title: chamado.assunto || 'Chamado sem título',
        description: chamado.descricao || 'Sem descrição',
        score: 100 - index, // Score baseado na posição (mais recentes primeiro)
        metadata: {
          status: chamado.status,
          categoria: chamado.categoria,
          criado_por: chamado.usuario_criador_nome,
          data_criacao: chamado.created_at
        }
      }));
    } catch (err) {
      console.error('❌ Erro na busca de chamados:', err);
      return [];
    }
  }, []);

  // Busca na base de conhecimento (simulada)
  const searchBaseConhecimento = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🔍 Buscando na base de conhecimento:', query);
    
    // Dados simulados da base de conhecimento
    const baseConhecimento = [
      {
        id: 'doc-1',
        titulo: 'Como criar um novo chamado',
        conteudo: 'Guia completo para criação de chamados no sistema NAPJe',
        categoria: 'Documentação',
        tags: ['chamado', 'criação', 'guia']
      },
      {
        id: 'doc-2',
        titulo: 'Procedimentos de backup',
        conteudo: 'Instruções para realizar backup dos dados do sistema',
        categoria: 'Procedimentos',
        tags: ['backup', 'segurança', 'dados']
      },
      {
        id: 'doc-3',
        titulo: 'Configuração de usuários',
        conteudo: 'Como configurar novos usuários no sistema',
        categoria: 'Administração',
        tags: ['usuário', 'configuração', 'admin']
      },
      {
        id: 'doc-4',
        titulo: 'Troubleshooting comum',
        conteudo: 'Soluções para problemas frequentes no sistema',
        categoria: 'Suporte',
        tags: ['problema', 'solução', 'suporte']
      },
      {
        id: 'doc-5',
        titulo: 'Integração com PJe',
        conteudo: 'Como integrar o sistema com o PJe',
        categoria: 'Integração',
        tags: ['pje', 'integração', 'sistema']
      }
    ];

    // Busca simples por texto
    const resultados = baseConhecimento.filter(doc => 
      doc.titulo.toLowerCase().includes(query.toLowerCase()) ||
      doc.conteudo.toLowerCase().includes(query.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    console.log('✅ Documentos encontrados:', resultados.length);

    return resultados.map((doc, index) => ({
      id: doc.id,
      type: 'conhecimento' as const,
      title: doc.titulo,
      description: doc.conteudo,
      score: 90 - index,
      metadata: {
        categoria: doc.categoria,
        tags: doc.tags
      }
    }));
  }, []);

  // Busca com ChatGPT (simulada)
  const searchWithChatGPT = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🤖 Buscando com ChatGPT:', query);
    
    // Simulação de resposta do ChatGPT
    const chatGPTResults = [
      {
        id: 'ai-1',
        type: 'conhecimento' as const,
        title: `Sugestão IA: ${query}`,
        description: `Baseado na sua busca por "${query}", aqui estão algumas sugestões relevantes para o sistema NAPJe.`,
        score: 95,
        metadata: {
          fonte: 'ChatGPT',
          categoria: 'Sugestão IA'
        }
      }
    ];

    console.log('✅ Sugestões IA geradas:', chatGPTResults.length);
    return chatGPTResults;
  }, []);

  // Busca híbrida principal
  const hybridSearch = useCallback(async (
    query: string, 
    options?: {
      types?: string[];
      limit?: number;
    }
  ) => {
    if (!query.trim()) {
      console.log('🔍 Query vazia, limpando resultados');
      setResults([]);
      return [];
    }

    const { types = ['chamado', 'conhecimento'], limit = 20 } = options || {};
    setIsLoading(true);
    setError(null);

    console.log('🚀 Iniciando busca híbrida:', { query, types, limit });

    try {
      const searchPromises: Promise<SearchResult[]>[] = [];

      // Buscar em chamados
      if (types.includes('chamado')) {
        searchPromises.push(searchChamados(query));
      }

      // Buscar na base de conhecimento
      if (types.includes('conhecimento')) {
        searchPromises.push(searchBaseConhecimento(query));
        // Adicionar busca com ChatGPT
        searchPromises.push(searchWithChatGPT(query));
      }

      console.log('📊 Executando', searchPromises.length, 'buscas em paralelo');
      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults.flat();

      console.log('📊 Total de resultados combinados:', combinedResults.length);

      // Ordenar por score e limitar resultados
      const sortedResults = combinedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log('✅ Resultados finais:', sortedResults.length);
      console.log('📋 Detalhes dos resultados:', sortedResults.map(r => ({ 
        type: r.type, 
        title: r.title, 
        score: r.score 
      })));

      setResults(sortedResults);

      // Adicionar ao histórico
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
        localStorage.setItem('smart_search_history', JSON.stringify(newHistory));
        return newHistory;
      });

      return sortedResults;
    } catch (err) {
      console.error('❌ Erro na busca híbrida:', err);
      setError('Erro ao realizar busca');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchChamados, searchBaseConhecimento, searchWithChatGPT]);

  // Sugestões inteligentes
  const getSmartSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (query.length < 2) return [];

    const suggestions = [
      'chamado',
      'problema',
      'sistema',
      'usuário',
      'configuração',
      'backup',
      'integração',
      'pje',
      'documentação',
      'suporte'
    ];

    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, []);

  // Funções auxiliares
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const semanticSearch = useCallback((query: string) => {
    return hybridSearch(query, { types: ['chamado', 'conhecimento'] });
  }, [hybridSearch]);

  const fuzzySearch = useCallback((query: string) => {
    return hybridSearch(query, { types: ['chamado', 'conhecimento'] });
  }, [hybridSearch]);

  const searchEntity = useCallback((query: string, entityType: string) => {
    return hybridSearch(query, { types: [entityType] });
  }, [hybridSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    hybridSearch,
    semanticSearch,
    fuzzySearch,
    searchEntity,
    getSmartSuggestions,
    clearResults
  };
};