import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, FileText, Save, Sparkles, Zap, User, Hash, Building, Settings, MessageSquare, Scale } from 'lucide-react';
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
  onSaveChamado?: () => void;
  onResetForm: () => void;
  validationErrors?: Record<string, string>;
  resumoRef?: React.RefObject<HTMLInputElement>;
  notasRef?: React.RefObject<HTMLTextAreaElement>;
}

export const FormSection = ({ formData, onInputChange, onMultipleInputChange, onGenerateDescription, onSaveChamado, onResetForm, validationErrors = {}, resumoRef, notasRef }: FormSectionProps) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resumo */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="resumo" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Resumo *
              </Label>
              <InputComSugestoes
                ref={resumoRef}
                id="resumo"
                value={formData.resumo}
                onChange={(value) => onInputChange('resumo', value)}
                sugestoes={sugestoesResumo}
                placeholder="Selecione ou digite o resumo do problema"
                className={validationErrors.resumo ? 'border-red-500' : ''}
              />
              {validationErrors.resumo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.resumo}
                </p>
              )}
            </div>

            {/* Resumo Personalizado - só aparece se resumo for 'Outro (personalizado)' */}
            {formData.resumo === 'Outro (personalizado)' && (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="resumoCustom" className="text-sm font-medium">
                  Resumo Personalizado *
                </Label>
                <Input
                  id="resumoCustom"
                  value={formData.resumoCustom}
                  onChange={(e) => onInputChange('resumoCustom', e.target.value)}
                  placeholder="Digite o resumo personalizado"
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
              placeholder="Ex: 1234567-89.2023.8.02.0001"
            />
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
            <Textarea
              ref={notasRef}
              id="notas"
              value={formData.notas}
              onChange={(e) => onInputChange('notas', e.target.value)}
              placeholder="Descreva detalhadamente o problema relatado pelo usuário..."
              className={`min-h-[120px] resize-none ${validationErrors.notas ? 'border-red-500' : ''}`}
            />
            {validationErrors.notas && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.notas}
              </p>
            )}
          </div>
      </CollapsibleSection>

      {/* Seção de Usuário */}
      <CollapsibleSection
        title="Dados do Usuário"
        description="Informações do usuário afetado pelo problema"
        icon={<User />}
        variant="secondary"
        defaultExpanded={false}
        badge="Opcional"
      >
          <UsuarioAutoComplete
            formData={formData}
            onInputChange={onInputChange}
          onMultipleInputChange={onMultipleInputChange}
        />
      </CollapsibleSection>

      {/* Seção de Ações */}
      <CollapsibleSection
        title="Ações do Chamado"
        description="Salvar ou gerar descrição automaticamente com IA"
        icon={<Settings />}
        variant="warning"
        defaultExpanded={true}
        className="mt-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={onSaveChamado}
            variant="outline"
            size="lg"
            className="h-14 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:border-blue-600 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Salvar Chamado</div>
                <div className="text-xs text-muted-foreground">Salvar progresso atual</div>
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={onGenerateDescription}
            size="lg"
            className="h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 group-hover:rotate-12 group-hover:scale-110 transition-all" />
              <div className="text-left">
                <div className="font-semibold">Gerar com IA</div>
                <div className="text-xs text-purple-100">Criar descrição automática</div>
              </div>
            </div>
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  );
};