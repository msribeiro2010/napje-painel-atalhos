import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SugestaoItem {
  valor: string;
  frequencia: number;
  ultimo_uso: string;
}

export const useSugestoes = () => {
  const [loading, setLoading] = useState(false);

  // Buscar sugestões para órgãos julgadores mais utilizados
  const buscarSugestoesOrgaoJulgador = async (grau: string): Promise<SugestaoItem[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chamados')
        .select('orgao_julgador, created_at')
        .not('orgao_julgador', 'is', null)
        .eq('grau', grau)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Agrupar por órgão julgador e contar frequência
      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const orgao = item.orgao_julgador!;
        const atual = contadores.get(orgao) || { count: 0, ultimoUso: item.created_at };
        contadores.set(orgao, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      // Converter para array e ordenar por frequência
      return Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10); // Top 10
    } catch (err) {
      console.error('Erro ao buscar sugestões de órgão julgador:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar sugestões para perfis de usuário mais utilizados
  const buscarSugestoesPerfil = async (): Promise<SugestaoItem[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chamados')
        .select('perfil_usuario_afetado, created_at')
        .not('perfil_usuario_afetado', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const perfil = item.perfil_usuario_afetado!;
        const atual = contadores.get(perfil) || { count: 0, ultimoUso: item.created_at };
        contadores.set(perfil, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      return Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
    } catch (err) {
      console.error('Erro ao buscar sugestões de perfil:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar sugestões para chamados origem mais utilizados
  const buscarSugestoesChamadoOrigem = async (): Promise<SugestaoItem[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chamados')
        .select('chamado_origem, created_at')
        .not('chamado_origem', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const origem = item.chamado_origem!;
        const atual = contadores.get(origem) || { count: 0, ultimoUso: item.created_at };
        contadores.set(origem, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      return Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
    } catch (err) {
      console.error('Erro ao buscar sugestões de chamado origem:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar sugestões para títulos/resumos mais utilizados
  const buscarSugestoesResumo = async (): Promise<SugestaoItem[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chamados')
        .select('titulo, created_at')
        .not('titulo', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const contadores = new Map<string, { count: number; ultimoUso: string }>();
      
      data?.forEach(item => {
        const titulo = item.titulo!;
        const atual = contadores.get(titulo) || { count: 0, ultimoUso: item.created_at };
        contadores.set(titulo, {
          count: atual.count + 1,
          ultimoUso: item.created_at > atual.ultimoUso ? item.created_at : atual.ultimoUso
        });
      });

      return Array.from(contadores.entries())
        .map(([valor, { count, ultimoUso }]) => ({
          valor,
          frequencia: count,
          ultimo_uso: ultimoUso
        }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 10);
    } catch (err) {
      console.error('Erro ao buscar sugestões de resumo:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    buscarSugestoesOrgaoJulgador,
    buscarSugestoesPerfil,
    buscarSugestoesChamadoOrigem,
    buscarSugestoesResumo,
    loading
  };
};