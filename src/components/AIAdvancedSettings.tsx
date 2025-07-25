import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Brain, 
  Sparkles, 
  Zap, 
  Target,
  Save,
  RotateCcw,
  Download,
  Upload,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface AISettings {
  creativity: number;
  technicality: number;
  verbosity: number;
  includeExamples: boolean;
  includeSuggestions: boolean;
  autoImprove: boolean;
  preferredModel: string;
  customPrompt: string;
  outputFormat: string;
  tone: string;
  priority: string;
  maxTokens: number;
  temperature: number;
}

interface AIAdvancedSettingsProps {
  onSettingsChange?: (settings: AISettings) => void;
  onClose?: () => void;
}

const defaultSettings: AISettings = {
  creativity: 50,
  technicality: 70,
  verbosity: 60,
  includeExamples: true,
  includeSuggestions: true,
  autoImprove: false,
  preferredModel: 'analytical',
  customPrompt: '',
  outputFormat: 'structured',
  tone: 'profissional',
  priority: 'alta',
  maxTokens: 1000,
  temperature: 0.7
};

const modelOptions = [
  { value: 'creative', label: 'IA Criativa', icon: <Sparkles className="h-4 w-4" />, description: 'Mais criativa e inovadora' },
  { value: 'analytical', label: 'IA Analítica', icon: <Brain className="h-4 w-4" />, description: 'Focada em análise e precisão' },
  { value: 'quick', label: 'IA Rápida', icon: <Zap className="h-4 w-4" />, description: 'Respostas rápidas e diretas' },
  { value: 'specialized', label: 'IA Especializada', icon: <Target className="h-4 w-4" />, description: 'Especializada em contexto jurídico' }
];

const toneOptions = [
  { value: 'profissional', label: 'Profissional' },
  { value: 'formal', label: 'Formal' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'amigavel', label: 'Amigável' },
  { value: 'conciso', label: 'Conciso' }
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' }
];

const outputFormatOptions = [
  { value: 'structured', label: 'Estruturado' },
  { value: 'narrative', label: 'Narrativo' },
  { value: 'bullet_points', label: 'Tópicos' },
  { value: 'technical', label: 'Técnico' }
];

export const AIAdvancedSettings: React.FC<AIAdvancedSettingsProps> = ({ 
  onSettingsChange, 
  onClose 
}) => {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [presets, setPresets] = useState<{ [key: string]: AISettings }>({});

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('ai-advanced-settings');
    const savedPresets = localStorage.getItem('ai-settings-presets');
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
    
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Erro ao carregar presets:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem('ai-advanced-settings', JSON.stringify(settings));
      onSettingsChange?.(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    toast.info('Configurações restauradas para o padrão');
  };

  const saveAsPreset = () => {
    const name = prompt('Nome do preset:');
    if (name) {
      const newPresets = { ...presets, [name]: settings };
      setPresets(newPresets);
      localStorage.setItem('ai-settings-presets', JSON.stringify(newPresets));
      toast.success(`Preset "${name}" salvo!`);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presets[presetName]) {
      setSettings(presets[presetName]);
      toast.success(`Preset "${presetName}" carregado!`);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings(imported);
          toast.success('Configurações importadas com sucesso!');
        } catch (error) {
          toast.error('Erro ao importar configurações');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Configurações Avançadas de IA</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Presets Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(presets).map(presetName => (
                  <Badge 
                    key={presetName}
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => loadPreset(presetName)}
                  >
                    {presetName}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveAsPreset}>
                  <Save className="h-3 w-3 mr-1" />
                  Salvar Preset
                </Button>
                <Button size="sm" variant="outline" onClick={exportSettings}>
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
                <label className="cursor-pointer">
                  <Button size="sm" variant="outline" asChild>
                    <span>
                      <Upload className="h-3 w-3 mr-1" />
                      Importar
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Modelo Preferido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modelo de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modelOptions.map(model => (
                  <div
                    key={model.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      settings.preferredModel === model.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateSetting('preferredModel', model.value)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {model.icon}
                      <span className="font-medium">{model.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parâmetros de Geração */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parâmetros de Geração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Criatividade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Criatividade</Label>
                  <span className="text-sm text-gray-500">{settings.creativity}%</span>
                </div>
                <Slider
                  value={[settings.creativity]}
                  onValueChange={([value]) => updateSetting('creativity', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controla o nível de criatividade nas respostas
                </p>
              </div>

              {/* Tecnicidade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Tecnicidade</Label>
                  <span className="text-sm text-gray-500">{settings.technicality}%</span>
                </div>
                <Slider
                  value={[settings.technicality]}
                  onValueChange={([value]) => updateSetting('technicality', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nível de detalhamento técnico
                </p>
              </div>

              {/* Verbosidade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Verbosidade</Label>
                  <span className="text-sm text-gray-500">{settings.verbosity}%</span>
                </div>
                <Slider
                  value={[settings.verbosity]}
                  onValueChange={([value]) => updateSetting('verbosity', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Extensão das respostas geradas
                </p>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Temperature</Label>
                  <span className="text-sm text-gray-500">{settings.temperature}</span>
                </div>
                <Slider
                  value={[settings.temperature * 100]}
                  onValueChange={([value]) => updateSetting('temperature', value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controla a aleatoriedade das respostas (0.0 - 1.0)
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value) || 1000)}
                  min={100}
                  max={4000}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limite máximo de tokens para a resposta
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tom */}
              <div>
                <Label>Tom da Resposta</Label>
                <Select value={settings.tone} onValueChange={(value) => updateSetting('tone', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div>
                <Label>Prioridade do Chamado</Label>
                <Select value={settings.priority} onValueChange={(value) => updateSetting('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formato de Saída */}
              <div>
                <Label>Formato de Saída</Label>
                <Select value={settings.outputFormat} onValueChange={(value) => updateSetting('outputFormat', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormatOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Switches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Incluir Exemplos</Label>
                    <p className="text-xs text-gray-500">Adicionar exemplos práticos</p>
                  </div>
                  <Switch
                    checked={settings.includeExamples}
                    onCheckedChange={(checked) => updateSetting('includeExamples', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Incluir Sugestões</Label>
                    <p className="text-xs text-gray-500">Adicionar sugestões de solução</p>
                  </div>
                  <Switch
                    checked={settings.includeSuggestions}
                    onCheckedChange={(checked) => updateSetting('includeSuggestions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Melhoria Automática</Label>
                    <p className="text-xs text-gray-500">Aplicar melhorias automáticas no texto</p>
                  </div>
                  <Switch
                    checked={settings.autoImprove}
                    onCheckedChange={(checked) => updateSetting('autoImprove', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Personalizado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Prompt Personalizado
                <Info className="h-4 w-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.customPrompt}
                onChange={(e) => updateSetting('customPrompt', e.target.value)}
                placeholder="Adicione instruções específicas para a IA..."
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Instruções adicionais que serão incluídas em todas as gerações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvancedSettings;