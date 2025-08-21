import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/types/form';
import { toast } from 'sonner';
import { limparCPF } from '@/utils/cpf-utils';

// Cache simples para chamados recentes
interface CacheEntry {
  data: Chamado[];
  timestamp: number;
  limit: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
let chamadosCache: CacheEntry | null = null;

export interface Chamado {
  id: string;
  titulo: string; // Mapeado do campo 'resumo'
  descricao: string; // Mapeado do campo 'notas'
  grau: string | null;
  numero_processo: string | null; // Mapeado do campo 'processos'
  orgao_julgador: string | null;
  perfil_usuario_afetado: string | null;
  nome_usuario_afetado: string | null;
  cpf_usuario_afetado: string | null;
  chamado_origem: string | null;
  created_at: string;
  status: string | null;
}

export const useChamados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    chamadosCache = null;
  }, []);

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((limit: number) => {
    if (!chamadosCache) return false;
    const now = Date.now();
    const isExpired = now - chamadosCache.timestamp > CACHE_DURATION;
    const hasEnoughData = chamadosCache.limit >= limit;
    return !isExpired && hasEnoughData;
  }, []);

  const salvarChamado = useCallback(async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

      const { data, error } = await supabase
        .from('chamados')
        .insert({
          titulo: resumoFinal,
          descricao: formData.notas,
          grau: formData.grau || null,
          numero_processo: formData.processos || null,
          orgao_julgador: formData.orgaoJulgador || null,
          perfil_usuario_afetado: formData.perfilUsuario || null,
          nome_usuario_afetado: formData.nomeUsuario || null,
          cpf_usuario_afetado: formData.cpfUsuario || null,
          chamado_origem: formData.chamadoOrigem || null,
          status: 'Aberto'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Limpar cache após salvar novo chamado
      clearCache();
      
      toast.success('Chamado salvo com sucesso!');
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido ao salvar chamado';
      console.error('Erro ao salvar chamado:', err);
      setError(errorMessage);
      toast.error('Erro ao salvar chamado. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  const buscarChamadosRecentes = useCallback(async (limite: number = 10): Promise<Chamado[]> => {
    try {
      setError(null);
      
      // Verificar cache primeiro
      if (isCacheValid(limite)) {
        console.log('📦 Usando dados do cache');
        return chamadosCache!.data.slice(0, limite);
      }

      setLoading(true);
      console.log(`🔄 Buscando ${limite} chamados recentes do Supabase...`);
      
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id,
          titulo,
          descricao,
          created_at,
          numero_processo,
          grau,
          orgao_julgador,
          perfil_usuario_afetado,
          nome_usuario_afetado,
          cpf_usuario_afetado,
          chamado_origem,
          status
        `)
        .order('created_at', { ascending: false })
        .limit(Math.max(limite, 20)); // Buscar pelo menos 20 para cache

      if (error) throw error;
      
      // Mapear os dados para o formato esperado
      const chamadosFormatados = (data || []).map(chamado => ({
        id: chamado.id,
        titulo: chamado.titulo || 'Sem título',
        descricao: chamado.descricao || 'Sem descrição',
        grau: chamado.grau,
        numero_processo: chamado.numero_processo,
        orgao_julgador: chamado.orgao_julgador,
        perfil_usuario_afetado: chamado.perfil_usuario_afetado,
        nome_usuario_afetado: chamado.nome_usuario_afetado,
        cpf_usuario_afetado: chamado.cpf_usuario_afetado,
        chamado_origem: chamado.chamado_origem,
        created_at: chamado.created_at,
        status: chamado.status || 'Aberto'
      }));
      
      // Atualizar cache
      chamadosCache = {
        data: chamadosFormatados,
        timestamp: Date.now(),
        limit: Math.max(limite, 20)
      };
      
      console.log(`✅ ${chamadosFormatados.length} chamados carregados e armazenados em cache`);
      return chamadosFormatados.slice(0, limite);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido ao buscar chamados';
      console.error('❌ Erro ao buscar chamados:', err);
      setError(errorMessage);
      toast.error('Erro ao carregar chamados. Verifique sua conexão.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  const excluirChamado = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('chamados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Limpar cache após exclusão
      clearCache();
      
      toast.success('Chamado excluído com sucesso');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido ao excluir chamado';
      console.error('Erro ao excluir chamado:', err);
      setError(errorMessage);
      toast.error('Erro ao excluir chamado. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  const buscarDadosUsuarioPorCPF = useCallback(async (cpf: string) => {
    try {
      setError(null);
      
      // Remove formatação do CPF para busca
      const cpfLimpo = limparCPF(cpf);
      
      if (!cpfLimpo || cpfLimpo.length !== 11) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('chamados')
        .select('nome_usuario_afetado, perfil_usuario_afetado, cpf_usuario_afetado')
        .eq('cpf_usuario_afetado', cpfLimpo)
        .not('nome_usuario_afetado', 'is', null)
        .not('perfil_usuario_afetado', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro na query buscarDadosUsuarioPorCPF:', error);
        return null;
      }
      
      // Se encontrou dados, retornar o primeiro resultado
      return data && data.length > 0 ? data[0] : null;
    } catch (err: any) {
      console.error('Erro ao buscar dados do usuário por CPF:', err);
      setError(err?.message || 'Erro ao buscar dados do usuário');
      return null;
    }
  }, []);

  // Memoizar o retorno para evitar re-renders desnecessários
  const memoizedReturn = useMemo(() => ({
    salvarChamado,
    buscarChamadosRecentes,
    excluirChamado,
    buscarDadosUsuarioPorCPF,
    clearCache,
    loading,
    error
  }), [salvarChamado, buscarChamadosRecentes, excluirChamado, buscarDadosUsuarioPorCPF, clearCache, loading, error]);

  return memoizedReturn;
};