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
  Star,
  MessageSquare,
  Users,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIInsights, AIInsight } from '@/hooks/useAIInsights';
import { FormData } from '@/types/form';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  className?: string;
  showHeader?: boolean;
  maxInsights?: number;
  formData?: FormData;
  onApplySuggestion?: (field: string, value: string) => void;
}

interface FormSuggestion {
  id: string;
  type: 'improvement' | 'completion' | 'optimization' | 'warning';
  field: string;
  title: string;
  description: string;
  value?: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface FormInsight {
  id: string;
  type: 'quality' | 'completeness' | 'urgency' | 'complexity';
  title: string;
  description: string;
  score: number;
  icon: React.ReactNode;
}

export const AIInsightsPanel = ({ 
  className, 
  showHeader = true, 
  maxInsights = 10,
  formData,
  onApplySuggestion
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
  const [formSuggestions, setFormSuggestions] = useState<FormSuggestion[]>([]);
  const [formInsights, setFormInsights] = useState<FormInsight[]>([]);
  const [isAnalyzingForm, setIsAnalyzingForm] = useState(false);

  // Análise em tempo real do formulário
  useEffect(() => {
    if (!formData) return;

    const analyzeForm = () => {
      setIsAnalyzingForm(true);
      
      setTimeout(() => {
        const newSuggestions = generateFormSuggestions(formData);
        const newInsights = generateFormInsights(formData);
        
        setFormSuggestions(newSuggestions);
        setFormInsights(newInsights);
        setIsAnalyzingForm(false);
      }, 800);
    };

    const debounceTimer = setTimeout(analyzeForm, 300);
    return () => clearTimeout(debounceTimer);
  }, [formData]);

  const generateFormSuggestions = (data: FormData): FormSuggestion[] => {
    const suggestions: FormSuggestion[] = [];

    // Sugestão para resumo
    if (!data.resumo || data.resumo.length < 15) {
      suggestions.push({
        id: 'resumo-improvement',
        type: 'completion',
        field: 'resumo',
        title: 'Resumo precisa ser mais detalhado',
        description: 'Um resumo mais específico melhora a categorização automática',
        value: data.resumo ? `${data.resumo} - Falha no sistema de autenticação` : 'Problema de acesso ao sistema - Falha na autenticação',
        confidence: 88,
        priority: 'high'
      });
    }

    // Sugestão para grau baseado no conteúdo
    if (data.notas) {
      const urgentWords = ['urgente', 'crítico', 'parado', 'bloqueado', 'emergência', 'imediato'];
      const hasUrgentContent = urgentWords.some(word => 
        data.notas!.toLowerCase().includes(word) || 
        (data.resumo && data.resumo.toLowerCase().includes(word))
      );
      
      if (hasUrgentContent && data.grau !== 'Alto') {
        suggestions.push({
          id: 'grau-urgency',
          type: 'optimization',
          field: 'grau',
          title: 'Prioridade alta detectada',
          description: 'O conteúdo indica alta urgência. Considere alterar o grau.',
          value: 'Alto',
          confidence: 92,
          priority: 'high'
        });
      }
    }

    // Sugestão para órgão julgador
    if (!data.orgaoJulgador && data.resumo) {
      const tribunalKeywords = ['tribunal', 'trf', 'tjf', 'stj', 'stf'];
      const hasTribalContent = tribunalKeywords.some(word => 
        data.resumo!.toLowerCase().includes(word)
      );
      
      if (hasTribalContent) {
        const orgaoSugerido = data.resumo.toLowerCase().includes('stj') ? 'STJ' : 
                             data.resumo.toLowerCase().includes('stf') ? 'STF' : 'TRF';
        suggestions.push({
          id: 'orgao-suggestion',
          type: 'completion',
          field: 'orgaoJulgador',
          title: 'Órgão julgador identificado',
          description: 'Detectamos referência a órgão específico no texto',
          value: orgaoSugerido,
          confidence: 85,
          priority: 'medium'
        });
      }
    }

    // Sugestão para melhorar descrição
    if (data.notas && data.notas.length > 0 && data.notas.length < 100) {
      suggestions.push({
        id: 'notas-enhancement',
        type: 'improvement',
        field: 'notas',
        title: 'Expandir descrição técnica',
        description: 'Adicione detalhes técnicos para melhor diagnóstico',
        value: `${data.notas}\n\n📋 Informações adicionais:\n• Horário de ocorrência: \n• Passos para reproduzir: \n• Mensagens de erro: \n• Impacto estimado: \n• Usuários afetados: `,
        confidence: 75,
        priority: 'medium'
      });
    }

    // Sugestão para dados do usuário
    if (!data.nome_usuario_afetado && data.notas && data.notas.length > 50) {
      suggestions.push({
        id: 'usuario-missing',
        type: 'completion',
        field: 'nome_usuario_afetado',
        title: 'Identificar usuário afetado',
        description: 'Problema detalhado sem identificação do usuário',
        confidence: 70,
        priority: 'low'
      });
    }

    return suggestions.slice(0, 4);
  };

  const generateFormInsights = (data: FormData): FormInsight[] => {
    const insights: FormInsight[] = [];

    // Análise de qualidade
    const qualityScore = calculateQualityScore(data);
    insights.push({
      id: 'quality',
      type: 'quality',
      title: 'Qualidade',
      description: qualityScore > 85 ? 'Excelente detalhamento' : 
                   qualityScore > 70 ? 'Boa qualidade' : 
                   qualityScore > 50 ? 'Qualidade média' : 'Precisa melhorar',
      score: qualityScore,
      icon: <Target className="h-4 w-4" />
    });

    // Análise de completude
    const completenessScore = calculateCompletenessScore(data);
    insights.push({
      id: 'completeness',
      type: 'completeness',
      title: 'Completude',
      description: `${Math.round(completenessScore)}% dos campos preenchidos`,
      score: completenessScore,
      icon: <CheckCircle className="h-4 w-4" />
    });

    // Análise de urgência
    const urgencyScore = calculateUrgencyScore(data);
    insights.push({
      id: 'urgency',
      type: 'urgency',
      title: 'Urgência',
      description: urgencyScore > 75 ? 'Alta prioridade' : 
                   urgencyScore > 50 ? 'Prioridade média' : 'Prioridade baixa',
      score: urgencyScore,
      icon: <AlertTriangle className="h-4 w-4" />
    });

    // Análise de complexidade
    const complexityScore = calculateComplexityScore(data);
    insights.push({
      id: 'complexity',
      type: 'complexity',
      title: 'Complexidade',
      description: complexityScore > 70 ? 'Problema complexo' : 
                   complexityScore > 40 ? 'Complexidade média' : 'Problema simples',
      score: complexityScore,
      icon: <Brain className="h-4 w-4" />
    });

    return insights;
  };

  const calculateQualityScore = (data: FormData): number => {
    let score = 0;
    if (data.resumo && data.resumo.length > 20) score += 25;
    if (data.resumo && data.resumo.length > 50) score += 10;
    if (data.notas && data.notas.length > 50) score += 25;
    if (data.notas && data.notas.length > 150) score += 15;
    if (data.grau) score += 15;
    if (data.orgaoJulgador) score += 10;
    return Math.min(score, 100);
  };

  const calculateCompletenessScore = (data: FormData): number => {
    const fields = [
      data.resumo,
      data.grau,
      data.orgaoJulgador,
      data.notas,
      data.nome_usuario_afetado
    ];
    const filledFields = fields.filter(field => field && field.toString().trim().length > 0);
    return (filledFields.length / fields.length) * 100;
  };

  const calculateUrgencyScore = (data: FormData): number => {
    let score = 0;
    if (data.grau === 'Alto') score += 50;
    if (data.grau === 'Médio') score += 25;
    
    const urgentKeywords = ['urgente', 'crítico', 'parado', 'bloqueado', 'emergência', 'imediato', 'falha crítica'];
    const text = `${data.resumo || ''} ${data.notas || ''}`.toLowerCase();
    urgentKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 10;
    });
    
    return Math.min(score, 100);
  };

  const calculateComplexityScore = (data: FormData): number => {
    let score = 0;
    if (data.notas && data.notas.length > 200) score += 30;
    if (data.resumo && data.resumo.length > 80) score += 20;
    
    const complexKeywords = [
      'integração', 'api', 'banco de dados', 'rede', 'servidor', 
      'configuração', 'autenticação', 'certificado', 'ssl', 'vpn',
      'firewall', 'proxy', 'load balancer', 'cluster'
    ];
    const text = `${data.resumo || ''} ${data.notas || ''}`.toLowerCase();
    complexKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 5;
    });
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30';
      case 'low': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30';
    }
  };

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
      console.error('Erro ao executar ação do insight:', err);
    }
  };

  const handleApplySuggestion = (suggestion: FormSuggestion) => {
    if (onApplySuggestion && suggestion.value) {
      onApplySuggestion(suggestion.field, suggestion.value);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Sparkles className="h-4 w-4" />;
      case 'completion': return <CheckCircle className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'text-blue-600 dark:text-blue-400';
      case 'completion': return 'text-green-600 dark:text-green-400';
      case 'optimization': return 'text-purple-600 dark:text-purple-400';
      case 'warning': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (error) {
    return (
      <Card className={cn('border-red-200 dark:border-red-800', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro ao carregar insights: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Insights Inteligentes
            {isAnalyzingForm && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Analisando...
              </div>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="insights" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Análise
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 px-4 pb-4">
            <TabsContent value="insights" className="mt-4 space-y-3">
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : insights.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum insight disponível</p>
                  </div>
                ) : (
                  insights.slice(0, maxInsights).map((insight) => {
                    const IconComponent = getInsightIcon(insight.type);
                    return (
                      <div
                        key={insight.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedInsight(
                          expandedInsight === insight.id ? null : insight.id
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  'text-xs px-2 py-0.5',
                                  getPriorityColor(insight.priority)
                                )}
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {insight.description}
                            </p>
                            {expandedInsight === insight.id && (
                              <div className="mt-3 pt-3 border-t space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(insight.timestamp).toLocaleString()}
                                </div>
                                {insight.confidence && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Confiança:</span>
                                    <Progress value={insight.confidence} className="h-1.5 flex-1" />
                                    <span className="text-xs font-medium">{insight.confidence}%</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInsightAction(insight);
                                    }}
                                  >
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Aplicar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dismissInsight(insight.id);
                                    }}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Dispensar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <ChevronRight 
                            className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform',
                              expandedInsight === insight.id && 'rotate-90'
                            )} 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4 space-y-3">
              <ScrollArea className="h-[400px]">
                {formSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma sugestão disponível</p>
                    <p className="text-xs mt-1">Preencha o formulário para receber sugestões</p>
                  </div>
                ) : (
                  formSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4 transition-colors',
                        getPriorityBorderColor(suggestion.priority)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-1.5 rounded-md',
                          getSuggestionTypeColor(suggestion.type)
                        )}>
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {suggestion.confidence}%
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.field}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {suggestion.description}
                          </p>
                          {suggestion.value && (
                            <div className="bg-muted/50 p-2 rounded text-xs mb-2 font-mono">
                              {suggestion.value.length > 100 
                                ? `${suggestion.value.substring(0, 100)}...` 
                                : suggestion.value
                              }
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleApplySuggestion(suggestion)}
                            disabled={!suggestion.value}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Aplicar Sugestão
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 space-y-3">
              <ScrollArea className="h-[400px]">
                {formInsights.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma análise disponível</p>
                    <p className="text-xs mt-1">Preencha o formulário para ver análises</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {formInsights.map((insight) => (
                      <div key={insight.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {insight.icon}
                            <span className="font-medium text-sm">{insight.title}</span>
                          </div>
                          <span className={cn(
                            'text-sm font-bold',
                            getScoreColor(insight.score)
                          )}>
                            {insight.score}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <Progress value={insight.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};