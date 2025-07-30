import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  Zap,
  Clock,
  ArrowRight,
  Brain,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SmartSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: any) => void;
  filters?: {
    types?: string[];
    limit?: number;
  };
}

export const SmartSearchDialog = ({ 
  isOpen, 
  onClose, 
  onResultSelect,
  filters 
}: SmartSearchDialogProps) => {
  const { 
    query, 
    setQuery, 
    results, 
    isLoading, 
    error, 
    searchHistory,
    hybridSearch, 
    getSmartSuggestions,
    clearResults 
  } = useSmartSearch();

  const [activeFilters, setActiveFilters] = useState<string[]>(filters?.types || ['chamado', 'conhecimento']);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  // Carregar histórico quando abrir
  useEffect(() => {
    if (isOpen && !query) {
      setShowHistory(true);
    }
  }, [isOpen, query]);

  // Efeito para buscar quando a query muda
  useEffect(() => {
    if (debouncedQuery) {
      console.log('🔍 SmartSearchDialog: Iniciando busca para:', debouncedQuery);
      console.log('🎯 Filtros ativos:', activeFilters);
      
      hybridSearch(debouncedQuery, { 
        types: activeFilters,
        limit: 20 
      }).then(results => {
        console.log('✅ SmartSearchDialog: Busca concluída, resultados:', results.length);
      }).catch(error => {
        console.error('❌ SmartSearchDialog: Erro na busca:', error);
      });
      
      setShowHistory(false);
    } else {
      console.log('🔍 SmartSearchDialog: Query vazia, limpando resultados');
      clearResults();
      setShowHistory(true);
    }
  }, [debouncedQuery, activeFilters, hybridSearch, clearResults]);

  // Efeito para buscar sugestões
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 2) {
      console.log('💡 SmartSearchDialog: Buscando sugestões para:', debouncedQuery);
      getSmartSuggestions(debouncedQuery).then(suggestions => {
        console.log('✅ SmartSearchDialog: Sugestões encontradas:', suggestions.length);
        setSuggestions(suggestions);
      }).catch(error => {
        console.error('❌ SmartSearchDialog: Erro ao buscar sugestões:', error);
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, getSmartSuggestions]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = results.length + suggestions.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < results.length) {
            handleResultSelect(results[selectedIndex]);
          } else if (selectedIndex < totalItems) {
            const suggestionIndex = selectedIndex - results.length;
            setQuery(suggestions[suggestionIndex]);
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

  const handleResultSelect = (result: any) => {
    console.log('🎯 SmartSearchDialog: Resultado selecionado:', result);
    onResultSelect?.(result);
    onClose();
  };

  const handleHistorySelect = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chamado':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'conhecimento':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'atalho':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFilterTypes = () => [
    { key: 'chamado', label: 'Chamados', icon: FileText, color: 'bg-blue-500' },
    { key: 'conhecimento', label: 'Base de Conhecimento', icon: BookOpen, color: 'bg-green-500' }
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-soft">
                <Brain className="h-5 w-5 text-white" />
              </div>
              Busca Inteligente
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar em chamados e base de conhecimento..."
              className="pl-10 pr-10 h-12 text-base bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {getFilterTypes().map(({ key, label, icon: Icon, color }) => (
              <Button
                key={key}
                variant={activeFilters.includes(key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-2 h-8 px-3 text-xs ${
                  activeFilters.includes(key) 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-white/60 hover:bg-white/80 border-gray-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>

          {/* Debug Info (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono">
              <div className="font-semibold mb-1">Debug Info:</div>
              <div>Query: "{query}"</div>
              <div>Debounced: "{debouncedQuery}"</div>
              <div>Loading: {isLoading ? 'Sim' : 'Não'}</div>
              <div>Error: {error || 'Nenhum'}</div>
              <div>Results: {results.length}</div>
              <div>Suggestions: {suggestions.length}</div>
              <div>Active Filters: {activeFilters.length > 0 ? activeFilters.join(', ') : 'Nenhum'}</div>
            </div>
          )}

          {/* Conteúdo principal */}
          <ScrollArea className="max-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="font-medium">Buscando...</p>
                <p className="text-sm">Analisando seus dados</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 dark:text-red-400">
                <p className="font-medium">Erro na busca</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : showHistory && searchHistory.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Histórico de Busca
                </h3>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setQuery(item)}
                    className="w-full justify-start h-auto p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Search className="h-4 w-4 mr-3 text-gray-400" />
                    {item}
                  </Button>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resultados ({results.length})
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {activeFilters.join(', ')}
                  </Badge>
                </div>
                
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      index === selectedIndex 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="flex items-start gap-3">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.metadata.categoria && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.categoria}
                              </Badge>
                            )}
                            {result.metadata.status && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.status}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente</p>
              </div>
            ) : null}

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sugestões
                  </h3>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => setQuery(suggestion)}
                      className={`w-full justify-start h-auto p-2 text-left text-sm ${
                        index + results.length === selectedIndex 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Search className="h-3 w-3 mr-2 text-gray-400" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};