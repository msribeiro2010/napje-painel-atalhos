import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';
import { Save, CheckCircle, AlertCircle, FileText, Sparkles, Clock, Layers, Wand2, Keyboard, RefreshCw, Plus, Zap, Target, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { FormData, DescriptionSection } from '@/types/form';
import { FormSection } from '@/components/FormSection';
import { GeneratedDescriptionSection } from '@/components/GeneratedDescriptionSection';
import { TemplateSelector } from '@/components/TemplateSelector';
import { SmartTemplates } from '@/components/SmartTemplates';
import { useFormKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { validateForm, isFormValid } from '@/utils/form-validation';
import { generateDescription, formatDescriptionSections, limparDescricaoProblema } from '@/utils/description-generator';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useChamados } from '@/hooks/useChamados';
import { useTextEnhancement } from '@/hooks/useTextEnhancement';

import { PageHeader } from '@/components/PageHeader';
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CriarChamado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { salvarUsuario, buscarUsuarios, buscarUsuarioPorCPF, loading: usuariosLoading } = useUsuarios();
  const { salvarChamado, buscarChamadosRecentes, excluirChamado, buscarDadosUsuarioPorCPF, clearCache, loading: chamadosLoading, error: chamadosError } = useChamados();

  
  const editId = searchParams.get('editId');
  const isEditing = !!editId;
  
  // Referências para os campos de resumo e notas
  const resumoRef = useRef<HTMLInputElement>(null);
  const notasRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    resumo: '',
    resumoCustom: '',
    grau: '',
    orgaoJulgador: '',
    perfilUsuario: '',
    cpfUsuario: '',
    nomeUsuario: '',
    processos: '',
    notas: '',
    chamadoOrigem: '',
  });
  
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [sections, setSections] = useState<DescriptionSection[]>([]);

  
  // Estados para validação e salvamento automático
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSmartTemplates, setShowSmartTemplates] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Refs para focar nos campos (já declarados acima)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Chave para localStorage
  const FORM_STORAGE_KEY = 'criar-chamado-form-data';
  const FORM_METADATA_KEY = 'criar-chamado-metadata';
  
  // Funções de persistência local
  const saveToLocalStorage = useCallback((data: FormData, metadata?: any) => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
      const metadataToSave = {
        timestamp: new Date().toISOString(),
        isDirty: true,
        ...metadata
      };
      localStorage.setItem(FORM_METADATA_KEY, JSON.stringify(metadataToSave));
      setAutoSaveStatus('Salvo automaticamente');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      const savedMetadata = localStorage.getItem(FORM_METADATA_KEY);
      
      if (savedData && savedMetadata) {
        const data = JSON.parse(savedData);
        const metadata = JSON.parse(savedMetadata);
        
        // Verificar se os dados não são muito antigos (24 horas)
        const savedTime = new Date(metadata.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && metadata.isDirty) {
          return { data, metadata };
        }
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    return null;
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(FORM_METADATA_KEY);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }, []);

  // Carregar dados dos parâmetros da URL (para funcionalidade de template)
  useEffect(() => {
    const resumo = searchParams.get('resumo');
    const grau = searchParams.get('grau');
    const processos = searchParams.get('processos');
    const orgaoJulgador = searchParams.get('orgaoJulgador');
    const perfilUsuario = searchParams.get('perfilUsuario');
    const cpfUsuario = searchParams.get('cpfUsuario');
    const nomeUsuario = searchParams.get('nomeUsuario');
    const notas = searchParams.get('notas');
    const chamadoOrigem = searchParams.get('chamadoOrigem');
    // editId já foi declarado acima
    
    if (resumo || grau || processos || orgaoJulgador || perfilUsuario || cpfUsuario || nomeUsuario || notas || chamadoOrigem) {
      setFormData({
        resumo: resumo || '',
        resumoCustom: '',
        grau: grau || '',
        orgaoJulgador: orgaoJulgador || '',
        perfilUsuario: perfilUsuario || '',
        cpfUsuario: cpfUsuario || '',
        nomeUsuario: nomeUsuario || '',
        processos: processos || '',
        notas: notas || '',
        chamadoOrigem: chamadoOrigem || '',
      });
      
      const message = editId ? 'Dados carregados para edição!' : 'Template carregado com sucesso!';
      toast.success(message);
    }
  }, [searchParams, editId]);

  // Carregar dados salvos ao inicializar o componente
  useEffect(() => {
    const savedForm = loadFromLocalStorage();
    if (savedForm) {
      const shouldRestore = window.confirm(
        'Encontramos dados não salvos de uma sessão anterior. Deseja recuperá-los?'
      );
      
      if (shouldRestore) {
        setFormData(savedForm.data);
        setHasUnsavedChanges(true);
        setIsDirty(true);
        toast.success('Dados recuperados com sucesso!');
      } else {
        clearLocalStorage();
      }
    }
  }, [loadFromLocalStorage, clearLocalStorage]);
  
  // Função de validação de campo individual
  const validateField = useCallback((field: keyof FormData, value: string | boolean) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'resumo':
        if (!value || value === '') {
          errors.resumo = 'Resumo é obrigatório';
        }
        break;
      case 'resumoCustom':
        // Validação condicional para resumo customizado
        if (formData.resumo === 'Outro (personalizado)' && (!value || value === '')) {
          errors.resumoCustom = 'Resumo personalizado é obrigatório';
        }
        break;
      case 'grau':
        if (!value || value === '') {
          errors.grau = 'Grau é obrigatório';
        }
        break;
      case 'orgaoJulgador':
        // Só é obrigatório se o grau estiver selecionado
        if (formData.grau && (!value || value === '')) {
          errors.orgaoJulgador = 'Órgão Julgador é obrigatório';
        }
        break;
      case 'perfilUsuario':
        if (!value || value === '') {
          errors.perfilUsuario = 'Perfil do Usuário é obrigatório';
        }
        break;
      case 'cpfUsuario':
        if (!value || value === '') {
          errors.cpfUsuario = 'CPF do Usuário é obrigatório';
        }
        break;
      case 'nomeUsuario':
        if (!value || value === '') {
          errors.nomeUsuario = 'Nome do Usuário é obrigatório';
        }
        break;
    }
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (Object.keys(errors).length > 0) {
        Object.assign(newErrors, errors);
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, [formData.grau, formData.resumo]);
  
  // Função de salvamento automático
  const autoSave = useCallback(async (data: FormData) => {
    if (!isDirty) return;
    
    try {
      setIsAutoSaving(true);
      setAutoSaveStatus('Salvando...');
      
      // Salvar no localStorage
      saveToLocalStorage(data);
      setHasUnsavedChanges(true);
      
      setLastSaved(new Date());
      
      // Simular salvamento no servidor (opcional)
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error('Erro no auto-save:', error);
      setAutoSaveStatus('Erro ao salvar');
    } finally {
      setIsAutoSaving(false);
    }
  }, [isDirty, saveToLocalStorage]);

  // Handler para beforeunload - avisar sobre dados não salvos
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isDirty) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isDirty]);
  
  // Handlers para templates e histórico
  const handleSelectTemplate = useCallback((template: { nome: string; dados: Record<string, unknown> }) => {
    try {
      const newFormData = {
        resumo: (template.dados.resumo as string) || '',
        resumoCustom: (template.dados.resumoCustom as string) || '',
        grau: (template.dados.grau as string) || '',
        orgaoJulgador: (template.dados.orgaoJulgador as string) || '',
        perfilUsuario: (template.dados.perfilUsuario as string) || '',
        cpfUsuario: (template.dados.cpfUsuario as string) || '',
        nomeUsuario: (template.dados.nomeUsuario as string) || '',
        processos: (template.dados.processos as string) || '',
        notas: (template.dados.notas as string) || '',
        chamadoOrigem: (template.dados.chamadoOrigem as string) || '',
      };
      setFormData(newFormData);
      toast.success(`Template "${template.nome}" aplicado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao aplicar template');
    }
  }, []);
  
  const handleApplyHistoryToForm = useCallback((item: { formData: Record<string, string>; description?: string; solution?: string }) => {
    try {
      const newFormData = {
        resumo: item.formData.resumo || '',
        resumoCustom: item.formData.resumoCustom || '',
        grau: item.formData.grau || '',
        orgaoJulgador: item.formData.orgaoJulgador || '',
        perfilUsuario: item.formData.perfilUsuario || '',
        cpfUsuario: item.formData.cpfUsuario || '',
        nomeUsuario: item.formData.nomeUsuario || '',
        processos: item.formData.processos || '',
        notas: item.formData.notas || '',
        chamadoOrigem: item.formData.chamadoOrigem || '',
      };
      setFormData(newFormData);
      
      if (item.description) {
        setGeneratedDescription(item.description);
        setIsGenerated(true);
      }
      

      
      toast.success('Dados do histórico aplicados com sucesso!');
    } catch (error) {
      toast.error('Erro ao aplicar dados do histórico');
    }
  }, []);
  

  
  const handleApplySuggestion = useCallback((suggestion: any) => {
    const updatedFormData = { ...formData };
    
    // Aplicar sugestões aos campos do formulário
    if (suggestion.resumo) updatedFormData.resumo = suggestion.resumo;
    if (suggestion.grau) updatedFormData.grau = suggestion.grau;
    if (suggestion.orgaoJulgador) updatedFormData.orgaoJulgador = suggestion.orgaoJulgador;
    if (suggestion.perfilUsuario) updatedFormData.perfilUsuario = suggestion.perfilUsuario;
    if (suggestion.processos) updatedFormData.processos = suggestion.processos;
    if (suggestion.notas) updatedFormData.notas = suggestion.notas;
    
    setFormData(updatedFormData);
    
    // Se houver descrição sugerida, aplicar também
    if (suggestion.description) {
      setGeneratedDescription(suggestion.description);
      setIsGenerated(true);
    }
    

    
    toast.success('Sugestão aplicada com sucesso!');
  }, [formData]);
  
  const handleApplyTemplate = useCallback((template: any) => {
    const templateContent = template.content || template;
    const newFormData = {
      resumo: templateContent.resumo || formData.resumo,
      resumoCustom: templateContent.resumoCustom || formData.resumoCustom,
      grau: templateContent.grau || formData.grau,
      orgaoJulgador: templateContent.orgaoJulgador || formData.orgaoJulgador,
      perfilUsuario: templateContent.perfilUsuario || formData.perfilUsuario,
      cpfUsuario: templateContent.cpfUsuario || formData.cpfUsuario,
      nomeUsuario: templateContent.nomeUsuario || formData.nomeUsuario,
      processos: templateContent.processos || formData.processos,
      notas: templateContent.notas || formData.notas,
      chamadoOrigem: templateContent.chamadoOrigem || formData.chamadoOrigem,
    };
    
    setFormData(newFormData);
    setShowSmartTemplates(false);
    toast.success(`Template "${template.title || template.nome}" aplicado com sucesso!`);
  }, [formData]);
  
  const handleSaveChamado = useCallback(async () => {
    if (!validateForm(formData)) return;
    
    try {
      // Salvar usuário se os dados estiverem preenchidos
      if (formData.cpfUsuario && formData.nomeUsuario) {
        await salvarUsuario(formData.cpfUsuario, formData.nomeUsuario, formData.perfilUsuario);
      }
      
      // Salvar chamado
      const result = await salvarChamado(formData);
      
      if (result.success) {
        // Limpar dados salvos localmente após sucesso
        clearLocalStorage();
        
        toast.success(isEditing ? 'Chamado atualizado com sucesso!' : 'Chamado salvo com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Erro ao salvar chamado');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro inesperado ao salvar chamado');
    }
  }, [formData, salvarUsuario, salvarChamado, isEditing, navigate, clearLocalStorage]);
  
  const handleGenerateDescription = useCallback(async () => {
    if (!validateForm(formData)) {
      toast.error('Preencha todos os campos obrigatórios antes de gerar a descrição');
      return;
    }
    
    try {
      // Gerar seções customizadas
      const generatedSections = createCustomSections(formData);
      const finalDescription = generatedSections.map(section => `${section.title}: ${section.content}`).join('\n\n');
      
      setSections(generatedSections);
      setGeneratedDescription(finalDescription);
      setIsGenerated(true);
      
      toast.success('Descrição gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast.error('Erro ao gerar descrição');
    }
  }, [formData]);


  
  // Atalhos de teclado
  const handleSaveShortcut = useCallback(() => {
    handleSaveChamado();
  }, [handleSaveChamado]);
  
  const handleGenerateDescriptionShortcut = useCallback(() => {
    handleGenerateDescription();
  }, [handleGenerateDescription]);
  
  const handleFocusResumo = useCallback(() => {
    resumoRef.current?.focus();
  }, []);
  
  const handleFocusNotas = useCallback(() => {
    notasRef.current?.focus();
  }, []);
  
  // Configurar atalhos de teclado
  const { shortcuts } = useFormKeyboardShortcuts({
    onSave: handleSaveShortcut,
    onGenerateDescription: handleGenerateDescriptionShortcut,
    onShowTemplates: () => setShowTemplateSelector(!showTemplateSelector),
    onShowKeyboardHelp: () => setShowKeyboardHelp(!showKeyboardHelp),
    onFocusResumo: handleFocusResumo,
    onFocusNotas: handleFocusNotas,
  });
  
  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsGenerated(false);
    setIsDirty(true);
    
    // Validação em tempo real
    validateField(field, value);
    
    // Configurar salvamento automático
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const newFormData = { ...formData, [field]: value };
      autoSave(newFormData);
    }, 3000); // Salvar após 3 segundos de inatividade
  };
  
  const handleMultipleInputChange = (updates: Partial<FormData>) => {
    const newFormData = {
      ...formData,
      ...updates
    };
    
    setFormData(newFormData);
    setIsGenerated(false);
    setIsDirty(true);
    
    // Validação em tempo real para cada campo atualizado
    Object.entries(updates).forEach(([field, value]) => {
      if (typeof value === 'string' || typeof value === 'boolean') {
        validateField(field as keyof FormData, value);
      }
    });
    
    // Configurar salvamento automático
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(newFormData);
    }, 3000); // Salvar após 3 segundos de inatividade
  };
  
  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  

  
  const resetForm = () => {
    setFormData({
      resumo: '',
      resumoCustom: '',
      grau: '',
      orgaoJulgador: '',
      perfilUsuario: '',
      cpfUsuario: '',
      nomeUsuario: '',
      processos: '',
      notas: '',
      chamadoOrigem: '',
    });
    setGeneratedDescription('');
    setIsGenerated(false);
    setValidationErrors({});
    setIsDirty(false);
    setLastSaved(null);
    setAutoSaveStatus('');
    
    // Limpar dados salvos localmente
    clearLocalStorage();
    
    toast.success('Formulário limpo!');
  };
  
  const { enhanceText, isEnhancing } = useTextEnhancement();

  // Função para otimizar texto com IA
  const handleOptimizeText = useCallback(async () => {
    if (!formData.notas.trim()) {
      toast.error('Adicione uma descrição do problema para otimizar');
      return;
    }

    try {
      // Criar contexto inteligente para a IA
      let contextualPrompt = `Melhore a seguinte descrição de problema técnico do sistema PJe (Processo Judicial Eletrônico).

`;
      
      // Adicionar contexto do usuário se disponível
      if (formData.nomeUsuario) {
        contextualPrompt += `O usuário ${formData.nomeUsuario} relata que `;
      } else {
        contextualPrompt += `O usuário relata que `;
      }
      
      // Adicionar contexto do processo se disponível
      if (formData.processos) {
        contextualPrompt += `ao trabalhar com o processo ${formData.processos}, `;
      }
      
      // Adicionar contexto do órgão e grau se disponível
      const contextoAdicional = [];
      if (formData.orgaoJulgador) {
        contextoAdicional.push(`no ${formData.orgaoJulgador}`);
      }
      if (formData.grau) {
        contextoAdicional.push(`${formData.grau} grau`);
      }
      
      if (contextoAdicional.length > 0) {
        contextualPrompt += `${contextoAdicional.join(' - ')}, `;
      }
      
      contextualPrompt += `está enfrentando o seguinte problema:\n\n"${formData.notas}"\n\n`;
      
      contextualPrompt += `INSTRUÇÕES PARA MELHORIA:\n`;
      contextualPrompt += `- Transforme em uma descrição técnica clara e profissional\n`;
      contextualPrompt += `- Mantenha todas as informações contextuais (nome, processo, órgão)\n`;
      contextualPrompt += `- Use linguagem formal adequada para chamados de TI\n`;
      contextualPrompt += `- Seja específico sobre o problema relatado\n`;
      contextualPrompt += `- NÃO invente detalhes que não foram mencionados\n`;
      contextualPrompt += `- Estruture o texto de forma clara e objetiva\n\n`;
      contextualPrompt += `Retorne APENAS a descrição melhorada, sem explicações adicionais.`;

      const textoOtimizado = await enhanceText(contextualPrompt, 'descricao');
      
      if (textoOtimizado) {
        setFormData(prev => ({ ...prev, notas: textoOtimizado }));
        setIsDirty(true);
        toast.success('✨ Texto otimizado com IA!');
      }
    } catch (error) {
      console.error('Erro ao otimizar texto:', error);
      toast.error('Erro ao otimizar texto com IA');
    }
  }, [formData.notas, formData.nomeUsuario, formData.processos, formData.orgaoJulgador, formData.grau, enhanceText]);

  const createCustomSections = (formData: FormData): DescriptionSection[] => {
    const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
    
    // Criar conteúdo do resumo incluindo o número do processo se disponível
    let resumoContent = resumoFinal;
    if (formData.processos) {
      resumoContent = `${resumoFinal} – ${formData.processos}`;
    }
    
    const sections: DescriptionSection[] = [
      {
        title: 'Resumo do Problema',
        content: resumoContent,
        key: 'resumo',
        fullWidth: true
      },
      {
        title: 'Descrição Detalhada',
        content: formData.notas || '', // Usar notas como descrição detalhada
        key: 'descricao',
        fullWidth: true
      }
    ];
    
    // Adicionar seção de processos se houver (separada)
    if (formData.processos) {
      sections.push({
        title: 'Processos Relacionados',
        content: formData.processos,
        key: 'processos'
      });
    }
    
    // Adicionar número do chamado de origem se houver
    if (formData.chamadoOrigem) {
      sections.push({
        title: 'Número do Chamado de Origem (OJ)',
        content: formData.chamadoOrigem,
        key: 'chamado-origem'
      });
    }
    
    // Adicionar seção de dados do usuário
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.orgaoJulgador) dadosUsuario.push(formData.orgaoJulgador);
    
    if (dadosUsuario.length > 0) {
      sections.push({
        title: 'Dados do Usuário',
        content: dadosUsuario.join(' / '), // Formato Nome/CPF/Perfil/Orgao
        key: 'dados-usuario'
      });
    }
    
    // Se for um template JIRA, substitui o placeholder do número do processo
    if (sections.length > 1 && sections[1].content.includes('[Número do processo será incorporado automaticamente]') && formData.processos) {
      sections[1].content = sections[1].content.replace(
        '[Número do processo será incorporado automaticamente]',
        formData.processos
      );
    }
    
    return sections;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Cabeçalho Moderno */}
      <div className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-indigo-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        
        <div className="relative">
          <PageHeader 
            title={isEditing ? "Editar Chamado" : "Criar Novo Chamado"}
            subtitle={isEditing ? "Modifique os dados do chamado" : "Preencha os dados para criar um novo chamado"}
          >
            <div className="flex items-center gap-3">
              {/* Status de salvamento modernizado */}
              <div className="flex items-center gap-3">
                {autoSaveStatus && (
                  <Badge 
                    variant={autoSaveStatus.includes('Erro') ? 'destructive' : autoSaveStatus.includes('Salvando') ? 'secondary' : 'default'} 
                    className="text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm border-0 px-3 py-1.5"
                  >
                    {autoSaveStatus.includes('Salvando') && <Clock className="h-3 w-3 animate-spin" />}
                    {autoSaveStatus.includes('Salvo') && <CheckCircle className="h-3 w-3" />}
                    {autoSaveStatus.includes('Erro') && <AlertCircle className="h-3 w-3" />}
                    {autoSaveStatus}
                  </Badge>
                )}
                {hasUnsavedChanges && !autoSaveStatus && (
                  <Badge variant="outline" className="text-xs flex items-center gap-2 text-amber-600 border-amber-300/50 shadow-lg backdrop-blur-sm px-3 py-1.5">
                    <Clock className="h-3 w-3" />
                    Alterações não salvas
                  </Badge>
                )}
                {lastSaved && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/20 shadow-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Último salvamento: {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              
              {/* Botão de atalhos modernizado */}
              <ModernButton
                variant="glass"
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                icon={<Keyboard className="h-4 w-4" />}
                className="shadow-lg backdrop-blur-sm"
              >
                Atalhos
              </ModernButton>
            </div>
          </PageHeader>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Formulário Principal */}
            <div className="space-y-8">
            <ModernCard variant="glass" className="overflow-hidden">
              <ModernCardHeader
                title="Dados do Chamado"
                description="Preencha as informações necessárias para criar o chamado"
                icon={<FileText className="h-5 w-5 text-white" />}
                action={
                  <div className="flex items-center gap-3">
                    {/* Botões de template modernizados */}
                    <ModernButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateSelector(true)}
                      icon={<Layers className="h-4 w-4" />}
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Templates
                    </ModernButton>
                    <ModernButton
                      variant="gradient"
                      size="sm"
                      onClick={() => setShowSmartTemplates(true)}
                      icon={<Brain className="h-4 w-4" />}
                      className="shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      IA Templates
                    </ModernButton>
                  </div>
                }
              />
              <ModernCardContent className="p-6">
                <FormSection
                  formData={formData}
                  onInputChange={handleInputChange}
                  onMultipleInputChange={handleMultipleInputChange}
                  onGenerateDescription={handleGenerateDescription}
                  onOptimizeText={handleOptimizeText}
                  onResetForm={resetForm}
                  validationErrors={validationErrors}
                  resumoRef={resumoRef}
                  notasRef={notasRef}
                  isOptimizing={isEnhancing}
                />
              </ModernCardContent>
            </ModernCard>
            
            {/* Seção de Descrição Gerada */}
            {isGenerated && (
              <ModernCard variant="glass">
                <ModernCardHeader
                  title="Descrição Gerada"
                  description="Visualize e edite a descrição gerada para o chamado"
                  icon={<Sparkles className="h-5 w-5 text-white" />}
                />
                <ModernCardContent className="p-6">
                  <GeneratedDescriptionSection
                    isGenerated={isGenerated}
                    sections={sections}
                    generatedDescription={generatedDescription}
                    formData={formData}
                    onSaveChamado={handleSaveChamado}
                    onClose={() => {
                      setIsGenerated(false);
                      resetForm();
                    }}
                  />
                </ModernCardContent>
              </ModernCard>
            )}
            
            {/* Botões de Ação Modernizados */}
            {!isGenerated && (
              <ModernCard variant="glass">
                <ModernCardContent className="p-6">
                  <ModernGrid>
                    <ModernGridItem span={12}>
                      <div className="flex justify-end gap-4">
                        <ModernButton
                          variant="outline"
                          onClick={() => navigate('/dashboard')}
                          disabled={chamadosLoading}
                          className="px-6 py-2"
                        >
                          Cancelar
                        </ModernButton>
                        <ModernButton
                          variant="gradient"
                          onClick={handleGenerateDescription}
                          disabled={chamadosLoading || !isFormValid(formData)}
                          icon={chamadosLoading ? 
                            <RefreshCw className="h-4 w-4 animate-spin" /> : 
                            <Sparkles className="h-4 w-4" />
                          }
                          className="px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                          loading={chamadosLoading}
                        >
                          {chamadosLoading ? 
                            'Gerando...' : 
                            'Gerar Descrição'
                          }
                        </ModernButton>
                      </div>
                    </ModernGridItem>
                  </ModernGrid>
                </ModernCardContent>
              </ModernCard>
            )}
            

            </div>
          </div>
      </div>
      
      {/* Diálogos */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
      />
      
      <Dialog open={showSmartTemplates} onOpenChange={setShowSmartTemplates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Layers className="h-5 w-5" />
               Template JIRA
             </DialogTitle>
           </DialogHeader>
          <SmartTemplates
            formData={formData}
            onApplyTemplate={handleApplyTemplate}
            onClose={() => setShowSmartTemplates(false)}
          />
        </DialogContent>
      </Dialog>
      
      <KeyboardShortcutsHelp
        open={showKeyboardHelp}
        onOpenChange={setShowKeyboardHelp}
        shortcuts={shortcuts}
      />
    </div>
  );
};

export default CriarChamado;