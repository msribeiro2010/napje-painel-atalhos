import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfYear, endOfYear, differenceInDays, isWeekend, isAfter, getDay } from "date-fns";

// Tipo para feriados
interface Feriado {
  id: number;
  data: string;
  descricao: string;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export interface VacationSuggestion {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  workDays: number;
  score: number;
  reason: string;
  holidays: string[];
  benefits: string[];
  period: 'primeiro-semestre' | 'segundo-semestre' | 'virada-ano' | 'carnaval' | 'junho-julho' | 'custom';
}

export const useVacationSuggestions = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ["vacation-suggestions", year],
    queryFn: async (): Promise<VacationSuggestion[]> => {
      try {
        const yearStart = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd');
        const yearEnd = format(endOfYear(new Date(year, 11, 31)), 'yyyy-MM-dd');

        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
        );

        const queryPromise = supabase
          .from('feriados' as any)
          .select('*')
          .gte('data', yearStart)
          .lte('data', yearEnd)
          .order('data', { ascending: true });

        const { data: feriados, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: Feriado[] | null, error: any };

        if (error) {
          console.error('Erro ao buscar feriados:', error);
          return [];
        }

        // Filtrar apenas feriados futuros
        const today = new Date();
        const feriadosFuturos = (feriados || []).filter(f => {
          const d = new Date(f.data);
          return isAfter(d, today) || (d.toDateString() === today.toDateString());
        });

        return generateVacationSuggestions(feriadosFuturos, year);
      } catch (error: any) {
        console.error('Erro no useVacationSuggestions:', error);
        
        // Em caso de erro de conectividade ou timeout, retorna sugestões básicas
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('Timeout') ||
            error?.name === 'TypeError') {
          console.log('Gerando sugestões básicas devido a problemas de conectividade');
          return createBasicSuggestions(year);
        }
        
        return [];
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Função para ajustar data para evitar fins de semana
function adjustDateToAvoidWeekend(date: Date, direction: 'forward' | 'backward'): Date {
  const adjustedDate = new Date(date);
  const dayOfWeek = getDay(adjustedDate); // 0 = domingo, 6 = sábado
  
  if (direction === 'forward') {
    // Se for sábado (6), avança para segunda (2 dias)
    // Se for domingo (0), avança para segunda (1 dia)
    if (dayOfWeek === 6) {
      return addDays(adjustedDate, 2);
    } else if (dayOfWeek === 0) {
      return addDays(adjustedDate, 1);
    }
  } else {
    // Se for sábado (6), volta para sexta (1 dia)
    // Se for domingo (0), volta para sexta (2 dias)
    if (dayOfWeek === 6) {
      return addDays(adjustedDate, -1);
    } else if (dayOfWeek === 0) {
      return addDays(adjustedDate, -2);
    }
  }
  
  return adjustedDate;
}

function generateVacationSuggestions(holidays: Feriado[], year: number): VacationSuggestion[] {
  try {
    const suggestions: VacationSuggestion[] = [];
    
    // Criar algumas sugestões básicas sempre, mesmo sem feriados
    if (!holidays || holidays.length === 0) {
      return createBasicSuggestions(year);
    }

    const holidayGroups = identifyHolidayGroups(holidays);
    
    holidayGroups.forEach((group, index) => {
      try {
        const groupSuggestions = createHolidayBasedSuggestions(group, year, index);
        suggestions.push(...groupSuggestions);
      } catch (error) {
        console.error(`Erro ao processar grupo ${index}:`, error);
      }
    });

    try {
      const strategicSuggestions = createStrategicSuggestions(holidays, year);
      suggestions.push(...strategicSuggestions);
    } catch (error) {
      console.error('Erro ao criar sugestões estratégicas:', error);
    }

    try {
      const yearEndSuggestions = createYearEndSuggestions(holidays, year);
      suggestions.push(...yearEndSuggestions);
    } catch (error) {
      console.error('Erro ao criar sugestões de fim de ano:', error);
    }

    return suggestions
      .filter(s => s && s.id && s.startDate && s.endDate) // Validação básica
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  } catch (error) {
    console.error('Erro em generateVacationSuggestions:', error);
    return createBasicSuggestions(year);
  }
}

function createBasicSuggestions(year: number): VacationSuggestion[] {
  return [
    {
      id: 'basic-january',
      startDate: `${year}-01-08`,
      endDate: `${year}-01-17`,
      totalDays: 10,
      workDays: 8,
      score: 60,
      reason: 'Início de ano tranquilo',
      holidays: [],
      benefits: ['Preços baixos', 'Destinos menos movimentados'],
      period: 'primeiro-semestre'
    },
    {
      id: 'basic-may',
      startDate: `${year}-05-06`,
      endDate: `${year}-05-15`,
      totalDays: 10,
      workDays: 8,
      score: 55,
      reason: 'Outono agradável',
      holidays: [],
      benefits: ['Clima ameno', 'Baixa temporada'],
      period: 'primeiro-semestre'
    }
  ];
}

function identifyHolidayGroups(holidays: Feriado[]) {
  const groups: Feriado[][] = [];
  let currentGroup: Feriado[] = [];
  
  holidays.forEach((holiday, index) => {
    const holidayDate = createLocalDate(holiday.data);
    
    if (currentGroup.length === 0) {
      currentGroup.push(holiday);
    } else {
      const lastHoliday = createLocalDate(currentGroup[currentGroup.length - 1].data);
      const daysDiff = differenceInDays(holidayDate, lastHoliday);
      
      if (daysDiff <= 10) {
        currentGroup.push(holiday);
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [holiday];
      }
    }
    
    if (index === holidays.length - 1 && currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }
  });

  return groups;
}

// Função para criar data local a partir de string YYYY-MM-DD
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month é 0-indexed
}

function createHolidayBasedSuggestions(holidayGroup: Feriado[], year: number, groupIndex: number): VacationSuggestion[] {
  const suggestions: VacationSuggestion[] = [];
  if (holidayGroup.length === 0) return suggestions;

  // O grupo pode conter mais de um feriado próximo (em até 10 dias)
  // A sugestão "após" deve sempre começar no dia seguinte ao último feriado do grupo
  const firstHoliday = createLocalDate(holidayGroup[0].data);
  const lastHoliday = createLocalDate(holidayGroup[holidayGroup.length - 1].data);

  // Antes do primeiro feriado do grupo
  const beforeEnd = adjustDateToAvoidWeekend(addDays(firstHoliday, -1), 'backward'); // Dia anterior ao feriado, evitando fim de semana
  const beforeStart = adjustDateToAvoidWeekend(addDays(beforeEnd, -9), 'backward'); // 9 dias antes do beforeEnd (total 10 dias úteis)
  if (beforeStart.getFullYear() === year) {
    suggestions.push({
      id: `before-${groupIndex}`,
      startDate: format(beforeStart, 'yyyy-MM-dd'),
      endDate: format(beforeEnd, 'yyyy-MM-dd'),
      totalDays: differenceInDays(beforeEnd, beforeStart) + 1,
      workDays: calculateWorkDays(beforeStart, beforeEnd),
      score: calculateScore(beforeStart, beforeEnd, holidayGroup, 'before'),
      reason: `Emendar com ${holidayGroup.map(h => h.descricao).join(', ')}`,
      holidays: holidayGroup.map(h => h.descricao),
      benefits: [
        'Período estendido de descanso',
        'Aproveita feriados sequenciais',
        'Menor custo de viagem'
      ],
      period: getPeriodType(firstHoliday)
    });
  }

  // Após o último feriado do grupo: férias começam no primeiro dia útil após o feriado
  // Se o feriado for em dia útil, as férias começam no dia seguinte
  // Se o feriado for em fim de semana, as férias começam na segunda-feira seguinte
  let afterStart = addDays(lastHoliday, 1);
  afterStart = adjustDateToAvoidWeekend(afterStart, 'forward');
  // Calcular 8 dias úteis a partir do afterStart (padrão das sugestões básicas)
  let afterEnd = new Date(afterStart);
  let workDaysCount = 0;
  while (workDaysCount < 6) { // 6 dias adicionais para totalizar 7 dias úteis (incluindo o primeiro dia)
    afterEnd = addDays(afterEnd, 1);
    if (!isWeekend(afterEnd)) {
      workDaysCount++;
    }
  }
  afterEnd = adjustDateToAvoidWeekend(afterEnd, 'backward'); // Garantir que termine em dia útil
  
  if (afterEnd.getFullYear() === year) {
    suggestions.push({
      id: `after-${groupIndex}`,
      startDate: format(afterStart, 'yyyy-MM-dd'),
      endDate: format(afterEnd, 'yyyy-MM-dd'),
      totalDays: differenceInDays(afterEnd, afterStart) + 1,
      workDays: calculateWorkDays(afterStart, afterEnd),
      score: calculateScore(afterStart, afterEnd, holidayGroup, 'after'),
      reason: `Estender após ${holidayGroup.map(h => h.descricao).join(', ')}`,
      holidays: holidayGroup.map(h => h.descricao),
      benefits: [
        'Máximo aproveitamento dos feriados',
        'Volta ao trabalho mais descansado',
        'Evita multidões do retorno',
        'Período otimizado (evita fins de semana)'
      ],
      period: getPeriodType(lastHoliday)
    });
  }

  return suggestions;
}

function createStrategicSuggestions(holidays: Feriado[], year: number): VacationSuggestion[] {
  const suggestions: VacationSuggestion[] = [];
  
  const janStart = new Date(year, 0, 8);
  const janEnd = new Date(year, 0, 17);
  
  suggestions.push({
    id: 'strategic-january',
    startDate: format(janStart, 'yyyy-MM-dd'),
    endDate: format(janEnd, 'yyyy-MM-dd'),
    totalDays: 10,
    workDays: calculateWorkDays(janStart, janEnd),
    score: 75,
    reason: 'Início de ano tranquilo e preços baixos',
    holidays: [],
    benefits: [
      'Destinos vazios pós-festividades',
      'Preços promocionais',
      'Clima de verão'
    ],
    period: 'primeiro-semestre'
  });

  const mayStart = new Date(year, 4, 6);
  const mayEnd = new Date(year, 4, 15);
  
  suggestions.push({
    id: 'strategic-may',
    startDate: format(mayStart, 'yyyy-MM-dd'),
    endDate: format(mayEnd, 'yyyy-MM-dd'),
    totalDays: 10,
    workDays: calculateWorkDays(mayStart, mayEnd),
    score: 70,
    reason: 'Outono com clima agradável',
    holidays: [],
    benefits: [
      'Clima perfeito para turismo',
      'Baixa temporada',
      'Natureza em transição'
    ],
    period: 'primeiro-semestre'
  });

  return suggestions;
}

function createYearEndSuggestions(holidays: Feriado[], year: number): VacationSuggestion[] {
  const suggestions: VacationSuggestion[] = [];
  
  const yearEndStart = new Date(year, 11, 20);
  const nextYearEnd = new Date(year + 1, 0, 10);
  
  suggestions.push({
    id: 'year-end-extended',
    startDate: format(yearEndStart, 'yyyy-MM-dd'),
    endDate: format(nextYearEnd, 'yyyy-MM-dd'),
    totalDays: 22,
    workDays: calculateWorkDays(yearEndStart, nextYearEnd),
    score: 90,
    reason: 'Virada de ano estendida - máximo descanso',
    holidays: holidays
      .filter(h => {
        const hDate = new Date(h.data);
        return (hDate >= yearEndStart && hDate <= nextYearEnd);
      })
      .map(h => h.descricao),
    benefits: [
      'Período completo de renovação',
      'Aproveita todas as festas',
      'Momento perfeito para viagens longas'
    ],
    period: 'virada-ano'
  });

  return suggestions;
}

function calculateWorkDays(startDate: Date, endDate: Date): number {
  let workDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      workDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return workDays;
}

function calculateScore(startDate: Date, endDate: Date, holidays: Feriado[], position: 'before' | 'after'): number {
  let score = 50;
  
  score += holidays.length * 15;
  
  if (position === 'after') score += 10;
  
  const month = startDate.getMonth();
  if (month === 11 || month === 0) score += 20;
  if (month >= 5 && month <= 7) score += 15;
  if (month >= 2 && month <= 4) score += 10;
  
  if (month === 1) score -= 5;
  
  return Math.min(100, score);
}

function getPeriodType(date: Date): VacationSuggestion['period'] {
  const month = date.getMonth();
  
  if (month >= 0 && month <= 5) return 'primeiro-semestre';
  if (month >= 6 && month <= 11) return 'segundo-semestre';
  if (month === 11 || month === 0) return 'virada-ano';
  if (month === 1 || month === 2) return 'carnaval';
  if (month === 5 || month === 6) return 'junho-julho';
  
  return 'custom';
}
