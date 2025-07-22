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

    try {
      setIsEnhancing(true);
      
      const { data, error } = await supabase.functions.invoke('enhance-text-with-ai', {
        body: { text: text.trim(), type }
      });

      if (error) {
        console.error('Error calling enhance-text-with-ai function:', error);
        toast.error('Erro ao conectar com o serviço de IA');
        return null;
      }

      if (data.error) {
        console.error('Error from enhance-text-with-ai function:', data.error);
        toast.error(data.error);
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