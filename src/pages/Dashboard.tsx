import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, StickyNote, Scale, Calendar, Zap, Building2, Home, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useShortcutsPreferences } from '@/hooks/useShortcutsPreferences';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';

import { ModernLayout } from '@/components/layout/ModernLayout';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { NextOnCallPanel } from '@/components/dashboard/NextOnCallPanel';
import { MonthlyBirthdaysPanel } from '@/components/dashboard/MonthlyBirthdaysPanel';

import PostitNotes from '@/components/PostitNotes';
import { useChamadosRecentes } from '@/hooks/useChamadosRecentes';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { RecentChamados } from '@/components/dashboard/RecentChamados';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { ChatAssistant } from '@/components/ChatAssistant';
// import { EventNotificationModal } from '@/components/EventNotificationModal';
// import { EventNotificationToast } from '@/components/EventNotificationToast';
// import { useEventNotifications } from '@/hooks/useEventNotifications';
// import { useEventReminders } from '@/hooks/useEventReminders';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import { usePostItNotes } from '@/hooks/usePostItNotes';


import { ptBR } from 'date-fns/locale';
import type { ChamadoComPerfil, DashboardAction } from '@/types/dashboard';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { SmartSearchDialog } from '@/components/SmartSearchDialog';

import { SearchResult } from '@/hooks/useSmartSearch';
import { toast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';



const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChatAssistant();
  // const { modalOpen, setModalOpen } = useEventNotifications();
  // useEventReminders(); // Hook de lembretes
  const { notes: postItNotes, loading: notesLoading, stats: notesStats, latestNote } = usePostItNotes();
  
  // Alertas automáticos removidos - mantendo apenas eventos da semana via botão

  const [postItOpen, setPostItOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  
  // Estado e hooks para favoritos das ações rápidas
  const [actionFavorites, setActionFavorites] = useState<string[]>([]);
  const { preferences, updatePreferences } = useShortcutsPreferences();
  
  // Carregar favoritos das ações do localStorage/preferências
  useEffect(() => {
    if (!preferences.loading && preferences.actionFavorites) {
      setActionFavorites(preferences.actionFavorites);
    }
  }, [preferences.actionFavorites, preferences.loading]);
  
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

  // Buscar configuração dos links do Acesso Rápido
  const { data: quickAccessConfig } = useQuery({
    queryKey: ['system-config', 'quick_access_links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'quick_access_links')
        .single();

      if (error) {
        console.warn('Erro ao buscar configuração do Acesso Rápido:', error);
        // Retornar configuração padrão se falhar
        return [
          {
            name: 'Assyst Query 996',
            url: 'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=996&queryProfileForm.columnProfileId=67',
            type: 'url'
          },
          {
            name: 'Gmail',
            url: 'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ifkv=AcMMx-fJZqEhabl9HDEfW2R7SrGxQKLfCcVCZrbfUkrYapnrKOuYor_ptr3gP8dRypgOM6siUZ--&rip=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-1241181511%3A1732804609017929&ddm=1',
            type: 'url'
          },
          {
            name: 'Assyst Query 423',
            url: 'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=423&queryProfileForm.columnProfileId=67',
            type: 'url'
          }
        ];
      }
      
      return data?.value || [];
    },
    enabled: !!user?.id
  });

  // Buscar configuração dos aplicativos locais
  const { data: quickAccessApps } = useQuery({
    queryKey: ['system-config', 'quick_access_apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'quick_access_apps')
        .single();

      if (error) {
        console.warn('Erro ao buscar aplicativos do Acesso Rápido:', error);
        return [];
      }
      
      // Filtrar apenas aplicativos habilitados
      return (data?.value || []).filter((app: any) => app.enabled);
    },
    enabled: !!user?.id
  });

  // Função para detectar sistema operacional
  const getOperatingSystem = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('win') !== -1) return 'windows';
    if (userAgent.indexOf('mac') !== -1) return 'mac';
    if (userAgent.indexOf('linux') !== -1) return 'linux';
    return 'unknown';
  };

  // Função para tentar abrir aplicativo local
  const tryOpenLocalApp = (app: any) => {
    const os = getOperatingSystem();
    const paths = app.paths[os] || [];
    
    console.log(`🔥 Tentando abrir ${app.name} no ${os}...`);
    
    // Para aplicativos locais, tentaremos diferentes abordagens
    if (os === 'windows') {
      // No Windows, podemos tentar usar protocolos customizados
      if (app.executable === 'firefox') {
        window.open('firefox:', '_blank');
        return true;
      } else if (app.executable === 'chrome') {
        window.open('chrome:', '_blank');
        return true;
      } else if (app.executable === 'calc') {
        window.open('calculator:', '_blank');
        return true;
      }
    } else if (os === 'mac') {
      // No Mac, podemos tentar usar protocolos de aplicativo
      if (app.executable === 'firefox') {
        window.location.href = 'firefox://';
        return true;
      }
    }
    
    // Fallback: tentar abrir como URL (pode não funcionar)
    try {
      const appUrl = `${app.executable}://`;
      window.open(appUrl, '_blank');
      return true;
    } catch (error) {
      console.warn(`Não foi possível abrir ${app.name}:`, error);
      return false;
    }
  };

  // Função para abrir múltiplas abas e aplicativos (Acesso Rápido)
  const handleAcessoRapido = () => {
    const links = quickAccessConfig || [];
    const apps = quickAccessApps || [];
    const totalItems = links.length + apps.length;

    if (totalItems === 0) {
      toast({
        title: "ℹ️ Nenhum item configurado",
        description: "Configure links e aplicativos na área administrativa.",
        duration: 3000,
      });
      return;
    }

    try {
      console.log('🚀 Iniciando Acesso Rápido...');
      console.log(`📊 Total: ${totalItems} itens (${links.length} links + ${apps.length} apps)`);
      
      let successCount = 0;
      let failCount = 0;
      const results: string[] = [];

      // Abrir links web primeiro
      if (links.length > 0) {
        // Abrir primeiro link imediatamente
        const firstWindow = window.open(links[0].url, '_blank', 'noopener,noreferrer');
        if (firstWindow && !firstWindow.closed) {
          successCount++;
          results.push(`✅ ${links[0].name}`);
          console.log('Primeiro link aberto:', links[0].name);
        } else {
          failCount++;
          results.push(`❌ ${links[0].name}`);
        }
        
        // Abrir outros links com delay
        links.slice(1).forEach((link, index) => {
          setTimeout(() => {
            const tempLink = document.createElement('a');
            tempLink.href = link.url;
            tempLink.target = '_blank';
            tempLink.rel = 'noopener noreferrer';
            tempLink.style.display = 'none';
            
            document.body.appendChild(tempLink);
            
            try {
              tempLink.click();
              console.log(`Link aberto: ${link.name}`);
              results.push(`✅ ${link.name}`);
            } catch (error) {
              console.warn(`Erro ao abrir link: ${link.name}`, error);
              results.push(`❌ ${link.name}`);
            } finally {
              document.body.removeChild(tempLink);
            }
          }, (index + 1) * 100); // 100ms entre cada link
        });
      }

      // Tentar abrir aplicativos locais
      if (apps.length > 0) {
        apps.forEach((app, index) => {
          setTimeout(() => {
            try {
              const opened = tryOpenLocalApp(app);
              if (opened) {
                console.log(`Aplicativo aberto: ${app.name}`);
                results.push(`🦊 ${app.name}`);
              } else {
                console.warn(`Falha ao abrir: ${app.name}`);
                results.push(`❌ ${app.name} (não disponível)`);
              }
            } catch (error) {
              console.error(`Erro ao abrir aplicativo ${app.name}:`, error);
              results.push(`❌ ${app.name} (erro)`);
            }
          }, links.length * 100 + index * 200); // Delay após os links
        });
      }

      // Toast de feedback imediato
      toast({
        title: "🚀 Acesso Rápido Ativado",
        description: `Abrindo ${totalItems} itens: ${links.length} links + ${apps.length} aplicativos`,
        duration: 4000,
      });

      // Toast com resultados após algum tempo
      setTimeout(() => {
        const linkResults = results.filter(r => r.includes('✅')).length;
        toast({
          title: "📊 Resultado do Acesso Rápido",
          description: `${linkResults}/${totalItems} itens abertos com sucesso`,
          duration: 6000,
        });
      }, Math.max(2000, totalItems * 150));

      // Toast com dicas se necessário
      setTimeout(() => {
        toast({
          title: "💡 Dicas",
          description: "Se alguns itens não abriram: 1) Permita pop-ups no navegador 2) Certifique-se que os aplicativos estão instalados",
          duration: 7000,
        });
      }, 3000);

    } catch (error) {
      console.error('Erro geral no Acesso Rápido:', error);
      toast({
        title: "❌ Erro no Acesso Rápido",
        description: "Ocorreu um erro. Verifique o console para detalhes.",
        duration: 5000,
      });
    }
  };

  // Funções para gerenciar favoritos das ações rápidas
  const toggleActionFavorite = (actionId: string) => {
    console.log('🔄 Toggle favorite action:', actionId);
    setActionFavorites(prev => {
      const newFavorites = prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId];
      
      console.log('📊 Favoritos das ações atualizados:', newFavorites);
      
      // Salvar nas preferências
      updatePreferences({ actionFavorites: newFavorites });
      
      return newFavorites;
    });
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
    },
    {
      icon: ExternalLink,
      title: "Acesso Rápido",
      description: "Abrir sistemas principais",
      onClick: handleAcessoRapido,
      color: "bg-gradient-to-r from-green-500 to-green-600"
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
              
              {/* Ações Rápidas Compactas */}
              <DashboardActions 
                actions={actions}
                favorites={actionFavorites}
                onToggleFavorite={toggleActionFavorite}
              />

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
            {/* Próximo Plantão */}
            <NextOnCallPanel />

            {/* Aniversariantes do Mês */}
            <MonthlyBirthdaysPanel />



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
      
      {/* Weekly Planning Modal - REMOVIDO - Mantendo apenas eventos via botão */}
      </ModernLayout>
    </ErrorBoundary>
  );
};

export default Dashboard;