import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTextEnhancement } from '@/hooks/useTextEnhancement';
import { FormData } from '@/types/form';
import { toast } from 'sonner';

interface AIAssystDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onProceedToGenerate: (enhancedDescription: string, suggestedSolution: string) => void;
}

export const AIAssystDialog = ({ open, onOpenChange, formData, onProceedToGenerate }: AIAssystDialogProps) => {
  const { enhanceText, isEnhancing } = useTextEnhancement();
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
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
      // Montar contexto com nome e processo, se existirem
      let contextualText = '';
      if (formData.nomeUsuario) {
        contextualText += `Usuário: ${formData.nomeUsuario}\n`;
      }
      if (formData.processos) {
        contextualText += `Número do processo: ${formData.processos}\n`;
      }
      if (contextualText) {
        contextualText += '\n';
      }
      contextualText += formData.notas;

      // Gerar descrição melhorada e solução em paralelo
      const [enhanced, solution] = await Promise.all([
        enhanceText(contextualText, 'descricao'),
        enhanceText(contextualText, 'sugestao_solucao')
      ]);

      if (enhanced) {
        setEnhancedDescription(enhanced);
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
    onProceedToGenerate(enhancedDescription, suggestedSolution);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Bot className="h-6 w-6 mr-2 text-blue-600" />
            Assyst Melhorado com IA
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
                  {/* Campos no topo */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">Chamado Origem:</span>
                      <span className="text-base">{formData.chamadoOrigem || '-'}</span>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(formData.chamadoOrigem || '', 'chamadoOrigem')} title="Copiar Chamado Origem">
                        {copiedField === 'chamadoOrigem' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">Assunto:</span>
                      <span className="text-base">{formData.resumo || '-'}</span>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(formData.resumo || '', 'assunto')} title="Copiar Assunto">
                        {copiedField === 'assunto' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">Nome:</span>
                      <span className="text-base">{[
                        formData.nomeUsuario,
                        formData.cpfUsuario,
                        formData.perfilUsuario,
                        formData.orgaoJulgador ? formData.orgaoJulgador.replace(/^\d+\s*-\s*/, '') : null
                      ].filter(Boolean).join(' / ') || '-'}</span>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard([
                        formData.nomeUsuario,
                        formData.cpfUsuario,
                        formData.perfilUsuario,
                        formData.orgaoJulgador ? formData.orgaoJulgador.replace(/^\d+\s*-\s*/, '') : null
                      ].filter(Boolean).join(' / ') || '-', 'nome')} title="Copiar Nome">
                        {copiedField === 'nome' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
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
                    onClick={handleProceed}
                    disabled={!enhancedDescription}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Prosseguir para Gerar Assyst
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
