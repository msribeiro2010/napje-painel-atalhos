import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/types/form';
import { toast } from 'sonner';
import { limparCPF } from '@/utils/cpf-utils';

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

  const salvarChamado = async (formData: FormData) => {
    try {
      setLoading(true);

      const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

      const { data, error } = await supabase
        .from('chamados')
        .insert({
          resumo: resumoFinal,
          notas: formData.notas,
          grau: formData.grau || null,
          processos: formData.processos || null,
          orgao_julgador: formData.orgaoJulgador || null,
          perfil_usuario_afetado: formData.perfilUsuario || null,
          nome_usuario_afetado: formData.nomeUsuario || null,
          cpf_usuario_afetado: formData.cpfUsuario || null,
          chamado_origem: formData.chamadoOrigem || null
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Chamado salvo na base de dados');
      return data;
    } catch (err) {
      console.error('Erro ao salvar chamado:', err);
      toast.error('Erro ao salvar chamado na base de dados');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarChamadosRecentes = async (limite: number = 10): Promise<Chamado[]> => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id,
          resumo,
          notas,
          grau,
          processos,
          orgao_julgador,
          perfil_usuario_afetado,
          nome_usuario_afetado,
          cpf_usuario_afetado,
          chamado_origem,
          descricao_gerada,
          created_at,
          created_by
        `)
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) throw error;
      
      // Mapear os dados para o formato esperado
      const chamadosFormatados = (data || []).map(chamado => ({
        id: chamado.id,
        titulo: chamado.resumo,
        descricao: chamado.notas || chamado.descricao_gerada || '',
        grau: chamado.grau,
        numero_processo: chamado.processos,
        orgao_julgador: chamado.orgao_julgador,
        perfil_usuario_afetado: chamado.perfil_usuario_afetado,
        nome_usuario_afetado: chamado.nome_usuario_afetado,
        cpf_usuario_afetado: chamado.cpf_usuario_afetado,
        chamado_origem: chamado.chamado_origem,
        created_at: chamado.created_at,
        status: 'Aberto' // Status padrão
      }));
      
      return chamadosFormatados;
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
      return [];
    }
  };

  const excluirChamado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chamados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Chamado excluído com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao excluir chamado:', err);
      toast.error('Erro ao excluir chamado');
      return false;
    }
  };

  const buscarDadosUsuarioPorCPF = async (cpf: string) => {
    try {
      // Remove formatação do CPF para busca
      const cpfLimpo = limparCPF(cpf);
      
      const { data, error } = await supabase
        .from('chamados')
        .select('nome_usuario_afetado, perfil_usuario_afetado, cpf_usuario_afetado')
        .eq('cpf_usuario_afetado', cpfLimpo)
        .not('nome_usuario_afetado', 'is', null)
        .not('perfil_usuario_afetado', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar dados do usuário por CPF:', err);
      return null;
    }
  };

  return { salvarChamado, buscarChamadosRecentes, excluirChamado, buscarDadosUsuarioPorCPF, loading };
};