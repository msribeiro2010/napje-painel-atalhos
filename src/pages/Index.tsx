import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  BookOpen, 
  User, 
  Shield, 
  ExternalLink, 
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Settings,
  Zap,
  Activity
} from 'lucide-react';
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
  const [showMainForm, setShowMainForm] = useState(false);

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
      
      setShowMainForm(true);
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
    setShowMainForm(false);
    toast.info('Formulário resetado');
  };

  const sections = formatDescriptionSections(formData);

  // Estatísticas fictícias para demonstração
  const stats = [
    { label: 'Chamados Hoje', value: '12', icon: Activity, color: 'text-blue-600' },
    { label: 'Tempo Médio', value: '2.3h', icon: Clock, color: 'text-green-600' },
    { label: 'Usuários Ativos', value: '45', icon: Users, color: 'text-purple-600' },
    { label: 'Taxa Resolução', value: '94%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const quickActions = [
    {
      title: 'Novo Chamado',
      description: 'Criar um novo chamado JIRA',
      icon: MessageSquare,
      action: () => setShowMainForm(true),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white'
    },
    {
      title: 'Base de Conhecimento',
      description: 'Consultar soluções documentadas',
      icon: BookOpen,
      action: () => navigate('/base-conhecimento'),
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Chamados Recentes',
      description: 'Visualizar histórico de chamados',
      icon: FileText,
      action: () => navigate('/chamados-recentes'),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white'
    },
    {
      title: 'Atalhos do Sistema',
      description: 'Acesso rápido aos atalhos',
      icon: Zap,
      action: () => navigate('/atalhos'),
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      textColor: 'text-white'
    }
  ];

  const adminActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Administrar usuários do sistema',
      icon: Shield,
      action: () => navigate('/admin/usuarios'),
      color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      textColor: 'text-white'
    },
    {
      title: 'Configurações',
      description: 'Configurações administrativas',
      icon: Settings,
      action: () => navigate('/admin/atalhos'),
      color: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
      textColor: 'text-white'
    }
  ];

  if (showMainForm || isGenerated) {
    return (
      <div className="min-h-screen bg-[#f8f5e4] p-2">
        <div className="max-w-6xl mx-auto">
          {/* Header simplificado */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={resetForm}
                className="text-[#7c6a3c] hover:bg-[#f3ecd2]"
              >
                ← Voltar ao Painel
              </Button>
            </div>
            <UserMenu />
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5e4] via-[#f3ecd2] to-[#f8f5e4] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header moderno */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" 
                  alt="Brasão TRT15" 
                  className="h-12 w-12 cursor-pointer hover:opacity-80 transition-all duration-300 drop-shadow-lg" 
                />
              </a>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7c6a3c] to-[#a68b5b] bg-clip-text text-transparent">
                Painel de Controle NAPJe
              </h1>
              <p className="text-[#bfae7c] text-sm font-medium">
                Núcleo de Apoio ao PJe - TRT15 | Sistema Integrado de Suporte
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-[#f3ecd2] text-[#7c6a3c] border-[#e2d8b8] font-medium px-3 py-1">
              Versão 2.0
            </Badge>
            <UserMenu />
          </div>
        </div>

        <UpcomingEventsAlert />

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações Principais */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#7c6a3c] mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`${action.color} ${action.textColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
                onClick={action.action}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <action.icon className="h-8 w-8 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-lg mb-2 text-white">{action.title}</CardTitle>
                  <CardDescription className="text-white/80 text-sm">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ações Administrativas (apenas para admins) */}
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#7c6a3c] mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Área Administrativa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminActions.map((action, index) => (
                <Card 
                  key={index} 
                  className={`${action.color} ${action.textColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
                  onClick={action.action}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <action.icon className="h-8 w-8 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                      <ExternalLink className="h-4 w-4 opacity-60" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-lg mb-2 text-white">{action.title}</CardTitle>
                    <CardDescription className="text-white/80 text-sm">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#7c6a3c] mb-2">Sistema NAPJe</h3>
              <p className="text-sm text-gray-600 mb-4">
                Plataforma integrada para gestão de suporte técnico e abertura de chamados JIRA
              </p>
              <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
                <span>© 2024 TRT15 - Núcleo de Apoio ao PJe</span>
                <span>•</span>
                <span>
                  Desenvolvido por{' '}
                  <a 
                    href="https://msribeiro2010.github.io/marcelo-s-ribeiro-stellar-ai/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#7c6a3c] hover:underline font-medium"
                  >
                    msribeiro
                  </a>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Sistema Online
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;