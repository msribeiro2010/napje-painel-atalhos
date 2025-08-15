import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FormData, DescriptionSection } from '@/types/form';
import { FormSection } from '@/components/FormSection';
import { GeneratedDescriptionSection } from '@/components/GeneratedDescriptionSection';
import { EnhancedAIDialog } from '@/components/EnhancedAIDialog';
import { TemplateSelector } from '@/components/TemplateSelector';
import { SimilarityAnalysis } from '@/components/SimilarityAnalysis';
import { AIHistory, useAIHistory } from '@/components/AIHistory';
import AIAdvancedSettings from '@/components/AIAdvancedSettings';
import { validateForm } from '@/utils/form-validation';
import { generateDescription, formatDescriptionSections, limparDescricaoProblema } from '@/utils/description-generator';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useChamados } from '@/hooks/useChamados';
import { PageHeader } from '@/components/PageHeader';

const CriarChamado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { salvarUsuario } = useUsuarios();
  const { salvarChamado } = useChamados();
  const { addToHistory } = useAIHistory();
  
  const editId = searchParams.get('editId');
  const isEditing = !!editId;
  
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
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiEnhancedDescription, setAiEnhancedDescription] = useState('');
  const [aiSuggestedSolution, setAiSuggestedSolution] = useState('');
  
  // Estados para melhorias
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIHistory, setShowAIHistory] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const editId = searchParams.get('editId');

    if (resumo || grau || processos || notas || chamadoOrigem) {
      setFormData(prev => ({
        ...prev,
        resumo: resumo || '',
        grau: grau || '',
        processos: processos || '',
        orgaoJulgador: orgaoJulgador || '',
        perfilUsuario: perfilUsuario || '',
        cpfUsuario: cpfUsuario || '',
        nomeUsuario: nomeUsuario || '',
        notas: notas ? limparDescricaoProblema(notas) : '',
        chamadoOrigem: chamadoOrigem || '',
      }));
      
      const message = editId ? 'Dados carregados para edição!' : 'Template carregado com sucesso!';
      toast.success(message);
    }
  }, [searchParams]);

  // Validação em tempo real
  const validateField = useCallback((field: keyof FormData, value: string | boolean) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'resumo':
        if (!value || value === '') {
          errors.resumo = 'Resumo é obrigatório';
        }
        break;
      case 'resumoCustom':
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
        if (!value || value === '') {
          errors.orgaoJulgador = 'Órgão julgador é obrigatório';
        }
        break;
      case 'notas':
        if (!value || value === '') {
          errors.notas = 'Descrição do problema é obrigatória';
        }
        break;
    }
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (errors[field]) {
        newErrors[field] = errors[field];
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    return Object.keys(errors).length === 0;
  }, [formData.resumo]);

  // Salvamento automático
  const autoSave = useCallback(async (data: FormData) => {
    if (!isDirty) return;
    
    setIsAutoSaving(true);
    try {
      // Salvar usuário se os dados estiverem preenchidos
      if (data.cpfUsuario && data.nomeUsuario) {
        await salvarUsuario(data.cpfUsuario, data.nomeUsuario, data.perfilUsuario);
      }
      
      // Removido: não salvar mais chamado automaticamente (apenas no clique do botão)
      
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Erro no salvamento automático:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isDirty, salvarUsuario]);

  const handleSelectTemplate = useCallback((template: { nome: string; dados: Record<string, unknown> }) => {
    // Aplicar dados do template ao formulário
    const newFormData = {
      ...formData,
      ...template.dados
    };
    
    setFormData(newFormData);
    setShowTemplateSelector(false);
    setIsDirty(true);
    
    toast.success(`Template "${template.nome}" aplicado com sucesso!`);
  }, [formData]);

  const handleSelectHistoryItem = useCallback((item: any) => {
    setShowAIHistory(false);
    toast.info('Item do histórico selecionado');
  }, []);

  const handleApplyHistoryToForm = useCallback((item: { formData: Record<string, string>; description?: string; solution?: string }) => {
    // Aplicar dados do histórico ao formulário
    const newFormData = {
      ...formData,
      resumo: item.formData.resumo,
      grau: item.formData.grau,
      orgaoJulgador: item.formData.orgaoJulgador,
      notas: item.formData.notas
    };
    
    setFormData(newFormData);
    if (item.description) setAiEnhancedDescription(item.description);
    if (item.solution) setAiSuggestedSolution(item.solution);
    setShowAIHistory(false);
    setIsDirty(true);
    
    toast.success('Dados do histórico aplicados ao formulário!');
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    setIsGenerated(false);
    setIsDirty(true);
    
    // Validação em tempo real
    validateField(field, value);
    
    // Configurar salvamento automático
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
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

  const handleSaveChamado = async () => {
    if (!validateForm(formData)) return;

    try {
      // Salvar usuário se os dados estiverem preenchidos
      if (formData.cpfUsuario && formData.nomeUsuario) {
        await salvarUsuario(formData.cpfUsuario, formData.nomeUsuario, formData.perfilUsuario);
      }

      // Salvar chamado na base de dados
      const result = await salvarChamado(formData);
      
      if (result) {
        toast.success('Chamado salvo com sucesso!');
        // Opcional: redirecionar para a lista de chamados ou limpar o formulário
        // navigate('/chamados-recentes');
      }
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
      toast.error('Erro ao salvar chamado. Tente novamente.');
    }
  };

  const handleGenerateDescription = async () => {
    if (!validateForm(formData)) return;

    // Salvar usuário se os dados estiverem preenchidos
    if (formData.cpfUsuario && formData.nomeUsuario) {
      await salvarUsuario(formData.cpfUsuario, formData.nomeUsuario, formData.perfilUsuario);
    }

    // Salvar chamado na base de dados
    await salvarChamado(formData);

    // Abrir dialog da IA
    setShowAIDialog(true);
  };

  const handleProceedToGenerate = async (enhancedDescription: string, suggestedSolution: string) => {
    setAiEnhancedDescription(enhancedDescription);
    setAiSuggestedSolution(suggestedSolution);
    
    // Adicionar ao histórico de IA
    addToHistory({
      model: 'analytical', // Pode ser dinâmico baseado na configuração
      prompt: `Resumo: ${formData.resumo}\nProblema: ${formData.notas}`,
      description: enhancedDescription,
      solution: suggestedSolution,
      isFavorite: false,
      formData: {
        resumo: formData.resumo,
        grau: formData.grau,
        orgaoJulgador: formData.orgaoJulgador,
        notas: formData.notas
      },
      settings: {
        tone: 'profissional',
        priority: 'alta',
        customInstructions: ''
      }
    });
    
    // Usar apenas a descrição melhorada pela IA, sem adicionar informações redundantes
    const descricaoMelhorada = enhancedDescription;
    
    // Atualizar o formData com a descrição melhorada para que apareça nas seções
    setFormData(prev => ({
      ...prev,
      notas: descricaoMelhorada
    }));
    
    // Gerar descrição customizada sem usar a função limparDescricaoProblema
    const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
    
    let description = `*Resumo\n\n${resumoFinal}`;
    if (formData.processos) {
      description += ` - ${formData.processos}`;
    }
    description += `\n\n`;
    
    // Usar a descrição melhorada diretamente sem limpeza
    description += `Descrição do Problema\n\n${descricaoMelhorada}\n\n`;
    
    // Adicionar outras seções conforme necessário
    if (formData.processos) {
      description += `Número dos processos\n\n${formData.processos}\n\n`;
    }
    
    if (formData.chamadoOrigem) {
      description += `Número do Chamado de Origem\n\n${formData.chamadoOrigem}\n\n`;
    }
    
    if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
      description += `Dados do Usuário:\n\n`;
      const dadosUsuario = [];
      if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
      if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
      if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
      if (formData.orgaoJulgador && formData.grau === '1º Grau') {
        const limparCodigoOJ = (orgaoJulgador: string): string => {
          return orgaoJulgador.replace(/^\d+\s*-\s*/, '').trim();
        };
        dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
      }
      description += `${dadosUsuario.join(' / ')}\n\n`;
    }
    
    setGeneratedDescription(description);
    setIsGenerated(true);
    
    // Copiar automaticamente os campos para a área de transferência
    try {
      // Preparar dados para JIRA
      const chamadoOrigem = formData.chamadoOrigem || '';
      const assunto = resumoFinal;
      const nome = [
        formData.nomeUsuario,
        formData.cpfUsuario,
        formData.perfilUsuario,
        formData.orgaoJulgador ? formData.orgaoJulgador.replace(/^\d+\s*-\s*/, '') : null
      ].filter(Boolean).join(' / ');
      
      // Copiar campos individuais em sequência
      await navigator.clipboard.writeText(chamadoOrigem);
      await new Promise(resolve => setTimeout(resolve, 100));
      await navigator.clipboard.writeText(assunto);
      await new Promise(resolve => setTimeout(resolve, 100));
      await navigator.clipboard.writeText(nome);
      await new Promise(resolve => setTimeout(resolve, 100));
      await navigator.clipboard.writeText(description);
      
      toast.success('Formulário JIRA preenchido automaticamente! Campos copiados para área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      toast.success('Descrição gerada com sucesso!');
    }
  };

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
    setShowAIDialog(false);
    setAiEnhancedDescription('');
    setAiSuggestedSolution('');
    toast.info('Formulário resetado');
  };

  // Criar seções customizadas quando há descrição melhorada pela IA
  const createCustomSections = (formData: FormData): DescriptionSection[] => {
    const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

    const sections: DescriptionSection[] = [
      // 1º lugar: Resumo
      {
        title: 'Resumo',
        content: resumoFinal + (formData.processos ? ` - ${formData.processos}` : ''),
        key: 'resumo',
        fullWidth: true
      },
      // 2º lugar: Descrição do Problema (sem limpeza quando há IA)
      {
        title: 'Descrição do Problema',
        content: aiEnhancedDescription ? formData.notas : limparDescricaoProblema(formData.notas),
        key: 'notas',
        fullWidth: true
      }
    ];

    // 3º lugar: Número dos processos se preenchido
    if (formData.processos) {
      sections.push({
        title: 'Número dos processos',
        content: formData.processos,
        key: 'processos',
        fullWidth: true
      });
    }

    // 4º lugar: Número do Chamado de Origem se preenchido
    if (formData.chamadoOrigem) {
      sections.push({
        title: 'Número do Chamado de Origem',
        content: formData.chamadoOrigem,
        key: 'chamadoOrigem',
        fullWidth: true
      });
    }

    // 5º lugar: Perfil do serviço que abriu o chamado se preenchido
     if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
       const dadosUsuario = [];
       if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
       if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
       if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
       if (formData.orgaoJulgador && formData.grau === '1º Grau') {
         const limparCodigoOJ = (orgaoJulgador: string): string => {
           return orgaoJulgador.replace(/^\d+\s*-\s*/, '').trim();
         };
         dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
       }
       
       sections.push({
         title: 'Dados do Usuário',
         content: dadosUsuario.join(' / '),
         key: 'usuario',
         fullWidth: true
       });
     }

     return sections;
  };

  const sections = createCustomSections(formData);

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title={isEditing ? 'Editar Chamado' : 'Criar Chamado'}
          subtitle="Gerador de Issues JIRA"
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Formulário */}
          <div className={`transition-all duration-500 ease-in-out ${
            isGenerated 
              ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' 
              : 'opacity-100 scale-100'
          }`}>
            <FormSection
          formData={formData}
          onInputChange={handleInputChange}
          onMultipleInputChange={handleMultipleInputChange}
          onGenerateDescription={handleGenerateDescription}
          onSaveChamado={handleSaveChamado}
          onResetForm={resetForm}
          validationErrors={validationErrors}
        />
            
            {/* Análise de Similaridade */}
            <SimilarityAnalysis formData={formData} />
          </div>

          {/* Resultado */}
          <div className={`transition-all duration-500 ease-in-out ${
            isGenerated 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
          }`}>
            <GeneratedDescriptionSection
              isGenerated={isGenerated}
              sections={sections}
              generatedDescription={generatedDescription}
            />
            
            {isGenerated && (
              <div className="mt-6 text-center space-x-4">
                <Button 
                  onClick={resetForm} 
                  variant="outline"
                  className="px-6 py-2"
                >
                  Criar Novo Chamado
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="secondary"
                  className="px-6 py-2"
                >
                  Voltar ao Início
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dialog da IA */}
        <EnhancedAIDialog
          open={showAIDialog}
          onOpenChange={setShowAIDialog}
          formData={formData}
          onProceedToGenerate={() => {
             setShowAIDialog(false);
             // Gerar descrição usando os dados atuais do formulário
             const description = generateDescription(formData);
             setGeneratedDescription(description);
             setIsGenerated(true);
             toast.success('Descrição gerada com sucesso!');
           }}
        />

        {/* Template Selector */}
         {showTemplateSelector && (
           <TemplateSelector
             onSelectTemplate={handleSelectTemplate}
             onClose={() => setShowTemplateSelector(false)}
           />
         )}

        {/* AI History */}
        {showAIHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Histórico de IA</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIHistory(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <AIHistory
                  onSelectItem={handleSelectHistoryItem}
                  onApplyToForm={handleApplyHistoryToForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Advanced Settings */}
        {showAISettings && (
          <AIAdvancedSettings
            onSettingsChange={(settings) => {
              console.log('Configurações atualizadas:', settings);
              toast.success('Configurações de IA atualizadas!');
            }}
            onClose={() => setShowAISettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CriarChamado;