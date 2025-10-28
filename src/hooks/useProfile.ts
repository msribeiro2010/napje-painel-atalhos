import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export const useProfile = () => {
  const { user } = useAuth();
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useProfile: No user ID available');
        return null;
      }
      
      console.log('useProfile: Fetching profile for user:', user.id);
      
      try {
        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const queryPromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) {
          console.error('useProfile: Supabase error:', error);
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        
        console.log('useProfile: Profile fetched successfully:', data);
        return data;
      } catch (err) {
        console.error('useProfile: Unexpected error:', err);
        
        // Tratamento específico para erros de conectividade e timeout
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
            throw new Error('Problema de conectividade. Verifique sua conexão.');
          } else if (err.message.includes('Timeout')) {
            throw new Error('Operação demorou muito. Tente novamente.');
          }
        }
        
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};