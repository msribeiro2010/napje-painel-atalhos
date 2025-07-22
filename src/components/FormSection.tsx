import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, FileText } from 'lucide-react';
import { FormData } from '@/types/form';
import { perfis, graus, orgaosJulgadores, resumosPadroes } from '@/constants/form-options';
import { obterOrgaoJulgadorDoProcesso } from '@/utils/processo-parser';
import { AssuntoSearchSelect } from './AssuntoSearchSelect';
import { OrgaoJulgadorSearchSelect } from './OrgaoJulgadorSearchSelect';
import { OrgaoJulgadorSearchSelect2Grau } from './OrgaoJulgadorSearchSelect2Grau';
import { UsuarioAutoComplete } from './UsuarioAutoComplete';


interface FormSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean) => void;
  onGenerateDescription: () => void;
  onResetForm: () => void;
}

export const FormSection = ({ formData, onInputChange, onGenerateDescription, onResetForm }: FormSectionProps) => {
  

  
  const handleProcessoChange = (value: string) => {
    console.log('HandleProcessoChange chamado com:', value);
    console.log('Grau atual:', formData.grau);
    
    // Atualiza o número do processo
    onInputChange('processos', value);
    
    // Se for 1º grau e o número do processo está preenchido, tenta preencher automaticamente o órgão julgador
    if (formData.grau === '1º Grau' && value.trim()) {
      console.log('Tentando obter órgão julgador para:', value);
      const orgaoJulgador = obterOrgaoJulgadorDoProcesso(value);
      console.log('Órgão julgador obtido:', orgaoJulgador);
      if (orgaoJulgador) {
        console.log('Preenchendo órgão julgador:', orgaoJulgador);
        onInputChange('orgaoJulgador', orgaoJulgador);
      } else {
        console.log('Nenhum órgão julgador encontrado para o processo');
      }
    } else {
      console.log('Condições não atendidas - Grau:', formData.grau, 'Value:', value.trim());
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
         <div>
           <Label htmlFor="chamadoOrigem">Número do Chamado de Origem</Label>
           <Input
             id="chamadoOrigem"
             value={formData.chamadoOrigem}
             onChange={(e) => onInputChange('chamadoOrigem', e.target.value)}
             placeholder="Ex: R303300 ou 11100"
           />
         </div>

         <div>
           <div className="mb-2">
             <Label htmlFor="resumo">Resumo *</Label>
           </div>
          <AssuntoSearchSelect
            value={formData.resumo}
            onValueChange={(value) => onInputChange('resumo', value)}
            placeholder="Selecione um resumo padrão ou busque por assunto..."
            resumosPadroes={resumosPadroes}
          />
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

        <div>
          <Label htmlFor="grau">Grau *</Label>
          <Select onValueChange={(value) => onInputChange('grau', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grau" />
            </SelectTrigger>
            <SelectContent>
              {graus.map((grau) => (
                <SelectItem key={grau} value={grau}>{grau}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="processos">Número(s) do(s) Processo(s)</Label>
          <Input
            id="processos"
            value={formData.processos}
            onChange={(e) => handleProcessoChange(e.target.value)}
            placeholder="Ex: 0000000-00.0000.0.00.0000"
          />
        </div>

        {formData.grau === '1º Grau' && (
          <div>
            <Label htmlFor="orgaoJulgador">Órgão Julgador *</Label>
            <OrgaoJulgadorSearchSelect
              value={formData.orgaoJulgador}
              onValueChange={(value) => onInputChange('orgaoJulgador', value)}
              placeholder="Buscar órgão julgador por cidade ou nome..."
              orgaosJulgadores={orgaosJulgadores}
            />
          </div>
        )}

        {formData.grau === '2º Grau' && (
          <div>
            <Label htmlFor="orgaoJulgador">Órgão Julgador de Origem *</Label>
            <OrgaoJulgadorSearchSelect2Grau
              value={formData.orgaoJulgador}
              onValueChange={(value) => onInputChange('orgaoJulgador', value)}
              placeholder="Buscar órgão julgador de 2º grau..."
            />
          </div>
        )}

        <div>
          <Label htmlFor="notas">Descrição do Problema *</Label>
          <Textarea
            id="notas"
            value={formData.notas}
            onChange={(e) => onInputChange('notas', e.target.value)}
            placeholder="Descreva detalhadamente o problema, ações já realizadas e informações relevantes..."
            rows={4}
          />
        </div>

        <UsuarioAutoComplete
          formData={formData}
          onInputChange={onInputChange}
        />


        <div className="flex gap-3">
          <Button onClick={onGenerateDescription} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Chamado com IA
          </Button>
          <Button onClick={onResetForm} variant="outline">
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};