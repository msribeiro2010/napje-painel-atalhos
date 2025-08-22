import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle, AlertCircle, FileText, Sparkles, Clock, Layers, Wand2, Keyboard, RefreshCw } from 'lucide-react';
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

import { PageHeader } from '@/components/PageHeader';
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
    const newFormData = {
      resumo: template.resumo || formData.resumo,
      resumoCustom: template.resumoCustom || formData.resumoCustom,
      grau: template.grau || formData.grau,
      orgaoJulgador: template.orgaoJulgador || formData.orgaoJulgador,
      perfilUsuario: template.perfilUsuario || formData.perfilUsuario,
      cpfUsuario: template.cpfUsuario || formData.cpfUsuario,
      nomeUsuario: template.nomeUsuario || formData.nomeUsuario,
      processos: template.processos || formData.processos,
      notas: template.notas || formData.notas,
      chamadoOrigem: template.chamadoOrigem || formData.chamadoOrigem,
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
  
  const createCustomSections = (formData: FormData): DescriptionSection[] => {
    const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
    
    const sections: DescriptionSection[] = [
      {
        title: 'Resumo do Problema',
        content: resumoFinal,
        key: 'resumo'
      },
      {
        title: 'Descrição Detalhada',
        content: '', // Será preenchido pela IA
        key: 'descricao'
      }
    ];
    
    // Adicionar seção de processos se houver
    if (formData.processos) {
      sections.push({
        title: 'Processos Relacionados',
        content: formData.processos,
        key: 'processos'
      });
    }
    
    // Adicionar seção de notas se houver
    if (formData.notas) {
      sections.push({
        title: 'Observações Adicionais',
        content: formData.notas,
        key: 'notas'
      });
    }
    
    // Adicionar seção de dados do usuário
    const dadosUsuario = [];
    if (formData.cpfUsuario) dadosUsuario.push(`CPF: ${formData.cpfUsuario}`);
    if (formData.nomeUsuario) dadosUsuario.push(`Nome: ${formData.nomeUsuario}`);
    if (formData.perfilUsuario) dadosUsuario.push(`Perfil: ${formData.perfilUsuario}`);
    
    if (dadosUsuario.length > 0) {
      sections.push({
        title: 'Dados do Usuário',
        content: dadosUsuario.join('\n'),
        key: 'dados-usuario'
      });
    }
    
    return sections;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader 
        title={isEditing ? "Editar Chamado" : "Criar Novo Chamado"}
        subtitle={isEditing ? "Modifique os dados do chamado" : "Preencha os dados para criar um novo chamado"}
      >
        <div className="flex items-center gap-2">
          {autoSaveStatus && (
            <Badge 
              variant={autoSaveStatus.includes('Erro') ? 'destructive' : autoSaveStatus.includes('Salvando') ? 'secondary' : 'default'} 
              className="text-xs flex items-center gap-1"
            >
              {autoSaveStatus.includes('Salvando') && <Clock className="h-3 w-3 animate-spin" />}
              {autoSaveStatus.includes('Salvo') && <CheckCircle className="h-3 w-3" />}
              {autoSaveStatus.includes('Erro') && <AlertCircle className="h-3 w-3" />}
              {autoSaveStatus}
            </Badge>
          )}
          {hasUnsavedChanges && !autoSaveStatus && (
            <Badge variant="outline" className="text-xs flex items-center gap-1 text-amber-600 border-amber-300">
              <Clock className="h-3 w-3" />
              Alterações não salvas
            </Badge>
          )}
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Último salvamento: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyboardHelp(true)}
            className="gap-2"
          >
            <Keyboard className="h-4 w-4" />
            Atalhos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </PageHeader>
      
      <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Formulário Principal */}
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Dados do Chamado</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateSelector(true)}
                      className="gap-2"
                    >
                      <Layers className="h-4 w-4" />
                      Templates
                    </Button>
                    <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowSmartTemplates(true)}
                       className="gap-2"
                     >
                       <Layers className="h-4 w-4" />
                       Template JIRA
                     </Button>

                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FormSection
                  formData={formData}
                  onInputChange={handleInputChange}
                  onMultipleInputChange={handleMultipleInputChange}
                  onGenerateDescription={handleGenerateDescription}
                  onSaveChamado={handleSaveChamado}
                  onResetForm={resetForm}

                  validationErrors={validationErrors}
                  resumoRef={resumoRef}
                  notasRef={notasRef}
                />
              </CardContent>
            </Card>
            
            {/* Seção de Descrição Gerada */}
            {isGenerated && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold">Descrição Gerada</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <GeneratedDescriptionSection
                    isGenerated={isGenerated}
                    sections={sections}
                    generatedDescription={generatedDescription}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Painel de Ações */}
            <Card className="border-t-4 border-t-blue-500 sticky bottom-4 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Save className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ações do Chamado</h3>
                      <p className="text-sm text-gray-600">Gere descrição automática ou salve o chamado</p>
                    </div>
                  </div>
                  {/* Status de Validação Compacto */}
                  <div className="flex items-center gap-2">
                    {isFormValid(formData) ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium hidden sm:inline">Pronto para salvar</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm text-amber-700 hidden sm:inline">Campos obrigatórios</span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Botões de Ação Principal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleGenerateDescription}
                    disabled={!isFormValid(formData) || isAutoSaving}
                    className="h-14 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:hover:bg-purple-950/30 dark:hover:border-purple-600 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-purple-100 rounded group-hover:bg-purple-200 transition-colors">
                        <Wand2 className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-purple-700">Gerar com IA</div>
                        <div className="text-xs text-purple-600">Criar descrição automática</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={handleSaveChamado}
                    disabled={!isFormValid(formData) || isAutoSaving}
                    className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-blue-500/20 rounded group-hover:bg-blue-400/30 transition-colors">
                        {isAutoSaving ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{isEditing ? 'Atualizar' : 'Salvar'} Chamado</div>
                        <div className="text-xs text-blue-100">{isAutoSaving ? 'Salvando...' : 'Finalizar e salvar'}</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* Ações Secundárias */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    disabled={isAutoSaving}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar Formulário
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplateSelector(true)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Carregar Template
                  </Button>
                  
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setShowSmartTemplates(true)}
                     className="text-gray-600 hover:text-gray-800"
                   >
                     <Layers className="h-4 w-4 mr-2" />
                     Template JIRA
                   </Button>
                  

                </div>
              </CardContent>
            </Card>
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