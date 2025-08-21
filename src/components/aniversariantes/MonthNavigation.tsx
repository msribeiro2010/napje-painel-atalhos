import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigationProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthNavigation = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: MonthNavigationProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevMonth}
        className="h-8 w-8 p-0 border-pink-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-pink-700 min-w-[100px] text-center">
        {format(currentDate, "MMM yyyy", { locale: ptBR })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextMonth}
        className="h-8 w-8 p-0 border-pink-300"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};