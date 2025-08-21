import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Copy, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrgaosJulgadores, OrgaoJulgador } from '@/hooks/useOrgaosJulgadores';
import { OrgaoJulgadorDialog } from '@/components/orgaos-julgadores/OrgaoJulgadorDialog';
import { useProfile } from '@/hooks/useProfile';

const OrgaosJulgadores = () => {
  const [busca, setBusca] = useState('');
  const [grauAtivo, setGrauAtivo] = useState<'1grau' | '2grau'>('1grau');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrgao, setEditingOrgao] = useState<OrgaoJulgador | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgaoToDelete, setOrgaoToDelete] = useState<OrgaoJulgador | null>(null);
  
  const { toast } = useToast();
  const { data: profile } = useProfile();
  
  const {
    orgaos,
    isLoading,
    createOrgao,
    updateOrgao,
    deleteOrgao
  } = useOrgaosJulgadores(grauAtivo);

  const isAdmin = profile?.is_admin && profile?.status === 'aprovado';

  // Filtrar órgãos com base na busca
  const orgaosFiltrados = useMemo(() => {
    if (!busca.trim()) return orgaos;
    
    const termoBusca = busca.toLowerCase();
    return orgaos.filter(orgao => 
      orgao.codigo.includes(termoBusca) || 
      orgao.nome.toLowerCase().includes(termoBusca)
    );
  }, [busca, orgaos]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({
      title: "Código copiado!",
      description: `Código ${codigo} foi copiado para a área de transferência.`,
    });
  };

  const exportarDados = () => {
    const csvContent = [
      'Código,Nome do Órgão',
      ...orgaos.map(orgao => `${orgao.codigo},"${orgao.nome}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orgaos_julgadores_${grauAtivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = () => {
    setEditingOrgao(null);
    setDialogOpen(true);
  };

  const handleEdit = (orgao: OrgaoJulgador) => {
    setEditingOrgao(orgao);
    setDialogOpen(true);
  };

  const handleSave = (data: { codigo: string; nome: string }) => {
    if (editingOrgao) {
      updateOrgao.mutate({ id: editingOrgao.id, ...data });
    } else {
      createOrgao.mutate(data);
    }
  };

  const handleDeleteClick = (orgao: OrgaoJulgador) => {
    setOrgaoToDelete(orgao);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (orgaoToDelete) {
      deleteOrgao.mutate(orgaoToDelete.id);
      setDeleteDialogOpen(false);
      setOrgaoToDelete(null);
    }
  };

  const renderTable = (orgaosList: OrgaoJulgador[]) => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Código</TableHead>
            <TableHead>Nome do Órgão</TableHead>
            <TableHead className="w-[140px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : orgaosList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                Nenhum órgão julgador encontrado
              </TableCell>
            </TableRow>
          ) : (
            orgaosList.map((orgao) => (
              <TableRow key={orgao.id}>
                <TableCell className="font-mono font-medium">
                  {orgao.codigo}
                </TableCell>
                <TableCell>{orgao.nome}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copiarCodigo(orgao.codigo)}
                      className="p-2 h-8 w-8"
                      title="Copiar código"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(orgao)}
                          className="p-2 h-8 w-8"
                          title="Editar"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(orgao)}
                          className="p-2 h-8 w-8 text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Órgãos Julgadores"
          subtitle="Consulta e gestão de órgãos julgadores do TRT15 - 1º e 2º graus"
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Órgãos Julgadores</CardTitle>
                <CardDescription>
                  Busque órgãos julgadores por código ou nome
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button 
                    onClick={handleCreate}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Órgão
                  </Button>
                )}
                <Button 
                  onClick={exportarDados}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Campo de busca */}
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar por código ou nome</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="busca"
                    placeholder="Digite o código ou nome do órgão..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tabs para 1º e 2º grau */}
              <Tabs value={grauAtivo} onValueChange={(value) => setGrauAtivo(value as '1grau' | '2grau')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="1grau">1º Grau</TabsTrigger>
                  <TabsTrigger value="2grau">2º Grau</TabsTrigger>
                </TabsList>

                <TabsContent value="1grau" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {orgaosFiltrados.length} órgão(s) encontrado(s)
                    </Badge>
                  </div>
                  {renderTable(orgaosFiltrados)}
                </TabsContent>

                <TabsContent value="2grau" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {orgaosFiltrados.length} órgão(s) encontrado(s)
                    </Badge>
                  </div>
                  {renderTable(orgaosFiltrados)}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para criar/editar órgão */}
        <OrgaoJulgadorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          orgao={editingOrgao}
          onSave={handleSave}
          isLoading={createOrgao.isPending || updateOrgao.isPending}
        />

        {/* Dialog de confirmação para excluir */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o órgão julgador "{orgaoToDelete?.nome}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default OrgaosJulgadores;