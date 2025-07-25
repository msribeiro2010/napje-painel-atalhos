import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Brain, Zap, Target, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsProps {
  onSettingsChange?: (settings: AISettings) => void;
}

export interface AISettings {
  creativity: number;
  technicality: number;
  verbosity: number;
  includeExamples: boolean;
  includeSuggestions: boolean;
  autoEnhance: boolean;
  preferredModel: string;
  customPrompts: {
    description: string;
    solution: string;
  };
  outputFormat: string;
  language: string;
}

const defaultSettings: AISettings = {
  creativity: 50,
  technicality: 70,
  verbosity: 60,
  includeExamples: true,
  includeSuggestions: true,
  autoEnhance: false,
  preferredModel: 'analytical',
  customPrompts: {
    description: '',
    solution: ''
  },
  outputFormat: 'structured',
  language: 'pt-BR'
};

const modelOptions = [
  { value: 'creative', label: 'IA Criativa', icon: <Zap className="h-4 w-4" /> },
  { value: 'analytical', label: 'IA Analítica', icon: <Brain className="h-4 w-4" /> },
  { value: 'specialized', label: 'IA Especializada', icon: <Target className="h-4 w-4" /> }
];

const outputFormats = [
  { value: 'structured', label: 'Estruturado' },
  { value: 'narrative', label: 'Narrativo' },
  { value: 'bullet', label: 'Lista de Tópicos' },
  { value: 'technical', label: 'Técnico Detalhado' }
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' }
];

export const AISettings: React.FC<AISettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('ai-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
    onSettingsChange?.(newSettings);
  };

  const updateCustomPrompt = (type: 'description' | 'solution', value: string) => {
    const newSettings = {
      ...settings,
      customPrompts: {
        ...settings.customPrompts,
        [type]: value
      }
    };
    setSettings(newSettings);
    setHasChanges(true);
    onSettingsChange?.(newSettings);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('ai-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    onSettingsChange?.(defaultSettings);
    toast.info('Configurações restauradas para o padrão');
  };

  const getSliderColor = (value: number) => {
    if (value <= 30) return 'bg-red-500';
    if (value <= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Configurações Avançadas de IA</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Restaurar
          </Button>
          <Button
            size="sm"
            onClick={saveSettings}
            disabled={!hasChanges}
            className="flex items-center gap-1"
          >
            <Save className="h-3 w-3" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Configurações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modelo Preferido */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Modelo Preferido</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.preferredModel}
              onValueChange={(value) => updateSetting('preferredModel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Formato de Saída */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Formato de Saída</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.outputFormat}
              onValueChange={(value) => updateSetting('outputFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Controles Deslizantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parâmetros de Geração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Criatividade */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Criatividade</Label>
              <Badge variant="outline">{settings.creativity}%</Badge>
            </div>
            <Slider
              value={[settings.creativity]}
              onValueChange={([value]) => updateSetting('creativity', value)}
              max={100}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Controla o nível de inovação e originalidade nas respostas
            </p>
          </div>

          {/* Tecnicidade */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tecnicidade</Label>
              <Badge variant="outline">{settings.technicality}%</Badge>
            </div>
            <Slider
              value={[settings.technicality]}
              onValueChange={([value]) => updateSetting('technicality', value)}
              max={100}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Define o nível de detalhamento técnico e precisão
            </p>
          </div>

          {/* Verbosidade */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Verbosidade</Label>
              <Badge variant="outline">{settings.verbosity}%</Badge>
            </div>
            <Slider
              value={[settings.verbosity]}
              onValueChange={([value]) => updateSetting('verbosity', value)}
              max={100}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Controla o tamanho e detalhamento das respostas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Opções Booleanas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opções Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Incluir Exemplos</Label>
              <p className="text-xs text-gray-500">Adicionar exemplos práticos nas respostas</p>
            </div>
            <Switch
              checked={settings.includeExamples}
              onCheckedChange={(checked) => updateSetting('includeExamples', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Incluir Sugestões</Label>
              <p className="text-xs text-gray-500">Gerar sugestões de solução automaticamente</p>
            </div>
            <Switch
              checked={settings.includeSuggestions}
              onCheckedChange={(checked) => updateSetting('includeSuggestions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Melhoria Automática</Label>
              <p className="text-xs text-gray-500">Aplicar melhorias automaticamente ao texto</p>
            </div>
            <Switch
              checked={settings.autoEnhance}
              onCheckedChange={(checked) => updateSetting('autoEnhance', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompts Customizados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompts Personalizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Prompt para Descrição</Label>
            <Textarea
              value={settings.customPrompts.description}
              onChange={(e) => updateCustomPrompt('description', e.target.value)}
              placeholder="Ex: Foque em aspectos técnicos e inclua passos detalhados..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt para Solução</Label>
            <Textarea
              value={settings.customPrompts.solution}
              onChange={(e) => updateCustomPrompt('solution', e.target.value)}
              placeholder="Ex: Forneça soluções práticas e testadas..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Você tem alterações não salvas. Clique em "Salvar" para aplicá-las.
          </p>
        </div>
      )}
    </div>
  );
};