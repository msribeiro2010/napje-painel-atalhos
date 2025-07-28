import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO, startOfMonth, endOfMonth, isAfter, isBefore, differenceInDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface UpcomingFeriado {
  id: number;
  descricao: string;
  data: string;
  tipo: string;
  daysUntil: number;
}

export interface UpcomingAniversariante {
  id: number;
  nome: string;
  data_nascimento: string;
  daysUntil: number;
  idade: number;
}

export interface UpcomingEvents {
  feriados: UpcomingFeriado[];
  aniversariantes: UpcomingAniversariante[];
}

export const useUpcomingEvents = () => {
  const [events, setEvents] = useState<UpcomingEvents>({
    feriados: [],
    aniversariantes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const today = startOfDay(new Date());
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const nextMonthEnd = endOfMonth(addDays(monthEnd, 30)); // Próximo mês também
        
        // Buscar feriados desde hoje até o final do próximo mês
        const { data: feriados, error: feriadosError } = await supabase
          .from('feriados')
          .select('*')
          .gte('data', format(today, 'yyyy-MM-dd')) // Incluir hoje
          .lte('data', format(nextMonthEnd, 'yyyy-MM-dd'));

        if (feriadosError) {
          console.error('Erro ao buscar feriados:', feriadosError);
        }

        // Buscar todos os aniversariantes
        const { data: aniversariantes, error: aniversariantesError } = await supabase
          .from('aniversariantes')
          .select('*');

        if (aniversariantesError) {
          console.error('Erro ao buscar aniversariantes:', aniversariantesError);
        }

        // Processar aniversariantes com lógica melhorada
        const aniversariantesFiltrados = aniversariantes?.map(aniversariante => {
          const nascimento = parseISO(aniversariante.data_nascimento);
          const currentYear = today.getFullYear();
          
          // Criar data do aniversário no ano atual
          let aniversarioEsteAno = new Date(currentYear, nascimento.getMonth(), nascimento.getDate());
          
          // Se o aniversário já passou este ano, considerar o próximo ano
          if (isBefore(aniversarioEsteAno, today)) {
            aniversarioEsteAno = new Date(currentYear + 1, nascimento.getMonth(), nascimento.getDate());
          }
          
          const daysUntil = differenceInDays(aniversarioEsteAno, today);
          const idade = aniversarioEsteAno.getFullYear() - nascimento.getFullYear();
          
          return {
            ...aniversariante,
            daysUntil,
            idade
          };
        }).filter(aniversariante => {
          // Filtrar aniversários nos próximos 30 dias
          return aniversariante.daysUntil >= 0 && aniversariante.daysUntil <= 30;
        }) || [];

        // Processar feriados com dias restantes
        const feriadosProcessados = feriados?.map(feriado => {
          const dataFeriado = parseISO(feriado.data);
          const daysUntil = differenceInDays(startOfDay(dataFeriado), today);
          
          return {
            ...feriado,
            daysUntil: Math.max(0, daysUntil) // Garantir que não seja negativo
          };
        }).filter(feriado => feriado.daysUntil <= 30) || []; // Próximos 30 dias

        setEvents({
          feriados: feriadosProcessados,
          aniversariantes: aniversariantesFiltrados
        });
      } catch (error) {
        console.error('Erro ao buscar eventos próximos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
    
    // Atualizar a cada 30 minutos para garantir dados atualizados
    const interval = setInterval(fetchUpcomingEvents, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const hasUpcomingEvents = events.feriados.length > 0 || events.aniversariantes.length > 0;

  return {
    events,
    loading,
    hasUpcomingEvents
  };
};