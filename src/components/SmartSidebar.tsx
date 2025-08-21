import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  FileText, 
  Clock, 
  Zap, 
  Settings, 
  History, 
  Lightbulb,
  TrendingUp,
  Target,
  Layers
} from 'lucide-react';
import { FormData } from '@/types/form';
import { AIInsightsPanel } from './AIInsightsPanel';
import { SimilarityAnalysis } from './SimilarityAnalysis';

interface SmartSidebarProps {
  formData: FormData;
  onApplySuggestion: (suggestion: any) => void;
  onShowTemplateSelector: () => void;
  onShowAIHistory: () => void;
  onShowAISettings: () => void;
}

export const SmartSidebar: React.FC<SmartSidebarProps> = ({
  formData,
  onApplySuggestion,
  onShowTemplateSelector,
  onShowAIHistory,
  onShowAISettings
}) => {
  const [activeTab, setActiveTab] = useState('insights');

  // Calcular estatísticas do formulário
  const getFormCompleteness = () => {
    const fields = ['resumo', 'grau', 'orgaoJulgador', 'notas'];
    const filledFields = fields.filter(field => formData[field as keyof FormData]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const getFormQuality = () => {
    let score = 0;
    if (formData.resumo && formData.resumo.length > 10) score += 25;
    if (formData.notas && formData.notas.length > 20) score += 25;
    if (formData.grau) score += 25;
    if (formData.orgaoJulgador) score += 25;
    return score;
  };

  const completeness = getFormCompleteness();
  const quality = getFormQuality();

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Brain className="h-4 w-4" />
            </div>
            Assistente Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Métricas do Formulário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
              <div className="text-2xl font-bold text-blue-600">{completeness}%</div>
              <div className="text-xs text-muted-foreground">Completude</div>
            </div>
            <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
              <div className="text-2xl font-bold text-green-600">{quality}%</div>
              <div className="text-xs text-muted-foreground">Qualidade</div>
            </div>
          </div>

          {/* Indicadores de Status */}
          <div className="flex flex-wrap gap-2">
            {completeness >= 75 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Target className="h-3 w-3 mr-1" />
                Bem estruturado
              </Badge>
            )}
            {quality >= 75 && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Alta qualidade
              </Badge>
            )}
            {formData.notas && formData.notas.length > 50 && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Lightbulb className="h-3 w-3 mr-1" />
                Detalhado
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Funcionalidades */}
      <Card className="border-0 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
              <Brain className="h-3 w-3" />
              IA
            </TabsTrigger>
            <TabsTrigger value="similarity" className="flex items-center gap-1 text-xs">
              <Search className="h-3 w-3" />
              Similaridade
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Ações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-0">
            <AIInsightsPanel 
              formData={formData}
              onApplySuggestion={onApplySuggestion}
            />
          </TabsContent>

          <TabsContent value="similarity" className="mt-0">
            <div className="-mx-6">
              <SimilarityAnalysis formData={formData} />
            </div>
          </TabsContent>

          <TabsContent value="actions" className="mt-0">
            <CardContent className="p-0">
              <div className="space-y-3">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Ações Rápidas
                </h3>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={onShowTemplateSelector}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-colors"
                    onClick={onShowAIHistory}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Histórico IA
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-green-50 hover:border-green-200 transition-colors"
                    onClick={onShowAISettings}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações IA
                  </Button>
                </div>

                {/* Dicas Contextuais */}
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Dica</div>
                      <div className="text-yellow-700 dark:text-yellow-300">
                        {completeness < 50 
                          ? "Preencha mais campos para obter sugestões mais precisas da IA."
                          : completeness < 75
                          ? "Adicione mais detalhes na descrição do problema para melhor análise."
                          : "Formulário bem estruturado! Use a IA para otimizar a descrição."
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};