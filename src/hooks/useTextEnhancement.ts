import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTextEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceText = async (text: string, type: 'resumo' | 'descricao' | 'geral' = 'geral'): Promise<string | null> => {
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

      toast.success('Texto melhorado com sucesso!');
      return data.enhancedText;
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