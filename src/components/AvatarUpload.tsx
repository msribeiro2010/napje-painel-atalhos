import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Camera, User, Loader2, Palette, FileImage, Edit2, Check, X } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  nome_completo: string | null;
  avatar_url: string | null;
}

const AvatarUpload = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Avatares sugeridos
  const suggestedAvatars = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop&crop=face',
  ];

  React.useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('Usuário não encontrado');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil com nova URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload do avatar');
    } finally {
      setUploading(false);
    }
  };

  const selectSuggestedAvatar = async (avatarUrl: string) => {
    try {
      setUploading(true);

      // Atualizar perfil com nova URL do avatar sugerido
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar avatar:', error);
      toast.error(error.message || 'Erro ao atualizar avatar');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      // Remover avatar do storage se existir
      if (profile?.avatar_url) {
        const fileName = profile.avatar_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user?.id}/${fileName}`]);
        }
      }

      // Atualizar perfil removendo URL do avatar
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast.success('Avatar removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover avatar:', error);
      toast.error(error.message || 'Erro ao remover avatar');
    } finally {
      setUploading(false);
    }
  };

  const startEditingName = () => {
    setTempName(profile?.nome_completo || '');
    setEditingName(true);
  };

  const cancelEditingName = () => {
    setTempName('');
    setEditingName(false);
  };

  const updateName = async () => {
    try {
      setUploading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ nome_completo: tempName.trim() || null })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, nome_completo: tempName.trim() || null } : null);
      setEditingName(false);
      setTempName('');
      toast.success('Nome atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar nome:', error);
      toast.error(error.message || 'Erro ao atualizar nome');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Camera className="h-5 w-5" />
          Meu Avatar
        </CardTitle>
        <CardDescription>
          Personalize sua foto de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-large">
            <AvatarImage 
              src={profile?.avatar_url || ''} 
              alt={profile?.nome_completo || 'Avatar'} 
            />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-bold">
              {getInitials(profile?.nome_completo)}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center w-full">
            {editingName ? (
              <div className="flex items-center gap-2 justify-center">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="text-center text-lg font-medium"
                  disabled={uploading}
                  maxLength={100}
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={updateName}
                    disabled={uploading || !tempName.trim()}
                    title="Salvar nome"
                  >
                    {uploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditingName}
                    disabled={uploading}
                    title="Cancelar"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <p className="font-medium text-lg">
                  {profile?.nome_completo || 'Nome não informado'}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingName}
                  disabled={uploading}
                  title="Editar nome"
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground text-sm mt-1">
              {profile?.email}
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Carregar Foto
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Avatares Sugeridos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="avatar-upload" className="text-sm font-medium">
                Enviar sua própria foto
              </Label>
              <div className="mt-2">
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="file:bg-gradient-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:shadow-medium"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'Enviando...' : 'Escolher Foto'}
              </Button>
              
              {profile?.avatar_url && (
                <Button
                  variant="destructive"
                  onClick={removeAvatar}
                  disabled={uploading}
                  size="icon"
                  title="Remover avatar"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
            </div>
          </TabsContent>
          
          <TabsContent value="suggested" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Escolha um avatar predefinido
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {suggestedAvatars.map((avatarUrl, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-2 h-auto hover:shadow-medium transition-all duration-200"
                    onClick={() => selectSuggestedAvatar(avatarUrl)}
                    disabled={uploading}
                  >
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={`Avatar sugerido ${index + 1}`} 
                      />
                      <AvatarFallback className="bg-gradient-secondary">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Clique em um avatar para selecioná-lo
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarUpload;