import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'chamado' | 'atalho' | 'usuario' | 'orgao' | 'evento' | 'memoria';
  score: number;
  metadata?: Record<string, any>;
  url?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'related';
  confidence: number;
}

export const useSmartSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Busca semântica usando edge function
  const semanticSearch = useCallback(async (query: string, filters?: { types?: string[], limit?: number }) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: query.trim(),
          filters: filters || {},
          includeMetadata: true
        }
      });

      if (error) throw error;

      const searchResults: SearchResult[] = data.results || [];
      setResults(searchResults);
      
      // Adicionar ao histórico
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
        localStorage.setItem('smart_search_history', JSON.stringify(newHistory));
        return newHistory;
      });

      return searchResults;
    } catch (err) {
      console.error('Erro na busca semântica:', err);
      setError('Erro ao realizar busca inteligente');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-complete inteligente
  const getSmartSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return [];
    }

    try {
      const { data, error } = await supabase.functions.invoke('smart-autocomplete', {
        body: {
          query: query.trim(),
          context: {
            searchHistory,
            currentPage: window.location.pathname
          }
        }
      });

      if (error) throw error;

      const newSuggestions: SearchSuggestion[] = data.suggestions || [];
      setSuggestions(newSuggestions);
      return newSuggestions;
    } catch (err) {
      console.error('Erro ao obter sugestões:', err);
      return [];
    }
  }, [searchHistory]);

  // Busca por similaridade de texto local
  const fuzzySearch = useCallback(async (query: string, collection: string) => {
    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .textSearch('titulo', query, { config: 'portuguese' })
      .limit(20);

    if (error) {
      console.error('Erro na busca fuzzy:', error);
      return [];
    }

    return data || [];
  }, []);

  // Busca híbrida (semântica + fuzzy + filtros)
  const hybridSearch = useCallback(async (
    query: string, 
    options?: {
      types?: string[];
      fuzzyCollections?: string[];
      semanticWeight?: number;
      limit?: number;
    }
  ) => {
    const { types, fuzzyCollections = [], semanticWeight = 0.7, limit = 50 } = options || {};

    setIsLoading(true);
    
    try {
      // Busca semântica (peso maior)
      const semanticResults = await semanticSearch(query, { types, limit: Math.floor(limit * semanticWeight) });
      
      // Busca fuzzy para complementar
      const fuzzyPromises = fuzzyCollections.map(collection => fuzzySearch(query, collection));
      const fuzzyResults = await Promise.all(fuzzyPromises);
      
      // Combinar e deduplicar resultados
      const allResults = [
        ...semanticResults,
        ...fuzzyResults.flat().map((item, index) => ({
          id: item.id,
          title: item.titulo || item.nome || item.assunto || 'Sem título',
          description: item.descricao || item.observacoes || 'Sem descrição',
          type: 'chamado' as const,
          score: 0.5 - (index * 0.01), // Score menor para resultados fuzzy
          metadata: item
        }))
      ];

      // Deduplicar por ID e ordenar por score
      const uniqueResults = allResults
        .filter((item, index, self) => self.findIndex(t => t.id === item.id) === index)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setResults(uniqueResults);
      return uniqueResults;
    } catch (err) {
      console.error('Erro na busca híbrida:', err);
      setError('Erro na busca híbrida');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [semanticSearch, fuzzySearch]);

  // Carregar histórico do localStorage
  const loadSearchHistory = useCallback(() => {
    try {
      const history = localStorage.getItem('smart_search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  }, []);

  // Limpar histórico
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('smart_search_history');
  }, []);

  // Busca por entidade específica com contexto
  const searchEntity = useCallback(async (
    entityType: string, 
    query: string, 
    context?: Record<string, any>
  ) => {
    const { data, error } = await supabase.functions.invoke('entity-search', {
      body: {
        entityType,
        query,
        context
      }
    });

    if (error) {
      console.error('Erro na busca de entidade:', error);
      return [];
    }

    return data.results || [];
  }, []);

  return {
    // Estados
    results,
    suggestions,
    isLoading,
    error,
    searchHistory,
    
    // Métodos de busca
    semanticSearch,
    hybridSearch,
    fuzzySearch,
    searchEntity,
    
    // Auto-complete
    getSmartSuggestions,
    
    // Histórico
    loadSearchHistory,
    clearSearchHistory,
    
    // Utilitários
    clearResults: () => setResults([]),
    clearSuggestions: () => setSuggestions([]),
    clearError: () => setError(null)
  };
};