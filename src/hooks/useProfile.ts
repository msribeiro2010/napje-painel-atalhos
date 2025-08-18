import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useProfile: No user ID available');
        return null;
      }
      
      console.log('useProfile: Fetching profile for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error('useProfile: Supabase error:', error);
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        
        console.log('useProfile: Profile fetched successfully:', data);
        return data;
      } catch (err) {
        console.error('useProfile: Unexpected error:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};