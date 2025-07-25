import { useState, useEffect } from 'react';
import { FormData } from '@/types/form';
import { useChamados } from './useChamados';

interface SimilarChamado {
  id: string;
  resumo: string;
  notas: string;
  orgaoJulgador: string;
  grau: string;
  similarity: number;
  createdAt: Date;
  resolucao?: string;
}

interface SimilarityAnalysisResult {
  similarChamados: SimilarChamado[];
  isAnalyzing: boolean;
  suggestions: string[];
}

export const useSimilarityAnalysis = (formData: FormData): SimilarityAnalysisResult => {
  const [similarChamados, setSimilarChamados] = useState<SimilarChamado[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allChamados, setAllChamados] = useState<any[]>([]);
  const { buscarChamadosRecentes } = useChamados();

  // Função para calcular similaridade entre textos usando algoritmo simples
  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0;
    
    const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = (commonWords.length * 2) / (words1.length + words2.length);
    
    return similarity;
  };

  // Função para extrair palavras-chave importantes
  const extractKeywords = (text: string): string[] => {
    const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'sobre', 'entre', 'durante', 'antes', 'depois', 'que', 'quando', 'onde', 'como', 'porque', 'se', 'mas', 'ou', 'e', 'é', 'são', 'foi', 'foram', 'ser', 'estar', 'ter', 'haver', 'fazer', 'dizer', 'ver', 'dar', 'saber', 'ir', 'vir', 'ficar', 'poder', 'querer', 'dever'];
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10); // Pegar apenas as 10 primeiras palavras relevantes
  };

  // Função para gerar sugestões baseadas em chamados similares
  const generateSuggestions = (similarChamados: SimilarChamado[]): string[] => {
    const suggestions: string[] = [];
    
    if (similarChamados.length > 0) {
      suggestions.push(`Encontrados ${similarChamados.length} chamados similares`);
      
      // Verificar se há chamados resolvidos
      const resolvedChamados = similarChamados.filter(c => c.resolucao);
      if (resolvedChamados.length > 0) {
        suggestions.push('Há chamados similares já resolvidos que podem ajudar');
      }
      
      // Verificar padrões de órgão julgador
      const orgaosFrequentes = similarChamados.reduce((acc, chamado) => {
        acc[chamado.orgaoJulgador] = (acc[chamado.orgaoJulgador] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const orgaoMaisFrequente = Object.entries(orgaosFrequentes)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (orgaoMaisFrequente && orgaoMaisFrequente[1] > 1) {
        suggestions.push(`Problema frequente no órgão: ${orgaoMaisFrequente[0]}`);
      }
      
      // Verificar se é um problema recorrente
      const chamadosRecentes = similarChamados.filter(c => {
        const daysDiff = (new Date().getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });
      
      if (chamadosRecentes.length >= 3) {
        suggestions.push('Problema recorrente - considere investigação mais profunda');
      }
    }
    
    return suggestions;
  };

  useEffect(() => {
    const analyzeSimilarity = async () => {
      if (!formData.resumo && !formData.notas) {
        setSimilarChamados([]);
        setSuggestions([]);
        return;
      }
      
      setIsAnalyzing(true);
      
      try {
        // Combinar resumo e notas para análise
        const searchText = `${formData.resumo} ${formData.notas}`.trim();
        
        if (!searchText || searchText.length < 10) {
          setSimilarChamados([]);
          setSuggestions([]);
          return;
        }
        
        // Analisar similaridade com chamados existentes
        const similarities = allChamados.map(chamado => {
          const chamadoText = `${chamado.titulo} ${chamado.descricao || ''}`;
          const similarity = calculateSimilarity(searchText, chamadoText);
          
          return {
            id: chamado.id,
            resumo: chamado.titulo,
            notas: chamado.descricao,
            orgaoJulgador: chamado.orgao_julgador || '',
            grau: chamado.grau || '',
            similarity,
            createdAt: new Date(chamado.created_at),
            resolucao: chamado.resolucao
          };
        })
        .filter(chamado => chamado.similarity > 0.3) // Filtrar apenas similaridades significativas
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Pegar apenas os 5 mais similares
        
        setSimilarChamados(similarities);
        setSuggestions(generateSuggestions(similarities));
        
      } catch (error) {
        console.error('Erro na análise de similaridade:', error);
        setSimilarChamados([]);
        setSuggestions([]);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    // Debounce para evitar muitas análises
    const timeoutId = setTimeout(analyzeSimilarity, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [formData.resumo, formData.notas, allChamados]);

  // Carregar chamados quando o componente montar
  useEffect(() => {
    const loadChamados = async () => {
      try {
        const chamados = await buscarChamadosRecentes(100); // Buscar mais chamados para análise
        setAllChamados(chamados);
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
      }
    };
    
    loadChamados();
  }, [buscarChamadosRecentes]);

  return {
    similarChamados,
    isAnalyzing,
    suggestions
  };
};