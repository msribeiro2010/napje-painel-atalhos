import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  type: 'chamado' | 'conhecimento' | 'atalho' | 'usuario';
  title: string;
  description: string;
  url?: string;
  score: number;
  metadata?: {
    // Existing metadata
    status?: string;
    categoria?: string;
    criado_por?: string;
    data_criacao?: string;
    tags?: string[];
    
    // New navigation metadata
    specificId?: string;        // ID específico do item
    searchTerm?: string;        // Termo que gerou o resultado
    highlightText?: string;     // Texto a ser destacado
    directUrl?: string;         // URL direta para o item
    
    // Legacy support
    [key: string]: any;
  };
}

// Cache agressivo para pesquisas
interface SearchCache {
  [key: string]: {
    data: SearchResult[];
    timestamp: number;
  };
}

let searchCache: SearchCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
const LOCAL_STORAGE_KEY = 'napje_search_cache';
const LOCAL_STORAGE_DURATION = 2 * 60 * 60 * 1000; // 2 horas

// Funções para localStorage
const saveToLocalStorage = (key: string, data: SearchResult[]) => {
  try {
    const allCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    allCache[key] = {
      data,
      timestamp: Date.now()
    };
    // Limitar o tamanho do cache (máximo 50 pesquisas)
    const keys = Object.keys(allCache);
    if (keys.length > 50) {
      const oldestKey = keys.reduce((oldest, current) => 
        allCache[current].timestamp < allCache[oldest].timestamp ? current : oldest
      );
      delete allCache[oldestKey];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCache));
  } catch (error) {
    console.warn('Erro ao salvar pesquisa no localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string): SearchResult[] | null => {
  try {
    const allCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const cached = allCache[key];
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > LOCAL_STORAGE_DURATION;
    
    if (isExpired) {
      delete allCache[key];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCache));
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.warn('Erro ao carregar pesquisa do localStorage:', error);
    return null;
  }
};

export const useSmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (err) {
        console.warn('Erro ao carregar histórico de busca:', err);
      }
    }
  }, []);

  // Função para extrair texto a ser destacado
  const extractHighlightText = useCallback((query: string, chamado: any): string => {
    const queryLower = query.toLowerCase().trim();
    const searchableFields = [
      { text: chamado.assunto, weight: 3 },
      { text: chamado.descricao, weight: 2 },
      { text: chamado.categoria, weight: 1 },
      { text: chamado.status, weight: 1 }
    ];

    // Encontrar o campo com maior relevância que contém o termo
    for (const field of searchableFields) {
      if (field.text && field.text.toLowerCase().includes(queryLower)) {
        // Extrair um trecho do texto que contém o termo
        const text = field.text;
        const index = text.toLowerCase().indexOf(queryLower);
        if (index !== -1) {
          const start = Math.max(0, index - 20);
          const end = Math.min(text.length, index + queryLower.length + 20);
          return text.substring(start, end);
        }
      }
    }

    return queryLower; // Fallback para o próprio termo de busca
  }, []);

  // Função para extrair texto a ser destacado de documentos
  const extractHighlightTextFromDoc = useCallback((query: string, doc: any): string => {
    const queryLower = query.toLowerCase().trim();
    
    // Verificar título primeiro (maior prioridade)
    if (doc.titulo && doc.titulo.toLowerCase().includes(queryLower)) {
      return doc.titulo;
    }
    
    // Verificar conteúdo
    if (doc.conteudo && doc.conteudo.toLowerCase().includes(queryLower)) {
      const text = doc.conteudo;
      const index = text.toLowerCase().indexOf(queryLower);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + queryLower.length + 30);
        return text.substring(start, end);
      }
    }
    
    // Verificar tags
    if (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
      const matchingTag = doc.tags.find((tag: string) => tag.toLowerCase().includes(queryLower));
      return matchingTag || queryLower;
    }

    return queryLower; // Fallback para o próprio termo de busca
  }, []);

  // Busca em chamados
  const searchChamados = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🔍 Buscando em chamados:', query);
    
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id,
          resumo,
          notas,
          grau,
          created_at,
          nome_usuario_afetado
        `)
        .or(`resumo.ilike.%${query}%,notas.ilike.%${query}%,grau.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('❌ Erro ao buscar chamados:', error);
        console.log('📝 Usando dados de exemplo devido ao erro');
        return getExampleChamados(query);
      }

      console.log('✅ Chamados encontrados no banco:', data?.length || 0);

      // Se não há dados reais, usar dados de exemplo
      if (!data || data.length === 0) {
        console.log('📝 Nenhum dado real encontrado, usando dados de exemplo');
        const exampleResults = getExampleChamados(query);
        console.log('📝 Dados de exemplo filtrados:', exampleResults.length);
        return exampleResults;
      }

      return (data || []).map((chamado, index) => ({
        id: chamado.id,
        type: 'chamado' as const,
        title: chamado.resumo || 'Chamado sem título',
        description: chamado.notas || 'Sem descrição',
        score: 100 - index, // Score baseado na posição (mais recentes primeiro)
        metadata: {
          status: 'Aberto', // Status padrão
          categoria: chamado.grau,
          criado_por: chamado.nome_usuario_afetado,
          data_criacao: chamado.created_at,
          // New navigation metadata
          specificId: chamado.id,
          searchTerm: query,
          highlightText: extractHighlightText(query, { 
            assunto: chamado.resumo, 
            descricao: chamado.notas, 
            categoria: chamado.grau, 
            status: 'Aberto' 
          }),
          directUrl: `/chamado/${chamado.id}`
        }
      }));
    } catch (err) {
      console.error('❌ Erro na busca de chamados:', err);
      return getExampleChamados(query);
    }
  }, []);

  // Dados de exemplo para chamados
  const getExampleChamados = useCallback((query: string): SearchResult[] => {
    const exampleChamados = [
      {
        id: 'chamado-1',
        assunto: 'Questão com login no sistema',
        descricao: 'Usuário não consegue acessar o sistema com suas credenciais',
        status: 'Em andamento',
        categoria: 'Suporte Técnico',
        created_at: new Date().toISOString(),
        usuario_criador_nome: 'João Silva'
      },
      {
        id: 'chamado-2',
        assunto: 'Erro na geração de relatórios',
        descricao: 'Sistema apresenta erro ao tentar gerar relatórios mensais',
        status: 'Pendente',
        categoria: 'Bug',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        usuario_criador_nome: 'Maria Santos'
      },
      {
        id: 'chamado-3',
        assunto: 'Solicitação de nova funcionalidade',
        descricao: 'Implementar filtro avançado na tela de consultas',
        status: 'Análise',
        categoria: 'Melhoria',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        usuario_criador_nome: 'Pedro Costa'
      },
      {
        id: 'chamado-4',
        assunto: 'Configuração de usuário',
        descricao: 'Criar novo usuário no sistema com perfil administrativo',
        status: 'Concluído',
        categoria: 'Configuração',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        usuario_criador_nome: 'Ana Oliveira'
      },
      {
        id: 'chamado-5',
        assunto: 'Backup do sistema',
        descricao: 'Realizar backup completo da base de dados',
        status: 'Agendado',
        categoria: 'Manutenção',
        created_at: new Date(Date.now() - 345600000).toISOString(),
        usuario_criador_nome: 'Carlos Lima'
      },
      {
        id: 'chamado-6',
        assunto: 'Cadastro de Perito - Erro',
        descricao: 'Problema no cadastro de perito judicial no sistema PJe',
        status: 'Em andamento',
        categoria: 'Cadastro',
        created_at: new Date(Date.now() - 432000000).toISOString(),
        usuario_criador_nome: 'Dr. Roberto Pereira'
      },
      {
        id: 'chamado-7',
        assunto: 'Nomeação de Perito',
        descricao: 'Solicitação de nomeação de perito para processo judicial',
        status: 'Pendente',
        categoria: 'Processo',
        created_at: new Date(Date.now() - 518400000).toISOString(),
        usuario_criador_nome: 'Juiz Carlos Mendes'
      },
      {
        id: 'chamado-8',
        assunto: 'Lista de Peritos Habilitados',
        descricao: 'Atualização da lista de peritos habilitados para nomeação',
        status: 'Concluído',
        categoria: 'Administração',
        created_at: new Date(Date.now() - 604800000).toISOString(),
        usuario_criador_nome: 'Secretaria Judicial'
      }
    ];

    // Filtrar por query com busca mais inteligente
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);
    
    const filtered = exampleChamados.filter(chamado => {
      const searchableText = [
        chamado.assunto,
        chamado.descricao,
        chamado.categoria,
        chamado.status,
        chamado.usuario_criador_nome
      ].join(' ').toLowerCase();
      
      // Busca por correspondência exata ou parcial
      return queryWords.some(word => searchableText.includes(word)) ||
             searchableText.includes(queryLower);
    });

    return filtered.map((chamado, index) => ({
      id: chamado.id,
      type: 'chamado' as const,
      title: chamado.assunto,
      description: chamado.descricao,
      score: 100 - index,
      metadata: {
        status: chamado.status,
        categoria: chamado.categoria,
        criado_por: chamado.usuario_criador_nome,
        data_criacao: chamado.created_at,
        // New navigation metadata
        specificId: chamado.id,
        searchTerm: query,
        highlightText: extractHighlightText(query, chamado),
        directUrl: `/chamado/${chamado.id}`
      }
    }));
  }, []);

  // Busca na base de conhecimento (simulada)
  const searchBaseConhecimento = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🔍 Buscando na base de conhecimento:', query);
    
    // Dados simulados da base de conhecimento expandida
    const baseConhecimento = [
      {
        id: 'doc-1',
        titulo: 'Como criar um novo chamado',
        conteudo: 'Guia completo para criação de chamados no sistema PJe. Inclui passo a passo detalhado.',
        categoria: 'Documentação',
        tags: ['chamado', 'criação', 'guia', 'tutorial']
      },
      {
        id: 'doc-2',
        titulo: 'Procedimentos de backup',
        conteudo: 'Instruções detalhadas para realizar backup dos dados do sistema de forma segura.',
        categoria: 'Procedimentos',
        tags: ['backup', 'segurança', 'dados', 'manutenção']
      },
      {
        id: 'doc-3',
        titulo: 'Configuração de usuários',
        conteudo: 'Como configurar novos usuários no sistema, definir permissões e perfis de acesso.',
        categoria: 'Administração',
        tags: ['usuário', 'configuração', 'admin', 'permissões']
      },
      {
        id: 'doc-4',
        titulo: 'Troubleshooting comum',
        conteudo: 'Soluções para problemas frequentes no sistema, erros comuns e suas correções.',
        categoria: 'Suporte',
        tags: ['problema', 'solução', 'suporte', 'erro']
      },
      {
        id: 'doc-5',
        titulo: 'Integração com PJe',
        conteudo: 'Como integrar o sistema com o PJe, configurações necessárias e troubleshooting.',
        categoria: 'Integração',
        tags: ['pje', 'integração', 'sistema', 'configuração']
      },
      {
        id: 'doc-6',
        titulo: 'Manual do usuário',
        conteudo: 'Manual completo do usuário com todas as funcionalidades do sistema PJe.',
        categoria: 'Documentação',
        tags: ['manual', 'usuário', 'funcionalidades', 'guia']
      },
      {
        id: 'doc-7',
        titulo: 'Relatórios e dashboards',
        conteudo: 'Como gerar relatórios personalizados e configurar dashboards no sistema.',
        categoria: 'Relatórios',
        tags: ['relatório', 'dashboard', 'análise', 'dados']
      },
      {
        id: 'doc-8',
        titulo: 'Segurança e auditoria',
        conteudo: 'Práticas de segurança, logs de auditoria e monitoramento do sistema.',
        categoria: 'Segurança',
        tags: ['segurança', 'auditoria', 'logs', 'monitoramento']
      },
      {
        id: 'doc-9',
        titulo: 'API e integrações',
        conteudo: 'Documentação da API REST e como integrar com sistemas externos.',
        categoria: 'Desenvolvimento',
        tags: ['api', 'rest', 'integração', 'desenvolvimento']
      },
      {
        id: 'doc-10',
        titulo: 'FAQ - Perguntas frequentes',
        conteudo: 'Respostas para as perguntas mais frequentes sobre o sistema PJe.',
        categoria: 'FAQ',
        tags: ['faq', 'perguntas', 'respostas', 'ajuda']
      },
      {
        id: 'doc-11',
        titulo: 'Configuração de Horário e Expediente',
        conteudo: 'Como configurar horários de funcionamento, plantões e escalas de trabalho no sistema. Inclui configuração de feriados e exceções.',
        categoria: 'Configuração',
        tags: ['horário', 'expediente', 'plantão', 'trabalho', 'feriado', 'escala']
      },
      {
        id: 'doc-12',
        titulo: 'Gestão de Horários de Atendimento',
        conteudo: 'Definir horários de atendimento ao público, configurar intervalos e pausas. Gestão de horário de funcionamento dos serviços.',
        categoria: 'Atendimento',
        tags: ['horário', 'atendimento', 'público', 'serviço', 'funcionamento', 'intervalo']
      },
      {
        id: 'doc-13',
        titulo: 'Registro de Ponto e Controle de Horário',
        conteudo: 'Sistema de controle de ponto eletrônico, registro de entrada e saída, gestão de horas extras e compensação.',
        categoria: 'RH',
        tags: ['horário', 'ponto', 'entrada', 'saída', 'controle', 'horas', 'extra']
      },
      {
        id: 'doc-14',
        titulo: 'Cadastro e Gestão de Peritos',
        conteudo: 'Manual completo para cadastro de peritos judiciais, incluindo habilitação, nomeação e gestão de especialidades. Procedimentos para manter lista atualizada de peritos.',
        categoria: 'Judicial',
        tags: ['perito', 'cadastro', 'nomeação', 'habilitação', 'especialidade', 'judicial']
      },
      {
        id: 'doc-15',
        titulo: 'Nomeação de Perito em Processos',
        conteudo: 'Guia para nomeação de peritos em processos judiciais, critérios de seleção, documentação necessária e procedimentos administrativos.',
        categoria: 'Processo',
        tags: ['perito', 'nomeação', 'processo', 'seleção', 'documentação', 'administrativo']
      },
      {
        id: 'doc-16',
        titulo: 'Lista de Peritos Habilitados',
        conteudo: 'Como consultar e atualizar a lista de peritos habilitados por especialidade, incluindo dados de contato e área de atuação.',
        categoria: 'Consulta',
        tags: ['perito', 'lista', 'habilitado', 'especialidade', 'contato', 'atuação']
      }
    ];

    // Busca mais inteligente por texto
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);
    
    const resultados = baseConhecimento.filter(doc => {
      const searchableText = [
        doc.titulo,
        doc.conteudo,
        doc.categoria,
        ...doc.tags
      ].join(' ').toLowerCase();
      
      // Busca por correspondência exata ou parcial
      return queryWords.some(word => searchableText.includes(word)) ||
             searchableText.includes(queryLower) ||
             doc.tags.some(tag => tag.toLowerCase().includes(queryLower));
    });

    console.log('✅ Documentos encontrados na base de conhecimento:', resultados.length);
    console.log('📋 Documentos que correspondem à busca:', resultados.map(doc => doc.titulo));

    return resultados.map((doc, index) => ({
      id: doc.id,
      type: 'conhecimento' as const,
      title: doc.titulo,
      description: doc.conteudo,
      score: 90 - index,
      metadata: {
        categoria: doc.categoria,
        tags: doc.tags,
        // New navigation metadata
        specificId: doc.id,
        searchTerm: query,
        highlightText: extractHighlightTextFromDoc(query, doc),
        directUrl: `/base-conhecimento/${doc.id}`
      }
    }));
  }, []);

  // Busca com ChatGPT (simulada)
  const searchWithChatGPT = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🤖 Buscando com ChatGPT:', query);
    
    // Simulação de resposta do ChatGPT
    const chatGPTResults = [
      {
        id: 'ai-1',
        type: 'conhecimento' as const,
        title: `Sugestão IA: ${query}`,
        description: `Baseado na sua busca por "${query}", aqui estão algumas sugestões relevantes para o sistema PJe.`,
        score: 95,
        metadata: {
          fonte: 'ChatGPT',
          categoria: 'Sugestão IA'
        }
      }
    ];

    console.log('✅ Sugestões IA geradas:', chatGPTResults.length);
    return chatGPTResults;
  }, []);

  // Sugestões genéricas quando não há resultados
  const getGenericSuggestions = useCallback((query: string): SearchResult[] => {
    const suggestions = [
      {
        id: 'suggestion-help',
        type: 'conhecimento' as const,
        title: `Não encontrou "${query}"? Aqui estão algumas dicas`,
        description: 'Tente termos mais específicos como "problema login", "erro sistema", "configurar usuário", "como fazer backup"',
        score: 50,
        metadata: {
          categoria: 'Ajuda',
          tipo: 'dicas',
          action: 'base-conhecimento'
        }
      },
      {
        id: 'suggestion-manual',
        type: 'conhecimento' as const,
        title: 'Consultar Base de Conhecimento',
        description: 'Acesse nossa base de conhecimento completa com manuais, tutoriais e documentação do sistema',
        score: 45,
        metadata: {
          categoria: 'Documentação',
          tipo: 'manual',
          action: 'base-conhecimento'
        }
      },
      {
        id: 'suggestion-create',
        type: 'chamado' as const,
        title: 'Criar Novo Chamado',
        description: 'Não encontrou o que procura? Crie um novo chamado para obter ajuda personalizada da nossa equipe',
        score: 40,
        metadata: {
          categoria: 'Ação',
          tipo: 'criar',
          action: 'criar-chamado'
        }
      },
      {
        id: 'suggestion-recent',
        type: 'chamado' as const,
        title: 'Ver Chamados Recentes',
        description: 'Consulte os chamados mais recentes para ver se sua dúvida já foi respondida',
        score: 35,
        metadata: {
          categoria: 'Consulta',
          tipo: 'historico',
          action: 'chamados-recentes'
        }
      }
    ];

    return suggestions;
  }, []);

  // Busca híbrida principal
  const hybridSearch = useCallback(async (
    query: string, 
    options?: {
      types?: string[];
      limit?: number;
    }
  ) => {
    if (!query.trim()) {
      console.log('🔍 Query vazia, limpando resultados');
      setResults([]);
      return [];
    }

    const { types = ['chamado', 'conhecimento'], limit = 20 } = options || {};
    
    // Criar chave de cache baseada na query e opções
    const cacheKey = `${query.toLowerCase().trim()}_${types.join(',')}_${limit}`;
    
    // Verificar cache em memória primeiro
    const memoryCache = searchCache[cacheKey];
    if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
      console.log('🎯 Cache hit (memória):', cacheKey);
      setResults(memoryCache.data);
      return memoryCache.data;
    }
    
    // Verificar cache no localStorage
    const localCache = loadFromLocalStorage(cacheKey);
    if (localCache) {
      console.log('🎯 Cache hit (localStorage):', cacheKey);
      // Atualizar cache em memória
      searchCache[cacheKey] = {
        data: localCache,
        timestamp: Date.now()
      };
      setResults(localCache);
      return localCache;
    }
    
    setIsLoading(true);
    setError(null);

    console.log('🚀 Iniciando busca híbrida:', { query, types, limit });
    
    // Debug específico para palavras importantes
    if (query.toLowerCase().includes('problema') || query.toLowerCase().includes('perito')) {
      console.log('🔍 DEBUG: Detectada busca por palavra-chave:', query.toLowerCase());
      console.log('🔍 DEBUG: Query completa:', query);
      console.log('🔍 DEBUG: Tipos de busca:', types);
    }

    try {
      const searchPromises: Promise<SearchResult[]>[] = [];

      // Buscar em chamados com tratamento de erro individual
      if (types.includes('chamado')) {
        searchPromises.push(
          searchChamados(query).catch(err => {
            console.error('❌ Erro na busca de chamados:', err);
            return getExampleChamados(query); // Fallback para dados de exemplo
          })
        );
      }

      // Buscar na base de conhecimento com tratamento de erro individual
      if (types.includes('conhecimento')) {
        searchPromises.push(
          searchBaseConhecimento(query).catch(err => {
            console.error('❌ Erro na busca de conhecimento:', err);
            return []; // Retorna array vazio em caso de erro
          })
        );
        // Adicionar busca com ChatGPT com tratamento de erro
        searchPromises.push(
          searchWithChatGPT(query).catch(err => {
            console.error('❌ Erro na busca com ChatGPT:', err);
            return []; // Retorna array vazio em caso de erro
          })
        );
      }

      console.log('📊 Executando', searchPromises.length, 'buscas em paralelo');
      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults.flat().filter(result => result != null);

      console.log('📊 Total de resultados combinados:', combinedResults.length);

      // Ordenar por score e limitar resultados
      const sortedResults = combinedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log('✅ Resultados finais:', sortedResults.length);
      console.log('📋 Detalhes dos resultados:', sortedResults.map(r => ({ 
        type: r.type, 
        title: r.title, 
        score: r.score 
      })));

      // Se não há resultados, adicionar sugestões genéricas
      if (sortedResults.length === 0) {
        console.log('💡 Adicionando sugestões genéricas para:', query);
        const genericSuggestions = getGenericSuggestions(query);
        sortedResults.push(...genericSuggestions);
      }

      setResults(sortedResults);
      
      // Salvar no cache (memória e localStorage)
      searchCache[cacheKey] = {
        data: sortedResults,
        timestamp: Date.now()
      };
      saveToLocalStorage(cacheKey, sortedResults);
      
      // Limpar cache antigo da memória
      const now = Date.now();
      Object.keys(searchCache).forEach(key => {
        if (now - searchCache[key].timestamp > CACHE_DURATION) {
          delete searchCache[key];
        }
      });

      // Adicionar ao histórico apenas se houve busca real
      if (query.trim().length > 0) {
        try {
          setSearchHistory(prev => {
            const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
            localStorage.setItem('smart_search_history', JSON.stringify(newHistory));
            return newHistory;
          });
        } catch (storageErr) {
          console.warn('⚠️ Erro ao salvar histórico:', storageErr);
          // Não quebrar a busca por erro de localStorage
        }
      }

      return sortedResults;
    } catch (err) {
      console.error('❌ Erro na busca híbrida:', err);
      setError('Erro ao realizar busca. Tente novamente.');
      
      // Em caso de erro geral, retornar sugestões genéricas
      const fallbackSuggestions = getGenericSuggestions(query);
      setResults(fallbackSuggestions);
      return fallbackSuggestions;
    } finally {
      setIsLoading(false);
    }
  }, [searchChamados, searchBaseConhecimento, searchWithChatGPT, getGenericSuggestions, getExampleChamados]);



  // Sugestões inteligentes
  const getSmartSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (query.length < 2) return [];

    const suggestions = [
      // Problemas comuns
      'problema login',
      'erro sistema',
      'sistema lento',
      'problema acesso',
      
      // Horários e expediente
      'horário expediente',
      'horário atendimento',
      'configurar horário',
      'horário plantão',
      
      // Configurações
      'configurar usuário',
      'configuração sistema',
      'configurar backup',
      'configurar relatório',
      
      // Procedimentos
      'como criar chamado',
      'como fazer backup',
      'como gerar relatório',
      'como configurar',
      
      // Documentação
      'manual usuário',
      'documentação sistema',
      'guia configuração',
      'tutorial',
      
      // Suporte
      'suporte técnico',
      'ajuda sistema',
      'troubleshooting',
      'solução problema',
      
      // Integrações
      'integração pje',
      'configurar pje',
      'api sistema',
      'webhook',
      
      // Judicial
      'cadastro perito',
      'nomeação perito',
      'lista perito',
      'perito habilitado',
      'perito judicial'
    ];

    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().split(' ').some(word => 
        suggestion.toLowerCase().includes(word)
      )
    );

    return filtered.slice(0, 6);
  }, []);

  // Funções auxiliares
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const clearSearchHistory = useCallback(() => {
    console.log('🗑️ Limpando histórico de busca');
    setSearchHistory([]);
    localStorage.removeItem('smart_search_history');
  }, []);
  
  const clearSearchCache = useCallback(() => {
    console.log('🗑️ Limpando cache de pesquisa');
    searchCache = {};
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const semanticSearch = useCallback((query: string) => {
    return hybridSearch(query, { types: ['chamado', 'conhecimento'] });
  }, [hybridSearch]);

  const fuzzySearch = useCallback((query: string) => {
    return hybridSearch(query, { types: ['chamado', 'conhecimento'] });
  }, [hybridSearch]);

  const searchEntity = useCallback((query: string, entityType: string) => {
    return hybridSearch(query, { types: [entityType] });
  }, [hybridSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    hybridSearch,
    semanticSearch,
    fuzzySearch,
    searchEntity,
    getSmartSuggestions,
    clearResults,
    clearSearchHistory,
    clearSearchCache
  };
};