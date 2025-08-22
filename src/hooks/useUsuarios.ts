import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { limparCPF } from '@/utils/cpf-utils';

export interface Usuario {
  id: string;
  cpf: string;
  nome_completo: string;
  perfil: string | null;
  created_at: string;
  updated_at: string;
}

// Cache agressivo para usuários
interface UsuarioCache {
  [key: string]: {
    data: Usuario[];
    timestamp: number;
  };
}

let usuariosCache: UsuarioCache = {};
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas
const LOCAL_STORAGE_KEY = 'napje_usuarios_cache';
const LOCAL_STORAGE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Funções para localStorage
const saveToLocalStorage = (key: string, data: Usuario[]) => {
  try {
    const allCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    allCache[key] = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCache));
  } catch (error) {
    console.warn('Erro ao salvar usuários no localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string): Usuario[] | null => {
  try {
    const allCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const cached = allCache[key];
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > LOCAL_STORAGE_DURATION;
    
    if (isExpired) {
      delete allCache[key];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCache));
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.warn('Erro ao carregar usuários do localStorage:', error);
    return null;
  }
};

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);

  const salvarUsuario = async (cpf: string, nomeCompleto: string, perfil: string) => {
    if (!cpf || !nomeCompleto) return null;

    try {
      setLoading(true);

      // Limpar CPF para salvar/buscar
      const cpfLimpo = cpf.replace(/\D/g, '');

      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cpfLimpo)
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
          .eq('cpf', cpfLimpo)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo usuário
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            cpf: cpfLimpo,
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
    if (!termo || termo.length < 3) {
      return [];
    }

    const cacheKey = termo.toLowerCase().trim();
    
    // Verificar cache em memória
    const cached = usuariosCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Usando usuários do cache em memória');
      return cached.data;
    }

    // Verificar localStorage
    const localData = loadFromLocalStorage(cacheKey);
    if (localData) {
      console.log('📦 Usando usuários do localStorage');
      usuariosCache[cacheKey] = {
        data: localData,
        timestamp: Date.now()
      };
      return localData;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, cpf, nome_completo, perfil, created_at, updated_at')
        .or(`cpf.ilike.%${termo}%,nome_completo.ilike.%${termo}%`)
        .order('nome_completo')
        .limit(8); // Reduzido de 10 para 8

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        // Retornar dados do localStorage se disponível
        if (localData) {
          return localData;
        }
        throw error;
      }

      const usuarios = data || [];
      
      // Atualizar cache em memória
      usuariosCache[cacheKey] = {
        data: usuarios,
        timestamp: Date.now()
      };

      // Salvar no localStorage
      saveToLocalStorage(cacheKey, usuarios);

      console.log(`✅ ${usuarios.length} usuários encontrados e armazenados em cache`);
      return usuarios;
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      
      // Tentar retornar dados do localStorage como último recurso
      if (localData) {
        console.log('📦 Usando usuários do localStorage como fallback após erro');
        return localData;
      }
      
      toast.error('Erro ao buscar usuários. Verifique sua conexão.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarioPorCPF = async (cpf: string): Promise<Usuario | null> => {
    if (!cpf) return null;

    try {
      // Limpar CPF para busca (remover pontos e traços)
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, cpf, nome_completo, perfil, created_at, updated_at')
        .eq('cpf', cpfLimpo)
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