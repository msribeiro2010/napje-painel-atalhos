import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Shield, Lock, Bot, ExternalLink, Bell, BarChart3, Calendar, Database } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  nome_completo: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
}

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  // Debug: Log do status do perfil
  useEffect(() => {
    if (profile) {
      console.log('🔍 UserMenu Debug:', {
        userId: profile.id,
        email: profile.email,
        nome: profile.nome_completo,
        isAdmin: profile.is_admin,
        hasAdminAccess: profile.is_admin === true
      });
    }
  }, [profile]);

  // Escutar mudanças no perfil para atualizar em tempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Perfil atualizado:', payload);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user || !profile) {
    return null;
  }

  // Debug adicional antes do render
  console.log('🎛️ Renderizando UserMenu:', {
    profileExists: !!profile,
    isAdmin: profile.is_admin,
    adminMenuWillShow: profile.is_admin === true
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative flex items-center gap-3 h-auto p-2 rounded-xl hover:shadow-medium transition-all duration-200 hover:bg-gradient-accent"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage 
              src={profile.avatar_url || ''} 
              alt={profile.nome_completo || 'Avatar'} 
            />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
              {getInitials(profile.nome_completo)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {profile.nome_completo || 'Nome não informado'}
            </span>
            {/* Exibir perfil abaixo do nome */}
            {profile.is_admin && (
              <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3 text-primary" /> Administrador
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-card/95 backdrop-blur-sm border shadow-xl" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage 
                src={profile.avatar_url || ''} 
                alt={profile.nome_completo || 'Avatar'} 
              />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
                {getInitials(profile.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile.nome_completo || 'Nome não informado'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
              {profile.is_admin && (
                <div className="flex items-center gap-1 mt-2">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Administrador</span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="cursor-pointer hover:bg-gradient-accent"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/memorias-importantes')}
          className="cursor-pointer hover:bg-gradient-accent"
        >
          <Lock className="mr-2 h-4 w-4" />
          <span>Memórias Importantes</span>
        </DropdownMenuItem>
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/usuarios')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Gerenciar Usuários</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/atalhos')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Gerenciar Atalhos</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/notificacoes')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Configurar Notificações</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/metricas')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Métricas do Sistema</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Bot className="mr-2 h-4 w-4" />
              <span>Ferramentas IA</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem 
                  onClick={() => window.open('https://chat.openai.com', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>ChatGPT</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://claude.ai', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Claude.ai</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://www.perplexity.ai', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Perplexity</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://lovable.dev', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Lovable</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://base44.com.br', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Base44</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://abacus.ai', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Abacus</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/feriados')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Administração de Feriados</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/configuracoes')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações do Sistema</span>
          </DropdownMenuItem>
        )}
        {profile.is_admin && (
          <DropdownMenuItem 
            onClick={() => navigate('/configuracao-banco')}
            className="cursor-pointer hover:bg-gradient-accent"
          >
            <Database className="mr-2 h-4 w-4" />
            <span>Configurar Banco PJe</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;