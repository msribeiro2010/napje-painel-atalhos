import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BookOpen, Shield, Plus, ExternalLink, StickyNote, Scale, Calendar, Home, Umbrella, Laptop, Video, Users, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import PostitNotes from '@/components/PostitNotes';
import { useChamadosRecentes } from '@/hooks/useChamadosRecentes';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { RecentChamados } from '@/components/dashboard/RecentChamados';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { EventsPanels } from '@/components/EventsPanels';
import { ChatAssistant } from '@/components/ChatAssistant';
import { SmartEventNotifications } from '@/components/SmartEventNotifications';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  const { modalOpen, setModalOpen } = useEventNotifications();
  const [postItOpen, setPostItOpen] = useState(false);
  

  
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
  const { data: chamadosRecentes = [], refetch } = useQuery<ChamadoComPerfil[]>({
    queryKey: ['chamados-recentes-dashboard'],
    queryFn: async () => {
      const { data: chamados, error } = await supabase
        .from('chamados')
        .select('*, titulo')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Buscar os perfis dos criadores
      const chamadosComPerfis: ChamadoComPerfil[] = await Promise.all(
        chamados.map(async (chamado): Promise<ChamadoComPerfil> => {
          if (chamado.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('nome_completo, email')
              .eq('id', chamado.created_by)
              .single();
            
            return { ...chamado, created_by_profile: profile };
          }
          return chamado as ChamadoComPerfil;
        })
      );

      return chamadosComPerfis;
    },
    enabled: !!user?.id
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

  const handleExcluir = async (id: string) => {
    await handleExcluirChamado(id);
    refetch(); // Atualizar a lista
  };

  const dashboardActions: DashboardAction[] = [
    {
      title: 'Criar Chamado',
      description: 'Gerar nova issue JIRA',
      icon: Plus,
      onClick: () => navigate('/criar-chamado'),
      variant: 'default' as const
    },
    {
      title: 'Base de Conhecimento',
      description: 'Consultar soluções documentadas',
      icon: BookOpen,
      onClick: () => navigate('/base-conhecimento'),
      variant: 'outline' as const
    },
    {
      title: 'Calendário de Trabalho',
      description: 'Organize férias, folgas, presencial e remoto',
      icon: Calendar,
      onClick: () => navigate('/calendario'),
      variant: 'outline' as const
    },
    {
      title: 'Atalhos',
      description: 'Central de acesso aos sistemas',
      icon: ExternalLink,
      onClick: () => navigate('/atalhos'),
      variant: 'outline' as const
    },
    {
      title: 'Post-it',
      description: 'Notas e anotações rápidas',
      icon: StickyNote,
      onClick: () => setPostItOpen(true),
      variant: 'outline' as const
    },
    {
      title: 'Órgãos Julgadores',
      description: 'Consultar códigos de órgãos do TRT15',
      icon: Scale,
      onClick: () => navigate('/orgaos-julgadores'),
      variant: 'outline' as const
    }
  ];



  // Botões administrativos foram movidos para o menu do usuário

  // Verificar se há informações relevantes para mostrar
  const hasWorkInfo = status !== 'none' || customEventsTomorrow.length > 0;

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      {/* Aviso do status do próximo dia - só aparece quando há marcação */}
      {hasWorkInfo && (
        <div className="max-w-6xl mx-auto mb-4 space-y-2">
          {/* Status de trabalho - só mostra se não for 'none' */}
          {status !== 'none' && (
            <div className="rounded-lg shadow p-4 flex items-center gap-3" style={{ background: statusLabel[status].color }}>
              {statusLabel[status].icon}
              <div className="flex flex-col">
                <span className="font-bold text-[#7c6a3c] text-lg tracking-wide font-mono">
                  Amanhã: {statusLabel[status].label}
                </span>
                <span className="text-[#8b7355] text-sm font-medium tracking-wider uppercase">
                  {format(tomorrow, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          )}
          {/* Avisos de eventos personalizados do próximo dia */}
          {customEventsTomorrow.map(ev => (
            <div
              key={ev.id}
              className="rounded-lg shadow flex items-center gap-3 px-4 py-3 border-l-4 animate-fade-in"
              style={{ background: customEventStyles[ev.type]?.color, borderColor: customEventStyles[ev.type]?.border }}
            >
              {customEventStyles[ev.type]?.icon}
              <div>
                <span className="font-semibold text-base mr-2">Amanhã: {ev.title}</span>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-white/60 text-gray-700 ml-2">{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
                {ev.description && <div className="text-xs text-gray-600 mt-1">{ev.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <DashboardHeader isAdmin={isAdmin} />
        
        <SmartEventNotifications />
        
        <EventsPanels />
        
        <DashboardActions actions={dashboardActions} />

        <RecentChamados 
          chamados={chamadosRecentes}
          onEdit={editarChamado}
          onDuplicate={duplicarChamado}
          onDelete={handleExcluir}
        />

        <DashboardFooter />
      </div>
      
      <ChatAssistant isOpen={isOpen} onToggle={toggleChat} />
      
      <EventNotificationModal isOpen={modalOpen} onOpenChange={setModalOpen} />
      
      <Dialog open={postItOpen} onOpenChange={setPostItOpen}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                <StickyNote className="h-5 w-5 text-white" />
              </div>
              Post-it
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 h-full overflow-auto">
            <PostitNotes />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Eventos Próximos */}
      <UpcomingEventsModal 
        isOpen={upcomingEventsOpen}
        onClose={closeUpcomingEvents}
        events={upcomingEvents}
      />
      
      {/* Botão Flutuante de Eventos Próximos */}
      <UpcomingEventsButton 
        eventCount={upcomingEvents.length}
        onClick={openUpcomingEvents}
        hasNewEvents={hasEvents}
      />
    </div>
  );
};

export default Dashboard;