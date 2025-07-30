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
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star
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
      low: 'bg-emerald-500',
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
    <Card className={cn("w-full bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-900/90 dark:to-slate-800/50 backdrop-blur-sm border-white/20 shadow-soft", className)}>
      {showHeader && (
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-soft">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Insights de IA</span>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isLoading}
              className="h-8 bg-white/60 hover:bg-white shadow-sm border-purple-200 hover:border-purple-300"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              {isLoading ? "Analisando..." : "Atualizar"}
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <TabsTrigger value="insights" className="text-xs font-medium data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              <Brain className="h-3 w-3 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs font-medium data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              <Activity className="h-3 w-3 mr-1" />
              Padrões
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs font-medium data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Previsões
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-medium data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6 pt-4">
            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-0 space-y-3">
              {error && (
                <div className="text-center py-4 text-destructive bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  {error}
                </div>
              )}

              {isLoading && insights.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="relative">
                      <Brain className="h-8 w-8 animate-pulse text-purple-500" />
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                    </div>
                    <p className="font-medium">Gerando insights...</p>
                    <p className="text-sm">A IA está analisando seus dados</p>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[400px] pr-4">
                {topInsights.length > 0 ? (
                  <div className="space-y-4">
                    {topInsights.map((insight) => {
                      const IconComponent = getInsightIcon(insight.type);
                      const CategoryIcon = getCategoryIcon(insight.category);
                      const isExpanded = expandedInsight === insight.id;

                      return (
                        <div
                          key={insight.id}
                          className="group border border-white/40 rounded-xl p-4 hover:shadow-glow transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-purple-200 dark:hover:border-purple-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-soft group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{insight.title}</h4>
                                <Badge 
                                  variant="secondary"
                                  className={cn("text-xs text-white font-medium", getPriorityColor(insight.priority))}
                                >
                                  {insight.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-700">
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {insight.category}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                {insight.description}
                              </p>

                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="font-medium">
                                    {formatConfidence(insight.confidence)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {insight.metadata.timeframe}
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <BarChart3 className="h-3 w-3" />
                                  {insight.metadata.dataPoints} pontos
                                </div>
                              </div>

                              <Progress 
                                value={insight.confidence * 100} 
                                className="h-1.5 mb-3 bg-gray-200 dark:bg-gray-700"
                              />

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {insight.actionable && insight.action && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleInsightAction(insight)}
                                      className="h-7 px-3 text-xs bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-soft hover:shadow-glow transition-all duration-300"
                                    >
                                      {insight.action.label}
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                                    className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                  >
                                    {isExpanded ? 'Menos' : 'Mais'} detalhes
                                  </Button>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dismissInsight(insight.id)}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                                      <span className="ml-1 capitalize text-gray-600 dark:text-gray-400">{insight.type}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Impacto:</span>
                                      <span className="ml-1 capitalize text-gray-600 dark:text-gray-400">{insight.metadata.impact || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Precisão:</span>
                                      <span className="ml-1 text-gray-600 dark:text-gray-400">{insight.metadata.accuracy ? formatConfidence(insight.metadata.accuracy) : 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Criado:</span>
                                      <span className="ml-1 text-gray-600 dark:text-gray-400">{insight.createdAt.toLocaleDateString()}</span>
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
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="relative mb-4">
                      <Brain className="h-12 w-12 text-purple-400" />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nenhum insight disponível</h3>
                    <p className="text-sm text-center max-w-xs">A IA está analisando seus dados para gerar insights personalizados</p>
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
                      <div key={index} className="border border-white/40 rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{pattern.activity}</h4>
                          <Badge variant={
                            pattern.trend === 'increasing' ? 'default' : 
                            pattern.trend === 'decreasing' ? 'destructive' : 'secondary'
                          } className="bg-gradient-to-r from-blue-500 to-purple-600">
                            {pattern.trend}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Frequência:</span>
                            <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">{pattern.frequency}x</span>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Eficiência:</span>
                            <span className="ml-1 font-semibold text-green-600 dark:text-green-400">{Math.round(pattern.efficiency * 100)}%</span>
                          </div>
                        </div>
                        <Progress value={pattern.efficiency * 100} className="h-2 bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold mb-2">Coletando padrões</h3>
                    <p className="text-sm text-center max-w-xs">Estamos analisando seus padrões de comportamento para otimizar sua experiência</p>
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
                      <div key={index} className="border border-white/40 rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">{prediction.metric}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Atual</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{prediction.currentValue}</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Previsto</div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{prediction.predictedValue}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Confiança: <span className="font-semibold text-purple-600 dark:text-purple-400">{formatConfidence(prediction.confidence)}</span></span>
                          <span className="text-gray-600 dark:text-gray-400">{prediction.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-4 text-green-400" />
                    <h3 className="text-lg font-semibold mb-2">Gerando previsões</h3>
                    <p className="text-sm text-center max-w-xs">A IA está analisando dados históricos para criar previsões precisas</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0">
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border border-white/40 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalUsers}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</div>
                    </div>
                    <div className="text-center p-4 border border-white/40 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.activeUsers}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</div>
                    </div>
                  </div>
                  
                  <div className="border border-white/40 rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Métricas de Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tempo de Resposta</span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{analytics.performanceMetrics.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Erro</span>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">{analytics.performanceMetrics.errorRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Satisfação</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{analytics.performanceMetrics.userSatisfaction}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-4 text-orange-400" />
                  <h3 className="text-lg font-semibold mb-2">Carregando analytics</h3>
                  <p className="text-sm text-center max-w-xs">Coletando dados de performance e uso do sistema</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};