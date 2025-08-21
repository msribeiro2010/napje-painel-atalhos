import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PendingApprovalMessage from './PendingApprovalMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Hook para buscar profile do usuário
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se o usuário não tem profile (erro na busca), redireciona para login
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Se o usuário está pendente de aprovação
  if (profile.status === 'pendente') {
    return <PendingApprovalMessage />;
  }

  // Se o usuário foi rejeitado, redireciona para login
  if (profile.status === 'rejeitado') {
    return <Navigate to="/auth" replace />;
  }

  // Se requer admin mas o usuário não é admin
  if (requireAdmin && !profile.is_admin) {
    return <Navigate to="/" replace />;
  }

  // Se chegou aqui, o usuário está aprovado e pode acessar
  return <>{children}</>;
};