import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BookOpen, Shield, Plus, ExternalLink, StickyNote, Scale, Calendar, Home, Umbrella, Laptop, Video, Users, Sparkles, Search, Brain, Zap, RefreshCw, Lightbulb, BarChart3, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';
import { Badge } from '@/components/ui/badge';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';

import PostitNotes from '@/components/PostitNotes';
import { useChamadosRecentes } from '@/hooks/useChamadosRecentes';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { RecentChamados } from '@/components/dashboard/RecentChamados';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { EventsPanels } from '@/components/EventsPanels';
import { ChatAssistant } from '@/components/ChatAssistant';
import { EventNotificationModal } from '@/components/EventNotificationModal';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import { useWorkCalendar } from '@/hooks/useWorkCalendar';
import type { WorkStatus } from '@/hooks/useWorkCalendar';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ChamadoComPerfil, DashboardAction } from '@/types/dashboard';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useUpcomingEventsModal } from '@/hooks/useUpcomingEventsModal';
import UpcomingEventsModal from '@/components/UpcomingEventsModal';
import UpcomingEventsButton from '@/components/UpcomingEventsButton';
import { SmartSearchDialog } from '@/components/SmartSearchDialog';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { SearchResult } from '@/hooks/useSmartSearch';
import { toast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  const { modalOpen, setModalOpen } = useEventNotifications();
  const [postItOpen, setPostItOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  
  // Atalho de teclado para busca (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSmartSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hook para eventos próximos
  const { 
    isOpen: upcomingEventsOpen, 
    upcomingEvents, 
    openModal: openUpcomingEvents, 
    closeModal: closeUpcomingEvents, 
    hasEvents 
  } = useUpcomingEventsModal();
  const { 
    duplicarChamado, 
    editarChamado, 
    handleExcluirChamado 
  } = useChamadosRecentes();

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

  // Buscar chamados recentes com react-query
  const { data: chamados = [], isLoading: chamadosLoading } = useQuery({
    queryKey: ['dashboard-chamados'],
    queryFn: async () => {
      console.log('🔍 Retornando chamados de teste para demonstração...');
      
      // Por enquanto, sempre retornar dados de teste
      const testChamados = [
        {
          id: 'test-1',
          assunto: 'Questão com login no sistema',
          descricao: 'Usuário não consegue acessar o sistema com suas credenciais',
          status: 'Em andamento',
          prioridade: 'Alta',
          created_at: new Date().toISOString(),
          usuario_criador: user?.id || 'test-user',
          categoria: 'Suporte Técnico',
          subcategoria: 'Autenticação',
          tags: ['login', 'acesso'],
          tempo_estimado: 2,
          data_vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          anexos: [],
          observacoes_internas: 'Chamado criado automaticamente para teste',
          historico_status: [],
          feedback_usuario: '',
          numero_protocolo: 'CHM-2024-001',
          orgao_julgador: 'TRT15',
          vara_origem: '1ª Vara',
          tipo_processo: 'Trabalhista',
          usuario_criador_nome: 'Sistema de Teste'
        },
        {
          id: 'test-2',
          assunto: 'Atualização de documentos',
          descricao: 'Necessário atualizar documentação do projeto',
          status: 'Pendente',
          prioridade: 'Média',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          usuario_criador: user?.id || 'test-user',
          categoria: 'Documentação',
          subcategoria: 'Atualização',
          tags: ['documentação', 'projeto'],
          tempo_estimado: 4,
          data_vencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          anexos: [],
          observacoes_internas: 'Chamado criado automaticamente para teste',
          historico_status: [],
          feedback_usuario: '',
          numero_protocolo: 'CHM-2024-002',
          orgao_julgador: 'TRT15',
          vara_origem: '2ª Vara',
          tipo_processo: 'Trabalhista',
          usuario_criador_nome: 'Sistema de Teste'
        },
        {
          id: 'test-3',
          assunto: 'Configuração de novo usuário',
          descricao: 'Solicitação para criar conta de novo funcionário',
          status: 'Concluído',
          prioridade: 'Baixa',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          usuario_criador: user?.id || 'test-user',
          categoria: 'Recursos Humanos',
          subcategoria: 'Onboarding',
          tags: ['usuário', 'conta'],
          tempo_estimado: 1,
          data_vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          anexos: [],
          observacoes_internas: 'Chamado criado automaticamente para teste',
          historico_status: [],
          feedback_usuario: 'Conta criada com sucesso',
          numero_protocolo: 'CHM-2024-003',
          orgao_julgador: 'TRT15',
          vara_origem: '3ª Vara',
          tipo_processo: 'Trabalhista',
          usuario_criador_nome: 'Sistema de Teste'
        }
      ];
      
      console.log('✅ Chamados de teste criados:', testChamados.length);
      return testChamados;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch a cada 30 segundos
    staleTime: 10000 // Considerar dados frescos por 10 segundos
  });

  // Buscar status do próximo dia
  const tomorrow = addDays(new Date(), 1);
  const { marks: tomorrowMarks, loading: marksLoading } = useWorkCalendar(tomorrow);
  const tomorrowKey = format(tomorrow, 'yyyy-MM-dd');
  const status: WorkStatus | 'none' = tomorrowMarks[tomorrowKey] || 'none';
  const tomorrowDateStr = format(tomorrow, 'dd/MM/yyyy');

  // Buscar eventos personalizados do próximo dia
  const { customEvents, fetchCustomEvents } = useCustomEvents(tomorrow);
  // Filtrar eventos do próximo dia
  const customEventsTomorrow = customEvents.filter(ev => ev.date === tomorrowKey);

  // Cores e ícones para tipos de evento
  const customEventStyles = {
    curso: { color: '#e3f2fd', border: '#2196f3', icon: <BookOpen className="h-5 w-5 text-blue-600 animate-bounce-slow" /> },
    webinario: { color: '#ede7f6', border: '#7c3aed', icon: <Video className="h-5 w-5 text-purple-600 animate-pulse-slow" /> },
    reuniao: { color: '#e8f5e9', border: '#43a047', icon: <Users className="h-5 w-5 text-green-600 animate-fade-slow" /> },
    outro: { color: '#fff8e1', border: '#ffb300', icon: <Sparkles className="h-5 w-5 text-amber-500 animate-bounce-slow" /> },
  };

  const statusLabel = {
    presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Home className="h-4 w-4 text-[#bfae7c] inline" /> },
    ferias: { label: 'Férias', color: '#ffe6e6', icon: <Umbrella className="h-4 w-4 text-[#e6a1a1] inline" /> },
    remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Laptop className="h-4 w-4 text-[#7cc3e6] inline" /> },
    plantao: { label: 'Plantão', color: '#e6ffe6', icon: <Shield className="h-4 w-4 text-[#4caf50] inline" /> },
    folga: { label: 'Folga', color: '#e0e0e0', icon: <Calendar className="h-4 w-4 text-[#757575] inline" /> },
    none: { label: 'Sem marcação', color: '#fff', icon: null },
  };

  const handleSearchResult = (result: SearchResult) => {
    console.log('🎯 Dashboard: Processando resultado selecionado:', result);
    
    try {
      // Mostrar toast de feedback
      toast({
        title: "Navegando...",
        description: `Abrindo: ${result.title}`,
        duration: 2000,
      });
      
      // Verificar se há uma ação específica nos metadados
      if (result.metadata?.action) {
        console.log('🚀 Executando ação específica:', result.metadata.action);
        navigate(`/${result.metadata.action}`);
        return;
      }
      
      // Debug específico para resultados com "problema"
      if (result.title?.toLowerCase().includes('problema')) {
        console.log('🔍 DEBUG: Processando resultado com "problema":', result);
        console.log('🔍 DEBUG: Tipo do resultado:', result.type);
        console.log('🔍 DEBUG: Metadados:', result.metadata);
      }
      
      // Navegar baseado no tipo de forma mais simples e segura
      switch (result.type) {
        case 'chamado':
          console.log('📋 Navegando para chamados');
          navigate('/chamados-recentes');
          break;
          
        case 'conhecimento':
          console.log('📚 Navegando para base de conhecimento');
          // Extrair palavras-chave do título para busca
          let searchTerm = '';
          
          // Se há metadados com tags, usar a primeira tag relevante
          if (result.metadata?.tags && Array.isArray(result.metadata.tags)) {
            searchTerm = result.metadata.tags[0];
          } else {
            // Extrair palavras-chave principais do título
            const title = result.title?.toLowerCase() || '';
            const keywords = ['horário', 'problema', 'usuário', 'backup', 'configuração', 'manual', 'erro', 'sistema'];
            const foundKeyword = keywords.find(keyword => title.includes(keyword));
            searchTerm = foundKeyword || title.split(' ')[0] || '';
          }
          
          if (searchTerm) {
            console.log('🔍 Navegando com termo de busca:', searchTerm);
            navigate(`/base-conhecimento?search=${encodeURIComponent(searchTerm)}`);
          } else {
            navigate('/base-conhecimento');
          }
          break;
          
        case 'atalho':
          console.log('🔗 Navegando para atalhos');
          if (result.url) {
            window.open(result.url, '_blank');
          } else {
            navigate('/atalhos');
          }
          break;
          
        case 'usuario':
          console.log('👥 Navegando para usuários');
          navigate('/admin/usuarios');
          break;
          
        case 'orgao':
          console.log('🏛️ Navegando para órgãos julgadores');
          navigate('/orgaos-julgadores');
          break;
          
        case 'evento':
          console.log('📅 Navegando para calendário');
          navigate('/calendario');
          break;
          
        case 'memoria':
          console.log('🔒 Navegando para memórias importantes');
          navigate('/memorias-importantes');
          break;
          
        default:
          console.log('❓ Tipo de resultado não reconhecido, navegando para chamados');
          navigate('/chamados-recentes');
          break;
      }
    } catch (error) {
      console.error('❌ Erro ao processar resultado da busca:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o resultado. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleExcluir = async (id: string) => {
    await handleExcluirChamado(id);
    // O React Query irá automaticamente revalidar a query
  };

  // Remove the problematic workCalendar code that doesn't match the hook's interface
  const today = new Date();

  const actions: DashboardAction[] = [
    {
      icon: Plus,
      title: "Novo Chamado",
      description: "Criar um novo chamado",
      onClick: () => navigate('/criar-chamado'),
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "Chamados",
      description: "Ver chamados recentes",
      onClick: () => navigate('/chamados-recentes'),
      color: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Atalhos",
      description: "Gerenciar atalhos",
      onClick: () => navigate('/atalhos'),
      color: "bg-gradient-to-r from-yellow-500 to-orange-600"
    },
    {
      icon: BookOpen,
      title: "Base de Conhecimento",
      description: "Consultar documentos",
      onClick: () => navigate('/base-conhecimento'),
      color: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      icon: Scale,
      title: "Órgãos Julgadores",
      description: "Consultar órgãos",
      onClick: () => navigate('/orgaos-julgadores'),
      color: "bg-gradient-to-r from-orange-500 to-orange-600"
    },
    {
      icon: Calendar,
      title: "Calendário",
      description: "Agendar compromissos",
      onClick: () => navigate('/calendario'),
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <ErrorBoundary>
      <ModernLayout>
      {/* Container principal com padding responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 space-y-8">
        {/* Header Modernizado */}
        <DashboardHeader 
          user={user} 
          onSearch={() => setSmartSearchOpen(true)}
        />



        {/* Grid Principal */}
        <ModernGrid cols={4} gap="lg">
          {/* Coluna Principal */}
          <ModernGridItem span={3}>
            <div className="space-y-8">
              {/* Eventos e Notificações */}
              <EventsPanels />
              
              {/* Ações Rápidas Compactas */}
              <DashboardActions actions={actions} />

              {/* Chamados Recentes Modernos */}
              <RecentChamados 
                chamados={chamados}
                isLoading={chamadosLoading}
                onDuplicar={duplicarChamado}
                onEditar={editarChamado}
                onExcluir={handleExcluir}
              />
            </div>
          </ModernGridItem>

          {/* Coluna Lateral - Painéis Verticais */}
          <ModernGridItem span={1}>
            <div className="space-y-6 sticky top-6">
              {/* Painel de Insights de IA */}
              <ModernCard variant="glass" glow={true}>
                <ModernCardHeader
                  title="Insights de IA"
                  description="Recomendações inteligentes"
                  icon={<Brain className="h-5 w-5 text-white" />}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  }
                />
                <ModernCardContent>
                  <div className="space-y-4">
                    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-blue rounded-lg">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">Bem-vindo ao NAPJe!</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Comece criando seu primeiro chamado para organizar suas tarefas e acompanhar o progresso dos seus projetos.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">medium</Badge>
                          <Badge variant="outline" className="text-xs">productivity</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">95% confiança</span>
                      </div>
                    </div>
                    <ModernButton 
                      variant="gradient" 
                      className="w-full"
                      onClick={() => navigate('/criar-chamado')}
                    >
                      Criar Chamado →
                    </ModernButton>
                  </div>
                </ModernCardContent>
              </ModernCard>

              {/* Painel de Métricas - Movido para área administrativa */}
              {/* <ModernCard variant="glass">
                <ModernCardHeader
                  title="Métricas"
                  description="Performance do sistema"
                  icon={<BarChart3 className="h-5 w-5 text-white" />}
                />
                <ModernCardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Tempo de Resposta</span>
                      <span className="text-sm font-semibold text-green-600">200ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Taxa de Erro</span>
                      <span className="text-sm font-semibold text-green-600">0%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Satisfação</span>
                      <span className="text-sm font-semibold text-green-600">100%</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard> */}

              {/* Post-it Notes */}
              <ModernCard variant="glass">
                <ModernCardHeader
                  title="Notas Rápidas"
                  description="Lembretes pessoais"
                  icon={<StickyNote className="h-5 w-5 text-white" />}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPostItOpen(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
                <ModernCardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Minhas Notas</span>
                      <span className="text-sm font-semibold text-orange-600">1 nota</span>
                    </div>
                    <ModernButton 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setPostItOpen(true)}
                    >
                      + Nova Nota
                    </ModernButton>
                    <div className="max-h-32 overflow-y-auto">
                      <PostitNotes />
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>

              {/* Painel de Status - Movido para área administrativa */}
              {/* <ModernCard variant="glass">
                <ModernCardHeader
                  title="Status do Sistema"
                  description="Monitoramento em tempo real"
                  icon={<Activity className="h-5 w-5 text-white" />}
                />
                <ModernCardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Usuários Ativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-purple-600">1</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Chamados Abertos</span>
                      <span className="text-sm font-semibold text-purple-600">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                      <span className="text-sm text-muted-foreground">Sistema</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-green-600">Online</span>
                      </div>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard> */}
            </div>
          </ModernGridItem>
        </ModernGrid>

        {/* Footer Elegante */}
        <DashboardFooter />
      </div>

      {/* Diálogos e Modais */}
      
      {/* Busca Inteligente */}
      <SmartSearchDialog
        isOpen={smartSearchOpen}
        onClose={() => setSmartSearchOpen(false)}
        onResultSelect={handleSearchResult}
        placeholder="Buscar chamados, atalhos, usuários, eventos..."
      />

      {/* Post-it Modal */}
      <Dialog open={postItOpen} onOpenChange={setPostItOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                <StickyNote className="h-4 w-4 text-white" />
              </div>
              Notas Rápidas
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <PostitNotes />
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Assistant */}
      <ChatAssistant isOpen={isOpen} onToggle={toggleChat} />

      {/* Event Notification Modal */}
      <EventNotificationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Upcoming Events Modal */}
      <UpcomingEventsModal
        isOpen={upcomingEventsOpen}
        onClose={closeUpcomingEvents}
        events={upcomingEvents}
      />

      {/* Atalho de teclado para busca implementado via useEffect */}
    </ModernLayout>
    </ErrorBoundary>
  );
};

export default Dashboard;