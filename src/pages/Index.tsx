import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, User, Shield, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FormData } from '@/types/form';
import { FormSection } from '@/components/FormSection';
import { GeneratedDescriptionSection } from '@/components/GeneratedDescriptionSection';
import { UpcomingEventsAlert } from '@/components/UpcomingEventsAlert';
import { validateForm } from '@/utils/form-validation';
import { generateDescription, formatDescriptionSections } from '@/utils/description-generator';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useChamados } from '@/hooks/useChamados';
import UserMenu from '@/components/UserMenu';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { salvarUsuario } = useUsuarios();
  const { salvarChamado } = useChamados();

  // Verificar se o usuário é admin
  const { data: isAdmin } = useQuery({
    queryKey: ['user-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) return false;
      return data?.is_admin || false;
    },
    enabled: !!user?.id
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };
  
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
        notas: notas || '',
        chamadoOrigem: chamadoOrigem || '',
      }));
      
      toast.success('Template carregado com sucesso!');
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
        {/* Header com menu do usuário */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer">
              <img src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" alt="Brasão TRT15" className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </a>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Gerador de Issues JIRA
              </h1>
              <p className="text-muted-foreground">Núcleo de Apoio ao PJe - TRT15</p>
            </div>
          </div>
          <UserMenu />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary">Versão 1.0</Badge>
            <Button 
              variant="outline" 
              onClick={() => navigate('/base-conhecimento')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Base de Conhecimento
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/chamados-recentes')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Chamados Recentes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/atalhos')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Atalhos
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/usuarios')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Gerenciar Usuários
              </Button>
            )}
          </div>
        </div>

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
              <div className="mt-6 text-center">
                <Button 
                  onClick={resetForm} 
                  variant="outline"
                  className="px-6 py-2"
                >
                  Criar Novo Chamado
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 TRT15 - Núcleo de Apoio ao PJe | Ferramenta de apoio para abertura de issues JIRA</p>
          <p className="mt-1">
            Desenvolvido por{' '}
            <a 
              href="https://msribeiro2010.github.io/marcelo-s-ribeiro-stellar-ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              msribeiro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;