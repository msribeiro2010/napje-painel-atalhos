import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, ArrowLeft, Settings, ExternalLink, 
  Save, X, GripVertical, ChevronUp, ChevronDown
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuickAccessLink {
  name: string;
  url: string;
  type: 'url';
  order: number;
}

interface QuickAccessApp {
  name: string;
  executable: string;
  paths: {
    windows: string[];
    mac: string[];
    linux: string[];
  };
  icon: string;
  enabled: boolean;
}

interface SortableItemProps {
  link: QuickAccessLink;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableItem = ({ link, index, onEdit, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `link-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group hover:bg-muted/50">
      <TableCell className="w-12">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{link.name}</TableCell>
      <TableCell className="max-w-md">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {link.url}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => window.open(link.url, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(index)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminSystemConfig = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'apps'>('links');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState({ name: '', url: '' });
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Buscar configuração dos links do Acesso Rápido
  const { data: config, isLoading } = useQuery({
    queryKey: ['system-config', 'quick_access_links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'quick_access_links')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const quickAccessLinks: QuickAccessLink[] = config?.value || [];

  // Buscar configuração dos aplicativos locais
  const { data: appsConfig } = useQuery({
    queryKey: ['system-config', 'quick_access_apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'quick_access_apps')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const quickAccessApps: QuickAccessApp[] = appsConfig?.value || [];

  // Mutation para atualizar configuração de links
  const updateConfig = useMutation({
    mutationFn: async (links: QuickAccessLink[]) => {
      const { error } = await supabase
        .from('system_config')
        .update({ 
          value: links,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('key', 'quick_access_links');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast.success('Links atualizados com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar links: ' + error.message);
    }
  });

  // Mutation para atualizar configuração de aplicativos
  const updateAppsConfig = useMutation({
    mutationFn: async (apps: QuickAccessApp[]) => {
      const { error } = await supabase
        .from('system_config')
        .update({ 
          value: apps,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('key', 'quick_access_apps');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast.success('Aplicativos atualizados com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar aplicativos: ' + error.message);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id.toString().replace('link-', ''));
      const newIndex = parseInt(over?.id.toString().replace('link-', '') || '0');

      const newLinks = arrayMove(quickAccessLinks, oldIndex, newIndex);
      
      // Atualizar ordem
      const linksWithOrder = newLinks.map((link, index) => ({
        ...link,
        order: index + 1
      }));

      updateConfig.mutate(linksWithOrder);
    }
  };

  const openDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setLinkForm({
        name: quickAccessLinks[index].name,
        url: quickAccessLinks[index].url
      });
    } else {
      setEditingIndex(null);
      setLinkForm({ name: '', url: '' });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
    setLinkForm({ name: '', url: '' });
  };

  const handleSaveLink = () => {
    if (!linkForm.name.trim() || !linkForm.url.trim()) {
      toast.error('Nome e URL são obrigatórios');
      return;
    }

    const newLinks = [...quickAccessLinks];

    if (editingIndex !== null) {
      // Editar link existente
      newLinks[editingIndex] = {
        ...newLinks[editingIndex],
        name: linkForm.name.trim(),
        url: linkForm.url.trim(),
      };
    } else {
      // Adicionar novo link
      newLinks.push({
        name: linkForm.name.trim(),
        url: linkForm.url.trim(),
        type: 'url',
        order: newLinks.length + 1
      });
    }

    updateConfig.mutate(newLinks);
    closeDialog();
  };

  const handleDeleteLink = (index: number) => {
    if (confirm('Tem certeza que deseja excluir este link?')) {
      const newLinks = quickAccessLinks.filter((_, i) => i !== index);
      
      // Reordenar
      const linksWithOrder = newLinks.map((link, i) => ({
        ...link,
        order: i + 1
      }));

      updateConfig.mutate(linksWithOrder);
    }
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= quickAccessLinks.length) return;

    const newLinks = arrayMove(quickAccessLinks, index, newIndex);
    const linksWithOrder = newLinks.map((link, i) => ({
      ...link,
      order: i + 1
    }));

    updateConfig.mutate(linksWithOrder);
  };

  const toggleAppEnabled = (appIndex: number) => {
    const newApps = [...quickAccessApps];
    newApps[appIndex].enabled = !newApps[appIndex].enabled;
    updateAppsConfig.mutate(newApps);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Carregando configurações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <PageHeader 
          title="Configurações do Sistema" 
          description="Gerenciar configurações globais do sistema"
        />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'links' | 'apps')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="links" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Links Web
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Aplicativos Locais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                      <ExternalLink className="h-6 w-6 text-blue-600" />
                      Links Web - Acesso Rápido
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Configure os links web que serão abertos pelo botão "Acesso Rápido"
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Link
                  </Button>
                </div>
              </CardHeader>
          <CardContent className="p-6">
            {quickAccessLinks.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nenhum link configurado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Adicione links para o botão "Acesso Rápido" do Dashboard
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Link
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext 
                      items={quickAccessLinks.map((_, index) => `link-${index}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {quickAccessLinks.map((link, index) => (
                        <SortableItem
                          key={`link-${index}`}
                          link={link}
                          index={index}
                          onEdit={openDialog}
                          onDelete={handleDeleteLink}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            )}

            {quickAccessLinks.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informações:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Arraste os links para reordenar</li>
                  <li>• Os links serão abertos na ordem configurada</li>
                  <li>• Use URLs completas (incluindo https://)</li>
                  <li>• Teste os links antes de salvar</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="apps">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Settings className="h-6 w-6 text-green-600" />
                  Aplicativos Locais - Acesso Rápido
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Ative/desative aplicativos locais que serão abertos pelo botão "Acesso Rápido"
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {quickAccessApps.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhum aplicativo disponível
                  </h3>
                  <p className="text-muted-foreground">
                    Os aplicativos locais serão carregados automaticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quickAccessApps.map((app, index) => (
                    <div 
                      key={app.executable}
                      className={`p-4 rounded-lg border transition-colors ${
                        app.enabled 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{app.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-800">{app.name}</h4>
                            <p className="text-sm text-gray-600">
                              Executável: <code className="text-xs bg-gray-200 px-1 rounded">{app.executable}</code>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {app.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                          <Switch
                            checked={app.enabled}
                            onCheckedChange={() => toggleAppEnabled(index)}
                          />
                        </div>
                      </div>
                      {app.enabled && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-gray-600 mb-1">Caminhos detectados:</p>
                          <div className="text-xs space-y-1">
                            {Object.entries(app.paths).map(([os, paths]) => (
                              <div key={os} className="flex gap-2">
                                <span className="font-medium capitalize text-gray-700">{os}:</span>
                                <span className="text-gray-600">{paths.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">ℹ️ Informações importantes:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Apenas aplicativos instalados no sistema funcionarão</li>
                  <li>• O sistema tentará detectar automaticamente os caminhos</li>
                  <li>• Aplicativos habilitados aparecerão no botão "Acesso Rápido"</li>
                  <li>• A abertura de aplicativos pode variar conforme o navegador</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        {/* Dialog para adicionar/editar link */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Editar Link' : 'Adicionar Link'}
              </DialogTitle>
              <DialogDescription>
                Configure um link para o botão "Acesso Rápido"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Nome do Link</Label>
                <Input
                  id="name"
                  placeholder="Ex: Gmail, Sistema Assyst, etc."
                  value={linkForm.name}
                  onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveLink} disabled={updateConfig.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateConfig.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                {linkForm.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(linkForm.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Testar
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSystemConfig;