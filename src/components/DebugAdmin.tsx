import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const DebugAdmin = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      console.log('🔍 DebugAdmin Profile:', data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: true, 
          status: 'aprovado' 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      console.log('✅ Usuário promovido a admin!');
      loadProfile(); // Recarregar
    } catch (error) {
      console.error('Error making admin:', error);
    }
  };

  if (loading) return <div>Carregando debug...</div>;

  const isAdmin = profile?.is_admin === true;
  const isApproved = profile?.status === 'aprovado';
  const hasFullAccess = isAdmin && isApproved;

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Debug - Permissões de Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Usuário ID:</span>
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">{user?.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span>Email:</span>
            <span>{profile?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Nome:</span>
            <span>{profile?.nome_completo || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>É Admin:</span>
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>{isAdmin ? 'Sim' : 'Não'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <div className="flex items-center gap-1">
              {isApproved ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>{profile?.status || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Acesso Completo:</span>
            <div className="flex items-center gap-1">
              {hasFullAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>{hasFullAccess ? 'Sim' : 'Não'}</span>
            </div>
          </div>
          
          {!hasFullAccess && (
            <div className="pt-3 border-t">
              <Button 
                onClick={makeAdmin}
                className="w-full"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                Tornar Admin e Aprovar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};