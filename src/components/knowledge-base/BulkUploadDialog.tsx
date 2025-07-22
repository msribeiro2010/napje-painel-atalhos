import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle, XCircle, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { KnowledgeBaseFormData } from '@/types/knowledge-base';

interface ExtractedItem {
  titulo: string;
  problema_descricao: string;
  solucao: string;
  categoria: string;
  tags: string[];
  selected?: boolean;
}

interface BulkUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveItems: (items: KnowledgeBaseFormData[]) => Promise<void>;
}

export const BulkUploadDialog = ({
  isOpen,
  onOpenChange,
  onSaveItems
}: BulkUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedItems([]);
    } else {
      toast.error('Por favor, selecione um arquivo PDF válido');
    }
  };

  const handleExtractContent = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PDF primeiro');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://zpufcvesenbhtmizmjiz.supabase.co/functions/v1/extract-multiple-knowledge-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWZjdmVzZW5iaHRtaXptaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDY5ODMsImV4cCI6MjA2NTA4Mjk4M30.aD0E3fkuTjaYnHRdWpYjCk_hPK-sKhVT2VdIfXy3Hy8`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const itemsWithSelection = result.data.map((item: ExtractedItem) => ({
          ...item,
          selected: true
        }));
        setExtractedItems(itemsWithSelection);
        toast.success(`${result.totalItems} problemas/soluções extraídos do PDF!`);
      } else {
        throw new Error(result.error || 'Erro ao processar PDF');
      }
    } catch (error) {
      console.error('Erro ao extrair conteúdo:', error);
      toast.error('Erro ao processar PDF. Verifique se a chave da OpenAI está configurada.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    setExtractedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItem = (index: number, updatedItem: Partial<ExtractedItem>) => {
    setExtractedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, ...updatedItem } : item
      )
    );
    setEditingIndex(null);
  };

  const handleSaveSelected = async () => {
    const selectedItems = extractedItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item para salvar');
      return;
    }

    const formattedItems: KnowledgeBaseFormData[] = selectedItems.map(item => ({
      titulo: item.titulo,
      problema_descricao: item.problema_descricao,
      solucao: item.solucao,
      categoria: item.categoria,
      tags: item.tags,
      arquivo_print: null
    }));

    try {
      await onSaveItems(formattedItems);
      toast.success(`${selectedItems.length} itens salvos na base de conhecimento!`);
      onOpenChange(false);
      setFile(null);
      setExtractedItems([]);
    } catch (error) {
      toast.error('Erro ao salvar itens');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload em Lote - PDF
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF com anotações de problemas e extraia automaticamente múltiplos itens para a base de conhecimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="pdfFile">Arquivo PDF</Label>
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
            
            {file && (
              <div className="flex items-center justify-between p-4 bg-gradient-accent rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button 
                  onClick={handleExtractContent}
                  disabled={isProcessing}
                  variant="default"
                >
                  {isProcessing ? 'Processando...' : 'Extrair Conteúdo'}
                </Button>
              </div>
            )}
          </div>

          {/* Extracted Items */}
          {extractedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Itens Extraídos ({extractedItems.length})</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtractedItems(prev => 
                      prev.map(item => ({ ...item, selected: true }))
                    )}
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtractedItems(prev => 
                      prev.map(item => ({ ...item, selected: false }))
                    )}
                  >
                    Desmarcar Todos
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 max-h-[400px] overflow-y-auto">
                {extractedItems.map((item, index) => (
                  <Card key={index} className={`${item.selected ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.selected || false}
                            onChange={() => toggleItemSelection(index)}
                            className="w-4 h-4"
                          />
                          {editingIndex === index ? (
                            <Input
                              value={item.titulo}
                              onChange={(e) => updateItem(index, { titulo: e.target.value })}
                              className="font-semibold"
                            />
                          ) : (
                            <CardTitle className="text-lg">{item.titulo}</CardTitle>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingIndex === index ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(null)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-destructive mb-1">Problema:</h4>
                        {editingIndex === index ? (
                          <Textarea
                            value={item.problema_descricao}
                            onChange={(e) => updateItem(index, { problema_descricao: e.target.value })}
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{item.problema_descricao}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-green-600 mb-1">Solução:</h4>
                        {editingIndex === index ? (
                          <Textarea
                            value={item.solucao}
                            onChange={(e) => updateItem(index, { solucao: e.target.value })}
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{item.solucao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.categoria}</Badge>
                        {item.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveSelected}
                  disabled={extractedItems.filter(item => item.selected).length === 0}
                >
                  Salvar Selecionados ({extractedItems.filter(item => item.selected).length})
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};