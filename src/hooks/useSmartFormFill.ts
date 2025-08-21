import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FormField {
  name: string;
  value: any;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  label: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: RegExp;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  category: string;
  usageCount: number;
  lastUsed: Date;
  accuracy: number;
}

export interface SmartSuggestion {
  field: string;
  value: any;
  confidence: number;
  source: 'history' | 'pattern' | 'context' | 'ai_prediction';
  reasoning: string;
}

export interface FormContext {
  formType: string;
  currentValues: Record<string, any>;
  relatedData?: Record<string, any>;
  userProfile?: any;
  timeContext?: {
    dayOfWeek: number;
    hour: number;
    isBusinessHours: boolean;
  };
}

export const useSmartFormFill = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillHistory, setFillHistory] = useState<any[]>([]);

  // Obter sugestões inteligentes para um campo específico
  const getFieldSuggestions = useCallback(async (
    fieldName: string,
    fieldType: string,
    formContext: FormContext
  ): Promise<SmartSuggestion[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.functions.invoke('smart-field-suggestions', {
        body: {
          userId: user.id,
          fieldName,
          fieldType,
          formContext,
          includePatterns: true,
          includeHistory: true,
          maxSuggestions: 5
        }
      });

      if (error) throw error;

      return data.suggestions || [];
    } catch (err) {
      console.error('Erro ao obter sugestões do campo:', err);
      return [];
    }
  }, [user]);

  // Preencher formulário automaticamente baseado em contexto
  const autoFillForm = useCallback(async (
    fields: FormField[],
    formContext: FormContext,
    options?: {
      confidence_threshold?: number;
      preserve_existing?: boolean;
      use_templates?: boolean;
    }
  ) => {
    if (!user) return {};

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('auto-fill-form', {
        body: {
          userId: user.id,
          fields,
          formContext,
          options: {
            confidence_threshold: 0.7,
            preserve_existing: true,
            use_templates: true,
            ...options
          }
        }
      });

      if (error) throw error;

      const filledData = data.filledData || {};
      const newSuggestions = data.suggestions || [];

      setSuggestions(newSuggestions);

      // Registrar uso para melhorar futuras predições
      await recordFormFill(formContext.formType, filledData, newSuggestions);

      return filledData;
    } catch (err) {
      console.error('Erro no preenchimento automático:', err);
      setError('Erro ao preencher formulário automaticamente');
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Detectar padrões no preenchimento de formulários
  const detectFormPatterns = useCallback(async (formType: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.functions.invoke('detect-form-patterns', {
        body: {
          userId: user.id,
          formType,
          timeframe: '90d',
          includeSequences: true
        }
      });

      if (error) throw error;

      return data.patterns || [];
    } catch (err) {
      console.error('Erro ao detectar padrões:', err);
      return [];
    }
  }, [user]);

  // Criar template de formulário baseado em uso frequente
  const createFormTemplate = useCallback(async (
    formData: Record<string, any>,
    formType: string,
    templateName: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-form-template', {
        body: {
          userId: user.id,
          formData,
          formType,
          templateName,
          autoDetectFields: true
        }
      });

      if (error) throw error;

      const newTemplate = data.template;
      setTemplates(prev => [...prev, newTemplate]);

      return newTemplate;
    } catch (err) {
      console.error('Erro ao criar template:', err);
      return null;
    }
  }, [user]);

  // Carregar templates salvos
  const loadFormTemplates = useCallback(async (formType?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('load-form-templates', {
        body: {
          userId: user.id,
          formType,
          includeStats: true
        }
      });

      if (error) throw error;

      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  }, [user]);

  // Aplicar template a um formulário
  const applyTemplate = useCallback(async (
    templateId: string,
    currentContext: FormContext
  ) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return {};

    try {
      const { data, error } = await supabase.functions.invoke('apply-form-template', {
        body: {
          templateId,
          currentContext,
          adaptToContext: true
        }
      });

      if (error) throw error;

      // Registrar uso do template
      await supabase.functions.invoke('record-template-usage', {
        body: { templateId, userId: user?.id }
      });

      return data.filledData || {};
    } catch (err) {
      console.error('Erro ao aplicar template:', err);
      return {};
    }
  }, [templates, user]);

  // Registrar preenchimento para machine learning
  const recordFormFill = useCallback(async (
    formType: string,
    formData: Record<string, any>,
    suggestions: SmartSuggestion[]
  ) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('record-form-fill', {
        body: {
          userId: user.id,
          formType,
          formData,
          suggestions,
          timestamp: new Date().toISOString(),
          context: {
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timeOfDay: new Date().getHours()
          }
        }
      });

      // Atualizar histórico local
      setFillHistory(prev => [{
        formType,
        data: formData,
        timestamp: new Date(),
        suggestions: suggestions.length
      }, ...prev.slice(0, 49)]); // Manter apenas últimos 50
    } catch (err) {
      console.error('Erro ao registrar preenchimento:', err);
    }
  }, [user]);

  // Obter sugestões contextuais inteligentes
  const getContextualSuggestions = useCallback(async (
    partialFormData: Record<string, any>,
    formType: string
  ) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.functions.invoke('contextual-suggestions', {
        body: {
          userId: user.id,
          partialFormData,
          formType,
          includeRelatedForms: true,
          useAI: true
        }
      });

      if (error) throw error;

      return data.suggestions || [];
    } catch (err) {
      console.error('Erro ao obter sugestões contextuais:', err);
      return [];
    }
  }, [user]);

  // Validação inteligente de formulário
  const validateFormIntelligently = useCallback(async (
    formData: Record<string, any>,
    formType: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('intelligent-form-validation', {
        body: {
          formData,
          formType,
          userId: user?.id,
          includeBusinessRules: true,
          suggestCorrections: true
        }
      });

      if (error) throw error;

      return {
        isValid: data.isValid,
        errors: data.errors || [],
        warnings: data.warnings || [],
        suggestions: data.corrections || []
      };
    } catch (err) {
      console.error('Erro na validação inteligente:', err);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };
    }
  }, [user]);

  // Otimizar formulário baseado em padrões de uso
  const optimizeFormLayout = useCallback(async (
    fields: FormField[],
    formType: string
  ) => {
    if (!user) return fields;

    try {
      const { data, error } = await supabase.functions.invoke('optimize-form-layout', {
        body: {
          userId: user.id,
          fields,
          formType,
          includeAccessibility: true,
          optimizeForMobile: true
        }
      });

      if (error) throw error;

      return data.optimizedFields || fields;
    } catch (err) {
      console.error('Erro ao otimizar layout:', err);
      return fields;
    }
  }, [user]);

  // Carregar dados iniciais (só se AI estiver habilitado)
  useEffect(() => {
    const aiEnabled = import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';
    if (user && aiEnabled) {
      loadFormTemplates();
    }
  }, [user, loadFormTemplates]);

  return {
    // Estados
    suggestions,
    templates,
    fillHistory,
    isLoading,
    error,

    // Métodos principais
    autoFillForm,
    getFieldSuggestions,
    getContextualSuggestions,

    // Templates
    createFormTemplate,
    loadFormTemplates,
    applyTemplate,

    // Padrões e análise
    detectFormPatterns,
    validateFormIntelligently,
    optimizeFormLayout,

    // Histórico
    recordFormFill,

    // Utilitários
    clearSuggestions: () => setSuggestions([]),
    clearError: () => setError(null)
  };
};