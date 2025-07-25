import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AvatarUpload from '@/components/AvatarUpload';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setChanging(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChanging(false);
    if (error) {
      toast.error(error.message || 'Erro ao alterar senha');
    } else {
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    }
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
                {/* Card de alteração de senha */}
                <div className="p-4 bg-gradient-accent rounded-lg border">
                  <h3 className="font-medium mb-2">Alterar Senha</h3>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nova Senha</label>
                      <input
                        type="password"
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                        autoComplete="new-password"
                        placeholder="Digite a nova senha"
                        title="Nova Senha"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        minLength={6}
                        required
                        autoComplete="new-password"
                        placeholder="Confirme a nova senha"
                        title="Confirmar Nova Senha"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={changing || !newPassword || !confirmPassword} className="bg-primary text-white hover:bg-primary/90">
                        {changing ? 'Salvando...' : 'Alterar Senha'}
                      </Button>
                    </div>
                  </form>
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