import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, User, Shield, ExternalLink, Calendar as CalendarIcon, Home, Umbrella, Laptop } from 'lucide-react';
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
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';

const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Home className="h-4 w-4 text-[#bfae7c]" /> },
  ferias: { label: 'Férias', color: '#ffe6e6', icon: <Umbrella className="h-4 w-4 text-[#e6a1a1]" /> },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Laptop className="h-4 w-4 text-[#7cc3e6]" /> },
  none: { label: '', color: '#fff', icon: null },
};

function MinimalCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today);
  
  // Carregar marcações do localStorage na inicialização
  const [marks, setMarks] = useState<{ [date: string]: 'presencial' | 'ferias' | 'remoto' | 'none' }>(() => {
    try {
      const saved = localStorage.getItem('calendar-marks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const current = marks[key] || 'none';
    const next = current === 'none' ? 'presencial' : current === 'presencial' ? 'ferias' : current === 'ferias' ? 'remoto' : 'none';
    const newMarks = { ...marks, [key]: next };
    setMarks(newMarks);
    
    // Salvar no localStorage
    try {
      localStorage.setItem('calendar-marks', JSON.stringify(newMarks));
    } catch (error) {
      console.warn('Não foi possível salvar as marcações do calendário:', error);
    }
  };

  const clearAllMarks = () => {
    setMarks({});
    try {
      localStorage.removeItem('calendar-marks');
    } catch (error) {
      console.warn('Não foi possível limpar as marcações do calendário:', error);
    }
  };

  return (
    <div className="bg-[#f8f5e4] border border-[#e2d8b8] rounded-xl shadow-sm p-4 mb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span className="font-semibold text-[#7c6a3c] text-base flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#bfae7c]" />
            Meu Calendário de Trabalho
          </span>
          <span className="text-[#bfae7c] text-sm">{format(month, 'MMMM yyyy')}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="px-2 py-1 text-xs" onClick={() => setMonth(addDays(month, -30))}>Anterior</Button>
          <Button size="sm" variant="outline" className="px-2 py-1 text-xs" onClick={() => setMonth(addDays(month, 30))}>Próximo</Button>
          <Button size="sm" variant="destructive" className="px-2 py-1 text-xs" onClick={clearAllMarks} title="Limpar todas as marcações">Limpar</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-[#bfae7c] font-medium text-center py-1">{d}</div>
        ))}
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={'empty-' + i}></div>
        ))}
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const mark = marks[key] || 'none';
          const isCurrent = isToday(date);
          return (
            <button
              key={key}
              onClick={() => handleDayClick(date)}
              className={`rounded-lg border border-[#e2d8b8] flex flex-col items-center justify-center h-12 w-full transition-all duration-150 focus:outline-none ${isCurrent ? 'ring-2 ring-[#bfae7c]' : ''}`}
              style={{ background: calendarLabels[mark].color }}
              title={calendarLabels[mark].label}
            >
              <span className="font-semibold text-[#7c6a3c] text-sm">{date.getDate()}</span>
              {calendarLabels[mark].icon}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center text-xs">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#f5e7c4] border border-[#e2d8b8]"></span>Presencial</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#ffe6e6] border border-[#e2d8b8]"></span>Férias</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#e6f7ff] border border-[#e2d8b8]"></span>Remoto</span>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#f8f5e4] p-2">
      <div className="max-w-6xl mx-auto">
        {/* Header com menu do usuário */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer">
              <img src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" alt="Brasão TRT15" className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity" />
            </a>
            <div>
              <h1 className="text-xl font-bold text-[#7c6a3c]">Painel NAPJe</h1>
              <p className="text-[#bfae7c] text-xs">Núcleo de Apoio ao PJe - TRT15</p>
            </div>
          </div>
          <UserMenu />
        </div>

        {/* Painel de Calendário */}
        <MinimalCalendar />

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="bg-[#f3ecd2] text-[#bfae7c] border-[#e2d8b8]">Versão 1.0</Badge>
            <Button 
              variant="outline" 
              onClick={() => navigate('/base-conhecimento')}
              className="flex items-center gap-2 text-[#7c6a3c] border-[#e2d8b8] bg-[#f8f5e4] hover:bg-[#f3ecd2]"
            >
              <BookOpen className="h-4 w-4" />
              Base de Conhecimento
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/chamados-recentes')}
              className="flex items-center gap-2 text-[#7c6a3c] border-[#e2d8b8] bg-[#f8f5e4] hover:bg-[#f3ecd2]"
            >
              <FileText className="h-4 w-4" />
              Chamados Recentes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/atalhos')}
              className="flex items-center gap-2 text-[#7c6a3c] border-[#e2d8b8] bg-[#f8f5e4] hover:bg-[#f3ecd2]"
            >
              <ExternalLink className="h-4 w-4" />
              Atalhos
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/usuarios')}
                className="flex items-center gap-2 text-[#7c6a3c] border-[#e2d8b8] bg-[#f8f5e4] hover:bg-[#f3ecd2]"
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