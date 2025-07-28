import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, RefreshCw, Sparkles, Brain, Zap, Target, CheckCircle } from 'lucide-react';
import { useTextEnhancement } from '@/hooks/useTextEnhancement';
import { FormData } from '@/types/form';
import { toast } from 'sonner';

interface EnhancedAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onProceedToGenerate: (enhancedDescription?: string, suggestedSolution?: string) => void;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  strengths: string[];
  speed: 'fast' | 'medium' | 'slow';
}

const aiModels: AIModel[] = [
  {
    id: 'creative',
    name: 'IA Criativa',
    description: 'Focada em soluções inovadoras e abordagens criativas',
    icon: <Sparkles className="h-4 w-4" />,
    strengths: ['Soluções inovadoras', 'Abordagens alternativas', 'Linguagem envolvente'],
    speed: 'medium'
  },
  {
    id: 'analytical',
    name: 'IA Analítica',
    description: 'Especializada em análise técnica e soluções estruturadas',
    icon: <Brain className="h-4 w-4" />,
    strengths: ['Análise detalhada', 'Soluções técnicas', 'Estrutura lógica'],
    speed: 'slow'
  },
  {
    id: 'quick',
    name: 'IA Rápida',
    description: 'Respostas rápidas e diretas para problemas comuns',
    icon: <Zap className="h-4 w-4" />,
    strengths: ['Velocidade', 'Respostas diretas', 'Eficiência'],
    speed: 'fast'
  },
  {
    id: 'specialized',
    name: 'IA Especializada',
    description: 'Focada em problemas específicos do sistema judiciário',
    icon: <Target className="h-4 w-4" />,
    strengths: ['Conhecimento jurídico', 'Contexto específico', 'Precisão técnica'],
    speed: 'medium'
  }
];

const toneOptions = [
  { value: 'formal', label: 'Formal' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'amigavel', label: 'Amigável' },
  { value: 'direto', label: 'Direto' },
  { value: 'detalhado', label: 'Detalhado' }
];

const priorityOptions = [
  { value: 'clareza', label: 'Clareza' },
  { value: 'completude', label: 'Completude' },
  { value: 'brevidade', label: 'Brevidade' },
  { value: 'precisao', label: 'Precisão técnica' }
];

export const EnhancedAIDialog: React.FC<EnhancedAIDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onProceedToGenerate
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('analytical');
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [selectedPriority, setSelectedPriority] = useState<string>('clareza');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [results, setResults] = useState<Record<string, { description: string; solution: string }>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>('config');
  
  const { enhanceText } = useTextEnhancement();

  const generateWithModel = async (modelId: string) => {
    if (!formData.notas) {
      toast.error('⚠️ Preencha a descrição do problema primeiro para gerar conteúdo inteligente');
      return;
    }

    setIsGenerating(prev => ({ ...prev, [modelId]: true }));
    
    // Toast de início da geração
    const loadingToast = toast.loading(`🤖 Gerando descrição inteligente com ${aiModels.find(m => m.id === modelId)?.name}...`);
    
    try {
      const model = aiModels.find(m => m.id === modelId);
      
      // Prompt melhorado e mais específico
      const contextualPrompt = `
        Você é um especialista em suporte técnico do sistema NAPJe (Núcleo de Apoio ao PJe).
        
        CONTEXTO DO SISTEMA:
        - Resumo: ${formData.resumo}
        - Grau: ${formData.grau}
        - Órgão Julgador: ${formData.orgaoJulgador}
        
        CONFIGURAÇÕES DE GERAÇÃO:
        - Modelo: ${model?.name}
        - Tom: ${selectedTone}
        - Prioridade: ${selectedPriority}
        - Instruções específicas: ${customInstructions}
        
        PROBLEMA RELATADO:
        ${formData.notas}
        
        TAREFA:
        Gere uma descrição técnica, clara e profissional do problema para um chamado ASSYST.
        
        DIRETRIZES OBRIGATÓRIAS:
        ✅ Use linguagem técnica apropriada para TI
        ✅ Seja específico sobre sintomas e comportamentos
        ✅ Inclua passos para reproduzir o problema se possível
        ✅ Mantenha foco no problema técnico
        ✅ Use formatação clara e organizada
        
        ❌ NÃO inclua dados pessoais (nomes, CPFs)
        ❌ NÃO inclua números de processo
        ❌ NÃO misture problema com solução
        ❌ NÃO use linguagem informal
      `;

      const solutionPrompt = `
        Com base no problema: "${formData.notas}"
        
        Gere uma sugestão de solução técnica concisa e prática para o suporte ASSYST.
        
        Incluir:
        - Passos de verificação
        - Possíveis causas
        - Ações recomendadas
        - Escalações se necessário
      `;

      const [enhancedDescription, suggestedSolution] = await Promise.all([
        enhanceText(contextualPrompt, 'descricao'),
        enhanceText(solutionPrompt, 'sugestao_solucao')
      ]);

      if (enhancedDescription && suggestedSolution) {
        setResults(prev => ({
          ...prev,
          [modelId]: {
            description: enhancedDescription,
            solution: suggestedSolution
          }
        }));
        
        // Mudar para a aba de resultados após gerar
        setActiveTab('results');
        
        // Toast de sucesso
        toast.dismiss(loadingToast);
        toast.success(`✅ Descrição gerada com sucesso usando ${model?.name}!`, {
          description: "Verifique o resultado na aba 'Resultados'"
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('❌ Falha na geração. Verifique sua conexão e tente novamente.');
      }
      
    } catch (error) {
      console.error('Erro ao gerar com IA:', error);
      toast.dismiss(loadingToast);
      toast.error('🔥 Erro na geração inteligente. Tente novamente ou use outro modelo.');
    } finally {
      setIsGenerating(prev => ({ ...prev, [modelId]: false }));
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copiado para a área de transferência`);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const getSpeedBadge = (speed: string) => {
    const colors = {
      fast: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      slow: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      fast: 'Rápido',
      medium: 'Médio',
      slow: 'Detalhado'
    };
    
    return (
      <Badge className={colors[speed as keyof typeof colors]}>
        {labels[speed as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerar Descrição Inteligente - ASSYST
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-6">
            {/* Seleção de Modelo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Escolha o Modelo de IA para Gerar sua Descrição</h3>
              <p className="text-sm text-gray-600">Selecione o modelo de IA mais adequado para o seu tipo de problema. Cada modelo possui características específicas para gerar descrições otimizadas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-all ${
                      selectedModel === model.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          {model.icon}
                          {model.name}
                        </div>
                        {getSpeedBadge(model.speed)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Pontos Fortes:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.strengths.map((strength, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Configurações Avançadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="tone">Tom da Resposta</Label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Instruções Customizadas */}
            <div className="space-y-3">
              <Label htmlFor="instructions">Instruções Adicionais (Opcional)</Label>
              <Textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ex: Foque em soluções técnicas, mencione procedimentos específicos, etc."
                rows={3}
              />
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button 
                onClick={() => generateWithModel(selectedModel)}
                disabled={isGenerating[selectedModel]}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating[selectedModel] ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando descrição inteligente...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    🚀 Gerar Descrição ASSYST com {aiModels.find(m => m.id === selectedModel)?.name}
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  aiModels.forEach(model => generateWithModel(model.id));
                }}
                disabled={Object.values(isGenerating).some(Boolean)}
                className="border-blue-200 hover:bg-blue-50"
              >
                {Object.values(isGenerating).some(Boolean) ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "🔥 Gerar com Todos os Modelos"
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {Object.keys(results).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado gerado ainda</p>
                <p className="text-sm">Configure e gere conteúdo na aba anterior</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(results).map(([modelId, result]) => {
                  const model = aiModels.find(m => m.id === modelId);
                  return (
                    <Card key={modelId} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {model?.icon}
                          {model?.name}
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Descrição Melhorada */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Descrição Melhorada</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.description, 'Descrição')}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                            {result.description}
                          </div>
                        </div>
                        
                        {/* Sugestão de Solução */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Sugestão de Solução</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.solution, 'Solução')}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                          <div className="bg-green-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                            {result.solution}
                          </div>
                        </div>
                        
                        {/* Botão para usar este resultado */}
                        <div className="pt-3 border-t">
                          <Button
                            onClick={() => {
                              onProceedToGenerate(result.description, result.solution);
                              onOpenChange(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            🎯 Usar Este Resultado para Gerar ASSYST
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={() => {
              // Pegar o primeiro resultado disponível ou permitir prosseguir sem IA
              const firstResult = Object.values(results)[0];
              if (firstResult) {
                onProceedToGenerate(firstResult.description, firstResult.solution);
              } else {
                onProceedToGenerate();
              }
              onOpenChange(false);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            {Object.keys(results).length > 0 ? (
              <>✅ Usar Resultado Selecionado</>
            ) : (
              <>📝 Prosseguir sem IA</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};