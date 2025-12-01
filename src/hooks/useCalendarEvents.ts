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

export const useCalendarEvents = (currentMonth: Date | null) => {
  const monthStart = currentMonth ? startOfMonth(currentMonth) : null;
  const monthEnd = currentMonth ? endOfMonth(currentMonth) : null;
  const monthStartStr = monthStart ? format(monthStart, 'yyyy-MM-dd') : '';
  const monthEndStr = monthEnd ? format(monthEnd, 'yyyy-MM-dd') : '';

  return useQuery({
    queryKey: ["calendar-events", currentMonth ? format(currentMonth, 'yyyy-MM') : 'invalid'],
    enabled: !!currentMonth,
    queryFn: async (): Promise<CalendarEvent[]> => {
      const events: CalendarEvent[] = [];

      try {
        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        // Buscar feriados do mês
        const feriadosPromise = supabase
          .from("feriados")
          .select("*")
          .gte("data", monthStartStr)
          .lte("data", monthEndStr);

        const { data: feriados, error: feriadosError } = await Promise.race([feriadosPromise, timeoutPromise]) as any;

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
        const aniversariantesPromise = supabase
          .from("aniversariantes")
          .select("*");

        const { data: aniversariantes, error: aniversariantesError } = await Promise.race([aniversariantesPromise, timeoutPromise]) as any;

      if (aniversariantesError) {
        console.error('Erro ao buscar aniversariantes:', aniversariantesError);
      } else {
        const currentYear = currentMonth!.getFullYear();
        const currentMonthNum = currentMonth!.getMonth() + 1;
        
        aniversariantes?.forEach(aniversariante => {
          // Validate that data_nascimento exists
          if (!aniversariante.data_nascimento) {
            console.warn('Aniversariante sem data de nascimento:', aniversariante);
            return;
          }

          const birthDate = new Date(`${aniversariante.data_nascimento}T12:00:00`);
          
          // Validate that the date is valid
          if (isNaN(birthDate.getTime())) {
            console.warn('Data de nascimento inválida:', aniversariante.data_nascimento);
            return;
          }

          const birthMonth = birthDate.getMonth() + 1;
          const birthDay = birthDate.getDate();
          
          // Se o aniversário é no mês atual
          if (birthMonth === currentMonthNum) {
            const anniversaryThisYear = `${currentYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
            
            // Remover idade do título
            events.push({
              id: aniversariante.id + 10000, // Offset para evitar conflito com IDs de feriados
              date: anniversaryThisYear,
              title: aniversariante.nome, // Apenas nome
              type: 'aniversario'
            });
          }
        });
      }

        return events;
      } catch (err: any) {
        console.error('Erro ao buscar eventos do calendário:', err);
        
        // Tratamento específico para erros de conectividade e timeout
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('TypeError: Failed to fetch')) {
            console.warn('Problema de conectividade - retornando lista vazia');
          } else if (err.message.includes('Timeout')) {
            console.warn('Timeout na busca de eventos - retornando lista vazia');
          }
        }
        
        return [];
      }
    },
  });
};
