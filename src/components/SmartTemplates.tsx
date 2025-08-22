import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  Star, 
  Clock, 
  Tag, 
  TrendingUp,
  Filter,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { FormData } from '@/types/form';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  usage: number;
  rating: number;
  lastUsed?: Date;
  content: {
    resumo?: string;
    grau?: string;
    orgaoJulgador?: string;
    notas?: string;
  };
}

interface SmartTemplatesProps {
  formData: FormData;
  onApplyTemplate: (template: Template) => void;
  onClose: () => void;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Template JIRA - Recurso Especial',
    description: 'Template estruturado para JIRA - Recursos Especiais',
    category: 'JIRA Template',
    tags: ['jira', 'recurso', 'processual'],
    usage: 45,
    rating: 4.8,
    lastUsed: new Date('2024-01-15'),
    content: {
      resumo: 'Recurso Especial - Violação ao art. 489, § 1º, do CPC',
      grau: 'Recurso Especial',
      orgaoJulgador: 'Superior Tribunal de Justiça',
      notas: `**DESCRIÇÃO DETALHADA:**
Questão processual envolvendo fundamentação da decisão judicial conforme art. 489, § 1º, do CPC. A decisão recorrida não apresentou fundamentação adequada, violando os requisitos legais estabelecidos no Código de Processo Civil.

**NÚMERO DO CHAMADO DE ORIGEM (OJ):**
A ser preenchido conforme necessário

**CONTEXTO ADICIONAL:**
- Processo: [Número do processo será incorporado automaticamente]
- Órgão: Superior Tribunal de Justiça
- Grau: Recurso Especial`
    }
  },
  {
    id: '2',
    title: 'Template JIRA - Agravo de Instrumento',
    description: 'Template estruturado para JIRA - Agravos de Instrumento',
    category: 'JIRA Template',
    tags: ['jira', 'agravo', 'tutela'],
    usage: 32,
    rating: 4.6,
    lastUsed: new Date('2024-01-10'),
    content: {
      resumo: 'Agravo de Instrumento - Indeferimento de tutela de urgência',
      grau: 'Agravo de Instrumento',
      orgaoJulgador: 'Tribunal de Justiça',
      notas: `**DESCRIÇÃO DETALHADA:**
Recurso contra decisão que indeferiu pedido de tutela de urgência. Demonstração da presença dos requisitos legais para concessão da medida: fumus boni iuris e periculum in mora.

**NÚMERO DO CHAMADO DE ORIGEM (OJ):**
A ser preenchido conforme necessário

**CONTEXTO ADICIONAL:**
- Processo: [Número do processo será incorporado automaticamente]
- Órgão: Tribunal de Justiça
- Grau: Agravo de Instrumento`
    }
  },
  {
    id: '3',
    title: 'Template JIRA - Apelação Cível',
    description: 'Template estruturado para JIRA - Apelações Cíveis',
    category: 'JIRA Template',
    tags: ['jira', 'apelação', 'civil'],
    usage: 28,
    rating: 4.5,
    lastUsed: new Date('2024-01-08'),
    content: {
      resumo: 'Apelação Cível - Reforma de sentença',
      grau: 'Apelação',
      orgaoJulgador: 'Tribunal de Justiça',
      notas: `**DESCRIÇÃO DETALHADA:**
Recurso de apelação visando a reforma da sentença de primeiro grau. Análise dos fundamentos da decisão e apresentação de argumentos para modificação do julgado.

**NÚMERO DO CHAMADO DE ORIGEM (OJ):**
A ser preenchido conforme necessário

**CONTEXTO ADICIONAL:**
- Processo: [Número do processo será incorporado automaticamente]
- Órgão: Tribunal de Justiça
- Grau: Apelação`
    }
  }
];

export const SmartTemplates: React.FC<SmartTemplatesProps> = ({
  formData,
  onApplyTemplate,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'usage' | 'rating' | 'recent'>('usage');

  // Filtrar e ordenar templates
  const filteredTemplates = mockTemplates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage - a.usage;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0);
        default:
          return 0;
      }
    });

  const categories = ['all', ...Array.from(new Set(mockTemplates.map(t => t.category)))];

  // Sugerir templates baseado no formulário atual
  const getSuggestedTemplates = () => {
    if (!formData.resumo) return [];
    
    return mockTemplates.filter(template => {
      const resumoLower = formData.resumo?.toLowerCase() || '';
      return template.tags.some(tag => resumoLower.includes(tag)) ||
             template.title.toLowerCase().includes(resumoLower.split(' ')[0]);
    }).slice(0, 2);
  };

  const suggestedTemplates = getSuggestedTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Templates Inteligentes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acelere seu trabalho com templates personalizados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* Sugestões Baseadas no Formulário */}
      {suggestedTemplates.length > 0 && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Sugeridos para você
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedTemplates.map(template => (
              <div key={template.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.title}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onApplyTemplate(template)}
                  className="ml-2"
                >
                  Usar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category === 'all' ? 'Todos' : category}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'usage' ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy('usage')}
            className="text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Mais usados
          </Button>
          <Button
            variant={sortBy === 'rating' ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy('rating')}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            Melhor avaliados
          </Button>
          <Button
            variant={sortBy === 'recent' ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy('recent')}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Recentes
          </Button>
        </div>
      </div>

      {/* Lista de Templates */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {template.usage} usos
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => onApplyTemplate(template)}
                    className="ml-2"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aplicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Nenhum template encontrado</p>
          <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
};