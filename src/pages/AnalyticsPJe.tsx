import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Users, FileText, Clock, Calendar, Download, Filter, RefreshCw, Activity, Zap, Globe, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import '@/styles/analytics-pje.css';

interface DistribuicaoData {
  oj_nome: string;
  cidade: string;
  total_processos: number;
  periodo_manha: number;
  periodo_tarde: number;
  periodo_noite: number;
  prioridade_urgente: number;
  justica_secreta: number;
  media_diaria: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
}

interface MetricasGerais {
  total_processos_mes: number;
  total_ojs_ativos: number;
  media_distribuicao_diaria: number;
  taxa_crescimento: number;
  pico_distribuicao: {
    data: string;
    total: number;
  };
  oj_mais_ativo: {
    nome: string;
    total: number;
  };
}

const AnalyticsPJe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [grauSelecionado, setGrauSelecionado] = useState<'1' | '2'>('1');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('todas');
  const [distribuicaoData, setDistribuicaoData] = useState<DistribuicaoData[]>([]);
  const [metricas, setMetricas] = useState<MetricasGerais | null>(null);
  const [cidades, setCidades] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Função para buscar dados de distribuição
  const fetchDistribuicaoData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        grau: grauSelecionado,
        periodo: periodoSelecionado,
        cidade: cidadeSelecionada
      });

      const response = await fetch(`http://localhost:3001/api/pje/analytics/distribuicao?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar dados de distribuição');

      const data = await response.json();
      setDistribuicaoData(data.distribuicao || []);
      setMetricas(data.metricas || null);
      setCidades(data.cidades || []);
      setLastUpdate(new Date());

      toast({
        title: "✅ Dados Atualizados",
        description: `Análise de ${data.distribuicao?.length || 0} órgãos julgadores carregada.`,
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados de análise.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDistribuicaoData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Função para exportar dados
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      grau: grauSelecionado,
      periodo: periodoSelecionado,
      metricas,
      distribuicao: distribuicaoData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_pje_${grauSelecionado}grau_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Exportado",
      description: "Dados exportados com sucesso!",
    });
  };

  useEffect(() => {
    fetchDistribuicaoData();
  }, [grauSelecionado, periodoSelecionado, cidadeSelecionada]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDistribuicaoData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [grauSelecionado, periodoSelecionado, cidadeSelecionada]);

  return (
    <div className="analytics-pje-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="header-title">
            <h1>Analytics PJe - Big Data Dashboard</h1>
            <p className="header-subtitle">Análise em tempo real da distribuição de processos</p>
          </div>
        </div>

        <div className="header-actions">
          <Badge variant="outline" className="update-badge">
            <Clock className="h-3 w-3 mr-1" />
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent className="p-4">
          <div className="filters-grid">
            <div className="filter-item">
              <label>Grau de Jurisdição</label>
              <Select value={grauSelecionado} onValueChange={(v) => setGrauSelecionado(v as '1' | '2')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Grau</SelectItem>
                  <SelectItem value="2">2º Grau</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-item">
              <label>Período</label>
              <Select value={periodoSelecionado} onValueChange={(v) => setPeriodoSelecionado(v as 'hoje' | 'semana' | 'mes')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-item">
              <label>Cidade</label>
              <Select value={cidadeSelecionada} onValueChange={setCidadeSelecionada}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Cidades</SelectItem>
                  {cidades.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      {metricas && (
        <div className="metrics-grid">
          <Card className="metric-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total de Processos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">
                <FileText className="h-8 w-8 text-blue-500" />
                <span className="metric-number">{metricas.total_processos_mes.toLocaleString('pt-BR')}</span>
              </div>
              <p className="metric-label">Este mês</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">OJs Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">
                <Briefcase className="h-8 w-8 text-green-500" />
                <span className="metric-number">{metricas.total_ojs_ativos}</span>
              </div>
              <p className="metric-label">Órgãos Julgadores</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Média Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">
                <Activity className="h-8 w-8 text-purple-500" />
                <span className="metric-number">{Math.round(metricas.media_distribuicao_diaria).toLocaleString('pt-BR')}</span>
              </div>
              <p className="metric-label">Processos/dia</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Taxa de Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">
                <TrendingUp className={`h-8 w-8 ${metricas.taxa_crescimento > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="metric-number">
                  {metricas.taxa_crescimento > 0 ? '+' : ''}{metricas.taxa_crescimento.toFixed(1)}%
                </span>
              </div>
              <p className="metric-label">Vs. período anterior</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Visualização */}
      <Tabs defaultValue="distribuicao" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribuicao">Distribuição por OJ</TabsTrigger>
          <TabsTrigger value="temporal">Análise Temporal</TabsTrigger>
          <TabsTrigger value="ranking">Rankings e Top Performers</TabsTrigger>
        </TabsList>

        {/* Tab: Distribuição por OJ */}
        <TabsContent value="distribuicao">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Detalhada por Órgão Julgador</CardTitle>
              <CardDescription>
                Análise completa da distribuição de processos por OJ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner" />
                  <p>Carregando dados de distribuição...</p>
                </div>
              ) : (
                <div className="distribuicao-grid">
                  {distribuicaoData.map((oj, index) => (
                    <Card key={index} className="oj-card">
                      <CardHeader className="pb-3">
                        <div className="oj-header">
                          <div>
                            <CardTitle className="text-base">{oj.oj_nome}</CardTitle>
                            <p className="text-sm text-muted-foreground">{oj.cidade}</p>
                          </div>
                          <Badge variant={oj.tendencia === 'alta' ? 'default' : oj.tendencia === 'baixa' ? 'secondary' : 'outline'}>
                            {oj.tendencia === 'alta' ? '↑' : oj.tendencia === 'baixa' ? '↓' : '→'} {oj.tendencia}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="oj-metrics">
                          <div className="metric-row">
                            <span className="metric-label">Total Hoje:</span>
                            <span className="metric-value">{oj.total_processos}</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Média Diária:</span>
                            <span className="metric-value">{oj.media_diaria.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="periodo-distribution">
                          <div className="periodo-label">Distribuição por Período:</div>
                          <div className="periodo-bars">
                            <div className="periodo-bar">
                              <div className="bar-fill morning" style={{ height: `${(oj.periodo_manha / oj.total_processos) * 100}%` }} />
                              <span className="bar-label">Manhã</span>
                              <span className="bar-value">{oj.periodo_manha}</span>
                            </div>
                            <div className="periodo-bar">
                              <div className="bar-fill afternoon" style={{ height: `${(oj.periodo_tarde / oj.total_processos) * 100}%` }} />
                              <span className="bar-label">Tarde</span>
                              <span className="bar-value">{oj.periodo_tarde}</span>
                            </div>
                            <div className="periodo-bar">
                              <div className="bar-fill night" style={{ height: `${(oj.periodo_noite / oj.total_processos) * 100}%` }} />
                              <span className="bar-label">Noite</span>
                              <span className="bar-value">{oj.periodo_noite}</span>
                            </div>
                          </div>
                        </div>

                        {(oj.prioridade_urgente > 0 || oj.justica_secreta > 0) && (
                          <div className="special-cases">
                            {oj.prioridade_urgente > 0 && (
                              <Badge variant="destructive" className="mr-2">
                                <Zap className="h-3 w-3 mr-1" />
                                {oj.prioridade_urgente} Urgente(s)
                              </Badge>
                            )}
                            {oj.justica_secreta > 0 && (
                              <Badge variant="secondary">
                                🔒 {oj.justica_secreta} Secreto(s)
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise Temporal */}
        <TabsContent value="temporal">
          <Card>
            <CardHeader>
              <CardTitle>Análise Temporal de Distribuição</CardTitle>
              <CardDescription>
                Padrões de distribuição ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="temporal-analysis">
                <div className="chart-placeholder">
                  <BarChart3 className="h-32 w-32 text-muted-foreground/20" />
                  <p className="text-muted-foreground mt-4">
                    Gráfico de tendência temporal em desenvolvimento
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta visualização mostrará a evolução da distribuição ao longo do tempo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Rankings */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Rankings e Top Performers</CardTitle>
              <CardDescription>
                OJs com maior volume de distribuição
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricas && (
                <div className="rankings-container">
                  <div className="ranking-item featured">
                    <div className="ranking-icon">
                      🏆
                    </div>
                    <div className="ranking-details">
                      <h3>OJ Mais Ativo</h3>
                      <p className="ranking-name">{metricas.oj_mais_ativo.nome}</p>
                      <p className="ranking-value">{metricas.oj_mais_ativo.total.toLocaleString('pt-BR')} processos</p>
                    </div>
                  </div>

                  <div className="ranking-item featured">
                    <div className="ranking-icon">
                      📈
                    </div>
                    <div className="ranking-details">
                      <h3>Pico de Distribuição</h3>
                      <p className="ranking-name">{new Date(metricas.pico_distribuicao.data).toLocaleDateString('pt-BR')}</p>
                      <p className="ranking-value">{metricas.pico_distribuicao.total.toLocaleString('pt-BR')} processos</p>
                    </div>
                  </div>

                  <div className="top-performers">
                    <h3 className="section-title">Top 10 OJs por Volume</h3>
                    <div className="performers-list">
                      {distribuicaoData
                        .sort((a, b) => b.total_processos - a.total_processos)
                        .slice(0, 10)
                        .map((oj, index) => (
                          <div key={index} className="performer-item">
                            <span className="performer-rank">#{index + 1}</span>
                            <div className="performer-info">
                              <p className="performer-name">{oj.oj_nome}</p>
                              <p className="performer-location">{oj.cidade}</p>
                            </div>
                            <div className="performer-metrics">
                              <span className="performer-value">{oj.total_processos}</span>
                              <Progress 
                                value={(oj.total_processos / (distribuicaoData[0]?.total_processos || 1)) * 100} 
                                className="performer-progress"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPJe;