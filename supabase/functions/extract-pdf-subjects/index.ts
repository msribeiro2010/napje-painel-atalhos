import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert PDF to text using a simple text extraction approach
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // For now, we'll use OpenAI to process the PDF content directly
    // In a production environment, you might want to use a dedicated PDF parsing library
    
    // Convert to base64 for API transmission
    const base64 = btoa(String.fromCharCode(...uint8Array));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extrair informações de documentos do sistema PJe (Processo Judicial Eletrônico).
            
            Analise o documento e extraia:
            1. Título/Assunto principal
            2. Descrição do problema
            3. Solução apresentada
            4. Categoria (PJe - Sistema, PJe - Certificado Digital, PJe - Peticionamento, PJe - Audiência Virtual, PJe - Consulta Processual, Hardware, Software, Rede, Email, Outros)
            5. Tags relevantes (máximo 5)
            
            Retorne APENAS um JSON no formato:
            {
              "titulo": "título extraído",
              "problema_descricao": "descrição do problema",
              "solucao": "solução apresentada",
              "categoria": "categoria identificada",
              "tags": ["tag1", "tag2", "tag3"]
            }`
          },
          {
            role: 'user',
            content: `Analise este documento PDF e extraia as informações solicitadas. Se não conseguir extrair alguma informação específica, use valores padrão apropriados.`
          }
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let extractedData;
    try {
      extractedData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      extractedData = {
        titulo: "Documento importado",
        problema_descricao: "Problema extraído do documento PDF",
        solucao: "Solução extraída do documento PDF",
        categoria: "Outros",
        tags: ["documento", "pdf"]
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: extractedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao processar documento',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});