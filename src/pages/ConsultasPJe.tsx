import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PJeSearchPanel } from '@/components/pje/PJeSearchPanel';
import { PJeAnalyticsDashboard } from '@/components/pje/PJeAnalyticsDashboard';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, Settings, Search, BarChart3, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ConsultasPJe = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Verificar se é admin
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });
  
  const isAdmin = profile?.is_admin === true;
  
  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ModernPageHeader
          title="Consultas PJe"
          subtitle="Pesquise informações nas bases de dados do PJe 1º e 2º grau"
          icon={<Database className="h-6 w-6 text-white" />}
          iconBgColor="from-indigo-500 to-purple-600"
          actions={
            isAdmin && (
              <Button
                onClick={() => navigate('/configuracao-pje')}
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar Banco
              </Button>
            )
          }
        />

        <div className="mt-6 space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Para utilizar este recurso, certifique-se de que o servidor proxy está rodando.
              Execute <code className="px-1 py-0.5 bg-muted rounded">npm run pje:server</code> em um terminal separado.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="pesquisa" className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="pesquisa" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Pesquisa Básica
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics Avançado
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pesquisa" className="mt-4">
              <PJeSearchPanel />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <PJeAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
};

export default ConsultasPJe;