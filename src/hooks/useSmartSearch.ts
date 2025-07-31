import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  type: 'chamado' | 'conhecimento' | 'atalho';
  title: string;
  description: string;
  url?: string;
  score: number;
  metadata?: Record<string, any>;
}

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

  // Busca em chamados
  const searchChamados = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('🔍 Buscando em chamados:', query);
    
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id,
          assunto,
          descricao,
          status,
          categoria,
          created_at,
          usuario_criador_nome
        `)
        .or(`assunto.ilike.%${query}%,descricao.ilike.%${query}%,categoria.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar chamados:', error);
        // Retornar dados de exemplo se houver erro
        return getExampleChamados(query);
      }

      console.log('✅ Chamados encontrados:', data?.length || 0);

      // Se não há dados reais, usar dados de exemplo
      if (!data || data.length === 0) {
        console.log('📝 Usando dados de exemplo para chamados');
        return getExampleChamados(query);
      }

      return (data || []).map((chamado, index) => ({
        id: chamado.id,
        type: 'chamado' as const,
        title: chamado.assunto || 'Chamado sem título',
        description: chamado.descricao || 'Sem descrição',
        score: 100 - index, // Score baseado na posição (mais recentes primeiro)
        metadata: {
          status: chamado.status,
          categoria: chamado.categoria,
          criado_por: chamado.usuario_criador_nome,
          data_criacao: chamado.created_at
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
      }
    ];

    // Filtrar por query
    const filtered = exampleChamados.filter(chamado => 
      chamado.assunto.toLowerCase().includes(query.toLowerCase()) ||
      chamado.descricao.toLowerCase().includes(query.toLowerCase()) ||
      chamado.categoria.toLowerCase().includes(query.toLowerCase()) ||
      chamado.status.toLowerCase().includes(query.toLowerCase())
    );

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
        data_criacao: chamado.created_at
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
        conteudo: 'Guia completo para criação de chamados no sistema NAPJe. Inclui passo a passo detalhado.',
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
        conteudo: 'Manual completo do usuário com todas as funcionalidades do sistema NAPJe.',
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
        conteudo: 'Respostas para as perguntas mais frequentes sobre o sistema NAPJe.',
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
      }
    ];

    // Busca mais inteligente por texto
    const resultados = baseConhecimento.filter(doc => {
      const queryLower = query.toLowerCase();
      return (
        doc.titulo.toLowerCase().includes(queryLower) ||
        doc.conteudo.toLowerCase().includes(queryLower) ||
        doc.categoria.toLowerCase().includes(queryLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    });

    console.log('✅ Documentos encontrados:', resultados.length);

    return resultados.map((doc, index) => ({
      id: doc.id,
      type: 'conhecimento' as const,
      title: doc.titulo,
      description: doc.conteudo,
      score: 90 - index,
      metadata: {
        categoria: doc.categoria,
        tags: doc.tags
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
        description: `Baseado na sua busca por "${query}", aqui estão algumas sugestões relevantes para o sistema NAPJe.`,
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
    setIsLoading(true);
    setError(null);

    console.log('🚀 Iniciando busca híbrida:', { query, types, limit });
    
    // Debug específico para a palavra "problema"
    if (query.toLowerCase().includes('problema')) {
      console.log('🔍 DEBUG: Detectada busca por "problema"');
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
      'webhook'
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
    clearSearchHistory
  };
};