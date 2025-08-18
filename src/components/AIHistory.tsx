import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Search, 
  Copy, 
  Trash2, 
  Star, 
  StarOff, 
  Calendar,
  Brain,
  Sparkles,
  Zap,
  Target,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIHistoryItem {
  id: string;
  timestamp: Date;
  model: string;
  prompt: string;
  description: string;
  solution: string;
  isFavorite: boolean;
  formData: {
    resumo: string;
    grau: string;
    orgaoJulgador: string;
    notas: string;
  };
  settings: {
    tone: string;
    priority: string;
    customInstructions: string;
  };
}

interface AIHistoryProps {
  onSelectItem?: (item: AIHistoryItem) => void;
  onApplyToForm?: (item: AIHistoryItem) => void;
}

const modelIcons = {
  creative: <Sparkles className="h-4 w-4" />,
  analytical: <Brain className="h-4 w-4" />,
  quick: <Zap className="h-4 w-4" />,
  specialized: <Target className="h-4 w-4" />
};

const modelNames = {
  creative: 'IA Criativa',
  analytical: 'IA Analítica',
  quick: 'IA Rápida',
  specialized: 'IA Especializada'
};

export const AIHistory: React.FC<AIHistoryProps> = ({ onSelectItem, onApplyToForm }) => {
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AIHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'model' | 'favorites'>('date');

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsed);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...history];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.formData.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.formData.notas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por modelo
    if (filterModel !== 'all') {
      filtered = filtered.filter(item => item.model === filterModel);
    }

    // Filtro por favoritos
    if (filterFavorites) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'model':
          return a.model.localeCompare(b.model);
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return b.timestamp.getTime() - a.timestamp.getTime();
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, filterModel, filterFavorites, sortBy]);

  const saveHistory = (newHistory: AIHistoryItem[]) => {
    try {
      localStorage.setItem('ai-history', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      toast.error('Erro ao salvar histórico');
    }
  };

  const toggleFavorite = (id: string) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(newHistory);
    toast.success('Favorito atualizado');
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
    toast.success('Item removido do histórico');
  };

  const clearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      saveHistory([]);
      toast.success('Histórico limpo');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copiado para a área de transferência`);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const addToHistory = (item: Omit<AIHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: AIHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    const newHistory = [newItem, ...history].slice(0, 100); // Manter apenas os últimos 100 itens
    saveHistory(newHistory);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Histórico de IA</h2>
          <Badge variant="outline">{filteredHistory.length} itens</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          disabled={history.length === 0}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Modelo */}
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os modelos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os modelos</SelectItem>
                <SelectItem value="creative">IA Criativa</SelectItem>
                <SelectItem value="analytical">IA Analítica</SelectItem>
                <SelectItem value="quick">IA Rápida</SelectItem>
                <SelectItem value="specialized">IA Especializada</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Mais recentes</SelectItem>
                <SelectItem value="model">Por modelo</SelectItem>
                <SelectItem value="favorites">Favoritos primeiro</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Favoritos */}
            <Button
              variant={filterFavorites ? "default" : "outline"}
              onClick={() => setFilterFavorites(!filterFavorites)}
              className="flex items-center gap-2"
            >
              <Star className={`h-4 w-4 ${filterFavorites ? 'fill-current' : ''}`} />
              Favoritos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista do Histórico */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">
                {history.length === 0 
                  ? 'Nenhum histórico encontrado'
                  : 'Nenhum item corresponde aos filtros aplicados'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {modelIcons[item.model as keyof typeof modelIcons]}
                    <span className="font-medium">
                      {modelNames[item.model as keyof typeof modelNames]}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.settings.tone}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(item.timestamp, { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {item.isFavorite ? (
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dados do Formulário Original */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium mb-1">Dados Originais:</p>
                  <p><strong>Resumo:</strong> {item.formData.resumo}</p>
                  <p><strong>Grau:</strong> {item.formData.grau}</p>
                  <p><strong>Órgão:</strong> {item.formData.orgaoJulgador}</p>
                  <p><strong>Problema:</strong> {item.formData.notas.substring(0, 100)}...</p>
                </div>

                {/* Descrição Gerada */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Descrição Gerada</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.description, 'Descrição')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {item.description}
                  </div>
                </div>

                {/* Solução Sugerida */}
                {item.solution && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Solução Sugerida</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.solution, 'Solução')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {item.solution}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectItem?.(item)}
                    className="flex-1"
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApplyToForm?.(item)}
                    className="flex-1"
                  >
                    Aplicar ao Formulário
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Hook para usar o histórico
export const useAIHistory = () => {
  const addToHistory = (item: Omit<AIHistoryItem, 'id' | 'timestamp'>) => {
    const savedHistory = localStorage.getItem('ai-history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    const newItem: AIHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    const newHistory = [newItem, ...history].slice(0, 100);
    localStorage.setItem('ai-history', JSON.stringify(newHistory));
  };

  return { addToHistory };
};