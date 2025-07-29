import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Clock, X, ArrowRight, Brain, Filter, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSmartSearch, SearchResult, SearchSuggestion } from '@/hooks/useSmartSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SmartSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  filters?: {
    types?: string[];
    collections?: string[];
  };
}

export const SmartSearchDialog = ({
  isOpen,
  onClose,
  onResultSelect,
  placeholder = "Buscar em qualquer lugar...",
  filters
}: SmartSearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    results,
    suggestions,
    isLoading,
    error,
    searchHistory,
    hybridSearch,
    getSmartSuggestions,
    loadSearchHistory,
    clearSearchHistory,
    clearResults
  } = useSmartSearch();

  const debouncedQuery = useDebounce(query, 300);

  // Carregar histórico ao abrir
  useEffect(() => {
    if (isOpen) {
      loadSearchHistory();
      inputRef.current?.focus();
    }
  }, [isOpen, loadSearchHistory]);

  // Realizar busca quando query muda
  useEffect(() => {
    if (debouncedQuery.trim()) {
      hybridSearch(debouncedQuery, {
        types: activeFilters.length > 0 ? activeFilters : filters?.types,
        fuzzyCollections: filters?.collections || ['chamados', 'atalhos', 'usuarios'],
        limit: 20
      });
      getSmartSuggestions(debouncedQuery);
      setShowHistory(false);
    } else {
      clearResults();
      setShowHistory(true);
    }
    setSelectedIndex(0);
  }, [debouncedQuery, activeFilters, hybridSearch, getSmartSuggestions, clearResults, filters]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = results.length + suggestions.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < results.length) {
            handleResultSelect(results[selectedIndex]);
          } else if (selectedIndex < totalItems) {
            const suggestion = suggestions[selectedIndex - results.length];
            setQuery(suggestion.text);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, suggestions, selectedIndex, onClose]);

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    onClose();
  };

  const handleHistorySelect = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
  };

  const getResultIcon = (type: string) => {
    const icons = {
      chamado: '📋',
      atalho: '⚡',
      usuario: '👤',
      orgao: '🏛️',
      evento: '📅',
      memoria: '💾'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getFilterTypes = () => [
    { id: 'chamado', label: 'Chamados', color: 'bg-blue-500' },
    { id: 'atalho', label: 'Atalhos', color: 'bg-green-500' },
    { id: 'usuario', label: 'Usuários', color: 'bg-purple-500' },
    { id: 'orgao', label: 'Órgãos', color: 'bg-orange-500' },
    { id: 'evento', label: 'Eventos', color: 'bg-red-500' },
    { id: 'memoria', label: 'Memórias', color: 'bg-indigo-500' }
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Busca Inteligente
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        {/* Barra de busca */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 h-12 text-lg"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilters([])}
              className="h-7 px-2"
            >
              <Filter className="h-3 w-3 mr-1" />
              Todos
            </Button>
            {getFilterTypes().map(filter => (
              <Button
                key={filter.id}
                variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "h-7 px-2",
                  activeFilters.includes(filter.id) && filter.color
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Resultados */}
        <ScrollArea className="max-h-[400px] px-6 pb-6">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Buscando...
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center justify-center py-8 text-destructive">
              {error}
            </div>
          )}

          {/* Histórico */}
          {showHistory && searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Buscas Recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearchHistory}
                  className="h-6 px-2 text-xs"
                >
                  Limpar
                </Button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(item)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Sugestões</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion.text)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                    selectedIndex === results.length + index && "bg-muted"
                  )}
                >
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  {suggestion.text}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </button>
              ))}
              <Separator />
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Resultados</h3>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg hover:bg-muted transition-colors group",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{result.title}</h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {result.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {Math.round(result.score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {!isLoading && !error && !showHistory && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2" />
              <p>Nenhum resultado encontrado</p>
              <p className="text-sm">Tente usar termos diferentes ou verifique a ortografia</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};