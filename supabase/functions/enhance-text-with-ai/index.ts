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
        systemPrompt = 'Você é um assistente especializado em melhorar descrições de problemas técnicos para chamados de suporte do sistema NAPJe. Organize as informações de forma clara, adicione contexto relevante sobre funcionalidades do sistema judiciário e mantenha a linguagem técnica apropriada.';
        userPrompt = `Melhore esta descrição de problema para um chamado de suporte técnico do NAPJe. Organize as informações de forma estruturada, adicione contexto técnico se necessário, identifique possíveis causas e mantenha a linguagem clara e profissional. Retorne apenas o texto melhorado:\n\n"${text}"`;
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