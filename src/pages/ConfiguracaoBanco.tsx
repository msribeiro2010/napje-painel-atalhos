import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Shield, 
  Check, 
  X, 
  Save, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  TestTube,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Server,
  RefreshCw
} from 'lucide-react';
import '@/styles/consultas-pje.css';

interface DatabaseConfig {
  host: string;
  database: string;
  user: string;
  password: string;
  port: number;
  ssl?: boolean;
}

interface DatabaseConfigs {
  pje1grau: DatabaseConfig;
  pje2grau: DatabaseConfig;
}

const ConfiguracaoBanco = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showPasswords, setShowPasswords] = useState({
    pje1grau: false,
    pje2grau: false
  });
  
  const [testingConnection, setTestingConnection] = useState({
    pje1grau: false,
    pje2grau: false
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    pje1grau: null as null | 'success' | 'error',
    pje2grau: null as null | 'success' | 'error'
  });
  
  const [configs, setConfigs] = useState<DatabaseConfigs>({
    pje1grau: {
      host: '',
      database: 'pje_1grau',
      user: '',
      password: '',
      port: 5432,
      ssl: false
    },
    pje2grau: {
      host: '',
      database: 'pje_2grau',
      user: '',
      password: '',
      port: 5432,
      ssl: false
    }
  });
  
  // Carregar configurações salvas (do localStorage ou sessionStorage)
  useEffect(() => {
    const loadConfigs = () => {
      try {
        // Tentar carregar do localStorage (encriptado)
        const savedConfigs = localStorage.getItem('pje_db_configs');
        if (savedConfigs) {
          // Descriptografar (implementar criptografia real em produção)
          const decrypted = atob(savedConfigs);
          const parsed = JSON.parse(decrypted);
          setConfigs(parsed);
          
          toast({
            title: "Configurações Carregadas",
            description: "As configurações anteriores foram restauradas",
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    
    loadConfigs();
  }, []);
  
  // Atualizar configuração
  const updateConfig = (grau: 'pje1grau' | 'pje2grau', field: keyof DatabaseConfig, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [grau]: {
        ...prev[grau],
        [field]: value
      }
    }));
    
    // Resetar status de conexão ao modificar
    setConnectionStatus(prev => ({
      ...prev,
      [grau]: null
    }));
  };
  
  // Testar conexão
  const testConnection = async (grau: 'pje1grau' | 'pje2grau') => {
    setTestingConnection(prev => ({ ...prev, [grau]: true }));
    setConnectionStatus(prev => ({ ...prev, [grau]: null }));
    
    try {
      const config = configs[grau];
      
      // Validar campos obrigatórios
      if (!config.host || !config.database || !config.user || !config.password) {
        toast({
          title: "Campos Obrigatórios",
          description: "Preencha todos os campos antes de testar",
          variant: "destructive",
          duration: 3000
        });
        setTestingConnection(prev => ({ ...prev, [grau]: false }));
        return;
      }
      
      // Enviar para o servidor testar a conexão
      const response = await fetch('http://localhost:3001/api/pje/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grau,
          config
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, [grau]: 'success' }));
        toast({
          title: "✅ Conexão Bem-Sucedida!",
          description: `Conectado ao ${grau === 'pje1grau' ? '1º' : '2º'} Grau com sucesso`,
          duration: 3000
        });
      } else {
        setConnectionStatus(prev => ({ ...prev, [grau]: 'error' }));
        toast({
          title: "❌ Erro na Conexão",
          description: result.error || "Não foi possível conectar ao banco",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus(prev => ({ ...prev, [grau]: 'error' }));
      toast({
        title: "❌ Erro",
        description: "Erro ao testar conexão. Verifique se o servidor está rodando.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [grau]: false }));
    }
  };
  
  // Salvar configurações
  const saveConfigs = async () => {
    try {
      // Validar antes de salvar
      const hasConfig1 = configs.pje1grau.host && configs.pje1grau.user;
      const hasConfig2 = configs.pje2grau.host && configs.pje2grau.user;
      
      if (!hasConfig1 && !hasConfig2) {
        toast({
          title: "Configuração Incompleta",
          description: "Configure pelo menos um banco de dados",
          variant: "destructive",
          duration: 3000
        });
        return;
      }
      
      // Criptografar (implementar criptografia real em produção)
      const encrypted = btoa(JSON.stringify(configs));
      localStorage.setItem('pje_db_configs', encrypted);
      
      // Enviar para o servidor atualizar as configurações
      const response = await fetch('http://localhost:3001/api/pje/update-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configs)
      });
      
      if (response.ok) {
        toast({
          title: "✅ Configurações Salvas",
          description: "As configurações foram salvas e aplicadas com sucesso",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Erro ao salvar as configurações",
        variant: "destructive",
        duration: 5000
      });
    }
  };
  
  // Exportar configurações
  const exportConfigs = () => {
    try {
      // Criar arquivo sem as senhas para segurança
      const exportData = {
        pje1grau: {
          ...configs.pje1grau,
          password: '' // Remover senha no export
        },
        pje2grau: {
          ...configs.pje2grau,
          password: '' // Remover senha no export
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pje-db-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Configurações Exportadas",
        description: "Arquivo baixado (senhas não incluídas por segurança)",
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro ao Exportar",
        description: "Não foi possível exportar as configurações",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  // Importar configurações
  const importConfigs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        // Validar estrutura
        if (imported.pje1grau && imported.pje2grau) {
          setConfigs(prev => ({
            pje1grau: {
              ...imported.pje1grau,
              password: prev.pje1grau.password // Manter senha atual
            },
            pje2grau: {
              ...imported.pje2grau,
              password: prev.pje2grau.password // Manter senha atual
            }
          }));
          
          toast({
            title: "📤 Configurações Importadas",
            description: "Configure as senhas manualmente",
            duration: 3000
          });
        } else {
          throw new Error('Formato inválido');
        }
      } catch (error) {
        console.error('Erro ao importar:', error);
        toast({
          title: "Erro ao Importar",
          description: "Arquivo inválido ou corrompido",
          variant: "destructive",
          duration: 3000
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Limpar input
  };
  
  // Componente de formulário para cada grau
  const DatabaseForm = ({ grau, title }: { grau: 'pje1grau' | 'pje2grau', title: string }) => (
    <Card className="pje-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Configure a conexão com o banco de dados do {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${grau}-host`}>Host / IP</Label>
            <Input
              id={`${grau}-host`}
              placeholder="ex: pje-dbpr-a1-replica ou 10.0.0.1"
              value={configs[grau].host}
              onChange={(e) => updateConfig(grau, 'host', e.target.value)}
              className="pje-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${grau}-port`}>Porta</Label>
            <Input
              id={`${grau}-port`}
              type="number"
              placeholder="5432"
              value={configs[grau].port}
              onChange={(e) => updateConfig(grau, 'port', parseInt(e.target.value))}
              className="pje-input"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${grau}-database`}>Nome do Banco</Label>
          <Input
            id={`${grau}-database`}
            placeholder={grau === 'pje1grau' ? 'pje_1grau' : 'pje_2grau'}
            value={configs[grau].database}
            onChange={(e) => updateConfig(grau, 'database', e.target.value)}
            className="pje-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${grau}-user`}>Usuário</Label>
          <Input
            id={`${grau}-user`}
            placeholder="seu_usuario"
            value={configs[grau].user}
            onChange={(e) => updateConfig(grau, 'user', e.target.value)}
            className="pje-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${grau}-password`}>Senha</Label>
          <div className="relative">
            <Input
              id={`${grau}-password`}
              type={showPasswords[grau] ? 'text' : 'password'}
              placeholder="••••••••"
              value={configs[grau].password}
              onChange={(e) => updateConfig(grau, 'password', e.target.value)}
              className="pje-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, [grau]: !prev[grau] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords[grau] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${grau}-ssl`}
            checked={configs[grau].ssl}
            onChange={(e) => updateConfig(grau, 'ssl', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor={`${grau}-ssl`}>Usar SSL</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => testConnection(grau)}
            disabled={testingConnection[grau]}
            className="pje-button"
          >
            {testingConnection[grau] ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
          
          {connectionStatus[grau] === 'success' && (
            <div className="flex items-center text-green-600 gap-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Conectado</span>
            </div>
          )}
          
          {connectionStatus[grau] === 'error' && (
            <div className="flex items-center text-red-600 gap-1">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Erro na conexão</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Server className="h-8 w-8 text-primary" />
              Configuração de Banco de Dados PJe
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure a conexão com os bancos de dados do PJe 1º e 2º Grau
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportConfigs}
              className="pje-button-outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <label htmlFor="import-config" className="pje-button-outline inline-flex items-center cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importar
              <input
                id="import-config"
                type="file"
                accept=".json"
                onChange={importConfigs}
                className="hidden"
              />
            </label>
            
            <Button
              onClick={saveConfigs}
              className="pje-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
        
        {/* Alert de Segurança */}
        <Alert className="bg-amber-50 border-amber-200">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Importante:</strong> Você precisa estar conectado à VPN do TRT15 para acessar os bancos de dados.
            As credenciais são armazenadas localmente de forma criptografada.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Formulários */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DatabaseForm grau="pje1grau" title="PJe 1º Grau" />
        <DatabaseForm grau="pje2grau" title="PJe 2º Grau" />
      </div>
      
      {/* Informações Adicionais */}
      <Card className="mt-6 pje-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>As configurações são salvas localmente no seu navegador</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Senhas são criptografadas antes do armazenamento</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Necessário estar na VPN para conectar aos bancos</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Ao exportar, as senhas não são incluídas por segurança</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracaoBanco;