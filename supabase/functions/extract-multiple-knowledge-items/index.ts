import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo fornecido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verificar se é PDF
    if (file.type !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: 'Apenas arquivos PDF são aceitos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processando PDF: ${file.name}, tamanho: ${file.size} bytes`)

    // Ler o arquivo PDF
    const arrayBuffer = await file.arrayBuffer()
    const pdfText = await extractTextFromPDF(arrayBuffer)

    if (!pdfText || pdfText.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Não foi possível extrair texto suficiente do PDF. Verifique se o arquivo contém texto legível.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Texto extraído: ${pdfText.length} caracteres`)

    // Processar com IA para extrair múltiplos problemas/soluções
    const knowledgeItems = await extractKnowledgeItems(pdfText)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: knowledgeItems,
        totalItems: knowledgeItems.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao processar PDF:', error)
    return new Response(
      JSON.stringify({ error: `Erro interno do servidor: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Extração básica de texto do PDF
    // Para uma implementação mais robusta, você pode usar bibliotecas específicas
    const uint8Array = new Uint8Array(arrayBuffer)
    let text = ''
    
    // Tentar extrair texto básico do PDF
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = uint8Array[i]
      // Filtrar caracteres legíveis (ASCII básico)
      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char)
      } else if (char === 10 || char === 13) {
        text += '\n'
      }
    }
    
    // Limpar e melhorar o texto extraído
    text = text
      .replace(/\s+/g, ' ') // Múltiplos espaços em um só
      .replace(/(.)\1{5,}/g, '$1') // Remover repetições excessivas
      .trim()
    
    console.log(`Texto bruto extraído: ${text.substring(0, 200)}...`)
    
    return text
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error('Falha na extração de texto do PDF')
  }
}

async function extractKnowledgeItems(text: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('Chave da OpenAI não configurada')
  }

  console.log(`Processando texto de ${text.length} caracteres`)

  // Se o texto for muito grande, processamos em chunks
  const maxChunkSize = 30000 // Aumentado para processar mais texto (até 30 mil caracteres por chunk)
  const chunks = []
  
  if (text.length > maxChunkSize) {
    console.log('Texto grande detectado, dividindo em chunks...')
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize))
    }
  } else {
    chunks.push(text)
  }

  const allItems = []

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processando chunk ${i + 1} de ${chunks.length}`)
    
    const prompt = `
Analise o seguinte texto extraído de um PDF com anotações sobre problemas de sistema e suas soluções.
Extraia e estruture TODOS os problemas/soluções encontrados em formato JSON.

IMPORTANTE:
- Identifique CADA problema/erro mencionado no texto, mesmo os pequenos
- Para cada problema, extraia a solução correspondente (se disponível)
- Se não houver solução explícita, sugira uma solução baseada no problema
- Crie títulos descritivos e concisos
- Categorize adequadamente cada item
- NÃO pule nenhum problema encontrado no texto
- Retorne até 50 itens por chunk, se possível

Cada item deve ter:
- titulo: Um título descritivo e conciso (máximo 100 caracteres)
- problema_descricao: Descrição detalhada do problema encontrado
- solucao: Solução detalhada passo a passo (se não explícita no texto, sugira uma solução adequada)
- categoria: Categoria do problema (ex: "PJe - Sistema", "PJe - Certificado Digital", "Hardware", "Software", "Rede", "Email", "Outros")
- tags: Array com 2-5 tags relevantes

Formato de resposta (JSON válido):
[
  {
    "titulo": "string",
    "problema_descricao": "string", 
    "solucao": "string",
    "categoria": "string",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

${chunks.length > 1 ? `Esta é a parte ${i + 1} de ${chunks.length} do documento.` : ''}

Texto a analisar:
${chunks[i]}
`

    try {
      const chunkItems = await processChunkWithAI(prompt, openaiApiKey)
      allItems.push(...chunkItems)
      console.log(`Chunk ${i + 1}: ${chunkItems.length} itens extraídos`)
    } catch (error) {
      console.error(`Erro ao processar chunk ${i + 1}:`, error)
    }
  }

  console.log(`Total de itens extraídos de todos os chunks: ${allItems.length}`)
  
  // Remover duplicatas baseado no título
  const uniqueItems = []
  const seenTitles = new Set()
  
  for (const item of allItems) {
    if (!seenTitles.has(item.titulo)) {
      seenTitles.add(item.titulo)
      uniqueItems.push(item)
    }
  }
  
  console.log(`${uniqueItems.length} itens únicos após remoção de duplicatas`)
  return uniqueItems
}

async function processChunkWithAI(prompt: string, openaiApiKey: string) {
  try {
    console.log('Enviando chunk para OpenAI...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em documentação técnica e extração de conhecimento de TI. Analise cuidadosamente o texto e extraia TODOS os problemas/soluções encontrados, sem exceção. Responda sempre com JSON válido contendo arrays de problemas/soluções extraídos do texto.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Reduzido para mais consistência
        max_tokens: 12000 // Aumentado para permitir mais itens por chunk
      })
    })

    const data = await response.json()
    console.log('Resposta da OpenAI recebida para chunk')
    
    if (!response.ok) {
      console.error('Erro da OpenAI:', data)
      throw new Error(`OpenAI API Error: ${data.error?.message || 'Erro desconhecido'}`)
    }

    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    console.log('Processando resposta da IA...')
    
    // Tentar extrair JSON da resposta
    let jsonContent = content.trim()
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.split('```json')[1].split('```')[0].trim()
    } else if (jsonContent.includes('```')) {
      jsonContent = jsonContent.split('```')[1].split('```')[0].trim()
    }

    // Parse do JSON retornado pela IA
    const knowledgeItems = JSON.parse(jsonContent)
    
    // Validar estrutura
    if (!Array.isArray(knowledgeItems)) {
      throw new Error('Resposta da IA não é um array válido')
    }

    const validItems = knowledgeItems.filter(item => 
      item.titulo && item.problema_descricao && item.solucao
    )

    console.log(`${validItems.length} itens válidos extraídos do chunk`)
    
    return validItems

  } catch (error) {
    console.error('Erro ao processar chunk com IA:', error)
    
    // Retornar array vazio em caso de erro no chunk
    return []
  }
}

function extractBasicProblems(text: string) {
  const items = []
  const lines = text.split('\n').filter(line => line.trim().length > 10)
  
  // Tentar identificar padrões básicos de problema/solução
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes('problema') || line.includes('erro') || line.includes('falha')) {
      const problema = lines[i].trim()
      const solucao = lines[i + 1]?.trim() || "Solução não especificada no documento"
      
      if (problema.length > 10) {
        items.push({
          titulo: problema.substring(0, 80),
          problema_descricao: problema,
          solucao: solucao,
          categoria: "Outros",
          tags: ["extraído", "manual"]
        })
      }
    }
  }
  
  return items.slice(0, 50) // Limitar a 50 itens no fallback
}