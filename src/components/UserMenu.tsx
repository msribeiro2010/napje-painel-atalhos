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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Shield, Link } from 'lucide-react';

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
            <span className="text-xs text-muted-foreground">
              {profile.email.split('@')[0]}
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
            <Link className="mr-2 h-4 w-4" />
            <span>Gerenciar Atalhos</span>
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