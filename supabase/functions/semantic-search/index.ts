// Edge Function para Busca Semântica com IA
// Esta é uma implementação exemplo que demonstra como integrar IA no sistema

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string;
  filters?: {
    types?: string[];
    limit?: number;
  };
  includeMetadata?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  score: number;
  metadata?: Record<string, unknown>;
  url?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, filters = {}, includeMetadata = false }: SearchRequest = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const searchTerms = query.toLowerCase().trim()
    const limit = filters.limit || 20

    // Busca híbrida: combina busca textual tradicional com scoring inteligente
    const results: SearchResult[] = []

    // 1. Buscar em chamados
    if (!filters.types || filters.types.includes('chamado')) {
      const { data: chamados, error: chamadosError } = await supabaseClient
        .from('chamados')
        .select('id, assunto, descricao, categoria, tags, created_at, status')
        .or(`assunto.ilike.%${searchTerms}%, descricao.ilike.%${searchTerms}%, tags.ilike.%${searchTerms}%`)
        .limit(Math.ceil(limit * 0.4))

      if (!chamadosError && chamados) {
        for (const chamado of chamados) {
          const score = calculateRelevanceScore(searchTerms, {
            title: chamado.assunto,
            description: chamado.descricao,
            tags: chamado.tags,
            category: chamado.categoria
          })

          results.push({
            id: chamado.id,
            title: chamado.assunto || 'Chamado sem título',
            description: chamado.descricao || 'Sem descrição',
            type: 'chamado',
            score,
            metadata: includeMetadata ? {
              id: chamado.id,
              categoria: chamado.categoria,
              tags: chamado.tags,
              status: chamado.status,
              created_at: chamado.created_at
            } : undefined,
            url: `/chamados/${chamado.id}`
          })
        }
      }
    }

    // 2. Buscar em atalhos
    if (!filters.types || filters.types.includes('atalho')) {
      const { data: atalhos, error: atalhosError } = await supabaseClient
        .from('atalhos')
        .select('id, titulo, descricao, url, categoria, tags')
        .or(`titulo.ilike.%${searchTerms}%, descricao.ilike.%${searchTerms}%, tags.ilike.%${searchTerms}%`)
        .limit(Math.ceil(limit * 0.3))

      if (!atalhosError && atalhos) {
        for (const atalho of atalhos) {
          const score = calculateRelevanceScore(searchTerms, {
            title: atalho.titulo,
            description: atalho.descricao,
            tags: atalho.tags,
            category: atalho.categoria
          })

          results.push({
            id: atalho.id,
            title: atalho.titulo || 'Atalho sem título',
            description: atalho.descricao || 'Sem descrição',
            type: 'atalho',
            score,
            metadata: includeMetadata ? {
              categoria: atalho.categoria,
              tags: atalho.tags
            } : undefined,
            url: atalho.url
          })
        }
      }
    }

    // 3. Buscar em usuários (se admin)
    if (!filters.types || filters.types.includes('usuario')) {
      const { data: usuarios, error: usuariosError } = await supabaseClient
        .from('profiles')
        .select('id, nome_completo, email, cargo, setor')
        .or(`nome_completo.ilike.%${searchTerms}%, email.ilike.%${searchTerms}%, cargo.ilike.%${searchTerms}%`)
        .limit(Math.ceil(limit * 0.15))

      if (!usuariosError && usuarios) {
        for (const usuario of usuarios) {
          const score = calculateRelevanceScore(searchTerms, {
            title: usuario.nome_completo,
            description: `${usuario.cargo} - ${usuario.setor}`,
            email: usuario.email
          })

          results.push({
            id: usuario.id,
            title: usuario.nome_completo || usuario.email || 'Usuário',
            description: usuario.cargo && usuario.setor ? `${usuario.cargo} - ${usuario.setor}` : 'Usuário do sistema',
            type: 'usuario',
            score,
            metadata: includeMetadata ? {
              email: usuario.email,
              cargo: usuario.cargo,
              setor: usuario.setor
            } : undefined
          })
        }
      }
    }

    // 4. Buscar em base de conhecimento
    if (!filters.types || filters.types.includes('conhecimento')) {
      const { data: conhecimento, error: conhecimentoError } = await supabaseClient
        .from('knowledge_base')
        .select('id, titulo, conteudo, categoria, tags')
        .or(`titulo.ilike.%${searchTerms}%, conteudo.ilike.%${searchTerms}%, tags.ilike.%${searchTerms}%`)
        .limit(Math.ceil(limit * 0.15))

      if (!conhecimentoError && conhecimento) {
        for (const item of conhecimento) {
          const score = calculateRelevanceScore(searchTerms, {
            title: item.titulo,
            description: item.conteudo,
            tags: item.tags,
            category: item.categoria
          })

          results.push({
            id: item.id,
            title: item.titulo || 'Documento',
            description: truncateText(item.conteudo || 'Sem conteúdo', 200),
            type: 'conhecimento',
            score,
            metadata: includeMetadata ? {
              categoria: item.categoria,
              tags: item.tags
            } : undefined,
            url: `/base-conhecimento/${item.id}`
          })
        }
      }
    }

    // Ordenar por relevância e aplicar limite
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Adicionar insights de busca para aprendizado
    await logSearchQuery(supabaseClient, query, sortedResults.length, searchTerms)

    return new Response(
      JSON.stringify({
        results: sortedResults,
        metadata: {
          query: query,
          resultsCount: sortedResults.length,
          searchTime: new Date().toISOString(),
          suggestions: generateSearchSuggestions(query, sortedResults)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na busca semântica:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno na busca',
        results: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Função para calcular relevância baseada em múltiplos fatores
function calculateRelevanceScore(searchTerms: string, content: Record<string, string>): number {
  let score = 0
  const searchWords = searchTerms.split(' ').filter(word => word.length > 2)

  // Pontuação por correspondência no título (peso maior)
  if (content.title) {
    const titleLower = content.title.toLowerCase()
    for (const word of searchWords) {
      if (titleLower.includes(word)) {
        score += titleLower === word ? 1.0 : 0.8 // Correspondência exata vs parcial
      }
    }
  }

  // Pontuação por correspondência na descrição
  if (content.description) {
    const descLower = content.description.toLowerCase()
    for (const word of searchWords) {
      if (descLower.includes(word)) {
        score += 0.4
      }
    }
  }

  // Pontuação por correspondência em tags
  if (content.tags) {
    const tagsLower = content.tags.toLowerCase()
    for (const word of searchWords) {
      if (tagsLower.includes(word)) {
        score += 0.6
      }
    }
  }

  // Pontuação por categoria
  if (content.category) {
    const categoryLower = content.category.toLowerCase()
    for (const word of searchWords) {
      if (categoryLower.includes(word)) {
        score += 0.3
      }
    }
  }

  // Normalizar score (0-1)
  return Math.min(score / searchWords.length, 1.0)
}

// Função para gerar sugestões de busca
function generateSearchSuggestions(originalQuery: string, results: SearchResult[]): string[] {
  const suggestions: Set<string> = new Set()

  // Sugestões baseadas nos resultados encontrados
  for (const result of results.slice(0, 5)) {
    const words = result.title.toLowerCase().split(' ')
    for (const word of words) {
      if (word.length > 3 && !originalQuery.toLowerCase().includes(word)) {
        suggestions.add(word)
      }
    }
  }

  // Sugestões comuns baseadas no tipo de resultado mais comum
  const typeCount: Record<string, number> = {}
  for (const result of results) {
    typeCount[result.type] = (typeCount[result.type] || 0) + 1
  }

  const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
    typeCount[a] > typeCount[b] ? a : b
  )

  // Adicionar sugestões específicas por tipo
  const typeSuggestions: Record<string, string[]> = {
    chamado: ['bug', 'problema', 'solicitação', 'erro', 'suporte'],
    atalho: ['sistema', 'acesso', 'ferramenta', 'aplicação'],
    usuario: ['perfil', 'administrador', 'contato'],
    conhecimento: ['tutorial', 'documentação', 'procedimento', 'guia']
  }

  if (typeSuggestions[mostCommonType]) {
    for (const suggestion of typeSuggestions[mostCommonType]) {
      if (!originalQuery.toLowerCase().includes(suggestion)) {
        suggestions.add(suggestion)
      }
    }
  }

  return Array.from(suggestions).slice(0, 5)
}

// Função para truncar texto
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Função para registrar consultas para análise futura
async function logSearchQuery(
  supabaseClient: { from: (table: string) => { insert: (data: Record<string, unknown>) => Promise<unknown> } }, 
  query: string, 
  resultsCount: number, 
  processedTerms: string
) {
  try {
    await supabaseClient
      .from('search_analytics')
      .insert({
        query: query,
        processed_terms: processedTerms,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
        user_agent: 'edge-function'
      })
  } catch (error) {
    // Log silencioso - não quebrar a busca por erro de analytics
    console.log('Erro ao registrar analytics de busca:', error)
  }
}