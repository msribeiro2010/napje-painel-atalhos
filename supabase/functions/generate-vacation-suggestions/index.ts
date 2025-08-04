import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holiday {
  id: number;
  data: string;
  descricao: string;
  tipo: string;
}

interface VacationSuggestion {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  workDays: number;
  score: number;
  reason: string;
  holidays: string[];
  benefits: string[];
  period: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { year } = await req.json();

    if (!year) {
      return new Response(JSON.stringify({ error: 'Ano é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar feriados do ano
    const { data: holidays, error: holidaysError } = await supabase
      .from('feriados')
      .select('*')
      .gte('data', `${year}-01-01`)
      .lte('data', `${year}-12-31`)
      .order('data', { ascending: true });

    if (holidaysError) {
      console.error('Erro ao buscar feriados:', holidaysError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar feriados' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados dos feriados para a IA
    const holidaysData = (holidays as Holiday[]).map(h => ({
      date: h.data,
      description: h.descricao,
      type: h.tipo
    }));

    const systemPrompt = `Você é um assistente especializado em planejamento de férias inteligente para funcionários públicos brasileiros. 

Sua tarefa é analisar os feriados oficiais de ${year} e gerar sugestões estratégicas de períodos de férias que maximizem o descanso aproveitando feriados próximos.

Critérios para as sugestões:
1. Priorize períodos que conectem feriados com finais de semana
2. Considere "pontes" que economizem dias de férias
3. Avalie diferentes durações (5, 10, 15, 20 dias)
4. Considere sazonalidade e épocas de viagem
5. Calcule o "score" baseado na eficiência (dias de descanso vs dias de férias usados)

Retorne um JSON válido com array de sugestões no formato:
{
  "suggestions": [
    {
      "id": "unique-id",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "totalDays": number,
      "workDays": number,
      "score": number (0-100),
      "reason": "Explicação da sugestão",
      "holidays": ["lista de feriados relacionados"],
      "benefits": ["lista de benefícios"],
      "period": "primeiro-semestre|segundo-semestre|virada-ano|carnaval|junho-julho|custom"
    }
  ]
}`;

    const userPrompt = `Analise os feriados de ${year} e gere 4-6 sugestões inteligentes de períodos de férias:

Feriados de ${year}:
${JSON.stringify(holidaysData, null, 2)}

Gere sugestões que aproveitem ao máximo esses feriados, considerando:
- Pontes estratégicas
- Conexão com finais de semana
- Diferentes durações de férias
- Épocas ideais para viagem
- Economia de dias úteis

Retorne apenas o JSON com as sugestões.`;

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
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
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

    let aiSuggestions;
    try {
      aiSuggestions = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError);
      throw new Error('Resposta da IA não é um JSON válido');
    }

    // Validar e processar sugestões
    const suggestions = aiSuggestions.suggestions || [];
    const validSuggestions = suggestions.filter((s: any) => 
      s.id && s.startDate && s.endDate && s.reason
    ).slice(0, 6); // Limitar a 6 sugestões

    console.log(`Generated ${validSuggestions.length} AI vacation suggestions for ${year}`);

    return new Response(JSON.stringify({ 
      suggestions: validSuggestions,
      year,
      generatedAt: new Date().toISOString(),
      source: 'openai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-vacation-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});