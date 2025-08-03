import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Loader2,
  Trash2,
  Lightbulb
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
    clearResults,
    clearSearchHistory
  } = useSmartSearch();

  const [activeFilters, setActiveFilters] = useState<string[]>(filters?.types || ['chamado', 'conhecimento']);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Carregar histórico quando abrir
  useEffect(() => {
    if (isOpen && !query) {
      setShowHistory(true);
      setHasError(false); // Reset error state when opening
    }
  }, [isOpen, query]);

  // Efeito para buscar quando a query muda
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) { // Reduzir de 3 para 2 caracteres
      console.log('🔍 SmartSearchDialog: Iniciando busca para:', debouncedQuery);
      console.log('🎯 Filtros ativos:', activeFilters);
      
      // Debug específico para "perito"
      if (debouncedQuery.toLowerCase().includes('perito')) {
        console.log('🔍 DEBUG: Detectada busca por "perito"');
        console.log('🔍 DEBUG: Query completa:', debouncedQuery);
        console.log('🔍 DEBUG: Filtros:', activeFilters);
      }
      
      hybridSearch(debouncedQuery.trim(), { 
        types: activeFilters,
        limit: 20 
      }).then(results => {
        console.log('✅ SmartSearchDialog: Busca concluída, resultados:', results.length);
        
        // Debug específico para resultados de "perito"
        if (debouncedQuery.toLowerCase().includes('perito')) {
          console.log('🔍 DEBUG: Resultados para "perito":', results);
          console.log('🔍 DEBUG: Títulos encontrados:', results.map(r => r.title));
        }
        
        if (results.length === 0) {
          console.log('⚠️ SmartSearchDialog: Nenhum resultado encontrado para:', debouncedQuery);
        }
      }).catch(error => {
        console.error('❌ SmartSearchDialog: Erro na busca:', error);
        // Não quebrar a interface em caso de erro
        setHasError(true);
        clearResults();
      });
      
      setShowHistory(false);
    } else if (debouncedQuery && debouncedQuery.trim().length > 0 && debouncedQuery.trim().length < 2) {
      // Para queries muito curtas, apenas limpar resultados sem fazer busca
      console.log('🔍 SmartSearchDialog: Query muito curta, aguardando mais caracteres');
      clearResults();
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
    
    // Debug específico para resultados importantes
    if (result.title?.toLowerCase().includes('problema') || result.title?.toLowerCase().includes('perito')) {
      console.log('🔍 DEBUG: Selecionado resultado importante:', result);
      console.log('🔍 DEBUG: Query atual:', query);
    }
    
    try {
      // Adicionar o termo de busca atual aos metadados se não existir
      const enhancedResult = {
        ...result,
        metadata: {
          ...result.metadata,
          searchTerm: result.metadata?.searchTerm || query.trim(),
          originalQuery: query.trim()
        }
      };
      
      console.log('🚀 SmartSearchDialog: Enviando resultado com contexto:', enhancedResult);
      onResultSelect?.(enhancedResult);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao processar seleção de resultado:', error);
      // Não fechar o modal em caso de erro para evitar tela em branco
    }
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
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-border/20 shadow-xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2.5 bg-gradient-primary rounded-xl shadow-soft">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  Busca Inteligente
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Encontre chamados, documentos e muito mais
                </span>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-accent rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Campo de busca */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua busca... (ex: problema, usuário, backup)"
              className="pl-12 pr-12 h-14 text-base bg-card/60 backdrop-blur-sm border-border/30 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl shadow-soft"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {!query && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>
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
                className={`flex items-center gap-2 h-9 px-4 text-sm rounded-xl transition-all duration-200 ${
                  activeFilters.includes(key) 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft' 
                    : 'bg-card/60 hover:bg-card border-border/30 hover:border-border/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {activeFilters.includes(key) && (
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                )}
              </Button>
            ))}
          </div>



          {/* Conteúdo principal */}
          <ScrollArea className="max-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-primary rounded-2xl opacity-20 animate-ping"></div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-lg font-semibold text-foreground">Buscando...</p>
                  <p className="text-sm text-muted-foreground mt-1">Analisando chamados e documentos</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-lg font-semibold text-foreground">Erro na busca</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuery('')}
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : showHistory && searchHistory.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Histórico de Busca
                  </h3>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => setQuery(item)}
                      className="w-full justify-start h-auto p-3 text-left hover:bg-card/60 rounded-xl group"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-1.5 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <Search className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {item}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/20">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Limpar todo o histórico
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Trash2 className="h-5 w-5 text-destructive" />
                          Limpar Histórico de Busca
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja limpar todo o histórico de busca? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            clearSearchHistory();
                            console.log('🗑️ Histórico limpo completamente pelo usuário');
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Limpar Histórico
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Resultados ({results.length})
                  </h3>
                  <div className="flex gap-1">
                    {activeFilters.map(filter => (
                      <Badge key={filter} variant="secondary" className="text-xs">
                        {filter}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {results.map((result, index) => {
                    try {
                      return (
                        <div
                          key={result.id || `result-${index}`}
                          className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            index === selectedIndex 
                              ? 'bg-primary/10 border-primary/30 shadow-soft' 
                              : 'bg-card/60 border-border/20 hover:bg-card/80 hover:border-border/40 hover:shadow-soft'
                          }`}
                          onClick={() => {
                            try {
                              handleResultSelect(result);
                            } catch (error) {
                              console.error('❌ Erro ao selecionar resultado:', error);
                            }
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {result.title || 'Sem título'}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                {result.description || 'Sem descrição'}
                              </p>
                              {result.metadata && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {result.metadata.categoria && (
                                    <Badge variant="outline" className="text-xs bg-card/50">
                                      {result.metadata.categoria}
                                    </Badge>
                                  )}
                                  {result.metadata.status && (
                                    <Badge variant="outline" className="text-xs bg-card/50">
                                      {result.metadata.status}
                                    </Badge>
                                  )}
                                  {result.metadata.criado_por && (
                                    <Badge variant="outline" className="text-xs bg-card/50">
                                      {result.metadata.criado_por}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('❌ Erro ao renderizar resultado:', error, result);
                      return (
                        <div key={`error-${index}`} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                          <p className="text-sm text-destructive">Erro ao exibir resultado</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ) : query && !isLoading ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Não encontramos nada para "<span className="font-medium text-foreground">{query}</span>". 
                  Tente termos diferentes ou verifique a ortografia.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuery('')}
                  >
                    Limpar busca
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuery('problema')}
                  >
                    Buscar "problema"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuery('perito')}
                  >
                    Buscar "perito"
                  </Button>
                </div>
              </div>
            ) : !query ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Busca Inteligente</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Digite algo para começar a buscar em chamados e documentos
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['horário', 'problema', 'perito', 'usuário', 'backup', 'configuração', 'manual'].map(suggestion => (
                    <Button 
                      key={suggestion}
                      variant="outline" 
                      size="sm" 
                      onClick={() => setQuery(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 px-1">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Sugestões de Busca
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => setQuery(suggestion)}
                        className={`justify-start h-auto p-3 text-left text-sm rounded-xl group ${
                          index + results.length === selectedIndex 
                            ? 'bg-primary/10 border-primary/20' 
                            : 'hover:bg-card/60 border-transparent'
                        } border`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1.5 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Search className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-foreground group-hover:text-primary transition-colors flex-1">
                            {suggestion}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};