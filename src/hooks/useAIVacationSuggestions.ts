import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VacationSuggestion } from './useVacationSuggestions';
import { toast } from 'sonner';

interface AIVacationResponse {
  suggestions: VacationSuggestion[];
  year: number;
  generatedAt: string;
  source: 'openai';
}

export const useAIVacationSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAISuggestions = async (year: number): Promise<VacationSuggestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Gerando sugestões de férias com IA para ${year}...`);
      
      // Timeout de 30 segundos para Edge Function (IA pode demorar mais)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: IA demorou mais de 30 segundos para responder')), 30000)
      );

      const functionPromise = supabase.functions.invoke(
        'generate-vacation-suggestions',
        {
          body: { year }
        }
      );

      const { data, error: functionError } = await Promise.race([functionPromise, timeoutPromise]) as any;

      if (functionError) {
        console.error('Erro na Edge Function:', functionError);
        throw new Error(functionError.message || 'Erro ao gerar sugestões com IA');
      }

      if (data.error) {
        console.error('Erro retornado pela IA:', data.error);
        throw new Error(data.error);
      }

      const aiResponse = data as AIVacationResponse;
      
      if (!aiResponse.suggestions || aiResponse.suggestions.length === 0) {
        throw new Error('Nenhuma sugestão foi gerada pela IA');
      }

      console.log(`IA gerou ${aiResponse.suggestions.length} sugestões para ${year}`);
      
      toast.success(`✨ IA gerou ${aiResponse.suggestions.length} sugestões inteligentes de férias!`, {
        description: 'Sugestões baseadas nos feriados oficiais e estratégias de otimização'
      });

      return aiResponse.suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao gerar sugestões com IA:', errorMessage);
      setError(errorMessage);
      
      // Toast de erro mais amigável
      if (errorMessage.includes('OPENAI_API_KEY')) {
        toast.error('🔑 OpenAI não configurada', {
          description: 'Configure a chave da OpenAI nas Edge Functions do Supabase'
        });
      } else if (errorMessage.includes('Rate limit')) {
        toast.error('⏱️ Limite de uso atingido', {
          description: 'Aguarde alguns minutos antes de tentar novamente'
        });
      } else if (errorMessage.includes('Timeout') || errorMessage.includes('Failed to fetch')) {
        toast.error('⏱️ Timeout na IA', {
          description: 'A IA demorou muito para responder. Tente novamente.'
        });
      } else {
        toast.error('❌ Erro ao gerar sugestões com IA', {
          description: errorMessage
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAISuggestions,
    isLoading,
    error
  };
};