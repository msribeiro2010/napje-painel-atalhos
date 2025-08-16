import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Dados dos feriados de 2025
const FERIADOS_2025 = [
  { data: '2025-01-01', descricao: 'Confraternização Universal', tipo: 'nacional' },
  { data: '2025-02-17', descricao: 'Carnaval', tipo: 'nacional' },
  { data: '2025-02-18', descricao: 'Carnaval', tipo: 'nacional' },
  { data: '2025-04-18', descricao: 'Sexta-feira Santa', tipo: 'nacional' },
  { data: '2025-04-21', descricao: 'Tiradentes', tipo: 'nacional' },
  { data: '2025-05-01', descricao: 'Dia do Trabalhador', tipo: 'nacional' },
  { data: '2025-06-19', descricao: 'Corpus Christi', tipo: 'nacional' },
  { data: '2025-09-07', descricao: 'Independência do Brasil', tipo: 'nacional' },
  { data: '2025-10-12', descricao: 'Nossa Senhora Aparecida', tipo: 'nacional' },
  { data: '2025-10-27', descricao: 'Dia do Servidor Público', tipo: 'nacional' },
  { data: '2025-11-02', descricao: 'Finados', tipo: 'nacional' },
  { data: '2025-11-15', descricao: 'Proclamação da República', tipo: 'nacional' },
  { data: '2025-12-25', descricao: 'Natal', tipo: 'nacional' }
];

export const ImportFeriados2025 = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feriadosExistentes, setFeriadosExistentes] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  const verificarFeriadosExistentes = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('feriados')
        .select('id')
        .gte('data', '2025-01-01')
        .lte('data', '2025-12-31');

      if (error) {
        console.error('Erro ao verificar feriados:', error);
        toast.error('Erro ao verificar feriados existentes');
        return;
      }

      setFeriadosExistentes(data?.length || 0);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao verificar feriados existentes');
    } finally {
      setIsChecking(false);
    }
  };

  const importarFeriados = async () => {
    setIsImporting(true);
    setImportStatus('idle');

    try {
      // Se existem feriados, remover primeiro
      if (feriadosExistentes > 0) {
        const { error: deleteError } = await supabase
          .from('feriados')
          .delete()
          .gte('data', '2025-01-01')
          .lte('data', '2025-12-31');

        if (deleteError) {
          console.error('Erro ao remover feriados existentes:', deleteError);
          toast.error('Erro ao remover feriados existentes');
          return;
        }
      }

      // Inserir novos feriados
      const { data, error } = await supabase
        .from('feriados')
        .insert(FERIADOS_2025)
        .select();

      if (error) {
        console.error('Erro ao inserir feriados:', error);
        toast.error('Erro ao importar feriados');
        setImportStatus('error');
        return;
      }

      setImportStatus('success');
      setFeriadosExistentes(data.length);
      toast.success(`${data.length} feriados importados com sucesso!`);
      
      // Invalidar cache dos feriados
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });

    } catch (error) {
      console.error('Erro durante importação:', error);
      toast.error('Erro durante a importação');
      setImportStatus('error');
    } finally {
      setIsImporting(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Importar Feriados de 2025
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={verificarFeriadosExistentes}
              disabled={isChecking}
            >
              {isChecking ? 'Verificando...' : 'Verificar Status'}
            </Button>
            {feriadosExistentes > 0 && (
              <Badge variant="secondary">
                {feriadosExistentes} feriados já cadastrados
              </Badge>
            )}
          </div>
        </div>

        {/* Alerta sobre feriados existentes */}
        {feriadosExistentes > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Já existem {feriadosExistentes} feriados de 2025 cadastrados. 
              A importação irá substituir todos os feriados existentes.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações sobre os feriados */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Serão importados {FERIADOS_2025.length} feriados nacionais de 2025.
          </AlertDescription>
        </Alert>

        {/* Botão de importação */}
        <Button 
          onClick={importarFeriados} 
          disabled={isImporting}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Importando...' : 'Importar Feriados de 2025'}
        </Button>

        {/* Status da importação */}
        {importStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Feriados importados com sucesso! O calendário foi atualizado.
            </AlertDescription>
          </Alert>
        )}

        {importStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erro durante a importação. Verifique as permissões e tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de feriados */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Feriados que serão importados:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {FERIADOS_2025.map((feriado, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{feriado.descricao}</div>
                  <div className="text-sm text-gray-600">
                    {formatarData(feriado.data)}
                  </div>
                </div>
                <Badge variant="outline">{feriado.tipo}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};