import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Database, Save, TestTube, AlertCircle, CheckCircle, Copy, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PJeConfig {
  orgaoJulgadorTable: string;
  municipioTable: string;
  processoTable: string;
  usuarioTable: string;
  customQueries: {
    searchOrgaosByCidade?: string;
    searchProcessos?: string;
    searchServidores?: string;
  };
}

const ConfiguracaoPJe = () => {
  const [config1Grau, setConfig1Grau] = useState<PJeConfig>({
    orgaoJulgadorTable: 'orgao_julgador',
    municipioTable: 'municipio',
    processoTable: 'tb_processo_trf',
    usuarioTable: 'tb_usuario_login',
    customQueries: {}
  });

  const [config2Grau, setConfig2Grau] = useState<PJeConfig>({
    orgaoJulgadorTable: 'orgao_julgador',
    municipioTable: 'municipio',
    processoTable: 'tb_processo_trf',
    usuarioTable: 'tb_usuario_login',
    customQueries: {}
  });

  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  // Carregar configuração salva
  useEffect(() => {
    const saved1 = localStorage.getItem('pje_config_1grau');
    const saved2 = localStorage.getItem('pje_config_2grau');
    
    if (saved1) setConfig1Grau(JSON.parse(saved1));
    if (saved2) setConfig2Grau(JSON.parse(saved2));
  }, []);

  const saveConfig = () => {
    localStorage.setItem('pje_config_1grau', JSON.stringify(config1Grau));
    localStorage.setItem('pje_config_2grau', JSON.stringify(config2Grau));
    
    toast({
      title: 'Configuração salva!',
      description: 'As configurações foram salvas localmente.',
    });
  };

  const testConnection = async (grau: '1' | '2') => {
    setTesting(true);
    setTestResult('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_PJE_API_URL || 'http://localhost:3001/api/pje'}/test-connection?grau=${grau}`);
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Conexão com ${grau}º Grau OK!\nTabelas encontradas: ${data.tables?.length || 0}`);
      } else {
        setTestResult(`❌ Erro na conexão: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setTesting(false);
    }
  };

  const runDiscoveryScript = async () => {
    toast({
      title: 'Execute o script de descoberta',
      description: 'No terminal: node scripts/discover-pje-tables.mjs',
    });
  };

  const exampleQuery = `-- Exemplo de query customizada para buscar OJs por cidade
SELECT DISTINCT 
  oj.id_orgao_julgador as id,
  oj.ds_orgao_julgador as nome,
  oj.sg_orgao_julgador as sigla,
  m.nm_municipio as cidade,
  m.sg_uf as uf
FROM orgao_julgador oj
LEFT JOIN municipio m ON oj.id_municipio = m.id_municipio
WHERE oj.in_ativo = 'S'
  AND LOWER(m.nm_municipio) LIKE LOWER($1)
ORDER BY m.nm_municipio, oj.ds_orgao_julgador
LIMIT 100`;

  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader 
          title="Configuração PJe" 
          description="Configure as tabelas e queries para consultas no banco PJe"
        />

        <div className="mt-6 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure os nomes corretos das tabelas do banco PJe para que as consultas funcionem corretamente.
              Execute o script de descoberta para identificar as tabelas disponíveis.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Descobrir Tabelas
              </CardTitle>
              <CardDescription>
                Execute o script para descobrir as tabelas disponíveis no banco PJe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={runDiscoveryScript} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Executar Script de Descoberta
                </Button>
                <Button 
                  onClick={() => testConnection('1')} 
                  disabled={testing}
                  variant="outline"
                >
                  Testar 1º Grau
                </Button>
                <Button 
                  onClick={() => testConnection('2')} 
                  disabled={testing}
                  variant="outline"
                >
                  Testar 2º Grau
                </Button>
              </div>
              
              {testResult && (
                <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre">
                  {testResult}
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2 font-medium">Para descobrir as tabelas, execute no terminal:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background rounded">
                    node scripts/discover-pje-tables.mjs
                  </code>
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText('node scripts/discover-pje-tables.mjs');
                      toast({ title: 'Comando copiado!' });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="1grau" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1grau">1º Grau</TabsTrigger>
              <TabsTrigger value="2grau">2º Grau</TabsTrigger>
            </TabsList>

            <TabsContent value="1grau" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configuração de Tabelas - 1º Grau
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oj-table-1">Tabela de Órgãos Julgadores</Label>
                      <Input
                        id="oj-table-1"
                        value={config1Grau.orgaoJulgadorTable}
                        onChange={(e) => setConfig1Grau({...config1Grau, orgaoJulgadorTable: e.target.value})}
                        placeholder="Ex: orgao_julgador"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mun-table-1">Tabela de Municípios</Label>
                      <Input
                        id="mun-table-1"
                        value={config1Grau.municipioTable}
                        onChange={(e) => setConfig1Grau({...config1Grau, municipioTable: e.target.value})}
                        placeholder="Ex: municipio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proc-table-1">Tabela de Processos</Label>
                      <Input
                        id="proc-table-1"
                        value={config1Grau.processoTable}
                        onChange={(e) => setConfig1Grau({...config1Grau, processoTable: e.target.value})}
                        placeholder="Ex: tb_processo_trf"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-table-1">Tabela de Usuários</Label>
                      <Input
                        id="user-table-1"
                        value={config1Grau.usuarioTable}
                        onChange={(e) => setConfig1Grau({...config1Grau, usuarioTable: e.target.value})}
                        placeholder="Ex: tb_usuario_login"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-query-1">Query Customizada (Opcional)</Label>
                    <Textarea
                      id="custom-query-1"
                      className="font-mono text-sm"
                      rows={10}
                      placeholder={exampleQuery}
                      value={config1Grau.customQueries.searchOrgaosByCidade || ''}
                      onChange={(e) => setConfig1Grau({
                        ...config1Grau, 
                        customQueries: {...config1Grau.customQueries, searchOrgaosByCidade: e.target.value}
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Você pode escrever queries SQL customizadas para substituir as padrões. Use $1, $2, etc para parâmetros.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="2grau" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configuração de Tabelas - 2º Grau
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oj-table-2">Tabela de Órgãos Julgadores</Label>
                      <Input
                        id="oj-table-2"
                        value={config2Grau.orgaoJulgadorTable}
                        onChange={(e) => setConfig2Grau({...config2Grau, orgaoJulgadorTable: e.target.value})}
                        placeholder="Ex: orgao_julgador"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mun-table-2">Tabela de Municípios</Label>
                      <Input
                        id="mun-table-2"
                        value={config2Grau.municipioTable}
                        onChange={(e) => setConfig2Grau({...config2Grau, municipioTable: e.target.value})}
                        placeholder="Ex: municipio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proc-table-2">Tabela de Processos</Label>
                      <Input
                        id="proc-table-2"
                        value={config2Grau.processoTable}
                        onChange={(e) => setConfig2Grau({...config2Grau, processoTable: e.target.value})}
                        placeholder="Ex: tb_processo_trf"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-table-2">Tabela de Usuários</Label>
                      <Input
                        id="user-table-2"
                        value={config2Grau.usuarioTable}
                        onChange={(e) => setConfig2Grau({...config2Grau, usuarioTable: e.target.value})}
                        placeholder="Ex: tb_usuario_login"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-query-2">Query Customizada (Opcional)</Label>
                    <Textarea
                      id="custom-query-2"
                      className="font-mono text-sm"
                      rows={10}
                      placeholder={exampleQuery}
                      value={config2Grau.customQueries.searchOrgaosByCidade || ''}
                      onChange={(e) => setConfig2Grau({
                        ...config2Grau, 
                        customQueries: {...config2Grau.customQueries, searchOrgaosByCidade: e.target.value}
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Você pode escrever queries SQL customizadas para substituir as padrões. Use $1, $2, etc para parâmetros.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button onClick={saveConfig} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default ConfiguracaoPJe;