import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'prediction' | 'anomaly' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'productivity' | 'quality' | 'efficiency' | 'security' | 'user_behavior';
  actionable: boolean;
  action?: {
    label: string;
    type: 'navigate' | 'execute' | 'schedule';
    payload: any;
  };
  metadata: {
    dataPoints: number;
    timeframe: string;
    accuracy?: number;
    impact?: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserBehaviorPattern {
  activity: string;
  frequency: number;
  timeOfDay: string[];
  daysOfWeek: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  efficiency: number;
}

export interface PredictiveMetric {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

export interface DashboardAnalytics {
  totalUsers: number;
  activeUsers: number;
  topActions: { action: string; count: number; trend: number }[];
  performanceMetrics: {
    avgResponseTime: number;
    errorRate: number;
    userSatisfaction: number;
  };
  trends: {
    period: 'day' | 'week' | 'month';
    data: { date: string; value: number }[];
  }[];
}

export const useAIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserBehaviorPattern[]>([]);
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gerar insights baseados em padrões de uso
  const generateInsights = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          userId: user.id,
          analysisTypes: ['patterns', 'recommendations', 'predictions', 'anomalies'],
          timeframe: '30d'
        }
      });

      if (error) throw error;

      const newInsights: AIInsight[] = data.insights.map((insight: any) => ({
        ...insight,
        createdAt: new Date(insight.createdAt),
        expiresAt: insight.expiresAt ? new Date(insight.expiresAt) : undefined
      }));

      setInsights(newInsights);
      
      if (data.userPatterns) {
        setUserPatterns(data.userPatterns);
      }
      
      if (data.predictions) {
        setPredictions(data.predictions);
      }

      return newInsights;
    } catch (err) {
      console.error('Erro ao gerar insights:', err);
      setError('Erro ao gerar insights de IA');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Analisar padrões de comportamento do usuário
  const analyzeUserBehavior = useCallback(async (timeframe: string = '30d') => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-user-behavior', {
        body: {
          userId: user.id,
          timeframe,
          includeEfficiency: true,
          includeTrends: true
        }
      });

      if (error) throw error;

      setUserPatterns(data.patterns || []);
      return data.patterns;
    } catch (err) {
      console.error('Erro ao analisar comportamento:', err);
      return [];
    }
  }, [user]);

  // Gerar previsões baseadas em dados históricos
  const generatePredictions = useCallback(async (metrics: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-predictions', {
        body: {
          metrics,
          timeframe: '7d',
          includeFactors: true
        }
      });

      if (error) throw error;

      setPredictions(data.predictions || []);
      return data.predictions;
    } catch (err) {
      console.error('Erro ao gerar previsões:', err);
      return [];
    }
  }, []);

  // Obter analytics do dashboard
  const getDashboardAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-analytics', {
        body: {
          includeRealTime: true,
          includeTrends: true,
          timeframe: '7d'
        }
      });

      if (error) throw error;

      setAnalytics(data);
      return data;
    } catch (err) {
      console.error('Erro ao obter analytics:', err);
      return null;
    }
  }, []);

  // Detectar anomalias nos dados
  const detectAnomalies = useCallback(async (dataType: string, threshold: number = 0.95) => {
    try {
      const { data, error } = await supabase.functions.invoke('detect-anomalies', {
        body: {
          dataType,
          threshold,
          timeframe: '24h'
        }
      });

      if (error) throw error;

      return data.anomalies || [];
    } catch (err) {
      console.error('Erro ao detectar anomalias:', err);
      return [];
    }
  }, []);

  // Obter recomendações personalizadas
  const getPersonalizedRecommendations = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.functions.invoke('personalized-recommendations', {
        body: {
          userId: user.id,
          context: {
            currentPage: window.location.pathname,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay()
          },
          maxRecommendations: 5
        }
      });

      if (error) throw error;

      return data.recommendations || [];
    } catch (err) {
      console.error('Erro ao obter recomendações:', err);
      return [];
    }
  }, [user]);

  // Executar ação de insight
  const executeInsightAction = useCallback(async (insight: AIInsight) => {
    if (!insight.actionable || !insight.action) return;

    try {
      const { data, error } = await supabase.functions.invoke('execute-insight-action', {
        body: {
          insightId: insight.id,
          action: insight.action,
          userId: user?.id
        }
      });

      if (error) throw error;

      // Atualizar insights após execução
      setInsights(prev => prev.map(i => 
        i.id === insight.id 
          ? { ...i, metadata: { ...i.metadata, executed: true } }
          : i
      ));

      return data;
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      throw err;
    }
  }, [user]);

  // Marcar insight como visto/ignorado
  const dismissInsight = useCallback(async (insightId: string) => {
    setInsights(prev => prev.filter(i => i.id !== insightId));
    
    // Salvar no backend que o insight foi ignorado
    try {
      await supabase.functions.invoke('dismiss-insight', {
        body: { insightId, userId: user?.id }
      });
    } catch (err) {
      console.error('Erro ao dispensar insight:', err);
    }
  }, [user]);

  // Carregar insights automaticamente
  useEffect(() => {
    if (user) {
      generateInsights();
      getDashboardAnalytics();
    }
  }, [user, generateInsights, getDashboardAnalytics]);

  // Filtrar insights por categoria ou tipo
  const getInsightsByCategory = useCallback((category: string) => {
    return insights.filter(insight => insight.category === category);
  }, [insights]);

  const getInsightsByPriority = useCallback((priority: string) => {
    return insights.filter(insight => insight.priority === priority)
      .sort((a, b) => b.confidence - a.confidence);
  }, [insights]);

  return {
    // Estados
    insights,
    userPatterns,
    predictions,
    analytics,
    isLoading,
    error,

    // Métodos de geração
    generateInsights,
    analyzeUserBehavior,
    generatePredictions,
    getDashboardAnalytics,
    detectAnomalies,
    getPersonalizedRecommendations,

    // Ações
    executeInsightAction,
    dismissInsight,

    // Filtros e utilitários
    getInsightsByCategory,
    getInsightsByPriority,
    clearError: () => setError(null)
  };
};