import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Search, Clock, Star } from 'lucide-react';
import { FormData } from '@/types/form';

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
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const templates: Template[] = [
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
    isFavorite: true
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
    isFavorite: false
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
    isFavorite: true
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
    isFavorite: false
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
    isFavorite: false
  }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  const categories = ['Todos', ...Array.from(new Set(templates.map(t => t.categoria)))];

  useEffect(() => {
    let filtered = templates;

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
  }, [searchTerm, selectedCategory]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Selecionar Template
            </h2>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar templates</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.nome}
                        {template.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{template.descricao}</p>
                    </div>
                    <Badge variant="secondary">{template.categoria}</Badge>
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
                      <span>{template.usageCount} usos</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => onSelectTemplate(template)}
                    >
                      Usar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum template encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};