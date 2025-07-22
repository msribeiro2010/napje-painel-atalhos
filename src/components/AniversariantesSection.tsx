import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAniversariantes } from "@/hooks/useAniversariantes";
import { useProfile } from "@/hooks/useProfile";
import { useAniversariantesForm } from "@/hooks/useAniversariantesForm";
import { AniversarianteDialog } from "@/components/aniversariantes/AniversarianteDialog";
import { AniversarianteItem } from "@/components/aniversariantes/AniversarianteItem";
import { MonthNavigation } from "@/components/aniversariantes/MonthNavigation";

export const AniversariantesSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: profile } = useProfile();
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingId,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
  } = useAniversariantesForm();

  const mesAtual = currentDate.getMonth() + 1;

  const { data: aniversariantes, isLoading } = useAniversariantes();
  const aniversariantesDoMes = aniversariantes?.filter(a => {
    const dataAniversario = new Date(a.data_nascimento + 'T12:00:00');
    return dataAniversario.getMonth() + 1 === mesAtual;
  });

  const isAdmin = profile?.is_admin && profile?.status === "aprovado";

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return null; // Não mostra nada durante o carregamento para evitar flash
  }

  // Se não há aniversariantes no mês, não exibe o painel
  if (!aniversariantesDoMes || aniversariantesDoMes.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Cake className="h-5 w-5" />
            Aniversariantes
          </CardTitle>
          <MonthNavigation
            currentDate={currentDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>
        <AniversarianteDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingId={editingId}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onResetForm={resetForm}
          isAdmin={isAdmin}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {aniversariantesDoMes.map((aniversariante) => (
            <AniversarianteItem
              key={aniversariante.id}
              aniversariante={aniversariante}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};