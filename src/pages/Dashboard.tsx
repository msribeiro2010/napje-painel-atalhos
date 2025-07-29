import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BookOpen, Shield, Plus, ExternalLink, StickyNote, Scale, Calendar, Home, Umbrella, Laptop, Video, Users, Sparkles, Search, Brain } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
import { useWorkCalendar, WorkStatus } from '@/hooks/useWorkCalendar';
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

  // Buscar chamados recentes
  const { data: chamados = [], isLoading: chamadosLoading } = useQuery({
    queryKey: ['dashboard-chamados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          id, assunto, descricao, status, prioridade, created_at, usuario_criador, 
          categoria, subcategoria, tags, tempo_estimado, data_vencimento,
          anexos, observacoes_internas, historico_status, feedback_usuario,
          numero_protocolo, orgao_julgador, vara_origem, tipo_processo
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Obter perfis dos usuários
      const chamadosComPerfis: ChamadoComPerfil[] = await Promise.all(
        (data || []).map(async (chamado) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nome_completo, email')
            .eq('id', chamado.usuario_criador)
            .single();

          return {
            ...chamado,
            usuario_criador_nome: profile?.nome_completo || profile?.email || 'Usuário não encontrado'
          };
        })
      );

      return chamadosComPerfis;
    },
    enabled: !!user
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

  const workCalendar = useWorkCalendar();
  const today = new Date();
  const isBusinessDay = workCalendar?.getWorkStatus(today) === WorkStatus.WORKING;
  const nextBusinessDay = workCalendar?.getNextBusinessDay(today);

  const actions: DashboardAction[] = [
    {
      icon: Plus,
      label: "Novo Chamado",
      description: "Criar um novo chamado",
      onClick: () => navigate('/criar-chamado'),
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      label: "Chamados",
      description: "Ver chamados recentes",
      onClick: () => navigate('/chamados-recentes'),
      color: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      icon: BookOpen,
      label: "Base de Conhecimento",
      description: "Consultar documentos",
      onClick: () => navigate('/base-conhecimento'),
      color: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      icon: Scale,
      label: "Órgãos Julgadores",
      description: "Consultar órgãos",
      onClick: () => navigate('/orgaos-julgadores'),
      color: "bg-gradient-to-r from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      label: "Memórias Importantes",
      description: "Documentos críticos",
      onClick: () => navigate('/memorias-importantes'),
      color: "bg-gradient-to-r from-red-500 to-red-600"
    },
    {
      icon: Calendar,
      label: "Calendário",
      description: "Agendar compromissos",
      onClick: () => navigate('/calendario'),
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600"
    }
  ];

  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Container principal com padding responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 space-y-8">
        {/* Header Modernizado */}
        <DashboardHeader 
          user={user} 
          isBusinessDay={isBusinessDay}
          nextBusinessDay={nextBusinessDay}
          onSearch={() => setSmartSearchOpen(true)}
        />

        {/* Busca Inteligente Global */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => setSmartSearchOpen(true)}
            variant="outline"
            size="lg"
            className="w-full max-w-md h-12 justify-start text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4 mr-3" />
            <span>Buscar em qualquer lugar...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="xl:col-span-2 space-y-8">
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

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Painel de Insights de IA */}
            <AIInsightsPanel className="h-[600px]" />

            {/* Post-it Notes */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-yellow-500" />
                  Notas Rápidas
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPostItOpen(true)}
                  className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <PostitNotes />
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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-yellow-500" />
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