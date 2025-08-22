import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, StickyNote, Scale, Calendar, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';

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
// import { EventNotificationModal } from '@/components/EventNotificationModal';
// import { EventNotificationToast } from '@/components/EventNotificationToast';
// import { useEventNotifications } from '@/hooks/useEventNotifications';
// import { useEventReminders } from '@/hooks/useEventReminders';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import { usePostItNotes } from '@/hooks/usePostItNotes';
import { usePlantaoNotifications } from '@/hooks/usePlantaoNotifications';

import { ptBR } from 'date-fns/locale';
import type { ChamadoComPerfil, DashboardAction } from '@/types/dashboard';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { SmartSearchDialog } from '@/components/SmartSearchDialog';

import { SearchResult } from '@/hooks/useSmartSearch';
import { toast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PlantaoPanel } from '@/components/PlantaoPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  // const { modalOpen, setModalOpen } = useEventNotifications();
  // useEventReminders(); // Hook de lembretes
  const { notes: postItNotes, loading: notesLoading, stats: notesStats, latestNote } = usePostItNotes();
  
  // Hook para notificações de plantão
  usePlantaoNotifications();

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

  // Hook para eventos próximos removido
  const { 
    duplicarChamado: duplicarChamadoOriginal, 
    editarChamado: editarChamadoOriginal
  } = useChamadosRecentes();
  
  // Função para recarregar os chamados
  const recarregarChamados = async () => {
    setChamadosLoading(true);
    try {
      console.log('🔄 Recarregando chamados...');
      const { data, error } = await supabase
        .from('chamados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) {
        console.error('❌ Erro ao recarregar:', error);
      } else {
        // Type assertion para usar a estrutura correta da tabela
         const chamadosData = (data as unknown) as Array<{
           id: string;
           titulo: string;
           descricao: string;
           created_at: string;
           numero_processo: string | null;
           grau: string | null;
           orgao_julgador: string | null;
           perfil_usuario_afetado: string | null;
           nome_usuario_afetado: string | null;
           cpf_usuario_afetado: string | null;
           chamado_origem: string | null;
           status: string | null;
           tipo: string | null;
           prioridade: number | null;
           assunto_id: string | null;
           created_by: string | null;
           updated_at: string;
           oj_detectada: string | null;
         }>;
        
        const chamadosFormatados = (chamadosData || []).map(chamado => ({
          id: chamado.id,
          titulo: chamado.titulo || 'Sem título',
          descricao: chamado.descricao || 'Sem descrição',
          grau: chamado.grau,
          numero_processo: chamado.numero_processo,
          orgao_julgador: chamado.orgao_julgador,
          perfil_usuario_afetado: chamado.perfil_usuario_afetado,
          nome_usuario_afetado: chamado.nome_usuario_afetado,
          cpf_usuario_afetado: chamado.cpf_usuario_afetado,
          chamado_origem: chamado.chamado_origem,
          created_at: chamado.created_at,
          status: chamado.status || 'Aberto'
        }));
        
        setChamadosRecentes(chamadosFormatados);
        console.log('✅ Chamados recarregados:', chamadosFormatados.length);
      }
    } catch (err) {
      console.error('❌ Erro ao recarregar chamados:', err);
    } finally {
      setChamadosLoading(false);
    }
  };
  
  // Wrappers para as funções originais com recarga
  const duplicarChamado = (chamado: any) => {
    duplicarChamadoOriginal(chamado);
    // Recarregar após um pequeno delay para dar tempo da navegação
    setTimeout(recarregarChamados, 500);
  };
  
  const editarChamado = (chamado: any) => {
    editarChamadoOriginal(chamado);
    // Recarregar após um pequeno delay para dar tempo da navegação
    setTimeout(recarregarChamados, 500);
  };

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

  // Busca direta e simples dos chamados
  const [chamadosRecentes, setChamadosRecentes] = useState<any[]>([]);
  const [chamadosLoading, setChamadosLoading] = useState(true);
  
  useEffect(() => {
    const buscarChamadosSimples = async () => {
      setChamadosLoading(true);
      try {
        console.log('🔍 Buscando chamados diretamente...');
        const { data, error } = await supabase
          .from('chamados')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) {
          console.error('❌ Erro:', error);
          setChamadosRecentes([]);
        } else {
          console.log('✅ Chamados encontrados:', data?.length || 0);
          console.log('📋 Dados:', data);
          
          // Type assertion para usar a estrutura correta da tabela
           const chamadosData = (data as unknown) as Array<{
             id: string;
             titulo: string;
             descricao: string;
             created_at: string;
             numero_processo: string | null;
             grau: string | null;
             orgao_julgador: string | null;
             perfil_usuario_afetado: string | null;
             nome_usuario_afetado: string | null;
             cpf_usuario_afetado: string | null;
             chamado_origem: string | null;
             status: string | null;
             tipo: string | null;
             prioridade: number | null;
             assunto_id: string | null;
             created_by: string | null;
             updated_at: string;
             oj_detectada: string | null;
           }>;
          
          // Mapear para formato esperado pelo componente RecentChamados
        const chamadosFormatados = (chamadosData || []).map(chamado => ({
          id: chamado.id,
          assunto: chamado.titulo || 'Sem título',
          descricao: chamado.descricao || 'Sem descrição',
          categoria: chamado.grau,
          numero_processo: chamado.numero_processo,
          orgao_julgador: chamado.orgao_julgador,
          perfil_usuario_afetado: chamado.perfil_usuario_afetado,
          usuario_criador_nome: chamado.nome_usuario_afetado,
          cpf_usuario_afetado: chamado.cpf_usuario_afetado,
          chamado_origem: chamado.chamado_origem,
          created_at: chamado.created_at,
          status: chamado.status || 'Aberto'
        }));
          
          setChamadosRecentes(chamadosFormatados);
        }
      } catch (err) {
        console.error('❌ Erro na busca:', err);
        setChamadosRecentes([]);
      } finally {
        setChamadosLoading(false);
      }
    };
    
    buscarChamadosSimples();
  }, []);
  
  // Debug: Testar busca direta na tabela
  const testarBuscaDireta = async () => {
    try {
      console.log('🔍 Testando busca direta na tabela chamados...');
      const { data, error, count } = await supabase
        .from('chamados')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
        
      console.log('📊 Total de chamados na tabela:', count);
      console.log('📋 Dados encontrados:', data?.length || 0);
      console.log('📋 Todos os chamados:', data);
      
      if (error) {
        console.error('❌ Erro na busca direta:', error);
      } else {
        toast({
          title: "Debug: Dados da Tabela",
          description: `Encontrados ${count} chamados na tabela. Veja o console para detalhes.`,
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('❌ Erro no teste direto:', err);
    }
  };
  
  useEffect(() => {
    // Executar teste apenas uma vez
    const testKey = `debug_test_${new Date().toDateString()}`;
    if (!sessionStorage.getItem(testKey)) {
      setTimeout(testarBuscaDireta, 1000);
      sessionStorage.setItem(testKey, 'true');
    }
  }, []);
  
  // Mapear os dados para o formato esperado pelo componente - REMOVIDO
  // Agora usando diretamente chamadosRecentes que já está no formato correto
  // const chamados = chamadosRecentes.map((chamado) => ({ ... }));

  // Debug: Log dos chamados carregados
  useEffect(() => {
    if (!chamadosLoading) {
      console.log('📋 Dashboard: Chamados carregados:', chamadosRecentes.length);
      console.log('📋 Dashboard: Dados dos chamados:', chamadosRecentes.map(c => ({
         id: c.id,
         assunto: c.assunto,
         created_at: c.created_at
       })));
    }
  }, [chamadosRecentes, chamadosLoading]);
  
  // Debug: Função para testar exclusão
  const testarExclusao = async () => {
    if (chamadosRecentes.length > 0) {
      const primeiroId = chamadosRecentes[0].id;
      console.log('🧪 Testando exclusão do chamado:', primeiroId);
      await handleExcluir(primeiroId);
    } else {
      console.log('⚠️ Nenhum chamado para testar exclusão');
    }
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
      
      // Debug específico para resultados importantes
      if (result.title?.toLowerCase().includes('problema') || result.title?.toLowerCase().includes('perito')) {
        console.log('🔍 DEBUG: Processando resultado importante:', result);
        console.log('🔍 DEBUG: Tipo do resultado:', result.type);
        console.log('🔍 DEBUG: Metadados:', result.metadata);
      }
      
      // Navegar baseado no tipo com contexto específico
      switch (result.type) {
        case 'chamado': {
          console.log('📋 Navegando para chamado específico');
          console.log('🔍 Dados do resultado:', {
            id: result.id,
            title: result.title,
            searchTerm: result.metadata?.searchTerm,
            originalQuery: result.metadata?.originalQuery
          });
          
          // Navegar para chamados recentes com termo de busca para filtrar
          const searchTerm = result.metadata?.searchTerm || result.metadata?.originalQuery || result.title;
          const navigationUrl = `/chamados-recentes?search=${encodeURIComponent(searchTerm)}&highlight=${encodeURIComponent(result.id)}`;
          
          console.log('🚀 URL de navegação:', navigationUrl);
          navigate(navigationUrl);
          break;
        }
        
        case 'conhecimento': {
          console.log('📚 Navegando para base de conhecimento');
          // Usar o termo de busca dos metadados se disponível
          let knowledgeSearchTerm = result.metadata?.searchTerm || '';
          
          // Se não há termo nos metadados, extrair do título
          if (!knowledgeSearchTerm) {
            // Se há metadados com tags, usar a primeira tag relevante
            if (result.metadata?.tags && Array.isArray(result.metadata.tags)) {
              knowledgeSearchTerm = result.metadata.tags[0];
            } else {
              // Extrair palavras-chave principais do título
              const title = result.title?.toLowerCase() || '';
              const keywords = ['horário', 'problema', 'perito', 'usuário', 'backup', 'configuração', 'manual', 'erro', 'sistema'];
              const foundKeyword = keywords.find(keyword => title.includes(keyword));
              knowledgeSearchTerm = foundKeyword || title.split(' ')[0] || '';
            }
          }
          
          if (knowledgeSearchTerm) {
            console.log('🔍 Navegando com termo de busca:', knowledgeSearchTerm);
            navigate(`/base-conhecimento?search=${encodeURIComponent(knowledgeSearchTerm)}&highlight=${encodeURIComponent(result.id)}`);
          } else {
            navigate('/base-conhecimento');
          }
          break;
        }
        
        case 'atalho': {
          console.log('🔗 Navegando para atalho');
          if (result.url) {
            window.open(result.url, '_blank');
          } else {
            const atalhoSearchTerm = result.metadata?.searchTerm || result.title;
            navigate(`/atalhos?search=${encodeURIComponent(atalhoSearchTerm)}`);
          }
          break;
        }
        
        case 'usuario': {
          console.log('👥 Navegando para usuários');
          const userSearchTerm = result.metadata?.searchTerm || result.title;
          navigate(`/admin/usuarios?search=${encodeURIComponent(userSearchTerm)}`);
          break;
        }
        
        default: {
          // Para tipos não definidos no SearchResult, navegamos para páginas específicas
          if ((result.type as string) === 'orgao') {
            console.log('🏛️ Navegando para órgãos julgadores');
            const orgaoSearchTerm = result.metadata?.searchTerm || result.title;
            navigate(`/orgaos-julgadores?search=${encodeURIComponent(orgaoSearchTerm)}`);
          } else if ((result.type as string) === 'evento') {
            console.log('📅 Navegando para calendário');
            navigate('/calendario');
          } else if ((result.type as string) === 'memoria') {
            console.log('🔒 Navegando para memórias importantes');
            const memoriaSearchTerm = result.metadata?.searchTerm || result.title;
            navigate(`/memorias-importantes?search=${encodeURIComponent(memoriaSearchTerm)}`);
          } else {
            console.log('❓ Tipo de resultado não reconhecido, navegando para chamados');
            const defaultSearchTerm = result.metadata?.searchTerm || result.title;
            navigate(`/chamados-recentes?search=${encodeURIComponent(defaultSearchTerm)}`);
          }
          break;
        }
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
    
    setSmartSearchOpen(false);
  };

  const handleExcluir = async (id: string) => {
    try {
      console.log('🗑️ Excluindo chamado:', id);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário atual:', user?.id);
      
      // Excluir do banco de dados
      const { error, data } = await supabase
        .from('chamados')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Erro ao excluir chamado:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Erro ao excluir",
          description: `${error.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      console.log('📋 Dados excluídos:', data);

      // Remover da lista local imediatamente
      setChamadosRecentes(prev => prev.filter(chamado => chamado.id !== id));
      
      console.log('✅ Chamado excluído com sucesso');
      toast({
        title: "Sucesso",
        description: "Chamado excluído com sucesso",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao excluir chamado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir chamado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };



  const actions: DashboardAction[] = [
    {
      icon: Plus,
      title: "Novo Chamado",
      description: "Criar um novo chamado",
      onClick: () => navigate('/criar-chamado'),
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Calendário",
      description: "Agendar compromissos",
      onClick: () => navigate('/calendario'),
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600"
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
                chamados={chamadosRecentes}
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
              {/* Seção de Insights de IA removida para interface mais limpa */}

              {/* Painel de Plantões */}
              <PlantaoPanel />

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

              {/* Notas Rápidas */}
              <ModernCard variant="glass" className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/30 dark:border-yellow-700/30">
                <ModernCardHeader
                  title="Notas Rápidas"
                  description="Lembretes e anotações inteligentes"
                  icon={
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                      <StickyNote className="h-5 w-5 text-white" />
                    </div>
                  }
                  action={
                    <ModernButton
                      variant="gradient"
                      size="sm"
                      onClick={() => setPostItOpen(true)}
                      icon={<Plus className="h-4 w-4" />}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    >
                      Nova Nota
                    </ModernButton>
                  }
                />
                <ModernCardContent>
                  <div className="space-y-4">
                    {notesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : latestNote ? (
                      /* Preview da nota mais recente */
                      <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-600/50 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex-shrink-0">
                            <StickyNote className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-foreground">Nota Recente</h4>
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                                Ativa
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {latestNote.content || 'Nota sem conteúdo'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{new Date(latestNote.created_at).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span>{new Date(latestNote.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Estado vazio */
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <StickyNote className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Organize suas ideias</h4>
                        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                          Crie notas rápidas para lembretes importantes
                        </p>
                        <ModernButton 
                          variant="gradient" 
                          size="sm"
                          onClick={() => setPostItOpen(true)}
                          icon={<Plus className="h-4 w-4" />}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                        >
                          Criar Primeira Nota
                        </ModernButton>
                      </div>
                    )}
                    
                    {/* Estatísticas Modernizadas - apenas se houver notas */}
                    {postItNotes.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                          <div className="relative text-center p-4 bg-gradient-to-br from-white/90 to-orange-50/90 dark:from-gray-800/90 dark:to-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-200/40 dark:border-orange-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">{notesStats.total}</div>
                            <div className="text-xs text-muted-foreground font-medium">Notas Ativas</div>
                          </div>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                          <div className="relative text-center p-4 bg-gradient-to-br from-white/90 to-green-50/90 dark:from-gray-800/90 dark:to-green-900/30 backdrop-blur-sm rounded-2xl border border-green-200/40 dark:border-green-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1">{notesStats.today}</div>
                            <div className="text-xs text-muted-foreground font-medium">Criadas Hoje</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Botão para gerenciar - Modernizado */}
                    {postItNotes.length > 0 && (
                      <ModernButton 
                        variant="gradient" 
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                        onClick={() => setPostItOpen(true)}
                        icon={<StickyNote className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />}
                      >
                        <span className="flex items-center gap-2">
                          Gerenciar Notas
                          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                        </span>
                      </ModernButton>
                    )}
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

      {/* Event Notification Modal - REMOVIDO */}
      {/* <EventNotificationModal isOpen={modalOpen} onOpenChange={setModalOpen} /> */}

      {/* Event Notification Toast - REMOVIDO */}
      {/* <EventNotificationToast /> */}

      {/* Upcoming Events Modal - REMOVIDO */}
      </ModernLayout>
    </ErrorBoundary>
  );
};

export default Dashboard;