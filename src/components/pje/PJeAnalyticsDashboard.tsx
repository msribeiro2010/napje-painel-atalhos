import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  Clock,
  Activity,
  Building2,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface DashboardData {
  processos_hoje: number;
  processos_mes: number;
  tarefas_abertas: number;
  tarefas_concluidas_hoje: number;
  audiencias_hoje: number;
  valor_medio_causa: number;
  valor_total_causa: number;
  media_processos_dia: number;
}

export const PJeAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrau, setSelectedGrau] = useState<'1' | '2'>('1');
  const [selectedTarefa, setSelectedTarefa] = useState('');
  const [processosDistribuidos, setProcessosDistribuidos] = useState<any[]>([]);
  const [gargalos, setGargalos] = useState<any[]>([]);
  const [audiencias, setAudiencias] = useState<any[]>([]);

  const API_URL = `${import.meta.env.VITE_PJE_API_URL || 'http://localhost:3001/api/pje'}/analytics`;

  // Carregar dashboard ao montar
  useEffect(() => {
    loadDashboard();
  }, [selectedGrau]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboard?grau=${selectedGrau}`);
      if (!response.ok) throw new Error('Erro ao carregar dashboard');
      
      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Verifique se o servidor está rodando',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProcessosDistribuidos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/distribuicao-hoje?grau=${selectedGrau}`);
      if (!response.ok) throw new Error('Erro ao carregar processos');
      
      const result = await response.json();
      setProcessosDistribuidos(result.processos || []);
      
      toast({
        title: `${result.total} processos distribuídos hoje`,
        description: 'Dados atualizados com sucesso'
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao carregar processos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGargalos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/gargalos-tarefas?grau=${selectedGrau}`);
      if (!response.ok) throw new Error('Erro ao carregar gargalos');
      
      const result = await response.json();
      setGargalos(result.gargalos || []);
      
      toast({
        title: `${result.total_tarefas_analisadas} tarefas analisadas`,
        description: 'Gargalos identificados com sucesso'
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao carregar gargalos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAudiencias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/audiencias-dia?grau=${selectedGrau}&data=${selectedDate}`);
      if (!response.ok) throw new Error('Erro ao carregar audiências');
      
      const result = await response.json();
      setAudiencias(result.audiencias || []);
      
      toast({
        title: `${result.total} audiências encontradas`,
        description: `Data: ${format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}`
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao carregar audiências',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarProcessosPorTarefa = async () => {
    if (!selectedTarefa) {
      toast({
        title: 'Digite o nome da tarefa',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/processos-tarefa?grau=${selectedGrau}&tarefa=${encodeURIComponent(selectedTarefa)}`);
      if (!response.ok) throw new Error('Erro ao buscar processos');
      
      const result = await response.json();
      
      toast({
        title: `${result.total} processos encontrados`,
        description: `Tarefa: ${selectedTarefa}`
      });
      
      console.log('Processos na tarefa:', result.processos);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao buscar processos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics PJe - Big Data Dashboard
          </CardTitle>
          <CardDescription>
            Análise avançada de dados com indicadores gerenciais e operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label>Grau de Jurisdição</Label>
              <Select value={selectedGrau} onValueChange={(v) => setSelectedGrau(v as '1' | '2')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Grau</SelectItem>
                  <SelectItem value="2">2º Grau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadDashboard} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores principais */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Processos Hoje</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.processos_hoje}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média diária: {dashboardData.media_processos_dia}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Processos no Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.processos_mes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Tarefas Abertas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.tarefas_abertas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Concluídas hoje: {dashboardData.tarefas_concluidas_hoje}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Audiências Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.audiencias_hoje}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Agendadas para hoje
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs com análises detalhadas */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="distribuicao" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="distribuicao">
                <FileText className="h-4 w-4 mr-2" />
                Distribuição
              </TabsTrigger>
              <TabsTrigger value="tarefas">
                <Activity className="h-4 w-4 mr-2" />
                Tarefas
              </TabsTrigger>
              <TabsTrigger value="gargalos">
                <Clock className="h-4 w-4 mr-2" />
                Gargalos
              </TabsTrigger>
              <TabsTrigger value="audiencias">
                <Calendar className="h-4 w-4 mr-2" />
                Audiências
              </TabsTrigger>
            </TabsList>

            <TabsContent value="distribuicao" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Processos Distribuídos Hoje</h3>
                <Button onClick={loadProcessosDistribuidos} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Carregar Processos
                </Button>
              </div>
              
              {processosDistribuidos.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Número</th>
                        <th className="text-left p-2">Órgão Julgador</th>
                        <th className="text-left p-2">Classe</th>
                        <th className="text-left p-2">Prioridade</th>
                        <th className="text-right p-2">Valor da Causa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processosDistribuidos.slice(0, 10).map((proc, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-mono text-sm">{proc.numero_processo}</td>
                          <td className="p-2">{proc.ds_orgao_julgador}</td>
                          <td className="p-2">{proc.ds_classe_judicial}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              proc.prioridade === 'Alta' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {proc.prioridade}
                            </span>
                          </td>
                          <td className="p-2 text-right">{formatCurrency(proc.vl_causa)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tarefas" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome da tarefa (ex: arquivo, audiência)"
                    value={selectedTarefa}
                    onChange={(e) => setSelectedTarefa(e.target.value)}
                  />
                  <Button onClick={buscarProcessosPorTarefa} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Processos
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Digite o nome ou parte do nome da tarefa para buscar processos parados nela.
                  Exemplos: "arquivo", "audiência", "conclusão"
                </p>
              </div>
            </TabsContent>

            <TabsContent value="gargalos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Análise de Gargalos</h3>
                <Button onClick={loadGargalos} disabled={loading}>
                  <Activity className="h-4 w-4 mr-2" />
                  Analisar Gargalos
                </Button>
              </div>
              
              {gargalos.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Tarefa</th>
                        <th className="text-center p-2">Processos Parados</th>
                        <th className="text-center p-2">Média Dias</th>
                        <th className="text-center p-2">Máximo Dias</th>
                        <th className="text-center p-2">Responsáveis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gargalos.map((g, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{g.tarefa}</td>
                          <td className="p-2 text-center font-bold">{g.processos_parados}</td>
                          <td className="p-2 text-center">{Math.round(g.media_dias_parado)}</td>
                          <td className="p-2 text-center text-red-600">{g.max_dias_parado}</td>
                          <td className="p-2 text-center">{g.qtd_responsaveis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audiencias" className="space-y-4 mt-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Data das Audiências</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Button onClick={loadAudiencias} disabled={loading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Buscar Audiências
                </Button>
              </div>
              
              {audiencias.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Processo</th>
                        <th className="text-left p-2">Órgão</th>
                        <th className="text-left p-2">Horário</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Magistrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audiencias.map((a, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-mono text-sm">{a.numero_processo}</td>
                          <td className="p-2">{a.ds_orgao_julgador}</td>
                          <td className="p-2">
                            {a.horario_inicio ? format(new Date(a.horario_inicio), 'HH:mm') : '-'}
                          </td>
                          <td className="p-2">{a.tipo_audiencia || '-'}</td>
                          <td className="p-2">{a.magistrado_responsavel || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Valores financeiros */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Indicadores Financeiros</CardTitle>
            <CardDescription>Valores de causa dos processos distribuídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total (30 dias)</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.valor_total_causa)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Médio por Processo</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.valor_medio_causa)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};