import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Clock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useSimilarityAnalysis } from '@/hooks/useSimilarityAnalysis';
import { FormData } from '@/types/form';

interface SimilarityAnalysisProps {
  formData: FormData;
}

export const SimilarityAnalysis: React.FC<SimilarityAnalysisProps> = ({ formData }) => {
  const { similarChamados, isAnalyzing, suggestions } = useSimilarityAnalysis(formData);
  const [expandedChamados, setExpandedChamados] = useState<Set<string>>(new Set());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return 'bg-red-100 text-red-800';
    if (similarity >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.7) return 'Alta';
    if (similarity >= 0.5) return 'Média';
    return 'Baixa';
  };

  const toggleChamadoExpansion = (chamadoId: string) => {
    const newExpanded = new Set(expandedChamados);
    if (newExpanded.has(chamadoId)) {
      newExpanded.delete(chamadoId);
    } else {
      newExpanded.add(chamadoId);
    }
    setExpandedChamados(newExpanded);
  };

  if (!formData.resumo && !formData.notas) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Análise de Similaridade
          {isAnalyzing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <Alert key={index} className="border-blue-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{suggestion}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Chamados Similares */}
        {similarChamados.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Chamados Similares Encontrados</h4>
            {similarChamados.map((chamado) => (
              <Card key={chamado.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{chamado.resumo}</h5>
                      <p className={`text-sm text-gray-600 ${expandedChamados.has(chamado.id) ? '' : 'line-clamp-2'}`}>
                        {chamado.notas}
                      </p>
                    </div>
                    <Badge className={getSimilarityColor(chamado.similarity)}>
                      {getSimilarityLabel(chamado.similarity)} ({Math.round(chamado.similarity * 100)}%)
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(chamado.createdAt)}
                      </span>
                      {chamado.grau && (
                        <Badge variant="outline" className="text-xs">
                          {chamado.grau}
                        </Badge>
                      )}
                      {chamado.orgaoJulgador && (
                        <span className="truncate max-w-[200px]">
                          {chamado.orgaoJulgador}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {chamado.resolucao && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolvido
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => toggleChamadoExpansion(chamado.id)}
                      >
                        {expandedChamados.has(chamado.id) ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {chamado.resolucao && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Resolução:</strong> {chamado.resolucao}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isAnalyzing && (
            <div className="text-center py-6 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum chamado similar encontrado</p>
              <p className="text-sm">Continue preenchendo os dados para uma análise mais precisa</p>
            </div>
          )
        )}
        
        {isAnalyzing && (
          <div className="text-center py-6 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Analisando similaridade...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};