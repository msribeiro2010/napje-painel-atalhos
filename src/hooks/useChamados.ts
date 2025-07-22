import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/types/form';
import { toast } from 'sonner';

export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  grau: string | null;
  numero_processo: string | null;
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
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
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

  return { salvarChamado, buscarChamadosRecentes, excluirChamado, loading };
};