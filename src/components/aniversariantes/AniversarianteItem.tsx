import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AniversarianteItemProps {
  aniversariante: {
    id: number;
    nome: string;
    data_nascimento: string;
  };
  isAdmin: boolean;
  onEdit: (aniversariante: any) => void;
  onDelete: (id: number) => void;
}

export const AniversarianteItem = ({
  aniversariante,
  isAdmin,
  onEdit,
  onDelete,
}: AniversarianteItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-pink-100 dark:border-pink-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
          <Calendar className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{aniversariante.nome}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(aniversariante.data_nascimento + 'T12:00:00'), "dd/MM", { locale: ptBR })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-pink-100 text-pink-700">
          🎂
        </Badge>
        {isAdmin && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(aniversariante)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(aniversariante.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};