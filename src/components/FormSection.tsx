import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, FileText, Sparkles, Zap, User, Hash, Building, MessageSquare, Scale, Wand2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormData } from '@/types/form';
import { perfis, graus, orgaosJulgadores } from '@/constants/form-options';
import { obterOrgaoJulgadorDoProcesso } from '@/utils/processo-parser';
import { CollapsibleSection } from './CollapsibleSection';

import { OrgaoJulgadorSearchSelect } from './OrgaoJulgadorSearchSelect';
import { OrgaoJulgadorSearchSelect2Grau } from './OrgaoJulgadorSearchSelect2Grau';
import { UsuarioAutoComplete } from './UsuarioAutoComplete';
import { InputComSugestoes } from './InputComSugestoes';
import { useSugestoes } from '@/hooks/useSugestoes';
import { useAssuntos } from '@/hooks/useAssuntos';
import { useState, useEffect } from 'react';


interface FormSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean) => void;
  onMultipleInputChange?: (updates: Partial<FormData>) => void;
  onGenerateDescription: () => void;
  onOptimizeText?: () => void;
  onResetForm: () => void;
  onClearForm?: () => void;
  validationErrors?: Record<string, string>;
  resumoRef?: React.RefObject<HTMLInputElement>;
  notasRef?: React.RefObject<HTMLTextAreaElement>;
  isOptimizing?: boolean;
}

export const FormSection = ({ formData, onInputChange, onMultipleInputChange, onGenerateDescription, onOptimizeText, onResetForm, onClearForm, validationErrors = {}, resumoRef, notasRef, isOptimizing = false }: FormSectionProps) => {
  const { 
    buscarSugestoesOrgaoJulgador, 
    buscarSugestoesPerfil, 
    buscarSugestoesChamadoOrigem,
    loading: sugestoesLoading 
  } = useSugestoes();

  // Hook para assuntos da tabela do Supabase
  const { assuntos, loading: assuntosLoading } = useAssuntos();

  const [sugestoesOrgaoJulgador, setSugestoesOrgaoJulgador] = useState([]);
  const [sugestoesPerfil, setSugestoesPerfil] = useState([]);
  const [sugestoesChamadoOrigem, setSugestoesChamadoOrigem] = useState([]);

  // Converter assuntos da tabela para formato de sugestões
  const sugestoesResumo = assuntos.map((assunto, index) => ({
    valor: assunto.nome,
    frequencia: 1, // Todos têm frequência 1 por serem dados da tabela
    ultimo_uso: new Date().toISOString() // Data atual como último uso
  }));

  // Carregar sugestões quando o componente montar
  useEffect(() => {
    const carregarSugestoes = async () => {
      const [perfis, chamadosOrigem] = await Promise.all([
        buscarSugestoesPerfil(),
        buscarSugestoesChamadoOrigem()
      ]);
      
      setSugestoesPerfil(perfis);
      setSugestoesChamadoOrigem(chamadosOrigem);
    };
    
    carregarSugestoes();
  }, [buscarSugestoesPerfil, buscarSugestoesChamadoOrigem]);

  // Carregar sugestões de órgão julgador quando o grau mudar
  useEffect(() => {
    if (formData.grau) {
      const carregarSugestoesOrgao = async () => {
        const sugestoes = await buscarSugestoesOrgaoJulgador(formData.grau);
        setSugestoesOrgaoJulgador(sugestoes);
      };
      
      carregarSugestoesOrgao();
    }
  }, [formData.grau, buscarSugestoesOrgaoJulgador]);

  const handleProcessoChange = (value: string) => {
    // Auto-preenchimento do órgão julgador para 1º grau
    if (formData.grau === '1º Grau' && value.trim()) {
      const orgaoJulgador = obterOrgaoJulgadorDoProcesso(value.trim());
      
      if (orgaoJulgador && onMultipleInputChange) {
        // Use multiple input change to update both fields at once
        // This prevents the race condition where processos field gets cleared
        onMultipleInputChange({
          processos: value,
          orgaoJulgador: orgaoJulgador
        });
        return;
      }
    }
    
    // Fallback to single field update
    onInputChange('processos', value);
  };


  return (
    <div className="space-y-4">
      {/* Seção Principal do Chamado */}
      <CollapsibleSection
        title="Informações Básicas"
        description="Dados essenciais para criação do chamado"
        icon={<FileText />}
        variant="primary"
        required={true}
        defaultExpanded={true}
      >
        <div className="space-y-6">
          {/* Grid de Campos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chamado Origem */}
            <div className="space-y-2">
              <Label htmlFor="chamadoOrigem" className="text-sm font-medium">
                Chamado Origem
              </Label>
              <InputComSugestoes
                id="chamadoOrigem"
                value={formData.chamadoOrigem}
                onChange={(value) => onInputChange('chamadoOrigem', value)}
                sugestoes={sugestoesChamadoOrigem}
                placeholder="Número do chamado de origem"
              />
            </div>

            {/* Assunto */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="resumo" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Assunto *
              </Label>
              <InputComSugestoes
                ref={resumoRef}
                id="resumo"
                value={formData.resumo}
                onChange={(value) => onInputChange('resumo', value)}
                sugestoes={sugestoesResumo}
                placeholder="Selecione ou digite o assunto do problema"
                className={validationErrors.resumo ? 'border-red-500' : ''}
              />
              {validationErrors.resumo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.resumo}
                </p>
              )}
            </div>

            {/* Assunto Personalizado - só aparece se resumo for 'Outro (personalizado)' */}
            {formData.resumo === 'Outro (personalizado)' && (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="resumoCustom" className="text-sm font-medium">
                  Assunto Personalizado *
                </Label>
                <Input
                  id="resumoCustom"
                  value={formData.resumoCustom}
                  onChange={(e) => onInputChange('resumoCustom', e.target.value)}
                  placeholder="Digite o assunto personalizado"
                  className={validationErrors.resumoCustom ? 'border-red-500' : ''}
                />
                {validationErrors.resumoCustom && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.resumoCustom}
                  </p>
                )}
              </div>
            )}

            {/* Grau */}
            <div className="space-y-2">
              <Label htmlFor="grau" className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Grau *
              </Label>
              <Select value={formData.grau} onValueChange={(value) => onInputChange('grau', value)}>
                <SelectTrigger className={validationErrors.grau ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o grau" />
                </SelectTrigger>
                <SelectContent>
                  {graus.map((grau) => (
                    <SelectItem key={grau} value={grau}>
                      {grau}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.grau && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.grau}
                </p>
              )}
            </div>

            {/* Número(s) do(s) Processo(s) */}
            <div className="space-y-2">
              <Label htmlFor="processos" className="text-sm font-medium">
                Número(s) do(s) Processo(s)
              </Label>
              <Input
                id="processos"
                value={formData.processos}
                onChange={(e) => handleProcessoChange(e.target.value)}
                placeholder="Ex: 0010715-11.2022.5.15.0092"
              />
            </div>
          </div>

          {/* Órgão Julgador - condicional baseado no grau */}
          {formData.grau && (
            <div className="space-y-2">
              <Label htmlFor="orgaoJulgador" className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Órgão Julgador *
              </Label>
              {formData.grau === '1º Grau' ? (
                <OrgaoJulgadorSearchSelect
                  value={formData.orgaoJulgador}
                  onValueChange={(value) => onInputChange('orgaoJulgador', value)}
                  placeholder="Buscar órgão julgador por cidade ou nome..."
                  orgaosJulgadores={orgaosJulgadores}
                />
              ) : (
                <OrgaoJulgadorSearchSelect2Grau
                  value={formData.orgaoJulgador}
                  onValueChange={(value) => onInputChange('orgaoJulgador', value)}
                  placeholder="Buscar órgão julgador de 2º grau..."
                />
              )}
              {validationErrors.orgaoJulgador && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.orgaoJulgador}
                </p>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Seção de Usuário */}
      <UsuarioAutoComplete
        formData={formData}
        onInputChange={onInputChange}
        onMultipleInputChange={onMultipleInputChange}
      />

      {/* Seção de Descrição */}
      <CollapsibleSection
        title="Descrição do Problema"
        description="Detalhe o problema relatado pelo usuário"
        icon={<MessageSquare />}
        variant="success"
        required={true}
        defaultExpanded={true}
      >
          <div className="space-y-2">
            <div className="relative">
              <Textarea
                ref={notasRef}
                id="notas"
                value={formData.notas}
                onChange={(e) => onInputChange('notas', e.target.value)}
                placeholder="Descreva detalhadamente o problema relatado pelo usuário..."
                className={`min-h-[200px] resize-none pr-20 ${validationErrors.notas ? 'border-red-500' : ''}`}
              />
              {formData.notas && onOptimizeText && (
                <Button
                  type="button"
                  onClick={onOptimizeText}
                  size="sm"
                  variant="outline"
                  disabled={isOptimizing}
                  className="absolute top-2 right-2 h-8 px-2 text-xs bg-white/90 hover:bg-white border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 shadow-sm disabled:opacity-50"
                >
                  <Wand2 className={`h-3 w-3 mr-1 ${isOptimizing ? 'animate-spin' : ''}`} />
                  {isOptimizing ? 'Otimizando...' : 'Otimizar IA'}
                </Button>
              )}
            </div>
            {validationErrors.notas && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.notas}
              </p>
            )}
          </div>
      </CollapsibleSection>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4 mt-6">
        <Button 
          onClick={onClearForm || onResetForm}
          size="lg"
          variant="outline"
          className="h-14 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="font-semibold">Limpar Dados</div>
            </div>
          </div>
        </Button>
        
        <Button 
          onClick={onGenerateDescription}
          size="lg"
          className="h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="font-semibold">Gerar JIRA</div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};