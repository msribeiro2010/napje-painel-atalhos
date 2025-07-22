import { BookOpen } from 'lucide-react';

interface KnowledgeBaseEmptyStateProps {
  searchTerm: string;
  selectedCategory: string;
}

export const KnowledgeBaseEmptyState = ({ searchTerm, selectedCategory }: KnowledgeBaseEmptyStateProps) => {
  const hasFilters = searchTerm || (selectedCategory && selectedCategory !== 'all');
  
  return (
    <div className="text-center py-16">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-10"></div>
        <BookOpen className="relative h-20 w-20 text-muted-foreground mx-auto" />
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        {hasFilters ? 'Nenhum item encontrado' : 'Nenhum item cadastrado ainda'}
      </h3>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        {hasFilters ? 'Tente ajustar os filtros de pesquisa para encontrar o que procura' : 'Comece adicionando o primeiro item à base de conhecimento'}
      </p>
    </div>
  );
};