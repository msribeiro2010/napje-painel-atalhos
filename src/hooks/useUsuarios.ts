import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Usuario {
  id: string;
  cpf: string;
  nome_completo: string;
  perfil: string | null;
}

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);

  const salvarUsuario = async (cpf: string, nomeCompleto: string, perfil: string) => {
    if (!cpf || !nomeCompleto) return null;

    try {
      setLoading(true);

      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cpf)
        .maybeSingle();

      if (existingUser) {
        // Atualizar usuário existente
        const { data, error } = await supabase
          .from('usuarios')
          .update({
            nome_completo: nomeCompleto,
            perfil: perfil || null,
            updated_at: new Date().toISOString()
          })
          .eq('cpf', cpf)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo usuário
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            cpf,
            nome_completo: nomeCompleto,
            perfil: perfil || null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      toast.error('Erro ao salvar dados do usuário');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = async (termo: string): Promise<Usuario[]> => {
    if (!termo || termo.length < 3) return [];

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, cpf, nome_completo, perfil')
        .or(`cpf.ilike.%${termo}%,nome_completo.ilike.%${termo}%`)
        .order('nome_completo')
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      return [];
    }
  };

  const buscarUsuarioPorCPF = async (cpf: string): Promise<Usuario | null> => {
    if (!cpf) return null;

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, cpf, nome_completo, perfil')
        .eq('cpf', cpf)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar usuário por CPF:', err);
      return null;
    }
  };

  return { salvarUsuario, buscarUsuarios, buscarUsuarioPorCPF, loading };
};