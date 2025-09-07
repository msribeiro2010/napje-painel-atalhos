import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { KnowledgeBaseItem, KnowledgeBaseFormData } from '@/types/knowledge-base';
import { KnowledgeBaseFilters } from '@/components/knowledge-base/KnowledgeBaseFilters';
import { KnowledgeBaseCard } from '@/components/knowledge-base/KnowledgeBaseCard';
import { KnowledgeBaseDialog } from '@/components/knowledge-base/KnowledgeBaseDialog';
import { BulkUploadDialog } from '@/components/knowledge-base/BulkUploadDialog';
import { KnowledgeBaseEmptyState } from '@/components/knowledge-base/KnowledgeBaseEmptyState';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, isLoading, saveItem, deleteItem, incrementView, incrementUtil } = useKnowledgeBase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Ler parâmetro de busca da URL e pré-popular o campo
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(decodeURIComponent(searchFromUrl));
      console.log('🔍 Base de Conhecimento: Termo de busca recebido da URL:', searchFromUrl);
    }
  }, [searchParams]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [formData, setFormData] = useState<KnowledgeBaseFormData>({
    titulo: '',
    problema_descricao: '',
    solucao: '',
    categoria: '',
    tags: [],
    arquivo_print: null,
    media_files: []
  });


  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.problema_descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.solucao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || item.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      problema_descricao: item.problema_descricao,
      solucao: item.solucao,
      categoria: item.categoria || '',
      tags: item.tags || [],
      arquivo_print: null,
      media_files: []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const success = await saveItem(formData, editingItem);
    if (success) {
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({
        titulo: '',
        problema_descricao: '',
        solucao: '',
        categoria: '',
        tags: [],
        arquivo_print: null,
        media_files: []
      });
    }
  };

  const handleSaveBulkItems = async (items: KnowledgeBaseFormData[]) => {
    for (const item of items) {
      await saveItem(item, null);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      titulo: '',
      problema_descricao: '',
      solucao: '',
      categoria: '',
      tags: [],
      arquivo_print: null,
      media_files: []
    });
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-400/30 rounded-full blur-xl opacity-60"></div>
              <BookOpen className="relative h-16 w-16 text-blue-600 dark:text-blue-400 mr-4" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Base de Conhecimento
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">Núcleo de Apoio ao PJe - TRT15</p>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2 px-4 py-2 text-sm bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            Pesquise soluções antes de abrir chamados
          </Badge>
        </div>

        <KnowledgeBaseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
            <div className="flex gap-3">
              <Clock />
              <DateDisplay />
              <Button 
                variant="outline" 
                onClick={() => setIsBulkUploadOpen(true)}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-400 dark:hover:to-purple-400 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <KnowledgeBaseDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingItem={editingItem}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </Dialog>
          </div>

        <BulkUploadDialog
          isOpen={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          onSaveItems={handleSaveBulkItems}
        />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <KnowledgeBaseCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onIncrementView={incrementView}
                onIncrementUtil={incrementUtil}
              />
            ))}
            {filteredItems.length === 0 && (
              <KnowledgeBaseEmptyState
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;