import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Função para limpar formatação markdown e deixar texto puro
const cleanMarkdownFormatting = (text: string): string => {
  return text
    // Remove headers markdown (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove formatação em negrito e itálico (* ** _)
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    // Remove listas markdown (- * +)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Remove links markdown [texto](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove código inline `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove blocos de código ```
    .replace(/```[\s\S]*?```/g, '')
    // Remove linhas horizontais ---
    .replace(/^---+$/gm, '')
    // Limpa espaços extras
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const useTextEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceText = async (text: string, type: 'resumo' | 'descricao' | 'sugestao_solucao' | 'geral' = 'geral'): Promise<string | null> => {
    if (!text.trim()) {
      toast.error('Digite algum texto para melhorar');
      return null;
    }

    // Verificar se as funcionalidades de IA estão habilitadas
    const aiEnabled = import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';
    if (!aiEnabled) {
      toast.info('⚠️ Funcionalidades de IA estão desabilitadas no modo desenvolvimento');
      return text; // Retorna o texto original sem modificações
    }

    try {
      setIsEnhancing(true);
      
      const { data, error } = await supabase.functions.invoke('enhance-text-with-ai', {
        body: { text: text.trim(), type }
      });

      if (error) {
        console.error('Error calling enhance-text-with-ai function:', error);
        
        // Verificar se é erro de autenticação
        if (error.message?.includes('Invalid API key') || error.message?.includes('Missing Supabase')) {
          toast.error('❌ Erro de configuração do Supabase. Verifique as variáveis de ambiente.');
        } else if (error.message?.includes('fetch')) {
          toast.error('❌ Erro de conexão. Verifique sua internet e tente novamente.');
        } else {
          toast.error('❌ Erro ao conectar com o serviço de IA');
        }
        return null;
      }

      if (data?.error) {
        console.error('Error from enhance-text-with-ai function:', data.error);
        
        // Verificar se é erro da OpenAI
        if (data.error.includes('OPENAI_API_KEY')) {
          toast.error('🔑 Chave da OpenAI não configurada no Supabase. Configure nas Edge Functions.');
        } else if (data.error.includes('OpenAI API')) {
          toast.error('🤖 Erro da API da OpenAI. Verifique os créditos da conta.');
        } else {
          toast.error(`❌ ${data.error}`);
        }
        return null;
      }

      if (!data.enhancedText) {
        toast.error('Não foi possível melhorar o texto');
        return null;
      }

      // Remove caracteres de formatação markdown (# e *) para texto puro
      const cleanText = cleanMarkdownFormatting(data.enhancedText);

      toast.success('Texto melhorado com sucesso!');
      return cleanText;
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('Erro inesperado ao melhorar o texto');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return { enhanceText, isEnhancing };
};