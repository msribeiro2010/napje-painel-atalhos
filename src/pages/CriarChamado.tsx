import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
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
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIHistory, setShowAIHistory] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

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



  const handleSelectTemplate = useCallback((template: any) => {
    // Aplicar dados do template ao formulário
    const newFormData = {
      ...formData,
      ...template.dados
    };
    
    setFormData(newFormData);
    setShowTemplateSelector(false);
    
    toast.success(`Template "${template.nome}" aplicado com sucesso!`);
  }, [formData]);

  const handleSelectHistoryItem = useCallback((item: any) => {
    setShowAIHistory(false);
    toast.info('Item do histórico selecionado');
  }, []);

  const handleApplyHistoryToForm = useCallback((item: any) => {
    // Aplicar dados do histórico ao formulário
    const newFormData = {
      ...formData,
      resumo: item.formData.resumo,
      grau: item.formData.grau,
      orgaoJulgador: item.formData.orgaoJulgador,
      notas: item.formData.notas
    };
    
    setFormData(newFormData);
    setAiEnhancedDescription(item.description);
    setAiSuggestedSolution(item.solution);
    setShowAIHistory(false);
    
    toast.success('Dados do histórico aplicados ao formulário!');
  }, [formData]);

   const handleInputChange = (field: keyof FormData, value: string | boolean) => {
     const newFormData = {
       ...formData,
       [field]: value
     };
     
     setFormData(newFormData);
     setIsGenerated(false);
     
     // Validação em tempo real
     validateField(field, value);
   };

  const handleGenerateDescription = async () => {
    if (!validateForm(formData)) {
      toast.error('⚠️ Complete os campos obrigatórios antes de gerar a descrição inteligente');
      return;
    }

    // Toast de início do processo
    const loadingToast = toast.loading('🔄 Preparando geração inteligente...');

    try {
      // Salvar usuário se os dados estiverem preenchidos
      if (formData.cpfUsuario && formData.nomeUsuario) {
        await salvarUsuario(formData.cpfUsuario, formData.nomeUsuario, formData.perfilUsuario);
      }

      // Salvar chamado na base de dados
      await salvarChamado(formData);

      // Fechar loading toast
      toast.dismiss(loadingToast);
      
      // Toast de sucesso e abrir dialog
      toast.success('✅ Dados salvos! Iniciando geração inteligente...', {
        description: 'Escolha o modelo de IA mais adequado para seu problema'
      });

      // Abrir dialog da IA
      setShowAIDialog(true);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao salvar dados. Tente novamente.');
      console.error('Erro ao preparar geração:', error);
    }
  };

  const handleProceedToGenerate = (enhancedDescription?: string, suggestedSolution?: string) => {
    let finalDescription = '';
    let finalSolution = '';
    
    if (enhancedDescription && suggestedSolution) {
      // Usar as descrições melhoradas pela IA
      setAiEnhancedDescription(enhancedDescription);
      setAiSuggestedSolution(suggestedSolution);
      finalDescription = enhancedDescription;
      finalSolution = suggestedSolution;
      
      // Adicionar ao histórico de IA
      addToHistory({
        model: 'analytical',
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
      
      toast.success('🎉 Descrição inteligente ASSYST gerada com sucesso!', {
        description: 'Sua descrição foi melhorada pela IA com linguagem técnica otimizada'
      });
    } else {
      // Usar descrição padrão
      finalDescription = formData.notas;
      toast.success('📝 Descrição padrão gerada com sucesso!');
    }
    
    // Atualizar o formData com a descrição final
    setFormData(prev => ({
      ...prev,
      notas: finalDescription
    }));
    
    // Gerar descrição final para ASSYST
    const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
    
    let description = `*Resumo\n\n${resumoFinal}`;
    if (formData.processos) {
      description += ` - ${formData.processos}`;
    }
    description += `\n\n`;
    
    // Usar a descrição final (melhorada ou padrão)
    description += `Descrição do Problema\n\n${finalDescription}\n\n`;
    
    // Adicionar seção de solução se houver sugestão da IA
    if (finalSolution) {
      description += `Sugestão de Solução\n\n${finalSolution}\n\n`;
    }
    
    // Adicionar outras seções
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
          onGenerateDescription={handleGenerateDescription}
          onResetForm={resetForm}
          onShowAIHistory={() => setShowAIHistory(true)}
          onShowAISettings={() => setShowAISettings(true)}
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
          onProceedToGenerate={handleProceedToGenerate}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Histórico de IA</h2>
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