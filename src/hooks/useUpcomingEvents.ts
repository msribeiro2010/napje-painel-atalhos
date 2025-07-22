import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO, startOfMonth, endOfMonth, isAfter, isBefore, differenceInDays } from 'date-fns';
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
        const today = new Date();
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        
        // Buscar feriados do mês atual que ainda não passaram
        const { data: feriados, error: feriadosError } = await supabase
          .from('feriados')
          .select('*')
          .gte('data', format(today, 'yyyy-MM-dd'))
          .lte('data', format(monthEnd, 'yyyy-MM-dd'));

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

        // Filtrar aniversariantes que fazem aniversário no resto do mês atual
        const aniversariantesFiltrados = aniversariantes?.filter(aniversariante => {
          const nascimento = parseISO(aniversariante.data_nascimento);
          const aniversarioEsteAno = new Date(today.getFullYear(), nascimento.getMonth(), nascimento.getDate());
          
          // Se o aniversário já passou este ano, considerar o próximo ano
          if (isBefore(aniversarioEsteAno, today)) {
            aniversarioEsteAno.setFullYear(today.getFullYear() + 1);
          }
          
          // Verificar se está dentro do mês atual e ainda não passou
          return isAfter(aniversarioEsteAno, today) && 
                 aniversarioEsteAno.getMonth() === today.getMonth() &&
                 aniversarioEsteAno.getFullYear() === today.getFullYear();
        }).map(aniversariante => {
          const nascimento = parseISO(aniversariante.data_nascimento);
          const aniversarioEsteAno = new Date(today.getFullYear(), nascimento.getMonth(), nascimento.getDate());
          const daysUntil = differenceInDays(aniversarioEsteAno, today);
          const idade = today.getFullYear() - nascimento.getFullYear();
          
          return {
            ...aniversariante,
            daysUntil,
            idade
          };
        }) || [];

        // Processar feriados com dias restantes
        const feriadosProcessados = feriados?.map(feriado => ({
          ...feriado,
          daysUntil: differenceInDays(parseISO(feriado.data), today)
        })) || [];

        // Filtrar apenas eventos próximos (próximos 7 dias)
        const feriadosProximos = feriadosProcessados.filter(f => f.daysUntil <= 7);
        const aniversariantesProximos = aniversariantesFiltrados.filter(a => a.daysUntil <= 7);

        setEvents({
          feriados: feriadosProximos,
          aniversariantes: aniversariantesProximos
        });
      } catch (error) {
        console.error('Erro ao buscar eventos próximos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const hasUpcomingEvents = events.feriados.length > 0 || events.aniversariantes.length > 0;

  return {
    events,
    loading,
    hasUpcomingEvents
  };
};