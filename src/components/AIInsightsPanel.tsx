import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Activity, 
  Target,
  ChevronRight,
  RefreshCw,
  X,
  Clock,
  Zap,
  BarChart3,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIInsights, AIInsight } from '@/hooks/useAIInsights';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  className?: string;
  showHeader?: boolean;
  maxInsights?: number;
}

export const AIInsightsPanel = ({ 
  className, 
  showHeader = true, 
  maxInsights = 10 
}: AIInsightsPanelProps) => {
  const {
    insights,
    userPatterns,
    predictions,
    analytics,
    isLoading,
    error,
    generateInsights,
    executeInsightAction,
    dismissInsight,
    getInsightsByPriority,
    getInsightsByCategory
  } = useAIInsights();

  const [selectedTab, setSelectedTab] = useState('insights');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const getInsightIcon = (type: string) => {
    const icons = {
      pattern: Activity,
      recommendation: Lightbulb,
      prediction: TrendingUp,
      anomaly: AlertTriangle,
      optimization: Target
    };
    return icons[type as keyof typeof icons] || Brain;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      productivity: Zap,
      quality: CheckCircle,
      efficiency: BarChart3,
      security: AlertTriangle,
      user_behavior: Eye
    };
    return icons[category as keyof typeof icons] || Activity;
  };

  const handleInsightAction = async (insight: AIInsight) => {
    try {
      await executeInsightAction(insight);
    } catch (err) {
      console.error('Erro ao executar ação:', err);
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const topInsights = insights
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence;
    })
    .slice(0, maxInsights);

  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Insights de IA
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              {isLoading ? "Analisando..." : "Atualizar"}
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-2">
            <TabsTrigger value="insights" className="text-xs">
              Insights
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs">
              Padrões
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs">
              Previsões
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6 pt-4">
            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-0 space-y-3">
              {error && (
                <div className="text-center py-4 text-destructive">
                  {error}
                </div>
              )}

              {isLoading && insights.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Gerando insights...
                  </div>
                </div>
              )}

              <ScrollArea className="h-[400px] pr-4">
                {topInsights.length > 0 ? (
                  <div className="space-y-3">
                    {topInsights.map((insight) => {
                      const IconComponent = getInsightIcon(insight.type);
                      const CategoryIcon = getCategoryIcon(insight.category);
                      const isExpanded = expandedInsight === insight.id;

                      return (
                        <div
                          key={insight.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-sm">{insight.title}</h4>
                                <Badge 
                                  variant="secondary"
                                  className={cn("text-xs text-white", getPriorityColor(insight.priority))}
                                >
                                  {insight.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {insight.category}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {insight.description}
                              </p>

                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>Confiança:</span>
                                  <span className="font-medium">
                                    {formatConfidence(insight.confidence)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {insight.metadata.timeframe}
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <BarChart3 className="h-3 w-3" />
                                  {insight.metadata.dataPoints} pontos
                                </div>
                              </div>

                              <Progress 
                                value={insight.confidence * 100} 
                                className="h-1 mb-3"
                              />

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {insight.actionable && insight.action && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleInsightAction(insight)}
                                      className="h-7 px-3 text-xs"
                                    >
                                      {insight.action.label}
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    {isExpanded ? 'Menos' : 'Mais'} detalhes
                                  </Button>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dismissInsight(insight.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="font-medium">Tipo:</span>
                                      <span className="ml-1 capitalize">{insight.type}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Impacto:</span>
                                      <span className="ml-1 capitalize">{insight.metadata.impact || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Precisão:</span>
                                      <span className="ml-1">{insight.metadata.accuracy ? formatConfidence(insight.metadata.accuracy) : 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Criado:</span>
                                      <span className="ml-1">{insight.createdAt.toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mb-2" />
                    <p>Nenhum insight disponível</p>
                    <p className="text-sm">A IA está analisando seus dados</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Padrões Tab */}
            <TabsContent value="patterns" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {userPatterns.length > 0 ? (
                  <div className="space-y-4">
                    {userPatterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pattern.activity}</h4>
                          <Badge variant={
                            pattern.trend === 'increasing' ? 'default' : 
                            pattern.trend === 'decreasing' ? 'destructive' : 'secondary'
                          }>
                            {pattern.trend}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Frequência:</span>
                            <span className="ml-1 font-medium">{pattern.frequency}x</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Eficiência:</span>
                            <span className="ml-1 font-medium">{Math.round(pattern.efficiency * 100)}%</span>
                          </div>
                        </div>
                        <Progress value={pattern.efficiency * 100} className="mt-2 h-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mb-2" />
                    <p>Coletando padrões de comportamento...</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Previsões Tab */}
            <TabsContent value="predictions" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {predictions.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.map((prediction, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{prediction.metric}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="text-sm text-muted-foreground">Atual</div>
                            <div className="text-lg font-bold">{prediction.currentValue}</div>
                          </div>
                          <div className="text-center p-2 bg-primary/10 rounded">
                            <div className="text-sm text-muted-foreground">Previsto</div>
                            <div className="text-lg font-bold text-primary">{prediction.predictedValue}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confiança: {formatConfidence(prediction.confidence)}</span>
                          <span className="text-muted-foreground">{prediction.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mb-2" />
                    <p>Gerando previsões...</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0">
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Total de Usuários</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Métricas de Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Tempo de Resposta</span>
                        <span className="text-sm font-medium">{analytics.performanceMetrics.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de Erro</span>
                        <span className="text-sm font-medium">{analytics.performanceMetrics.errorRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Satisfação</span>
                        <span className="text-sm font-medium">{analytics.performanceMetrics.userSatisfaction}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <p>Carregando analytics...</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};