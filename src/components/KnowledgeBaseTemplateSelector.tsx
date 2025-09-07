import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Clock, Star, BookOpen, Eye, ThumbsUp } from 'lucide-react';
import { FormData } from '@/types/form';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { KnowledgeBaseItem } from '@/types/knowledge-base';

interface Template {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  tags: string[];
  dados: Partial<FormData>;
  usageCount: number;
  lastUsed?: Date;
  isFavorite?: boolean;
  source: 'template' | 'knowledge';
}

interface KnowledgeBaseTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
}

// Templates estáticos existentes
const staticTemplates: Template[] = [
  {
    id: '1',
    nome: 'Problema de Login',
    categoria: 'Acesso',
    descricao: 'Template para problemas relacionados ao login no sistema',
    tags: ['login', 'acesso', 'senha', 'autenticação'],
    dados: {
      resumo: 'Problema de acesso ao sistema',
      grau: '1º Grau',
      notas: 'Usuário relatou dificuldades para acessar o sistema. Verificar:\n- Credenciais do usuário\n- Status da conta\n- Configurações de rede\n- Logs de autenticação'
    },
    usageCount: 45,
    lastUsed: new Date('2024-01-15'),
    isFavorite: true,
    source: 'template'
  },
  {
    id: '2',
    nome: 'Erro de Certificado Digital',
    categoria: 'Certificado',
    descricao: 'Template para problemas com certificado digital',
    tags: ['certificado', 'digital', 'assinatura', 'token'],
    dados: {
      resumo: 'Problema com certificado digital',
      grau: '1º Grau',
      notas: 'Problema reportado com certificado digital. Verificar:\n- Validade do certificado\n- Instalação correta\n- Drivers do token/smartcard\n- Configurações do navegador'
    },
    usageCount: 32,
    lastUsed: new Date('2024-01-10'),
    isFavorite: false,
    source: 'template'
  },
  {
    id: '3',
    nome: 'Lentidão no Sistema',
    categoria: 'Performance',
    descricao: 'Template para problemas de performance e lentidão',
    tags: ['lentidão', 'performance', 'velocidade', 'timeout'],
    dados: {
      resumo: 'Sistema apresentando lentidão',
      grau: '1º Grau',
      notas: 'Usuário reportou lentidão no sistema. Verificar:\n- Carga do servidor\n- Conexão de rede\n- Cache do navegador\n- Recursos do computador\n- Horário de maior uso'
    },
    usageCount: 28,
    lastUsed: new Date('2024-01-08'),
    isFavorite: true,
    source: 'template'
  },
  {
    id: '4',
    nome: 'Erro ao Enviar Petição',
    categoria: 'Peticionamento',
    descricao: 'Template para problemas no envio de petições',
    tags: ['petição', 'envio', 'protocolo', 'anexo'],
    dados: {
      resumo: 'Erro no envio de petição eletrônica',
      grau: '1º Grau',
      notas: 'Erro reportado durante o envio de petição. Verificar:\n- Tamanho dos arquivos anexados\n- Formato dos documentos\n- Certificado digital\n- Dados do processo\n- Logs de erro do sistema'
    },
    usageCount: 38,
    lastUsed: new Date('2024-01-12'),
    isFavorite: false,
    source: 'template'
  },
  {
    id: '5',
    nome: 'Problema de Impressão',
    categoria: 'Impressão',
    descricao: 'Template para problemas relacionados à impressão',
    tags: ['impressão', 'impressora', 'documento', 'pdf'],
    dados: {
      resumo: 'Problema na impressão de documentos',
      grau: '1º Grau',
      notas: 'Problema reportado na impressão. Verificar:\n- Status da impressora\n- Drivers atualizados\n- Configurações de impressão\n- Formato do documento\n- Permissões de acesso'
    },
    usageCount: 22,
    lastUsed: new Date('2024-01-05'),
    isFavorite: false,
    source: 'template'
  }
];

export const KnowledgeBaseTemplateSelector: React.FC<KnowledgeBaseTemplateSelectorProps> = ({ 
  open, 
  onOpenChange, 
  onSelectTemplate 
}) => {
  const { items: knowledgeItems, isLoading } = useKnowledgeBase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState('templates');
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  // Converter itens da base de conhecimento em templates
  useEffect(() => {
    const knowledgeTemplates: Template[] = knowledgeItems.map((item: KnowledgeBaseItem) => ({
      id: `kb-${item.id}`,
      nome: item.titulo,
      categoria: item.categoria || 'Base de Conhecimento',
      descricao: item.problema_descricao.substring(0, 100) + (item.problema_descricao.length > 100 ? '...' : ''),
      tags: item.tags || [],
      dados: {
        resumo: item.titulo,
        grau: item.categoria?.includes('1') ? '1º Grau' : item.categoria?.includes('2') ? '2º Grau' : '',
        notas: `PROBLEMA:\n${item.problema_descricao}\n\nSOLUÇÃO:\n${item.solucao}`
      },
      usageCount: item.visualizacoes || 0,
      lastUsed: item.updated_at ? new Date(item.updated_at) : undefined,
      isFavorite: (item.util_count || 0) > 5, // Considera favorito se tem mais de 5 marcações como útil
      source: 'knowledge'
    }));

    setAllTemplates([...staticTemplates, ...knowledgeTemplates]);
  }, [knowledgeItems]);

  // Obter categorias únicas
  const categories = ['Todos', ...Array.from(new Set(allTemplates.map(t => t.categoria)))];

  // Filtrar templates
  useEffect(() => {
    let filtered = allTemplates;

    // Filtrar por aba ativa
    if (activeTab === 'templates') {
      filtered = filtered.filter(t => t.source === 'template');
    } else if (activeTab === 'knowledge') {
      filtered = filtered.filter(t => t.source === 'knowledge');
    }

    // Filtrar por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(t => t.categoria === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.nome.toLowerCase().includes(term) ||
        t.descricao.toLowerCase().includes(term) ||
        t.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Ordenar por favoritos primeiro, depois por uso recente
    filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.usageCount - a.usageCount;
    });

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, activeTab, allTemplates]);

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Nunca usado';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Usado ontem';
    if (diffDays < 7) return `Usado há ${diffDays} dias`;
    if (diffDays < 30) return `Usado há ${Math.ceil(diffDays / 7)} semanas`;
    return `Usado há ${Math.ceil(diffDays / 30)} meses`;
  };

  const getSourceIcon = (source: string) => {
    return source === 'knowledge' ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getSourceBadge = (source: string) => {
    return source === 'knowledge' ? (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
        <BookOpen className="h-3 w-3 mr-1" />
        Base de Conhecimento
      </Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
        <FileText className="h-3 w-3 mr-1" />
        Template
      </Badge>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Selecionar Template ou Assunto
            </h2>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Todos ({allTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates ({staticTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Base de Conhecimento ({knowledgeItems.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar templates e assuntos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando base de conhecimento...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getSourceIcon(template.source)}
                          {template.nome}
                          {template.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{template.descricao}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getSourceBadge(template.source)}
                        <Badge variant="secondary">{template.categoria}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastUsed(template.lastUsed)}
                        </span>
                        <span className="flex items-center gap-1">
                          {template.source === 'knowledge' ? (
                            <>
                              <Eye className="h-3 w-3" />
                              {template.usageCount} visualizações
                            </>
                          ) : (
                            <>
                              {template.usageCount} usos
                            </>
                          )}
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          onSelectTemplate(template);
                          onOpenChange(false);
                        }}
                      >
                        Usar {template.source === 'knowledge' ? 'Assunto' : 'Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredTemplates.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum template ou assunto encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};