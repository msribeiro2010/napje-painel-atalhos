import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  type: 'feriado' | 'aniversario';
  description?: string;
}

export const useCalendarEvents = (currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthStartStr = format(monthStart, 'yyyy-MM-dd');
  const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ["calendar-events", format(currentMonth, 'yyyy-MM')],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const events: CalendarEvent[] = [];

      // Buscar feriados do mês
      const { data: feriados, error: feriadosError } = await supabase
        .from("feriados")
        .select("*")
        .gte("data", monthStartStr)
        .lte("data", monthEndStr);

      if (feriadosError) {
        console.error('Erro ao buscar feriados:', feriadosError);
      } else {
        feriados?.forEach(feriado => {
          events.push({
            id: feriado.id,
            date: feriado.data,
            title: feriado.descricao,
            type: 'feriado',
            description: feriado.tipo
          });
        });
      }

      // Buscar aniversariantes - comparando apenas mês e dia
      const { data: aniversariantes, error: aniversariantesError } = await supabase
        .from("aniversariantes")
        .select("*");

      if (aniversariantesError) {
        console.error('Erro ao buscar aniversariantes:', aniversariantesError);
      } else {
        const currentYear = currentMonth.getFullYear();
        const currentMonthNum = currentMonth.getMonth() + 1;
        
        aniversariantes?.forEach(aniversariante => {
          const birthDate = new Date(aniversariante.data_nascimento);
          const birthMonth = birthDate.getMonth() + 1;
          const birthDay = birthDate.getDate();
          
          // Se o aniversário é no mês atual
          if (birthMonth === currentMonthNum) {
            const anniversaryThisYear = `${currentYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
            
            // Calcular idade
            const age = currentYear - birthDate.getFullYear();
            
            events.push({
              id: aniversariante.id + 10000, // Offset para evitar conflito com IDs de feriados
              date: anniversaryThisYear,
              title: `${aniversariante.nome} (${age} anos)`,
              type: 'aniversario'
            });
          }
        });
      }

      return events;
    },
  });
};
