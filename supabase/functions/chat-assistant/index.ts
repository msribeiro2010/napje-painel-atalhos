/// <reference types="https://deno.land/x/types/deno.d.ts" />

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

// Declare Deno globals for TypeScript
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Chat assistant function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing chat request...');
    const requestBody = await req.json();
    
    // Extract search parameters from request body
    const { message: userMessage, conversationHistory = [], enableWebSearch = true, searchMode = 'auto' } = requestBody;
    console.log('Message received:', userMessage);
    console.log('Search configuration:', { enableWebSearch, searchMode });

    // Verify all required environment variables
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration missing',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get knowledge base content
    const { data: knowledgeBase } = await supabase
      .from('base_conhecimento')
      .select('titulo, problema_descricao, solucao, categoria, tags')
      .limit(20)
      .order('created_at', { ascending: false });

    // Get recent tickets
    const { data: chamados } = await supabase
      .from('chamados')
      .select('titulo, descricao, tipo, status, assunto_id, created_at')
      .limit(15)
      .order('created_at', { ascending: false });

    // Get subjects for context
    const { data: assuntos } = await supabase
      .from('assuntos')
      .select('id, nome, categoria');

    // Get calendar events (feriados)
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { data: feriados } = await supabase
      .from('feriados')
      .select('id, data, descricao, tipo')
      .gte('data', today.toISOString().split('T')[0])
      .lte('data', nextMonth.toISOString().split('T')[0])
      .order('data', { ascending: true });

    // Get aniversariantes (birthdays)
    const { data: aniversariantes } = await supabase
      .from('aniversariantes')
      .select('id, nome, data_nascimento')
      .order('data_nascimento', { ascending: true });

    // Get important memories (limited to avoid token overflow)
    const { data: importantMemories } = await supabase
      .from('important_memories')
      .select('id, title, description, category, url, notes')
      .limit(10)
      .order('created_at', { ascending: false });

    // Get custom events for current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { data: customEvents } = await supabase
      .from('user_custom_events')
      .select('id, date, type, title, description, start_time, end_time, url')
      .gte('date', monthStart.toISOString().split('T')[0])
      .lte('date', monthEnd.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Function to search relevant content in knowledge base with better relevance
    function searchRelevantKnowledge(query: string, knowledgeBase: any[]): any[] {
      if (!knowledgeBase || knowledgeBase.length === 0) return [];
      
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(' ').filter(word => word.length > 2);
      
      return knowledgeBase
        .map(kb => {
          let relevanceScore = 0;
          const searchText = `${kb.titulo} ${kb.problema_descricao} ${kb.solucao} ${kb.categoria} ${kb.tags?.join(' ') || ''}`.toLowerCase();
          
          // Exact phrase match (highest priority)
          if (searchText.includes(queryLower)) {
            relevanceScore += 10;
          }
          
          // Keyword matches
          keywords.forEach(keyword => {
            if (searchText.includes(keyword)) {
              relevanceScore += 1;
            }
          });
          
          return { ...kb, relevanceScore };
        })
        .filter(kb => kb.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5); // Top 5 most relevant
    }

    // Function to search relevant tickets with better filtering
    function searchRelevantTickets(query: string, chamados: any[], assuntos: any[]): any[] {
      if (!chamados || chamados.length === 0) return [];
      
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(' ').filter(word => word.length > 2);
      
      return chamados
        .map(chamado => {
          let relevanceScore = 0;
          const assunto = assuntos?.find(a => a.id === chamado.assunto_id);
          const searchText = `${chamado.titulo} ${chamado.descricao} ${chamado.tipo} ${assunto?.nome || ''}`.toLowerCase();
          
          // Exact phrase match
          if (searchText.includes(queryLower)) {
            relevanceScore += 10;
          }
          
          // Keyword matches
          keywords.forEach(keyword => {
            if (searchText.includes(keyword)) {
              relevanceScore += 1;
            }
          });
          
          // Priority for recent tickets
          const daysSinceCreated = (Date.now() - new Date(chamado.created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreated < 7) relevanceScore += 2; // Recent tickets get bonus
          
          return { ...chamado, relevanceScore, assunto };
        })
        .filter(chamado => chamado.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3); // Top 3 most relevant
    }

    // Enhanced web search function with better targeting
    async function searchWebContent(query: string, enableWebSearch: boolean = true): Promise<string> {
      if (!enableWebSearch) {
        console.log('Web search disabled by user preference');
        return '';
      }
      
      try {
        console.log('Searching for additional context from external sources...');
        
        // Search TRT15 and judicial sites with better queries
        const searchQueries = [
          `site:trt15.jus.br ${query}`,
          `site:cnj.jus.br ${query}`,
          `site:tst.jus.br ${query}`,
          `"${query}" tribunal regional trabalho`,
          `${query} processo judicial eletrônico`
        ];
        
        let webContext = '';
        let searchCount = 0;
        const maxSearches = 3; // Limit web searches
        
        for (const searchQuery of searchQueries) {
          if (searchCount >= maxSearches) break;
          
          try {
            console.log(`Searching: ${searchQuery}`);
            const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`);
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              if (searchData.AbstractText && searchData.AbstractText.length > 50) {
                webContext += `${searchData.AbstractText}\n\n`;
                searchCount++;
              }
              if (searchData.RelatedTopics && searchData.RelatedTopics.length > 0) {
                const topics = searchData.RelatedTopics.slice(0, 1).map((topic: any) => topic.Text).join('\n');
                if (topics.length > 30) {
                  webContext += `${topics}\n\n`;
                }
              }
            }
          } catch (searchError) {
            console.log(`Search error for ${searchQuery}:`, searchError);
          }
        }
        
        return webContext.trim();
      } catch (error) {
        console.log('Web search error:', error);
        return '';
      }
    }

    // Smart search: First check internal sources, then web if needed
    const relevantKnowledge = searchRelevantKnowledge(userMessage, knowledgeBase || []);
    const relevantTickets = searchRelevantTickets(userMessage, chamados || [], assuntos || []);
    
    console.log('Internal search results:', {
      relevantKnowledge: relevantKnowledge.length,
      relevantTickets: relevantTickets.length,
      enableWebSearch
    });
    
    // Only search web if internal sources don't provide enough context
    let webContext = '';
    const hasInternalContext = relevantKnowledge.length > 0 || relevantTickets.length > 0;
    
    // Apply search mode logic
    if (searchMode === 'web' || (searchMode === 'auto' && (!hasInternalContext || enableWebSearch) && userMessage && userMessage.length > 10)) {
      webContext = await searchWebContent(userMessage, enableWebSearch || searchMode === 'web');
    }

    // Create context for the AI using filtered and relevant results
    const knowledgeContext = relevantKnowledge.length > 0 ? 
      relevantKnowledge.map(kb => 
        `Título: ${kb.titulo}\nProblema: ${kb.problema_descricao}\nSolução: ${kb.solucao}\nCategoria: ${kb.categoria || 'N/A'}\nTags: ${kb.tags?.join(', ') || 'N/A'}\nRelevância: ${kb.relevanceScore}`
      ).join('\n\n---\n\n') : 
      knowledgeBase?.slice(0, 3).map(kb => 
        `Título: ${kb.titulo}\nProblema: ${kb.problema_descricao}\nSolução: ${kb.solucao}\nCategoria: ${kb.categoria || 'N/A'}\nTags: ${kb.tags?.join(', ') || 'N/A'}`
      ).join('\n\n---\n\n') || '';

    const chamadosContext = relevantTickets.length > 0 ?
      relevantTickets.map(chamado => {
        return `Título: ${chamado.titulo}\nDescrição: ${chamado.descricao}\nTipo: ${chamado.tipo || 'N/A'}\nStatus: ${chamado.status}\nAssunto: ${chamado.assunto?.nome || 'N/A'}\nData: ${new Date(chamado.created_at).toLocaleDateString('pt-BR')}\nRelevância: ${chamado.relevanceScore}`;
      }).join('\n\n---\n\n') :
      chamados?.slice(0, 3).map(chamado => {
        const assunto = assuntos?.find(a => a.id === chamado.assunto_id);
        return `Título: ${chamado.titulo}\nDescrição: ${chamado.descricao}\nTipo: ${chamado.tipo || 'N/A'}\nStatus: ${chamado.status}\nAssunto: ${assunto?.nome || 'N/A'}\nData: ${new Date(chamado.created_at).toLocaleDateString('pt-BR')}`;
      }).join('\n\n---\n\n') || '';

    // Create calendar context
    const feriadosContext = feriados?.map(feriado => 
      `Data: ${new Date(feriado.data).toLocaleDateString('pt-BR')}\nFeriado: ${feriado.descricao}\nTipo: ${feriado.tipo}`
    ).join('\n\n---\n\n') || '';

    const aniversariantesContext = aniversariantes?.slice(0, 10).map(aniversariante => {
      // Validate that data_nascimento exists
      if (!aniversariante.data_nascimento) {
        console.warn('Aniversariante sem data de nascimento:', aniversariante);
        return `Nome: ${aniversariante.nome}\nData de Nascimento: Não informada\nIdade: Não calculável\nPróximo Aniversário: Não calculável`;
      }

      const nascimento = new Date(aniversariante.data_nascimento);
      
      // Validate that the date is valid
      if (isNaN(nascimento.getTime())) {
        console.warn('Data de nascimento inválida:', aniversariante.data_nascimento);
        return `Nome: ${aniversariante.nome}\nData de Nascimento: Inválida\nIdade: Não calculável\nPróximo Aniversário: Não calculável`;
      }

      const hoje = new Date();
      const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      return `Nome: ${aniversariante.nome}\nData de Nascimento: ${nascimento.toLocaleDateString('pt-BR')}\nIdade: ${idade} anos\nPróximo Aniversário: ${aniversarioEsteAno.toLocaleDateString('pt-BR')}`;
    }).join('\n\n---\n\n') || '';

    const memoriesContext = importantMemories?.map(memory => 
      `Título: ${memory.title}\nDescrição: ${memory.description || 'N/A'}\nCategoria: ${memory.category}\nURL: ${memory.url || 'N/A'}\nNotas: ${memory.notes || 'N/A'}`
    ).join('\n\n---\n\n') || '';

    const customEventsContext = customEvents?.map(event => 
      `Data: ${new Date(event.date).toLocaleDateString('pt-BR')}\nTipo: ${event.type}\nTítulo: ${event.title}\nDescrição: ${event.description || 'N/A'}\nHorário: ${event.start_time || 'N/A'} - ${event.end_time || 'N/A'}\nURL: ${event.url || 'N/A'}`
    ).join('\n\n---\n\n') || '';

    const systemPrompt = `Você é um assistente de TI especializado no sistema do TRT15 (Tribunal Regional do Trabalho da 15ª Região). 

Sua função é ajudar os usuários com base na base de conhecimento existente, nos chamados recentes do sistema, informações de calendário, memórias importantes e em informações atualizadas de fontes oficiais.

CONTEXTO DA BASE DE CONHECIMENTO (PRIORIDADE ALTA):
${knowledgeContext}

CONTEXTO DOS CHAMADOS RECENTES (PRIORIDADE ALTA):
${chamadosContext}

${feriadosContext ? `CONTEXTO DE FERIADOS E DATAS IMPORTANTES:
${feriadosContext}

` : ''}

${aniversariantesContext ? `CONTEXTO DE ANIVERSARIANTES:
${aniversariantesContext}

` : ''}

${memoriesContext ? `CONTEXTO DE MEMÓRIAS IMPORTANTES:
${memoriesContext}

` : ''}

${customEventsContext ? `CONTEXTO DE EVENTOS PERSONALIZADOS:
${customEventsContext}

` : ''}

${webContext ? `CONTEXTO ADICIONAL DA WEB (sites oficiais do TRT15, CNJ, TST):
${webContext}` : ''}

INSTRUÇÕES PRIORITÁRIAS PARA BUSCA INTELIGENTE:
1. **PRIORIDADE MÁXIMA**: Base de conhecimento interna do TRT15 (ordenada por relevância)
2. **ALTA PRIORIDADE**: Chamados recentes similares (especialmente últimos 7 dias)
3. **MÉDIA PRIORIDADE**: Informações de calendário, memórias importantes
4. **BAIXA PRIORIDADE**: Busca web (sites oficiais TRT15, CNJ, TST) - APENAS quando necessário
5. **CONTEXTO RELEVANTE**: As informações foram filtradas por relevância - use-as prioritariamente

REGRAS DE RESPOSTA:
- **SEMPRE mencione** se a resposta vem da base de conhecimento interna
- **SEMPRE indique** se há soluções similares em chamados recentes
- **Se usar busca web**, informe claramente que são informações complementares
- **Para problemas já resolvidos**: Referencie diretamente a solução da base
- **Para problemas similares**: Mencione chamados recentes relacionados
- **Nunca invente**: Use apenas informações das fontes consultadas
- **Seja específico**: Mencione números de relevância quando disponíveis

ESTRATÉGIA DE BUSCA APLICADA:
- ✅ Busca inteligente por palavras-chave na base interna
- ✅ Filtro de chamados por relevância e data
- ✅ Busca web SOMENTE quando contexto interno é insuficiente
- ✅ Priorização automática por relevância (scores incluídos)

ORDEM DE PRIORIDADE DAS FONTES (OTIMIZADA):
1. 🥇 Base de conhecimento (filtrada por relevância)
2. 🥈 Chamados recentes (últimos 7 dias têm prioridade)
3. 🥉 Informações de calendário e memórias
4. 🔍 Sites oficiais (TRT15, CNJ, TST) - busca complementar
5. 💡 Conhecimento geral (último recurso)

Responda de forma útil e contextualizada baseando-se OBRIGATORIAMENTE nas informações fornecidas.`;

    console.log('Sending request to OpenAI with context from:', {
      knowledgeBaseItems: knowledgeBase?.length || 0,
      chamadosItems: chamados?.length || 0,
      assuntosItems: assuntos?.length || 0,
      feriadosItems: feriados?.length || 0,
      aniversariantesItems: aniversariantes?.length || 0,
      importantMemoriesItems: importantMemories?.length || 0,
      customEventsItems: customEvents?.length || 0,
      webContextAvailable: webContext.length > 0,
      webContextLength: webContext.length
    });

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openAIResponse.ok) {
      console.error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`);
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error details:', errorText);
      
      return new Response(JSON.stringify({ 
        error: `Erro na API da OpenAI: ${openAIResponse.status}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response received');
    
    let assistantResponse = 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente.';
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
      assistantResponse = data.choices[0].message.content.trim();
      
      // Remove caracteres de formatação Markdown
      assistantResponse = assistantResponse
        // Remove títulos (###, ##, #)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove negrito (**texto** ou __texto__)
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        // Remove itálico (*texto* ou _texto_)
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove links [texto](url)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove código `código`
        .replace(/`([^`]+)`/g, '$1')
        // Remove listas (* item ou - item)
        .replace(/^[*\-+]\s+/gm, '')
        // Remove números de listas (1. item, 2. item)
        .replace(/^\d+\.\s+/gm, '')
        // Remove linhas horizontais (--- ou ***)
        .replace(/^[-*]{3,}$/gm, '')
        // Remove múltiplas quebras de linha
        .replace(/\n{3,}/g, '\n\n')
        // Remove espaços extras no início e fim
        .trim();
    } else if (data.error) {
      console.error('OpenAI API returned error:', data.error);
      assistantResponse = 'Sou o assistente de TI do TRT15. Como posso ajudá-lo hoje?';
    }

    // Garantir que sempre há uma resposta válida
    if (!assistantResponse || assistantResponse.length < 5) {
      assistantResponse = 'Olá! Sou o assistente virtual do TRT15. Posso ajudá-lo com questões de TI, base de conhecimento e chamados. Como posso auxiliá-lo?';
    }

    console.log('Successfully generated response');

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});