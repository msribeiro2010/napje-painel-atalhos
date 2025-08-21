import { useState } from "react";
import { useCreateAniversariante, useUpdateAniversariante, useDeleteAniversariante } from "@/hooks/useAniversariantes";

interface FormData {
  nome: string;
  data_nascimento: string;
}

export const useAniversariantesForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    data_nascimento: "",
  });

  const createAniversariante = useCreateAniversariante();
  const updateAniversariante = useUpdateAniversariante();
  const deleteAniversariante = useDeleteAniversariante();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateAniversariante.mutate({
        id: editingId,
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
      });
    } else {
      createAniversariante.mutate({
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nome: "", data_nascimento: "" });
    setEditingId(null);
  };

  const handleEdit = (aniversariante: any) => {
    setFormData({
      nome: aniversariante.nome,
      data_nascimento: aniversariante.data_nascimento,
    });
    setEditingId(aniversariante.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este aniversariante?")) {
      deleteAniversariante.mutate(id);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingId,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
  };
};