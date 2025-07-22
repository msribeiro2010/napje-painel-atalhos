import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BookOpen, Shield, Plus, ExternalLink, StickyNote, Scale, Calendar } from 'lucide-react';
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
import { UpcomingEventsAlert } from '@/components/UpcomingEventsAlert';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import type { ChamadoComPerfil, DashboardAction } from '@/types/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  const [postItOpen, setPostItOpen] = useState(false);
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
        .select('*')
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

  if (isAdmin) {
    dashboardActions.push({
      title: 'Gerenciar Usuários',
      description: 'Administrar acesso ao sistema',
      icon: Shield,
      onClick: () => navigate('/admin/usuarios'),
      variant: 'outline' as const
    });
    
    dashboardActions.push({
      title: 'Gerenciar Atalhos',
      description: 'Criar e editar grupos e atalhos',
      icon: ExternalLink,
      onClick: () => navigate('/admin/atalhos'),
      variant: 'outline' as const
    });
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader isAdmin={isAdmin} />
        
        <UpcomingEventsAlert />
        
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
    </div>
  );
};

export default Dashboard;