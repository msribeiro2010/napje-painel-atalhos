import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Texto é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY não configurada. Configure sua chave da OpenAI nas configurações do projeto.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';
    
    switch (type) {
      case 'resumo':
        systemPrompt = 'Você é um assistente especializado em criar resumos claros e concisos para chamados de suporte técnico do sistema NAPJe (Núcleo de Apoio ao Poder Judiciário eletrônico). Mantenha a linguagem profissional e objetiva, focando nos aspectos técnicos relevantes para sistemas judiciários.';
        userPrompt = `Melhore este resumo para um chamado de suporte do NAPJe, mantendo-o claro, profissional e técnico. Retorne apenas o texto melhorado:\n\n"${text}"`;
        break;
      case 'descricao':
        systemPrompt = 'Você é um assistente especializado em redigir descrições detalhadas e profissionais para chamados de suporte do sistema NAPJe. Sua tarefa é transformar o relato do problema em um texto descritivo, claro, objetivo e detalhado, em formato de parágrafo, explicando o impacto, contexto e consequências do problema, como em um relatório técnico. Não sugira solução, diagnóstico ou causa. Nunca invente dados e nunca proponha solução. IMPORTANTE: Não inclua cabeçalhos, títulos ou formatações como "Chamado de Suporte Técnico", "Usuário:", "Número do Processo:" ou similares. Retorne apenas a descrição do problema de forma direta.';
        userPrompt = `Reescreva a descrição do problema abaixo, transformando-a em um parágrafo claro, objetivo e detalhado, explicando o impacto, contexto e consequências do problema, como em um relatório técnico. Não sugira solução, diagnóstico ou causa. NÃO inclua cabeçalhos, títulos ou informações como "Chamado de Suporte Técnico", "Usuário:", "Número do Processo:" ou similares. Retorne apenas a descrição limpa do problema:\n\n"${text}"`;
        break;
      case 'sugestao_solucao':
        systemPrompt = 'Você é um assistente especializado em suporte técnico do sistema NAPJe. Com base na descrição do problema fornecida, sugira uma possível solução ou orientação inicial para o servidor responsável, de forma clara, objetiva e profissional. Se não for possível sugerir uma solução, oriente o servidor a buscar mais informações ou encaminhar para o suporte especializado. Sempre responda em português brasileiro.';
        userPrompt = `Com base na descrição do problema abaixo, gere uma sugestão de solução ou orientação inicial para o servidor responsável. Seja claro, objetivo e profissional. Se não for possível sugerir uma solução, oriente a buscar mais informações ou encaminhar para o suporte especializado.\n\nDescrição do problema:\n"${text}"`;
        break;
      case 'emoji':
        systemPrompt = 'Você é um assistente especializado em sugerir emojis relevantes para títulos de grupos e atalhos. Analise o título fornecido e sugira apenas 1 emoji que represente bem o conteúdo ou função. Retorne apenas o emoji, sem texto adicional.';
        userPrompt = `Sugira 1 emoji relevante para este título. Retorne apenas o emoji:\n\n"${text}"`;
        break;
      case 'nota':
        systemPrompt = 'Você é um assistente especializado em melhorar notas pessoais e organizacionais. Sua tarefa é reescrever a nota de forma mais clara, organizada e profissional, mantendo o contexto original mas melhorando a legibilidade e estrutura. Use linguagem clara e objetiva, organize ideias em tópicos quando apropriado, e mantenha o tom pessoal quando necessário.';
        userPrompt = `Melhore esta nota pessoal, tornando-a mais clara, organizada e legível. Mantenha o contexto original mas melhore a estrutura e clareza. Retorne apenas o texto melhorado:\n\n"${text}"`;
        break;
      default:
        systemPrompt = 'Você é um assistente especializado em melhorar textos para comunicação profissional no contexto de suporte técnico. Mantenha a linguagem clara, objetiva e profissional.';
        userPrompt = `Melhore este texto mantendo o contexto original, mas tornando-o mais claro e profissional. Retorne apenas o texto melhorado:\n\n"${text}"`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`Erro na API da OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da API da OpenAI');
    }

    const enhancedText = data.choices[0].message.content.trim();

    console.log('Text enhanced successfully:', { originalLength: text.length, enhancedLength: enhancedText.length });

    return new Response(JSON.stringify({ enhancedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-text-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});