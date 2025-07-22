import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, ArrowLeft, Settings, Link, FolderOpen, 
  Save, X, Eye, EyeOff, Search, Filter
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

interface ShortcutGroup {
  id: string;
  title: string;
  icon: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface Shortcut {
  id: string;
  title: string;
  url: string;
  icon: string;
  group_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  group_title?: string;
}

const AdminShortcuts = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'shortcuts'>('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isShortcutDialogOpen, setIsShortcutDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ShortcutGroup | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [groupForm, setGroupForm] = useState({ title: '', icon: '' });
  const [shortcutForm, setShortcutForm] = useState({ title: '', url: '', icon: '', group_id: '' });
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Buscar grupos
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortcut_groups')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return data as ShortcutGroup[];
    }
  });

  // Buscar atalhos
  const { data: shortcuts, isLoading: shortcutsLoading } = useQuery({
    queryKey: ['admin-shortcuts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortcuts')
        .select(`
          *,
          shortcut_groups!inner(title)
        `)
        .order('order', { ascending: true });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        group_title: item.shortcut_groups?.title
      })) as Shortcut[];
    }
  });

  // Filtrar dados baseado na busca
  const filteredGroups = groups?.filter(group => 
    group.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredShortcuts = shortcuts?.filter(shortcut => 
    shortcut.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.group_title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Mutations para grupos
  const createGroup = useMutation({
    mutationFn: async (groupData: { title: string; icon: string }) => {
      const maxOrder = Math.max(...(groups?.map(g => g.order) || [0]));
      const { error } = await supabase
        .from('shortcut_groups')
        .insert({
          ...groupData,
          order: maxOrder + 1
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['shortcut-groups'] });
      toast.success('Grupo criado com sucesso!');
      setIsGroupDialogOpen(false);
      setGroupForm({ title: '', icon: '' });
    },
    onError: (error) => {
      toast.error('Erro ao criar grupo');
      console.error(error);
    }
  });

  const updateGroup = useMutation({
    mutationFn: async (groupData: { id: string; title: string; icon: string }) => {
      const { error } = await supabase
        .from('shortcut_groups')
        .update({
          title: groupData.title,
          icon: groupData.icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['shortcut-groups'] });
      toast.success('Grupo atualizado com sucesso!');
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      setGroupForm({ title: '', icon: '' });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar grupo');
      console.error(error);
    }
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      // Primeiro deletar todos os atalhos do grupo
      await supabase
        .from('shortcuts')
        .delete()
        .eq('group_id', groupId);

      // Depois deletar o grupo
      const { error } = await supabase
        .from('shortcut_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shortcuts'] });
      queryClient.invalidateQueries({ queryKey: ['shortcut-groups'] });
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] });
      toast.success('Grupo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir grupo');
      console.error(error);
    }
  });

  // Mutations para atalhos
  const createShortcut = useMutation({
    mutationFn: async (shortcutData: { title: string; url: string; icon: string; group_id: string }) => {
      const maxOrder = Math.max(...(shortcuts?.map(s => s.order) || [0]));
      const { error } = await supabase
        .from('shortcuts')
        .insert({
          ...shortcutData,
          order: maxOrder + 1
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shortcuts'] });
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] });
      toast.success('Atalho criado com sucesso!');
      setIsShortcutDialogOpen(false);
      setShortcutForm({ title: '', url: '', icon: '', group_id: '' });
    },
    onError: (error) => {
      toast.error('Erro ao criar atalho');
      console.error(error);
    }
  });

  const updateShortcut = useMutation({
    mutationFn: async (shortcutData: { id: string; title: string; url: string; icon: string; group_id: string }) => {
      const { error } = await supabase
        .from('shortcuts')
        .update({
          title: shortcutData.title,
          url: shortcutData.url,
          icon: shortcutData.icon,
          group_id: shortcutData.group_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', shortcutData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shortcuts'] });
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] });
      toast.success('Atalho atualizado com sucesso!');
      setIsShortcutDialogOpen(false);
      setEditingShortcut(null);
      setShortcutForm({ title: '', url: '', icon: '', group_id: '' });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar atalho');
      console.error(error);
    }
  });

  const deleteShortcut = useMutation({
    mutationFn: async (shortcutId: string) => {
      const { error } = await supabase
        .from('shortcuts')
        .delete()
        .eq('id', shortcutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shortcuts'] });
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] });
      toast.success('Atalho excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir atalho');
      console.error(error);
    }
  });

  // Handlers
  const handleEditGroup = (group: ShortcutGroup) => {
    setEditingGroup(group);
    setGroupForm({ title: group.title, icon: group.icon });
    setIsGroupDialogOpen(true);
  };

  const handleEditShortcut = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut);
    setShortcutForm({ 
      title: shortcut.title, 
      url: shortcut.url, 
      icon: shortcut.icon, 
      group_id: shortcut.group_id 
    });
    setIsShortcutDialogOpen(true);
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ title: '', icon: '' });
    setIsGroupDialogOpen(true);
  };

  const handleCreateShortcut = () => {
    setEditingShortcut(null);
    setShortcutForm({ title: '', url: '', icon: '', group_id: '' });
    setIsShortcutDialogOpen(true);
  };

  const handleSubmitGroup = () => {
    if (!groupForm.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (editingGroup) {
      updateGroup.mutate({ id: editingGroup.id, ...groupForm });
    } else {
      createGroup.mutate(groupForm);
    }
  };

  const handleSubmitShortcut = () => {
    if (!shortcutForm.title.trim() || !shortcutForm.url.trim() || !shortcutForm.group_id) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (editingShortcut) {
      updateShortcut.mutate({ id: editingShortcut.id, ...shortcutForm });
    } else {
      createShortcut.mutate(shortcutForm);
    }
  };

  const isLoading = groupsLoading || shortcutsLoading;

  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
              <Settings className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Gerenciamento de Atalhos
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Crie, edite e gerencie grupos e atalhos do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'groups' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('groups')}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Grupos ({groups?.length || 0})
            </Button>
            <Button
              variant={activeTab === 'shortcuts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('shortcuts')}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Atalhos ({shortcuts?.length || 0})
            </Button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Buscar ${activeTab === 'groups' ? 'grupos' : 'atalhos'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            onClick={activeTab === 'groups' ? handleCreateGroup : handleCreateShortcut}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar {activeTab === 'groups' ? 'Grupo' : 'Atalho'}
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'groups' ? (
          <Card>
            <CardHeader>
              <CardTitle>Grupos de Atalhos</CardTitle>
              <CardDescription>
                Gerencie os grupos que organizam os atalhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando grupos...</div>
              ) : !filteredGroups.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum grupo encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ícone</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div className="p-2 bg-muted rounded-lg w-10 h-10 flex items-center justify-center">
                            <span className="text-lg">{group.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{group.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{group.order}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(group.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir este grupo? Todos os atalhos serão removidos.')) {
                                  deleteGroup.mutate(group.id);
                                }
                              }}
                              disabled={deleteGroup.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Atalhos</CardTitle>
              <CardDescription>
                Gerencie todos os atalhos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando atalhos...</div>
              ) : !filteredShortcuts.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum atalho encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ícone</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShortcuts.map((shortcut) => (
                      <TableRow key={shortcut.id}>
                        <TableCell>
                          <div className="p-2 bg-muted rounded-lg w-10 h-10 flex items-center justify-center">
                            <span className="text-lg">{shortcut.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{shortcut.title}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={shortcut.url}>
                            {shortcut.url}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{shortcut.group_title}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{shortcut.order}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditShortcut(shortcut)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir este atalho?')) {
                                  deleteShortcut.mutate(shortcut.id);
                                }
                              }}
                              disabled={deleteShortcut.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog para Grupos */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
              </DialogTitle>
              <DialogDescription>
                {editingGroup ? 'Modifique as informações do grupo' : 'Preencha as informações para criar um novo grupo'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-title">Título</Label>
                <Input
                  id="group-title"
                  value={groupForm.title}
                  onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
                  placeholder="Ex: Google Apps"
                />
              </div>
              <div>
                <Label htmlFor="group-icon">Ícone (emoji)</Label>
                <Input
                  id="group-icon"
                  value={groupForm.icon}
                  onChange={(e) => setGroupForm({ ...groupForm, icon: e.target.value })}
                  placeholder="Ex: 🌐"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitGroup}
                disabled={createGroup.isPending || updateGroup.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingGroup ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Atalhos */}
        <Dialog open={isShortcutDialogOpen} onOpenChange={setIsShortcutDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingShortcut ? 'Editar Atalho' : 'Criar Novo Atalho'}
              </DialogTitle>
              <DialogDescription>
                {editingShortcut ? 'Modifique as informações do atalho' : 'Preencha as informações para criar um novo atalho'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shortcut-title">Título</Label>
                <Input
                  id="shortcut-title"
                  value={shortcutForm.title}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, title: e.target.value })}
                  placeholder="Ex: Gmail"
                />
              </div>
              <div>
                <Label htmlFor="shortcut-url">URL</Label>
                <Input
                  id="shortcut-url"
                  value={shortcutForm.url}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, url: e.target.value })}
                  placeholder="Ex: https://mail.google.com"
                />
              </div>
              <div>
                <Label htmlFor="shortcut-icon">Ícone (emoji)</Label>
                <Input
                  id="shortcut-icon"
                  value={shortcutForm.icon}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, icon: e.target.value })}
                  placeholder="Ex: 📧"
                />
              </div>
              <div>
                <Label htmlFor="shortcut-group">Grupo</Label>
                <Select
                  value={shortcutForm.group_id}
                  onValueChange={(value) => setShortcutForm({ ...shortcutForm, group_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsShortcutDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitShortcut}
                disabled={createShortcut.isPending || updateShortcut.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingShortcut ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminShortcuts; 