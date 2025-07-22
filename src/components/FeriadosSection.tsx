import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Plus, Trash2, Edit2, Star, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFeriados, useCreateFeriado, useUpdateFeriado, useDeleteFeriado, useVerificarFeriadosFaltantes, useCorrigirFeriado, feriadosEssenciais2025 } from "@/hooks/useFeriados";
import { useProfile } from "@/hooks/useProfile";

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "nacional":
      return "bg-green-100 text-green-700 border-green-200";
    case "estadual":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "municipal":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const FeriadosSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: feriados, isLoading } = useFeriados();
  const { data: profile } = useProfile();
  const createFeriado = useCreateFeriado();
  const updateFeriado = useUpdateFeriado();
  const deleteFeriado = useDeleteFeriado();
  const { data: feriadosFaltantes = [] } = useVerificarFeriadosFaltantes();
  const corrigirFeriado = useCorrigirFeriado();

  const mesAtual = currentDate.getMonth() + 1;
  const anoAtual = currentDate.getFullYear();

  // Filtrar feriados do mês atual
  const feriadosDoMes = feriados?.filter(f => {
    const dataFeriado = new Date(f.data + 'T12:00:00');
    return dataFeriado.getMonth() + 1 === mesAtual && dataFeriado.getFullYear() === anoAtual;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    tipo: "",
  });

  const isAdmin = profile?.is_admin && profile?.status === "aprovado";

  const addMissingHoliday = async (holiday: {data: string, descricao: string, tipo: string}) => {
    corrigirFeriado.mutate(holiday);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateFeriado.mutate({
        id: editingId,
        data: formData.data,
        descricao: formData.descricao,
        tipo: formData.tipo,
      });
    } else {
      createFeriado.mutate({
        data: formData.data,
        descricao: formData.descricao,
        tipo: formData.tipo,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ data: "", descricao: "", tipo: "" });
    setEditingId(null);
  };

  const handleEdit = (feriado: any) => {
    setFormData({
      data: feriado.data,
      descricao: feriado.descricao,
      tipo: feriado.tipo,
    });
    setEditingId(feriado.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este feriado?")) {
      deleteFeriado.mutate(id);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return null; // Não mostra nada durante o carregamento para evitar flash
  }

  // Determina se há feriados no mês para exibir mensagem apropriada
  const temFeriados = feriadosDoMes && feriadosDoMes.length > 0;
  const quantidadeFeriados = feriadosDoMes?.length || 0;

  return (
    <div className="flex items-center gap-2">
      {/* Widget compacto */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs">
              {quantidadeFeriados} feriado{quantidadeFeriados !== 1 ? 's' : ''} em {format(currentDate, "MMM", { locale: ptBR })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Feriados
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevMonth}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium min-w-[80px] text-center">
                  {format(currentDate, "MMM/yy", { locale: ptBR })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={resetForm}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Editar Feriado" : "Adicionar Feriado"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nacional">Nacional</SelectItem>
                          <SelectItem value="estadual">Estadual</SelectItem>
                          <SelectItem value="municipal">Municipal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingId ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Seção de feriados faltantes - apenas para admins */}
          {isAdmin && feriadosFaltantes.length > 0 && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Feriados Faltantes
                </span>
              </div>
                             <div className="space-y-1">
                {feriadosFaltantes.map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-amber-700">
                      {format(new Date(holiday.data + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })} - {holiday.descricao}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => addMissingHoliday(holiday)}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto">
            {temFeriados ? (
              <div className="space-y-1 p-2">
                {feriadosDoMes.map((feriado) => (
                  <div
                    key={feriado.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{feriado.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(feriado.data + 'T12:00:00'), "dd/MM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge className={`text-xs px-1.5 py-0.5 ${getTipoColor(feriado.tipo)}`}>
                        {feriado.tipo.charAt(0).toUpperCase()}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(feriado)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(feriado.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">
                  Nenhum feriado em {format(currentDate, "MMMM", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Botão para administração avançada de feriados - apenas para admins */}
      {isAdmin && (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Star className="h-4 w-4" />
              <span className="text-xs">Gerenciar Feriados</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Administração de Feriados</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lista de anos disponíveis */}
                <div>
                  <h4 className="font-semibold mb-2">Feriados por Ano</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {[2024, 2025, 2026, 2027].map(year => {
                      const feriadosDoAno = feriados?.filter(f => 
                        new Date(f.data + 'T12:00:00').getFullYear() === year
                      ) || [];
                      
                      return (
                        <div key={year} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{year}</span>
                            <Badge variant="outline">
                              {feriadosDoAno.length} feriados
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            {feriadosDoAno.slice(0, 3).map(f => (
                              <div key={f.id} className="flex justify-between">
                                <span>{format(new Date(f.data + 'T12:00:00'), "dd/MM")}</span>
                                <span className="truncate max-w-32">{f.descricao}</span>
                              </div>
                            ))}
                            {feriadosDoAno.length > 3 && (
                              <div className="text-gray-500">
                                +{feriadosDoAno.length - 3} mais...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verificação de feriados faltantes */}
                <div>
                  <h4 className="font-semibold mb-2">Verificação de Integridade</h4>
                  <div className="space-y-2">
                    {feriadosFaltantes.length > 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-800">
                            Feriados Faltantes Detectados
                          </span>
                        </div>
                                                 <div className="space-y-2">
                          {feriadosFaltantes.map((holiday, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {holiday.descricao}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {format(new Date(holiday.data + 'T12:00:00'), "dd/MM/yyyy")}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addMissingHoliday(holiday)}
                              >
                                Adicionar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-green-800">
                            Todos os feriados essenciais estão cadastrados
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formulário para adicionar novos feriados */}
                  <div className="mt-4 border-t pt-4">
                    <h5 className="font-medium mb-2">Adicionar Novo Feriado</h5>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="admin-data" className="text-xs">Data</Label>
                          <Input
                            id="admin-data"
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            required
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-tipo" className="text-xs">Tipo</Label>
                          <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nacional">Nacional</SelectItem>
                              <SelectItem value="estadual">Estadual</SelectItem>
                              <SelectItem value="municipal">Municipal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="admin-descricao" className="text-xs">Descrição</Label>
                        <Input
                          id="admin-descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          required
                          className="h-8"
                        />
                      </div>
                      <Button type="submit" size="sm" className="w-full">
                        {editingId ? "Atualizar" : "Adicionar"} Feriado
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};