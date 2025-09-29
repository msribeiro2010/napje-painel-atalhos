import { supabase } from '@/integrations/supabase/client';
import { devSupabase } from '@/lib/supabase-dev';

/**
 * Hook que retorna o cliente Supabase apropriado baseado no modo de desenvolvimento
 */
export const useSupabaseClient = () => {
  // Usar cliente de desenvolvimento se estiver em modo offline
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === 'true';
  
  return isOfflineMode ? devSupabase : supabase;
};