import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { items, categories, isLoading, saveItem, deleteItem, incrementView, incrementUtil } = useKnowledgeBase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    media_files: [],
    notificacao_semanal: false,
    mensagem_notificacao: ''
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
      media_files: [],
      notificacao_semanal: item.notificacao_semanal || false,
      mensagem_notificacao: item.mensagem_notificacao || ''
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
        media_files: [],
        notificacao_semanal: false,
        mensagem_notificacao: ''
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
      media_files: [],
      notificacao_semanal: false,
      mensagem_notificacao: ''
    });
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-20"></div>
              <BookOpen className="relative h-16 w-16 text-primary mr-4" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Base de Conhecimento
              </h1>
              <p className="text-xl text-muted-foreground mt-2">Núcleo de Apoio ao PJe - TRT15</p>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2 px-4 py-2 text-sm shadow-soft">
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
            className="bg-background/80 hover:bg-background border-border/50 hover:border-border shadow-soft transition-all duration-300 hover:shadow-medium"
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
                className="flex items-center gap-2 bg-background/80 hover:bg-background border-border/50 hover:border-border shadow-soft transition-all duration-300 hover:shadow-medium"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 shadow-medium transition-all duration-300 hover:shadow-large hover:scale-105">
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