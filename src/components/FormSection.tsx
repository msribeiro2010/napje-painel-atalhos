import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, FileText, History, Settings } from 'lucide-react';
import { FormData } from '@/types/form';
import { perfis, graus, orgaosJulgadores, resumosPadroes } from '@/constants/form-options';
import { obterOrgaoJulgadorDoProcesso } from '@/utils/processo-parser';

import { OrgaoJulgadorSearchSelect } from './OrgaoJulgadorSearchSelect';
import { OrgaoJulgadorSearchSelect2Grau } from './OrgaoJulgadorSearchSelect2Grau';
import { UsuarioAutoComplete } from './UsuarioAutoComplete';
import { InputComSugestoes } from './InputComSugestoes';
import { useSugestoes } from '@/hooks/useSugestoes';
import { useState, useEffect } from 'react';


interface FormSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean) => void;
  onGenerateDescription: () => void;
  onResetForm: () => void;
  onShowAIHistory?: () => void;
  onShowAISettings?: () => void;
  validationErrors?: Record<string, string>;
}

export const FormSection = ({ formData, onInputChange, onGenerateDescription, onResetForm, onShowAIHistory, onShowAISettings, validationErrors = {} }: FormSectionProps) => {
  const { 
    buscarSugestoesOrgaoJulgador, 
    buscarSugestoesPerfil, 
    buscarSugestoesChamadoOrigem, 
    buscarSugestoesResumo,
    loading: sugestoesLoading 
  } = useSugestoes();

  const [sugestoesOrgaoJulgador, setSugestoesOrgaoJulgador] = useState([]);
  const [sugestoesPerfil, setSugestoesPerfil] = useState([]);
  const [sugestoesChamadoOrigem, setSugestoesChamadoOrigem] = useState([]);
  const [sugestoesResumo, setSugestoesResumo] = useState([]);

  // Carregar sugestões quando o componente montar
  useEffect(() => {
    const carregarSugestoes = async () => {
      const [perfis, chamadosOrigem, resumos] = await Promise.all([
        buscarSugestoesPerfil(),
        buscarSugestoesChamadoOrigem(),
        buscarSugestoesResumo()
      ]);
      
      setSugestoesPerfil(perfis);
      setSugestoesChamadoOrigem(chamadosOrigem);
      setSugestoesResumo(resumos);
    };
    
    carregarSugestoes();
  }, []);

  // Carregar sugestões de órgão julgador quando o grau mudar
  useEffect(() => {
    if (formData.grau) {
      const carregarSugestoesOrgao = async () => {
        const sugestoes = await buscarSugestoesOrgaoJulgador(formData.grau);
        setSugestoesOrgaoJulgador(sugestoes);
      };
      
      carregarSugestoesOrgao();
    }
  }, [formData.grau]);

  const handleProcessoChange = (value: string) => {
    onInputChange('processos', value);
    
    // Auto-preenchimento do órgão julgador para 1º grau
    if (formData.grau === '1º Grau' && value.trim()) {
      const orgaoJulgador = obterOrgaoJulgadorDoProcesso(value.trim());
      if (orgaoJulgador) {
        onInputChange('orgaoJulgador', orgaoJulgador);
      }
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-blue-600 text-white">
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Dados do Chamado
        </CardTitle>
        <CardDescription className="text-blue-100">
          Preencha todos os campos obrigatórios para gerar a descrição
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6 p-6">
         {/* Resumo first - most important field */}
         <div>
           <div className="mb-2">
             <Label htmlFor="resumo" className={validationErrors.resumo ? 'text-red-600' : ''}>Resumo *</Label>
           </div>
          <InputComSugestoes
            id="resumo"
            value={formData.resumo}
            onChange={(value) => onInputChange('resumo', value)}
            placeholder="Descreva brevemente o problema"
            sugestoes={sugestoesResumo}
            loading={sugestoesLoading}
            className={validationErrors.resumo ? 'border-red-500 focus:border-red-500' : ''}
          />
          {validationErrors.resumo && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.resumo}
            </p>
          )}
        </div>

         {/* Grid layout for better screen utilization */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <div>
             <Label htmlFor="chamadoOrigem">Chamado Origem</Label>
             <InputComSugestoes
               id="chamadoOrigem"
               value={formData.chamadoOrigem}
               onChange={(value) => onInputChange('chamadoOrigem', value)}
               placeholder="Ex: R303300 ou 11100"
               sugestoes={sugestoesChamadoOrigem}
               loading={sugestoesLoading}
             />
           </div>

          <div>
            <Label htmlFor="grau" className={validationErrors.grau ? 'text-red-600' : ''}>Grau *</Label>
            <Select value={formData.grau} onValueChange={(value) => onInputChange('grau', value)}>
              <SelectTrigger className={validationErrors.grau ? 'border-red-500 focus:border-red-500' : ''}>
                <SelectValue placeholder="Selecione o grau" />
              </SelectTrigger>
              <SelectContent>
                {graus.map((grau) => (
                  <SelectItem key={grau} value={grau}>{grau}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.grau && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.grau}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="processos">Número(s) do(s) Processo(s)</Label>
            <Input
              id="processos"
              value={formData.processos}
              onChange={(e) => handleProcessoChange(e.target.value)}
              onPaste={(e) => {
                setTimeout(() => {
                  const inputElement = e.currentTarget;
                  const newValue = inputElement.value;
                  handleProcessoChange(newValue);
                }, 10);
              }}
              placeholder="Ex: 0000000-00.0000.0.00.0000"
            />
          </div>
        </div>

        {formData.resumo === 'Outro (personalizado)' && (
          <div>
            <Label htmlFor="resumoCustom">Resumo Personalizado *</Label>
            <Input
              id="resumoCustom"
              value={formData.resumoCustom}
              onChange={(e) => onInputChange('resumoCustom', e.target.value)}
              placeholder="Digite um resumo personalizado"
            />
          </div>
        )}

        {formData.grau === '1º Grau' && (
          <div>
            <Label htmlFor="orgaoJulgador" className={validationErrors.orgaoJulgador ? 'text-red-600' : ''}>Órgão Julgador *</Label>
            <OrgaoJulgadorSearchSelect
              value={formData.orgaoJulgador}
              onValueChange={(value) => onInputChange('orgaoJulgador', value)}
              placeholder="Buscar órgão julgador por cidade ou nome..."
              orgaosJulgadores={orgaosJulgadores}
            />
            {validationErrors.orgaoJulgador && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.orgaoJulgador}
              </p>
            )}
          </div>
        )}

        {formData.grau === '2º Grau' && (
          <div>
            <Label htmlFor="orgaoJulgador" className={validationErrors.orgaoJulgador ? 'text-red-600' : ''}>Órgão Julgador de Origem *</Label>
            <OrgaoJulgadorSearchSelect2Grau
              value={formData.orgaoJulgador}
              onValueChange={(value) => onInputChange('orgaoJulgador', value)}
              placeholder="Buscar órgão julgador de 2º grau..."
            />
            {validationErrors.orgaoJulgador && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.orgaoJulgador}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="notas" className={validationErrors.notas ? 'text-red-600' : ''}>Descrição do Problema *</Label>
          <Textarea
            id="notas"
            value={formData.notas}
            onChange={(e) => onInputChange('notas', e.target.value)}
            placeholder="Descreva detalhadamente o problema, ações já realizadas e informações relevantes..."
            rows={4}
            className={validationErrors.notas ? 'border-red-500 focus:border-red-500' : ''}
          />
          {validationErrors.notas && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.notas}
            </p>
          )}
        </div>

        <UsuarioAutoComplete
          formData={formData}
          onInputChange={onInputChange}
        />


        <div className="flex gap-3">
          <Button onClick={onGenerateDescription} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Assyst com IA
          </Button>
          {onShowAIHistory && (
            <Button onClick={onShowAIHistory} variant="outline">
              <History className="h-4 w-4 mr-2" />
              Histórico IA
            </Button>
          )}
          {onShowAISettings && (
            <Button onClick={onShowAISettings} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Config IA
            </Button>
          )}
          <Button onClick={onResetForm} variant="outline">
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};