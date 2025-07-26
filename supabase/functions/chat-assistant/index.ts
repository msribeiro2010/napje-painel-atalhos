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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Chat assistant function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing chat request...');
    const { message, conversationHistory = [] } = await req.json();
    console.log('Message received:', message);

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

    console.log('Searching for additional context from external sources...');
    
    // Function to search web for TRT15 and judicial content
    async function searchWebContent(query: string): Promise<string> {
      try {
        // Search TRT15 and judicial sites
        const searchQueries = [
          `site:trt15.jus.br ${query}`,
          `site:cnj.jus.br ${query}`,
          `site:tst.jus.br ${query}`
        ];
        
        let webContext = '';
        
        for (const searchQuery of searchQueries) {
          try {
            console.log(`Searching: ${searchQuery}`);
            // Use a simple DuckDuckGo search API or similar
            const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`);
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              if (searchData.AbstractText) {
                webContext += `${searchData.AbstractText}\n\n`;
              }
              if (searchData.RelatedTopics) {
                const topics = searchData.RelatedTopics.slice(0, 2).map((topic: any) => topic.Text).join('\n');
                webContext += `${topics}\n\n`;
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

    // Perform web search if relevant
    let webContext = '';
    if (message && message.length > 10) {
      webContext = await searchWebContent(message);
    }

    // Create context for the AI
    const knowledgeContext = knowledgeBase?.map(kb => 
      `Título: ${kb.titulo}\nProblema: ${kb.problema_descricao}\nSolução: ${kb.solucao}\nCategoria: ${kb.categoria || 'N/A'}\nTags: ${kb.tags?.join(', ') || 'N/A'}`
    ).join('\n\n---\n\n') || '';

    const chamadosContext = chamados?.map(chamado => {
      const assunto = assuntos?.find(a => a.id === chamado.assunto_id);
      return `Título: ${chamado.titulo}\nDescrição: ${chamado.descricao}\nTipo: ${chamado.tipo || 'N/A'}\nStatus: ${chamado.status}\nAssunto: ${assunto?.nome || 'N/A'}\nData: ${new Date(chamado.created_at).toLocaleDateString('pt-BR')}`;
    }).join('\n\n---\n\n') || '';

    // Create calendar context
    const feriadosContext = feriados?.map(feriado => 
      `Data: ${new Date(feriado.data).toLocaleDateString('pt-BR')}\nFeriado: ${feriado.descricao}\nTipo: ${feriado.tipo}`
    ).join('\n\n---\n\n') || '';

    const aniversariantesContext = aniversariantes?.slice(0, 10).map(aniversariante => {
      const nascimento = new Date(aniversariante.data_nascimento);
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

INSTRUÇÕES PRIORITÁRIAS:
1. **SEMPRE CONSULTE PRIMEIRO** a base de conhecimento interna e chamados recentes antes de dar qualquer resposta
2. Use PRIORITARIAMENTE as informações da base de conhecimento e chamados recentes do TRT15
3. Para perguntas sobre calendário, feriados, aniversários ou eventos, consulte as informações de calendário disponíveis
4. Para perguntas sobre informações importantes, senhas, URLs ou notas pessoais, consulte as memórias importantes
5. Complemente com informações dos sites oficiais (TRT15, CNJ, TST) quando disponíveis
6. Se a informação não estiver disponível em nenhuma fonte consultada, informe claramente
7. Responda sempre em português brasileiro de forma educada e profissional
8. Para problemas já solucionados na base de conhecimento, referencie a solução existente
9. Para problemas similares aos chamados recentes, mencione isso no contexto
10. Para problemas técnicos, sugira passos claros baseados nas soluções conhecidas
11. Se necessário, recomende a criação de um novo chamado
12. **IMPORTANTE**: Nunca invente informações - use apenas o que está disponível nas fontes consultadas
13. Para informações de calendário, sempre mencione datas próximas relevantes
14. Para memórias importantes, mantenha a confidencialidade e só forneça informações quando solicitado diretamente

ORDEM DE PRIORIDADE DAS FONTES:
1. Base de conhecimento interna do TRT15
2. Chamados recentes similares
3. Informações de calendário (feriados, aniversários, eventos)
4. Memórias importantes (quando relevante)
5. Sites oficiais (TRT15, CNJ, TST)
6. Conhecimento geral sobre tecnologia e direito trabalhista

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
      { role: 'user', content: message }
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