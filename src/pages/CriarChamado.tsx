import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { FormData } from '@/types/form';
import { FormSection } from '@/components/FormSection';
import { GeneratedDescriptionSection } from '@/components/GeneratedDescriptionSection';
import { UpcomingEventsAlert } from '@/components/UpcomingEventsAlert';
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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsGenerated(false);
  };

  const handleGenerateDescription = async () => {
    if (!validateForm(formData)) return;

    // Salvar usuário se os dados estiverem preenchidos
    if (formData.cpfUsuario && formData.nomeUsuario) {
      await salvarUsuario(formData.cpfUsuario, formData.nomeUsuario, formData.perfilUsuario);
    }

    // Salvar chamado na base de dados
    await salvarChamado(formData);

    const description = generateDescription(formData);
    setGeneratedDescription(description);
    setIsGenerated(true);
    toast.success('Descrição gerada com sucesso!');
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
    toast.info('Formulário resetado');
  };

  const sections = formatDescriptionSections(formData);

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title={isEditing ? 'Editar Chamado' : 'Criar Chamado'}
          subtitle="Gerador de Issues JIRA"
        />

        <UpcomingEventsAlert />

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
            />
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
      </div>
    </div>
  );
};

export default CriarChamado;