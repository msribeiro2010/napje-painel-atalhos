import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Brain, Star, Gift, Sparkles, MapPin, TrendingUp, Clock } from 'lucide-react';
import { useVacationSuggestions, VacationSuggestion } from '@/hooks/useVacationSuggestions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface VacationSuggestionsPanelProps {
  year?: number;
  onSelectSuggestion?: (suggestion: VacationSuggestion) => void;
}

export const VacationSuggestionsPanel = ({ 
  year = new Date().getFullYear(),
  onSelectSuggestion 
}: VacationSuggestionsPanelProps) => {
  const { data: suggestions = [], isLoading, error } = useVacationSuggestions(year);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  // Se houver erro, mostrar mensagem amigável
  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            IA de Férias Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Erro ao carregar sugestões de IA</p>
            <p className="text-sm">Tente novamente mais tarde</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 55) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPeriodIcon = (period: VacationSuggestion['period']) => {
    switch (period) {
      case 'virada-ano': return <Sparkles className="h-4 w-4" />;
      case 'carnaval': return <Gift className="h-4 w-4" />;
      case 'junho-julho': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPeriodLabel = (period: VacationSuggestion['period']) => {
    const labels = {
      'primeiro-semestre': '1º Semestre',
      'segundo-semestre': '2º Semestre', 
      'virada-ano': 'Virada de Ano',
      'carnaval': 'Carnaval',
      'junho-julho': 'Férias de Inverno',
      'custom': 'Personalizado'
    };
    return labels[period];
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            IA de Férias Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Analisando feriados e gerando sugestões...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            IA de Férias Inteligentes {year}
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {suggestions.length} sugestões
          </Badge>
        </CardTitle>
        <p className="text-purple-100 text-sm">
          Sugestões personalizadas baseadas nos feriados oficiais
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Nenhuma sugestão disponível</p>
            <p className="text-sm">Adicione feriados para {year} para receber sugestões personalizadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Collapsible
                key={suggestion.id}
                open={expandedSuggestion === suggestion.id}
                onOpenChange={(isOpen) => setExpandedSuggestion(isOpen ? suggestion.id : null)}
              >
                <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getPeriodIcon(suggestion.period)}
                            <span className="font-semibold text-gray-900">
                              {format(new Date(suggestion.startDate), 'dd MMM', { locale: ptBR })} - {' '}
                              {format(new Date(suggestion.endDate), 'dd MMM', { locale: ptBR })}
                            </span>
                            <Badge className={getScoreColor(suggestion.score)}>
                              <Star className="h-3 w-3 mr-1" />
                              {suggestion.score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {suggestion.totalDays} dias
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {suggestion.workDays} dias úteis
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getPeriodLabel(suggestion.period)}
                            </Badge>
                          </div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-4">
                        {/* Feriados relacionados */}
                        {suggestion.holidays.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                              <Gift className="h-4 w-4 text-orange-500" />
                              Feriados Relacionados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.holidays.map((holiday, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {holiday}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Benefícios */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Vantagens deste período
                          </h4>
                          <ul className="space-y-1">
                            {suggestion.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Botão de ação */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={() => onSelectSuggestion?.(suggestion)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Marcar no Calendário
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Footer com dica */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">Dica da IA</p>
              <p className="text-xs text-purple-700 mt-1">
                As sugestões são calculadas considerando proximidade com feriados, 
                economia em viagens e melhor aproveitamento do tempo de descanso.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
