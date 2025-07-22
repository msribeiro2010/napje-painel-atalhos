import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AvatarUpload from '@/components/AvatarUpload';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <AvatarUpload />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Configurações da Conta
                </CardTitle>
                <CardDescription>
                  Gerencie sua conta e preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-accent rounded-lg border">
                  <h3 className="font-medium mb-2">Tema do Sistema</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Escolha o tema da interface do sistema
                  </p>
                  <ThemeToggle />
                </div>

                <div className="p-4 bg-gradient-accent rounded-lg border">
                  <h3 className="font-medium mb-2">Informações da Conta</h3>
                  <p className="text-sm text-muted-foreground">
                    Para alterar seu nome ou outras informações, entre em contato com o administrador do sistema.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;