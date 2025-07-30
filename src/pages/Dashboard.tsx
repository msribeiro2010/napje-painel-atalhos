import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BookOpen, Shield, Plus, ExternalLink, StickyNote, Scale, Calendar, Home, Umbrella, Laptop, Video, Users, Sparkles, Search, Brain, Zap, RefreshCw, Lightbulb, BarChart3, Activity } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  const { modalOpen, setModalOpen } = useEventNotifications();
  const [postItOpen, setPostItOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  

  
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
      console.log('🔍 Buscando chamados recentes...');
      
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id, 
          assunto, 
          descricao, 
          status, 
          prioridade, 
          created_at, 
          usuario_criador, 
          categoria, 
          subcategoria, 
          tags, 
          tempo_estimado, 
          data_vencimento,
          anexos, 
          observacoes_internas, 
          historico_status, 
          feedback_usuario,
          numero_protocolo, 
          orgao_julgador, 
          vara_origem, 
          tipo_processo
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('❌ Erro ao buscar chamados:', error);
        throw error;
      }

      console.log('✅ Chamados encontrados:', data?.length || 0);
      console.log('📋 Dados brutos dos chamados:', data);

      // Se não há chamados, criar alguns de teste
      if (!data || data.length === 0) {
        console.log('📝 Criando chamados de teste...');
        const testChamados = [
          {
            id: 'test-1',
            assunto: 'Problema com login no sistema',
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
      }

      // Obter perfis dos usuários
      const chamadosComPerfis: ChamadoComPerfil[] = await Promise.all(
        (data || []).map(async (chamado) => {
          if (!chamado.usuario_criador) {
            return {
              ...chamado,
              usuario_criador_nome: 'Usuário não identificado'
            };
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('nome_completo, email')
            .eq('id', chamado.usuario_criador)
            .single();

          if (profileError) {
            console.warn('⚠️ Erro ao buscar perfil do usuário:', profileError);
          }

          return {
            ...chamado,
            usuario_criador_nome: profile?.nome_completo || profile?.email || 'Usuário não encontrado'
          };
        })
      );

      console.log('✅ Chamados com perfis processados:', chamadosComPerfis.length);
      return chamadosComPerfis;
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
    // Navegar para o resultado selecionado
    switch (result.type) {
      case 'chamado':
        if (result.metadata?.id) {
          navigate(`/chamados/${result.metadata.id}`);
        }
        break;
      case 'atalho':
        if (result.url) {
          window.open(result.url, '_blank');
        } else {
          navigate('/atalhos');
        }
        break;
      case 'usuario':
        navigate('/admin/usuarios');
        break;
      case 'orgao':
        navigate('/orgaos-julgadores');
        break;
      case 'evento':
        navigate('/calendario');
        break;
      case 'memoria':
        navigate('/memorias-importantes');
        break;
      default:
        console.log('Resultado selecionado:', result);
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
      icon: Shield,
      title: "Memórias Importantes",
      description: "Documentos críticos",
      onClick: () => navigate('/memorias-importantes'),
      color: "bg-gradient-to-r from-red-500 to-red-600"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Container principal com padding responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 space-y-6">
        {/* Header Modernizado */}
        <DashboardHeader 
          user={user} 
          onSearch={() => setSmartSearchOpen(true)}
        />

        {/* Busca Inteligente Global */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => setSmartSearchOpen(true)}
            variant="outline"
            size="lg"
            className="w-full max-w-md h-12 justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors bg-white/60 hover:bg-white/80 border-gray-200 dark:border-gray-700 shadow-soft"
          >
            <Search className="h-4 w-4 mr-3" />
            <span>Buscar em qualquer lugar...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-gray-100 dark:bg-gray-800 px-1.5 font-mono text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Coluna Principal */}
          <div className="xl:col-span-2 space-y-6">
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

            {/* Eventos e Notificações */}
            <EventsPanels />
          </div>

          {/* Coluna Lateral - Painéis Horizontais */}
          <div className="xl:col-span-2 space-y-6">
            {/* Linha 1: Insights de IA e Métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Painel de Insights de IA */}
              <div className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-900/90 dark:to-blue-900/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-soft">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    Insights de IA
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 h-7 w-7 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <Lightbulb className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Bem-vindo ao NAPJe!</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Comece criando seu primeiro chamado para organizar suas tarefas e acompanhar o progresso dos seus projetos.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">medium</Badge>
                        <Badge variant="outline" className="text-xs">productivity</Badge>
                      </div>
                      <span className="text-xs text-gray-500">95% Agora 1 pontos</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs">
                    Criar Chamado →
                  </Button>
                </div>
              </div>

              {/* Painel de Métricas */}
              <div className="bg-gradient-to-br from-white/90 to-green-50/50 dark:from-gray-900/90 dark:to-green-900/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-soft">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    Métricas
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Tempo de Resposta</span>
                      <span className="text-xs font-semibold text-green-600">200ms</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Taxa de Erro</span>
                      <span className="text-xs font-semibold text-green-600">0%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Satisfação</span>
                      <span className="text-xs font-semibold text-green-600">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha 2: Notas Rápidas e Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Post-it Notes */}
              <div className="bg-gradient-to-br from-white/90 to-yellow-50/50 dark:from-gray-900/90 dark:to-yellow-900/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-soft">
                      <StickyNote className="h-4 w-4 text-white" />
                    </div>
                    Notas Rápidas
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPostItOpen(true)}
                    className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Minhas Notas</span>
                    <span className="text-xs font-semibold text-yellow-600">1 nota criada</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                    + Nova Nota
                  </Button>
                </div>
                <div className="max-h-[120px] overflow-y-auto mt-3">
                  <PostitNotes />
                </div>
              </div>

              {/* Painel de Status */}
              <div className="bg-gradient-to-br from-white/90 to-purple-50/50 dark:from-gray-900/90 dark:to-purple-900/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-soft">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    Status do Sistema
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Usuários Ativos</span>
                      <span className="text-xs font-semibold text-purple-600">1</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Chamados Abertos</span>
                      <span className="text-xs font-semibold text-purple-600">0</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Sistema</span>
                      <span className="text-xs font-semibold text-green-600">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

      {/* Atalho de teclado para busca */}
      <script>
        {`
          document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              ${smartSearchOpen ? 'false' : 'true'};
            }
          });
        `}
      </script>
    </div>
  );
};

export default Dashboard;