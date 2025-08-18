import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Star, 
  Filter,
  Grid,
  List,
  Lock,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useImportantMemories, ImportantMemory } from '@/hooks/useImportantMemories';
import { ImportantMemoryCard } from '@/components/important-memories/ImportantMemoryCard';
import { ImportantMemoryForm } from '@/components/important-memories/ImportantMemoryForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/PageHeader';

const categories = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'geral', label: 'Geral' },
];

const sortOptions = [
  { value: 'created_desc', label: 'Mais Recentes' },
  { value: 'created_asc', label: 'Mais Antigas' },
  { value: 'title_asc', label: 'Título (A-Z)' },
  { value: 'title_desc', label: 'Título (Z-A)' },
  { value: 'category_asc', label: 'Categoria (A-Z)' },
  { value: 'favorites', label: 'Favoritos Primeiro' },
];

const ImportantMemories: React.FC = () => {
  const {
    memories,
    loading,
    createMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
  } = useImportantMemories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<ImportantMemory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);

  const filteredAndSortedMemories = useMemo(() => {
    let filtered = memories;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.title.toLowerCase().includes(term) ||
        memory.description?.toLowerCase().includes(term) ||
        memory.category.toLowerCase().includes(term) ||
        memory.notes?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === selectedCategory);
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter(memory => memory.is_favorite);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'category_asc':
          return a.category.localeCompare(b.category);
        case 'favorites':
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [memories, searchTerm, selectedCategory, showFavoritesOnly, sortBy]);

  const handleCreateMemory = async (data: Record<string, unknown>) => {
    setIsFormLoading(true);
    const success = await createMemory(data);
    setIsFormLoading(false);
    return success;
  };

  const handleUpdateMemory = async (data: Record<string, unknown>) => {
    if (!editingMemory) return false;
    setIsFormLoading(true);
    const success = await updateMemory(editingMemory.id, data);
    setIsFormLoading(false);
    return success;
  };

  const handleEdit = (memory: ImportantMemory) => {
    setEditingMemory(memory);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMemory(null);
  };

  const getCategoryStats = () => {
    const stats = memories.reduce((acc, memory) => {
      acc[memory.category] = (acc[memory.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const categoryStats = getCategoryStats();
  const favoritesCount = memories.filter(m => m.is_favorite).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Memórias Importantes" 
        subtitle="Armazene senhas, logins e informações importantes de forma segura"
        showBackButton={true}
        backTo="/"
      >
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 ml-4">
          <Plus className="w-4 h-4" />
          Nova Memória
        </Button>
      </PageHeader>

      {/* Security Info Alert */}
      {showSecurityInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">
              <strong>Segurança:</strong> Suas memórias são privadas e apenas você pode visualizá-las. 
              Use senhas fortes e mantenha suas informações atualizadas.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityInfo(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{memories.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{favoritesCount}</div>
          <div className="text-sm text-gray-600">Favoritos</div>
        </div>
        {Object.entries(categoryStats).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-gray-700">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{category}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar memórias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2"
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Apenas Favoritos
            </Button>
            
            {(searchTerm || selectedCategory !== 'all' || showFavoritesOnly) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {filteredAndSortedMemories.length} resultado(s)
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Memories Grid/List */}
      {filteredAndSortedMemories.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {memories.length === 0 ? 'Nenhuma memória encontrada' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {memories.length === 0 
              ? 'Comece criando sua primeira memória importante'
              : 'Tente ajustar os filtros ou termo de busca'
            }
          </p>
          {memories.length === 0 && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Memória
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedMemories.map((memory) => (
            <ImportantMemoryCard
              key={memory.id}
              memory={memory}
              onEdit={handleEdit}
              onDelete={deleteMemory}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <ImportantMemoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemory ? handleUpdateMemory : handleCreateMemory}
        editingMemory={editingMemory}
        isLoading={isFormLoading}
      />
    </div>
  );
};

export default ImportantMemories;