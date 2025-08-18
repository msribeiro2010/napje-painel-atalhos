import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Plus, Trash2, Edit2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFeriados, useCreateFeriado, useUpdateFeriado, useDeleteFeriado } from "@/hooks/useFeriados";
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

  const mesAtual = currentDate.getMonth() + 1;
  const anoAtual = currentDate.getFullYear();

  // Filtrar apenas feriados futuros (não incluir feriados que já passaram)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
  
  const feriadosDoMes = feriados?.filter(f => {
    // Validate that f.data exists
    if (!f.data) {
      console.warn('Feriado sem data:', f);
      return false;
    }

    const dataFeriado = new Date(f.data + 'T12:00:00');
    
    // Validate that the date is valid
    if (isNaN(dataFeriado.getTime())) {
      console.warn('Data de feriado inválida:', f.data);
      return false;
    }

    // Filtrar apenas feriados do mês atual que são hoje ou futuros
    const isMesAtual = dataFeriado.getMonth() + 1 === mesAtual && dataFeriado.getFullYear() === anoAtual;
    const isFuturoOuHoje = dataFeriado >= hoje;
    
    return isMesAtual && isFuturoOuHoje;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    tipo: "",
  });

  const isAdmin = profile?.is_admin && profile?.status === "aprovado";

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
    </div>
  );
};