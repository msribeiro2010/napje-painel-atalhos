import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DebugCustomEvents() {
  const { user } = useAuth();
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>('');

  const checkTableStructure = async () => {
    try {
      // Verificar se a tabela existe e sua estrutura
      const { data, error } = await supabase
        .from('user_custom_events')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Erro ao verificar tabela:', error);
        setTableExists(false);
        setTestResult(`Erro: ${error.message}`);
        return;
      }
      
      setTableExists(true);
      
      // Verificar campos da tabela
      const { data: structureData, error: structureError } = await supabase
        .rpc('get_table_columns', { table_name: 'user_custom_events' })
        .select();
        
      if (!structureError && structureData) {
        setTableStructure(structureData);
      }
      
      setTestResult('Tabela existe e está acessível');
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setTableExists(false);
      setTestResult(`Erro inesperado: ${error}`);
    }
  };

  const testCreateEvent = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const testEvent = {
        user_id: user.id,
        date: '2025-08-04',
        type: 'curso',
        title: 'Teste de Debug',
        description: 'Evento criado para debug'
      };

      console.log('🔄 Testando criação de evento:', testEvent);

      const { data, error } = await supabase
        .from('user_custom_events')
        .insert([testEvent])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar evento de teste:', error);
        setTestResult(`Erro ao criar: ${error.message}`);
        toast.error('Erro ao criar evento de teste');
        return;
      }

      console.log('✅ Evento de teste criado:', data);
      setTestResult(`Evento criado com sucesso! ID: ${data.id}`);
      toast.success('Evento de teste criado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro inesperado ao criar evento:', error);
      setTestResult(`Erro inesperado: ${error}`);
    }
  };

  useEffect(() => {
    if (user) {
      checkTableStructure();
    }
  }, [user]);

  if (!user) {
    return <div>Usuário não autenticado</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Debug - Eventos Personalizados</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Usuário:</strong> {user.email}</p>
        <p><strong>ID do Usuário:</strong> {user.id}</p>
        <p><strong>Tabela existe:</strong> {tableExists === null ? 'Verificando...' : tableExists ? 'Sim' : 'Não'}</p>
        <p><strong>Resultado do teste:</strong> {testResult || 'Nenhum teste executado'}</p>
      </div>

      <div className="space-x-2">
        <Button onClick={checkTableStructure} variant="outline">
          Verificar Tabela
        </Button>
        <Button onClick={testCreateEvent} variant="default">
          Testar Criação de Evento
        </Button>
      </div>

      {tableStructure.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Estrutura da Tabela:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(tableStructure, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
