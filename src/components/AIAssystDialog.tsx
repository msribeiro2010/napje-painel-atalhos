import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTextEnhancement } from '@/hooks/useTextEnhancement';
import { FormData } from '@/types/form';
import { generateAITemplate } from '@/utils/description-generator';
import { toast } from 'sonner';

interface AIAssystDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onProceedToGenerate: (aiTemplate: string, suggestedSolution: string) => void;
}

export const AIAssystDialog = ({ open, onOpenChange, formData, onProceedToGenerate }: AIAssystDialogProps) => {
  const { enhanceText, isEnhancing } = useTextEnhancement();
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [aiTemplate, setAiTemplate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (open && formData.notas) {
      generateAIContent();
    }
  }, [open, formData.notas]);

  const generateAIContent = async () => {
    if (!formData.notas) return;
    
    setIsProcessing(true);
    
    try {
      // Criar contexto adicional para a IA
      let contextualText = formData.notas;
      
      if (formData.processos) {
        contextualText += `\n\nNúmero do processo: ${formData.processos}`;
      }
      
      if (formData.orgaoJulgador) {
        contextualText += `\nÓrgão julgador: ${formData.orgaoJulgador}`;
      }
      
      if (formData.grau) {
        contextualText += `\nGrau: ${formData.grau}`;
      }

      // Gerar descrição melhorada e solução em paralelo
      const [enhanced, solution] = await Promise.all([
        enhanceText(contextualText, 'descricao'),
        enhanceText(contextualText, 'sugestao_solucao')
      ]);

      if (enhanced) {
        setEnhancedDescription(enhanced);
        // Gerar template automaticamente com a descrição melhorada
        const template = generateAITemplate(formData, enhanced);
        setAiTemplate(template);
      }
      
      if (solution) {
        setSuggestedSolution(solution);
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo com IA:', error);
      toast.error('Erro ao processar com IA');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar texto');
    }
  };

  const handleProceed = () => {
    onProceedToGenerate(aiTemplate, suggestedSolution);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Bot className="h-6 w-6 mr-2 text-blue-600" />
            Gerador de Chamado com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isProcessing ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-blue-600 animate-pulse mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Processando com IA...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Analisando a descrição e gerando sugestões
              </p>
            </div>
          ) : (
            <>
              {/* Descrição Melhorada */}
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                    Descrição do Problema Melhorada
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Descrição Original:</Label>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.notas}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Descrição Melhorada pela IA:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(enhancedDescription, 'description')}
                        className="flex items-center gap-2"
                      >
                        {copiedField === 'description' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={enhancedDescription}
                      onChange={(e) => setEnhancedDescription(e.target.value)}
                      rows={6}
                      className="font-medium"
                      placeholder="A IA irá melhorar a descrição do problema..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Template Final do Chamado */}
              <Card>
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-purple-600" />
                    Template Final do Chamado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Prévia do template que será gerado:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(aiTemplate, 'template')}
                        className="flex items-center gap-2"
                      >
                        {copiedField === 'template' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={aiTemplate}
                      onChange={(e) => setAiTemplate(e.target.value)}
                      rows={8}
                      className="font-medium bg-purple-50 font-mono text-sm"
                      placeholder="O template será gerado automaticamente..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Solução Sugerida */}
              <Card>
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-green-600" />
                    Solução Sugerida pela IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sugestão baseada na base de conhecimento e análise:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(suggestedSolution, 'solution')}
                        className="flex items-center gap-2"
                      >
                        {copiedField === 'solution' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={suggestedSolution}
                      onChange={(e) => setSuggestedSolution(e.target.value)}
                      rows={5}
                      className="font-medium bg-green-50"
                      placeholder="A IA irá sugerir uma solução baseada no problema descrito..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                
                <div className="space-x-3">
                  <Button
                    variant="outline"
                    onClick={generateAIContent}
                    disabled={isEnhancing || !formData.notas}
                  >
                    Regenerar com IA
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const template = generateAITemplate(formData, enhancedDescription);
                      setAiTemplate(template);
                      toast.success('Template regenerado!');
                    }}
                    disabled={!enhancedDescription}
                  >
                    Atualizar Template
                  </Button>
                  
                  <Button
                    onClick={handleProceed}
                    disabled={!aiTemplate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Usar Template com IA
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
