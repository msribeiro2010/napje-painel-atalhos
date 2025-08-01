import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface CalendarDebugProps {
  month: Date;
}

export function CalendarDebug({ month }: CalendarDebugProps) {
  const { user } = useAuth();
  const { customEvents, loading } = useCustomEvents(month);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDebugCheck = async () => {
    if (!user) {
      setDebugInfo('❌ Usuário não autenticado');
      return;
    }

    let debug = `🔍 DEBUG - Eventos Personalizados\n`;
    debug += `👤 User ID: ${user.id}\n`;
    debug += `📅 Mês: ${format(month, 'yyyy-MM')}\n`;
    debug += `⏳ Carregando: ${loading}\n`;
    debug += `📊 Eventos carregados: ${customEvents.length}\n\n`;

    try {
      // Verificar se a tabela existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_custom_events')
        .select('count')
        .limit(1);

      if (tableError) {
        debug += `❌ Erro ao verificar tabela: ${tableError.message}\n`;
        debug += `   Código: ${tableError.code}\n`;
        debug += `   Detalhes: ${tableError.details}\n`;
      } else {
        debug += `✅ Tabela acessível\n`;
      }

      // Verificar todos os eventos do usuário
      const { data: allEvents, error: allError } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id);

      if (allError) {
        debug += `❌ Erro ao buscar todos os eventos: ${allError.message}\n`;
      } else {
        debug += `📋 Total de eventos do usuário: ${allEvents?.length || 0}\n`;
        
        if (allEvents && allEvents.length > 0) {
          debug += `📋 Eventos encontrados:\n`;
          allEvents.forEach((event, index) => {
            debug += `   ${index + 1}. ${event.date} - ${event.title} (${event.type})\n`;
          });
        }
      }

      // Verificar especificamente o dia 04/08/2025
      const { data: augustEvents, error: augustError } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', '2025-08-04');

      if (augustError) {
        debug += `❌ Erro ao buscar eventos de 04/08/2025: ${augustError.message}\n`;
      } else {
        debug += `🎯 Eventos para 04/08/2025: ${augustEvents?.length || 0}\n`;
        if (augustEvents && augustEvents.length > 0) {
          augustEvents.forEach((event, index) => {
            debug += `   ${index + 1}. ${event.title} - ${event.type}\n`;
          });
        }
      }

      // Verificar range do mês atual
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const { data: monthEvents, error: monthError } = await supabase
        .from('user_custom_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().slice(0, 10))
        .lte('date', monthEnd.toISOString().slice(0, 10));

      if (monthError) {
        debug += `❌ Erro ao buscar eventos do mês: ${monthError.message}\n`;
      } else {
        debug += `📅 Eventos no mês atual (${format(monthStart, 'yyyy-MM')}): ${monthEvents?.length || 0}\n`;
      }

    } catch (error) {
      debug += `❌ Erro inesperado: ${error}\n`;
    }

    setDebugInfo(debug);
  };

  useEffect(() => {
    if (user) {
      runDebugCheck();
    }
  }, [user, month, customEvents]);

  const testCreateAugustEvent = async () => {
    if (!user) return;

    try {
      const testEvent = {
        user_id: user.id,
        date: '2025-08-04',
        type: 'curso',
        title: 'Evento de Teste - 04/08/2025',
        description: 'Evento criado via debug para testar o calendário'
      };

      const { data, error } = await supabase
        .from('user_custom_events')
        .insert([testEvent])
        .select()
        .single();

      if (error) {
        setDebugInfo(prev => prev + `\n❌ Erro ao criar evento teste: ${error.message}`);
      } else {
        setDebugInfo(prev => prev + `\n✅ Evento teste criado: ${data.id}`);
        // Aguardar um pouco e verificar novamente
        setTimeout(runDebugCheck, 1000);
      }
    } catch (error) {
      setDebugInfo(prev => prev + `\n❌ Erro inesperado ao criar evento: ${error}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border rounded-lg shadow-lg p-4 z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Debug - Eventos</h3>
        <div className="space-x-1">
          <Button onClick={runDebugCheck} size="sm" variant="outline">
            Atualizar
          </Button>
          <Button onClick={testCreateAugustEvent} size="sm" variant="default">
            Criar Teste 04/08
          </Button>
        </div>
      </div>
      
      <pre className="text-xs bg-gray-100 p-2 rounded border whitespace-pre-wrap">
        {debugInfo || 'Clique em "Atualizar" para gerar debug...'}
      </pre>
    </div>
  );
}