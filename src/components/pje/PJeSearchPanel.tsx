import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Users, Building2, Loader2, FileSearch, Upload, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePJeSearch, OrgaoJulgador, Processo, Servidor } from '@/hooks/usePJeSearch';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProcessoDetalhesModal } from './ProcessoDetalhesModal';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export const PJeSearchPanel = () => {
  const { loading, searchOrgaosJulgadores, searchProcessos, searchServidores } = usePJeSearch();
  
  // Estados de loading separados para cada busca
  const [loadingOj, setLoadingOj] = useState(false);
  const [loadingProcesso, setLoadingProcesso] = useState(false);
  const [loadingServidor, setLoadingServidor] = useState(false);
  
  // Estados para modal de detalhes
  const [modalOpen, setModalOpen] = useState(false);
  const [processoDetalhes, setProcessoDetalhes] = useState<any>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  
  // Função para buscar detalhes completos do processo
  const handleViewProcessDetails = async (processo: any, grau: string) => {
    setLoadingDetalhes(true);
    setModalOpen(true);
    setProcessoDetalhes(processo); // Mostra dados básicos primeiro
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PJE_API_URL}/processo-detalhes?grau=${grau}&idProcesso=${processo.id_processo}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) throw new Error('Erro ao buscar detalhes do processo');
      
      const data = await response.json();
      setProcessoDetalhes(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do processo:', error);
      toast.error('Erro ao carregar detalhes do processo');
    } finally {
      setLoadingDetalhes(false);
    }
  };
  
  // Estados para OJs
  const [ojGrau, setOjGrau] = useState<'1' | '2'>('1');
  const [ojCidade, setOjCidade] = useState('');
  const [ojResults, setOjResults] = useState<OrgaoJulgador[]>([]);
  
  // Estados para Processos
  const [processoGrau, setProcessoGrau] = useState<'1' | '2'>('1');
  const [processoNumero, setProcessoNumero] = useState('');
  const [processoAno, setProcessoAno] = useState('');
  const [processoOj, setProcessoOj] = useState('');
  const [processoOjNome, setProcessoOjNome] = useState('');
  const [processoResults, setProcessoResults] = useState<Processo[]>([]);
  
  // Estados para Servidores
  const [servidorGrau, setServidorGrau] = useState<'1' | '2'>('1');
  const [servidorNome, setServidorNome] = useState('');
  const [servidorCpf, setServidorCpf] = useState('');
  const [servidorMatricula, setServidorMatricula] = useState('');
  const [servidorResults, setServidorResults] = useState<Servidor[]>([]);
  const [servidorSugestoes, setServidorSugestoes] = useState<Array<{id: string, nome: string, matricula: string}>>([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);
  const [showSugestoes, setShowSugestoes] = useState(false);
  
  // Debounce do termo de busca para evitar muitas requisições
  const debouncedNome = useDebounce(servidorNome, 300);
  
  // Estados para Processos por CPF/CNPJ
  const [documento, setDocumento] = useState('');
  const [loadingDocumento, setLoadingDocumento] = useState(false);
  const [documentoResultados, setDocumentoResultados] = useState<any>(null);
  
  // Estados para OJs do servidor
  const [servidorOjGrau, setServidorOjGrau] = useState<'1' | '2'>('1');
  const [servidorOjCpf, setServidorOjCpf] = useState('');
  const [servidorOjResults, setServidorOjResults] = useState<any>(null);
  const [loadingServidorOj, setLoadingServidorOj] = useState(false);
  
  // Estados para verificação em lote de OJs
  const [ojsInputText, setOjsInputText] = useState('');
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [filtroCidade, setFiltroCidade] = useState('');

  const handleOjSearch = async () => {
    console.log('Buscando OJs:', { ojGrau, ojCidade });
    setLoadingOj(true);
    try {
      const results = await searchOrgaosJulgadores(ojGrau, ojCidade);
      console.log('Resultados OJs:', results);
      setOjResults(results);
    } catch (error) {
      console.error('Erro ao buscar OJs:', error);
    } finally {
      setLoadingOj(false);
    }
  };

  const handleProcessoSearch = async () => {
    console.log('Buscando processos:', { processoGrau, processoNumero, processoAno, processoOj });
    setLoadingProcesso(true);
    try {
      const results = await searchProcessos(processoGrau, {
        numero: processoNumero,
        ano: processoAno,
        oj: processoOj,
      });
      console.log('Resultados processos:', results);
      setProcessoResults(results);
      
      // Se encontrou processo, atualiza o nome do OJ
      if (results.length > 0 && results[0].nome_orgao_julgador) {
        setProcessoOjNome(results[0].nome_orgao_julgador);
      }
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setLoadingProcesso(false);
    }
  };

  const handleServidorSearch = async () => {
    console.log('Buscando servidores:', { servidorGrau, servidorNome, servidorCpf, servidorMatricula });
    setLoadingServidor(true);
    setShowSugestoes(false);
    try {
      const results = await searchServidores(servidorGrau, {
        nome: servidorNome,
        cpf: servidorCpf,
        matricula: servidorMatricula,
      });
      console.log('Resultados servidores:', results);
      setServidorResults(results);
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
    } finally {
      setLoadingServidor(false);
    }
  };
  
  // Buscar sugestões quando o nome mudar (com debounce)
  useEffect(() => {
    const buscarSugestoes = async () => {
      if (!debouncedNome || debouncedNome.length < 2) {
        setServidorSugestoes([]);
        setShowSugestoes(false);
        return;
      }
      
      setLoadingSugestoes(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/pje/servidores/sugestoes?grau=${servidorGrau}&termo=${encodeURIComponent(debouncedNome)}&limit=8`
        );
        
        if (response.ok) {
          const sugestoes = await response.json();
          setServidorSugestoes(sugestoes);
          setShowSugestoes(sugestoes.length > 0);
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        setServidorSugestoes([]);
      } finally {
        setLoadingSugestoes(false);
      }
    };
    
    buscarSugestoes();
  }, [debouncedNome, servidorGrau]);
  
  // Função para selecionar uma sugestão
  const selecionarSugestao = (sugestao: {id: string, nome: string, matricula: string}) => {
    setServidorNome(sugestao.nome);
    setServidorMatricula(sugestao.matricula);
    setShowSugestoes(false);
    // Busca automática após selecionar
    setTimeout(() => handleServidorSearch(), 100);
  };
  
  // Função para buscar OJs do servidor
  const handleServidorOjSearch = async () => {
    if (!servidorOjCpf || servidorOjCpf.trim().length === 0) {
      toast.error('Por favor, informe o CPF do servidor');
      return;
    }
    
    setLoadingServidorOj(true);
    setServidorOjResults(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PJE_API_URL}/servidor-ojs?cpf=${servidorOjCpf}&grau=${servidorOjGrau}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) throw new Error('Erro ao buscar OJs do servidor');
      
      const data = await response.json();
      setServidorOjResults(data);
      
      if (data.ojs_localizacoes.length === 0) {
        toast.info('Nenhuma OJ/localidade encontrada para este CPF');
      }
    } catch (error) {
      console.error('Erro ao buscar OJs do servidor:', error);
      toast.error('Erro ao buscar OJs do servidor');
    } finally {
      setLoadingServidorOj(false);
    }
  };
  
  // Função para importar arquivo JSON
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Tenta parsear como JSON primeiro
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            setOjsInputText(json.join('\n'));
          } else if (json.ojs && Array.isArray(json.ojs)) {
            setOjsInputText(json.ojs.join('\n'));
          } else {
            toast.error('Formato JSON inválido. Esperado um array de OJs.');
          }
        } catch {
          // Se não for JSON válido, trata como texto simples
          setOjsInputText(content);
        }
        toast.success('Arquivo importado com sucesso!');
      } catch (error) {
        toast.error('Erro ao ler o arquivo');
        console.error('Erro ao importar arquivo:', error);
      }
    };
    reader.readAsText(file);
  };
  
  // Função para verificar OJs em lote
  const handleBatchVerification = async () => {
    if (!ojsInputText.trim()) {
      toast.error('Por favor, insira as OJs para verificação');
      return;
    }
    
    if (!servidorOjCpf) {
      toast.error('Por favor, busque primeiro as OJs do servidor');
      return;
    }
    
    if (!servidorOjResults || !servidorOjResults.ojs_localizacoes) {
      toast.error('Nenhuma OJ do servidor carregada. Faça a busca primeiro.');
      return;
    }
    
    setLoadingVerification(true);
    
    try {
      // Parse das OJs inseridas (pode ser separado por vírgula, quebra de linha, etc)
      const inputOjs = ojsInputText
        .split(/[\n,;]+/)
        .map(oj => oj.trim())
        .filter(oj => oj.length > 0);
      
      // OJs do servidor (extraindo nomes/IDs únicos)
      const serverOjs = servidorOjResults.ojs_localizacoes.map((item: any) => 
        item.ds_orgao_julgador || item.localizacao || ''
      ).filter((oj: string) => oj.length > 0);
      
      // Comparação
      const existentes: string[] = [];
      const faltantes: string[] = [];
      
      inputOjs.forEach(inputOj => {
        const found = serverOjs.some((serverOj: string) => 
          serverOj.toLowerCase().includes(inputOj.toLowerCase()) ||
          inputOj.toLowerCase().includes(serverOj.toLowerCase())
        );
        
        if (found) {
          existentes.push(inputOj);
        } else {
          faltantes.push(inputOj);
        }
      });
      
      setVerificationResults({
        total: inputOjs.length,
        existentes,
        faltantes,
        serverTotal: serverOjs.length
      });
      
      toast.success('Verificação concluída!');
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast.error('Erro ao realizar verificação');
    } finally {
      setLoadingVerification(false);
    }
  };
  
  // Função para exportar resultados
  const handleExportResults = () => {
    if (!verificationResults) {
      toast.error('Nenhum resultado para exportar');
      return;
    }
    
    if (!servidorOjResults) {
      toast.error('Dados do servidor não disponíveis');
      return;
    }
    
    // Formatar CPF com pontos e traços
    const formatarCpf = (cpf: string) => {
      const numeros = cpf.replace(/\D/g, '');
      if (numeros.length === 11) {
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf;
    };
    
    // Função para ordenar OJs numericamente e alfabeticamente
    const ordenarOJs = (ojs: string[]) => {
      return ojs.sort((a, b) => {
        // Extrair números e textos
        const numA = a.match(/^\d+/);
        const numB = b.match(/^\d+/);
        
        if (numA && numB) {
          const diff = parseInt(numA[0]) - parseInt(numB[0]);
          if (diff !== 0) return diff;
        }
        
        // Ordenação alfabética como fallback
        return a.localeCompare(b, 'pt-BR');
      });
    };
    
    // Determinar o perfil baseado nas informações disponíveis
    const determinarPerfil = () => {
      // Verificar se tem OJs como responsável
      const temResponsavel = servidorOjResults.agrupado?.responsavel?.length > 0;
      
      // Verificar papéis únicos
      const papeis = [...new Set(
        servidorOjResults.ojs_localizacoes
          .filter((item: any) => item.papel)
          .map((item: any) => item.papel)
      )];
      
      // Tentar determinar o perfil baseado nos papéis ou responsabilidades
      if (papeis.includes('Secretário de Audiência')) return 'Secretário de Audiência';
      if (papeis.includes('Diretor de Secretaria')) return 'Diretor de Secretaria';
      if (papeis.includes('Assistente')) return 'Assistente';
      if (papeis.includes('Servidor')) return 'Servidor';
      if (temResponsavel) return 'Responsável';
      
      // Perfil padrão
      return 'Servidor';
    };
    
    // Exportar apenas as OJs faltantes
    const exportData = [
      {
        nome: servidorOjResults.nome_servidor || 'Nome não disponível',
        cpf: formatarCpf(servidorOjCpf),
        perfil: determinarPerfil(),
        ojs: ordenarOJs(verificationResults.faltantes) // Exporta apenas as OJs faltantes
      }
    ];
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ojs_faltantes_${servidorOjCpf}_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Arquivo com OJs faltantes exportado com sucesso!');
  };
  
  // Função para buscar processos por documento
  const handleDocumentoSearch = async () => {
    if (!documento || documento.trim().length === 0) {
      return;
    }
    
    console.log('Buscando processos por documento:', documento);
    setLoadingDocumento(true);
    setDocumentoResultados(null);
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/pje/processos-por-documento?documento=${encodeURIComponent(documento)}&limit=200`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao buscar processos');
      }
      
      const data = await response.json();
      console.log('Processos encontrados:', data);
      setDocumentoResultados(data);
    } catch (error) {
      console.error('Erro ao buscar processos por documento:', error);
      setDocumentoResultados({
        erro: true,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoadingDocumento(false);
    }
  };
  
  // Função para formatar CPF/CNPJ
  const formatarDocumento = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length <= 11) {
      // CPF
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      return numeros
        .substring(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };
  
  // Função para filtrar e ordenar OJs
  const filtrarEOrdenarOJs = (ojs: any[]) => {
    let ojsFiltradas = ojs;
    
    // Aplicar filtro por cidade se houver
    if (filtroCidade.trim()) {
      ojsFiltradas = ojs.filter((item: any) => {
        const nome = item.ds_orgao_julgador || item.localizacao || '';
        return nome.toLowerCase().includes(filtroCidade.toLowerCase());
      });
    }
    
    // Ordenar numericamente e alfabeticamente
    return ojsFiltradas.sort((a: any, b: any) => {
      const nomeA = a.ds_orgao_julgador || a.localizacao || '';
      const nomeB = b.ds_orgao_julgador || b.localizacao || '';
      
      // Extrair números do início
      const numA = nomeA.match(/^\d+/);
      const numB = nomeB.match(/^\d+/);
      
      if (numA && numB) {
        const diff = parseInt(numA[0]) - parseInt(numB[0]);
        if (diff !== 0) return diff;
      }
      
      // Ordenação alfabética como fallback
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consultas PJe</CardTitle>
          <CardDescription>
            Pesquise órgãos julgadores, processos e servidores nas bases do PJe 1º e 2º grau
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Tabs defaultValue="ojs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ojs" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Órgãos Julgadores
            </TabsTrigger>
            <TabsTrigger value="processos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Processos
            </TabsTrigger>
            <TabsTrigger value="servidores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Servidores
            </TabsTrigger>
            <TabsTrigger value="processos-documento" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Processos/CPF/CNPJ
            </TabsTrigger>
            <TabsTrigger value="servidor-ojs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Servidor/OJ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ojs" className="space-y-4 mt-4">
            <div className="space-y-4">
              <RadioGroup value={ojGrau} onValueChange={(value) => setOjGrau(value as '1' | '2')}>
                <div className="flex items-center space-x-4">
                  <Label>Grau:</Label>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="oj-grau-1" />
                    <Label htmlFor="oj-grau-1">1º Grau</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="oj-grau-2" />
                    <Label htmlFor="oj-grau-2">2º Grau</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="oj-cidade">Cidade</Label>
                <div className="flex gap-2">
                  <Input
                    id="oj-cidade"
                    value={ojCidade}
                    onChange={(e) => setOjCidade(e.target.value)}
                    placeholder="Ex: Campinas, São Paulo, Ribeirão Preto..."
                  />
                  <Button onClick={handleOjSearch} disabled={loadingOj}>
                    <Search className="h-4 w-4 mr-2" />
                    {loadingOj ? 'Buscando...' : 'Buscar OJs'}
                  </Button>
                </div>
              </div>

              {ojResults.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {ojResults.length} resultado(s) encontrado(s)
                  </h4>
                  {ojResults.map((oj) => (
                    <div key={oj.id} className="p-3 border rounded hover:bg-accent cursor-pointer">
                      <div className="font-medium">{oj.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Sigla: {oj.sigla} | ID: {oj.id}
                      </div>
                      {oj.cidade && (
                        <div className="text-sm text-muted-foreground">
                          Cidade: {oj.cidade}{oj.uf ? ` - ${oj.uf}` : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="processos" className="space-y-4 mt-4">
            <div className="space-y-4">
              <RadioGroup value={processoGrau} onValueChange={(value) => setProcessoGrau(value as '1' | '2')}>
                <div className="flex items-center space-x-4">
                  <Label>Grau:</Label>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="proc-grau-1" />
                    <Label htmlFor="proc-grau-1">1º Grau</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="proc-grau-2" />
                    <Label htmlFor="proc-grau-2">2º Grau</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proc-numero-completo">Número do Processo (formato CNJ)</Label>
                  <Input
                    id="proc-numero-completo"
                    value={processoNumero}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProcessoNumero(value);
                      
                      // Extrai automaticamente ano e outros dados do formato CNJ
                      // Formato: 0010715-11.2022.5.15.0092
                      const cnj = value.match(/(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})/);
                      if (cnj) {
                        setProcessoAno(cnj[3]); // Extrai o ano (2022)
                        // Se quiser, pode extrair o órgão também: cnj[6] = origem (0092)
                        const origem = parseInt(cnj[6], 10);
                        if (origem > 0) {
                          setProcessoOj(origem.toString());
                        }
                      }
                    }}
                    placeholder="Ex: 0010715-11.2022.5.15.0092"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite o número completo no formato CNJ ou apenas o número sequencial
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proc-oj">Órgão Julgador</Label>
                  <Input
                    id="proc-oj"
                    value={processoOj && processoOjNome ? `${processoOj} - ${processoOjNome}` : processoOj}
                    readOnly
                    placeholder="Extraído automaticamente do número do processo"
                    className="bg-muted/50 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Código e nome extraídos automaticamente do número CNJ
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleProcessoSearch} disabled={loadingProcesso} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  {loadingProcesso ? 'Buscando...' : 'Buscar Processos'}
                </Button>
                <Button 
                  onClick={async () => {
                    console.log('Buscando processos de exemplo...');
                    setLoadingProcesso(true);
                    try {
                      const response = await fetch('http://localhost:3001/api/pje/processos-exemplo?grau=' + processoGrau);
                      const data = await response.json();
                      console.log('Processos de exemplo:', data);
                      if (data.length > 0) {
                        alert('Processos encontrados! Verifique o console (F12) para ver os números.');
                      } else {
                        alert('Nenhum processo encontrado no banco de dados de teste.');
                      }
                    } catch (error) {
                      console.error('Erro:', error);
                    } finally {
                      setLoadingProcesso(false);
                    }
                  }}
                  variant="outline"
                  disabled={loadingProcesso}
                  title="Buscar alguns processos de exemplo no banco"
                >
                  Exemplos
                </Button>
              </div>

              {processoResults.length === 0 && processoNumero && !loadingProcesso && (
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  <p>Nenhum processo encontrado com o número {processoNumero}</p>
                  <p className="text-sm mt-2">
                    Tente buscar processos de exemplo para ver quais números existem no banco de teste.
                  </p>
                </div>
              )}
              
              {processoResults.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {processoResults.length} processo(s) encontrado(s)
                  </h4>
                  {processoResults.map((proc, idx) => (
                    <div key={idx} className="p-3 border rounded hover:bg-accent cursor-pointer"
                         onClick={() => handleViewProcessDetails(proc, processoGrau)}>
                      <div className="font-medium">
                        {proc.numero_unico || `${proc.numero}-${proc.ano}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Classe: {proc.classe_judicial || proc.classe || 'N/A'}
                      </div>
                      {proc.nome_orgao_julgador && (
                        <div className="text-sm text-muted-foreground">
                          Órgão Julgador: {proc.nome_orgao_julgador}
                        </div>
                      )}
                      {proc.valor_causa && (
                        <div className="text-sm text-muted-foreground">
                          Valor da Causa: R$ {proc.valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Autuação: {proc.data_autuacao ? formatDate(new Date(proc.data_autuacao), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </div>
                      
                      {/* Mostrar tarefa atual se existir */}
                      {proc.tarefa_atual && (
                        <div className="text-sm bg-blue-50 p-2 rounded mt-2">
                          <div className="font-medium text-blue-900">Tarefa Atual:</div>
                          <div className="text-blue-700">{proc.tarefa_atual.nome_tarefa}</div>
                          {proc.tarefa_atual.dias_na_tarefa && (
                            <div className="text-xs text-blue-600">
                              Há {proc.tarefa_atual.dias_na_tarefa} dias nesta tarefa
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Mostrar quantidade de partes e documentos */}
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        {proc.partes && proc.partes.length > 0 && (
                          <span>{proc.partes.length} parte(s)</span>
                        )}
                        {proc.documentos && proc.documentos.length > 0 && (
                          <span>{proc.documentos.length} documento(s)</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-blue-600 mt-2">
                        Clique para ver detalhes completos →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="servidores" className="space-y-4 mt-4">
            <div className="space-y-4">
              <RadioGroup value={servidorGrau} onValueChange={(value) => setServidorGrau(value as '1' | '2')}>
                <div className="flex items-center space-x-4">
                  <Label>Grau:</Label>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="serv-grau-1" />
                    <Label htmlFor="serv-grau-1">1º Grau</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="serv-grau-2" />
                    <Label htmlFor="serv-grau-2">2º Grau</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serv-nome">Nome</Label>
                  <div className="relative">
                    <Input
                      id="serv-nome"
                      value={servidorNome}
                      onChange={(e) => {
                        setServidorNome(e.target.value);
                        setShowSugestoes(true);
                      }}
                      onFocus={() => servidorSugestoes.length > 0 && setShowSugestoes(true)}
                      placeholder="Digite o nome do servidor..."
                      autoComplete="off"
                    />
                    {loadingSugestoes && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Dropdown de sugestões */}
                    {showSugestoes && servidorSugestoes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                        <div className="py-1">
                          {servidorSugestoes.map((sugestao) => (
                            <button
                              key={sugestao.id}
                              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => selecionarSugestao(sugestao)}
                            >
                              <div className="font-medium">{sugestao.nome}</div>
                              <div className="text-sm text-muted-foreground">Matrícula: {sugestao.matricula}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite pelo menos 2 caracteres para ver sugestões
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serv-cpf">CPF</Label>
                    <Input
                      id="serv-cpf"
                      value={servidorCpf}
                      onChange={(e) => setServidorCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serv-matricula">Matrícula</Label>
                    <Input
                      id="serv-matricula"
                      value={servidorMatricula}
                      onChange={(e) => setServidorMatricula(e.target.value)}
                      placeholder="Matrícula"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleServidorSearch} disabled={loadingServidor} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {loadingServidor ? 'Buscando...' : 'Buscar Servidores'}
              </Button>

              {servidorResults.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {servidorResults.length} servidor(es) encontrado(s)
                  </h4>
                  {servidorResults.map((serv) => (
                    <div key={serv.id} className="p-3 border rounded hover:bg-accent">
                      <div className="font-medium">{serv.nome}</div>
                      {serv.cpf && (
                        <div className="text-sm text-muted-foreground">
                          CPF: {serv.cpf}
                        </div>
                      )}
                      {serv.matricula && (
                        <div className="text-sm text-muted-foreground">
                          Matrícula: {serv.matricula}
                        </div>
                      )}
                      {serv.email && (
                        <div className="text-sm text-muted-foreground">
                          Email: {serv.email}
                        </div>
                      )}
                      {serv.tipo && (
                        <div className="text-sm text-muted-foreground">
                          Tipo: {serv.tipo}
                        </div>
                      )}
                      {serv.lotacao && (
                        <div className="text-sm text-muted-foreground">
                          Lotação: {serv.lotacao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="processos-documento" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-cpf-cnpj">CPF ou CNPJ</Label>
                <div className="flex gap-2">
                  <Input
                    id="doc-cpf-cnpj"
                    value={documento}
                    onChange={(e) => setDocumento(formatarDocumento(e.target.value))}
                    placeholder="Digite o CPF ou CNPJ"
                    className="font-mono"
                    maxLength={18} // Máximo para CNPJ formatado
                  />
                  <Button 
                    onClick={handleDocumentoSearch} 
                    disabled={loadingDocumento || !documento}
                  >
                    {loadingDocumento ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Processos
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Busca processos em ambos os graus (1º e 2º) onde o CPF/CNPJ é parte
                </p>
              </div>

              {documentoResultados && !documentoResultados.erro && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Documento: {documentoResultados.documento}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {documentoResultados.tipo}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {documentoResultados.total_processos} processo(s) encontrado(s)
                    </Badge>
                  </div>

                  {documentoResultados.total_processos > 0 && (
                    <div className="space-y-4">
                      {/* Agrupar processos por grau */}
                      {['1º Grau', '2º Grau'].map(grau => {
                        const processosGrau = documentoResultados.processos.filter(
                          (p: any) => p.grau === grau
                        );
                        
                        if (processosGrau.length === 0) return null;
                        
                        return (
                          <div key={grau} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{grau}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {processosGrau.length} processo(s)
                              </span>
                            </div>
                            
                            <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                              {processosGrau.map((proc: any, idx: number) => (
                                <div 
                                  key={`${grau}-${idx}`} 
                                  className="p-3 border rounded hover:bg-accent cursor-pointer"
                                  onClick={() => handleViewProcessDetails(proc, proc.grau === '2º Grau' ? '2' : '1')}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <div className="font-mono font-medium">
                                        {proc.numero_unico}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Classe: {proc.classe || 'N/A'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Órgão: {proc.orgao_julgador || 'N/A'}
                                      </div>
                                      <div className="text-sm">
                                        <Badge variant={proc.polo === 'Polo Ativo' ? 'default' : 'secondary'}>
                                          {proc.polo}
                                        </Badge>
                                        <span className="ml-2 text-muted-foreground">
                                          como {proc.tipo_parte || 'Parte'}
                                        </span>
                                      </div>
                                      {proc.dt_autuacao && (
                                        <div className="text-sm text-muted-foreground">
                                          Autuação: {formatDate(new Date(proc.dt_autuacao), 'dd/MM/yyyy', { locale: ptBR })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-blue-600 mt-2">
                                    Clique para ver detalhes →
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {documentoResultados.total_processos === 0 && (
                    <div className="border rounded-lg p-6 text-center text-muted-foreground">
                      <FileSearch className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum processo encontrado para este documento</p>
                      <p className="text-sm mt-1">
                        Verifique se o CPF/CNPJ está correto
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {documentoResultados && documentoResultados.erro && (
                <div className="border border-destructive rounded-lg p-4 text-center">
                  <p className="text-destructive font-medium">
                    {documentoResultados.mensagem}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="servidor-ojs" className="space-y-4 mt-4">
            <div className="space-y-4">
              <RadioGroup value={servidorOjGrau} onValueChange={(value) => setServidorOjGrau(value as '1' | '2')}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="servidor-oj-1grau" />
                    <Label htmlFor="servidor-oj-1grau">1º Grau</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="servidor-oj-2grau" />
                    <Label htmlFor="servidor-oj-2grau">2º Grau</Label>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <Label htmlFor="servidor-oj-cpf">CPF do Servidor</Label>
                <div className="flex gap-2">
                  <Input
                    id="servidor-oj-cpf"
                    type="text"
                    placeholder="Digite o CPF (apenas números)"
                    value={servidorOjCpf}
                    onChange={(e) => setServidorOjCpf(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleServidorOjSearch()}
                  />
                  <Button 
                    onClick={handleServidorOjSearch} 
                    disabled={loadingServidorOj || !servidorOjCpf}
                  >
                    {loadingServidorOj ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {servidorOjResults && (
                <div className="mt-4 space-y-4">
                  {servidorOjResults.nome_servidor && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          {servidorOjResults.nome_servidor}
                        </CardTitle>
                        {servidorOjResults.email_servidor && (
                          <CardDescription>{servidorOjResults.email_servidor}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Total OJs: {servidorOjResults.total_ojs}</span>
                          <span>Total Localizações: {servidorOjResults.total_localizacoes}</span>
                        </div>
                        
                        {/* Filtro por cidade */}
                        <div className="flex gap-2 items-center">
                          <Label htmlFor="filtro-cidade" className="text-sm">
                            Filtrar por cidade:
                          </Label>
                          <Input
                            id="filtro-cidade"
                            type="text"
                            placeholder="Ex: Campinas, São Paulo, Ribeirão..."
                            value={filtroCidade}
                            onChange={(e) => setFiltroCidade(e.target.value)}
                            className="max-w-xs"
                          />
                          {filtroCidade && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setFiltroCidade('')}
                            >
                              Limpar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {(() => {
                    const ojsResponsavelFiltradas = servidorOjResults.agrupado?.responsavel ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.responsavel) : [];
                    return ojsResponsavelFiltradas.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge variant="default">Responsável</Badge>
                            <span className="text-xs text-muted-foreground">
                              ({ojsResponsavelFiltradas.length})
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {ojsResponsavelFiltradas.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded hover:bg-muted/50">
                              <div className="font-medium text-sm">
                                {item.ds_orgao_julgador || item.localizacao || 'Localização'}
                              </div>
                              {item.sigla && (
                                <div className="text-xs text-muted-foreground">
                                  Sigla: {item.sigla} {item.vara && `• Vara: ${item.vara}`}
                                </div>
                              )}
                              {item.papel && (
                                <div className="text-xs text-muted-foreground">
                                  Papel: {item.papel}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })()}
                  
                  {(() => {
                    const ojsFavoritasFiltradas = servidorOjResults.agrupado?.favoritas ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.favoritas) : [];
                    return ojsFavoritasFiltradas.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge variant="secondary">Favoritas</Badge>
                            <span className="text-xs text-muted-foreground">
                              ({ojsFavoritasFiltradas.length})
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {ojsFavoritasFiltradas.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded hover:bg-muted/50">
                              <div className="font-medium text-sm">
                                {item.ds_orgao_julgador || item.localizacao || 'Localização'}
                              </div>
                              {item.sigla && (
                                <div className="text-xs text-muted-foreground">
                                  Sigla: {item.sigla} {item.vara && `• Vara: ${item.vara}`}
                                </div>
                              )}
                              {item.papel && (
                                <div className="text-xs text-muted-foreground">
                                  Papel: {item.papel}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })()}
                  
                  {(() => {
                    const ojsNormaisFiltradas = servidorOjResults.agrupado?.normais ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.normais) : [];
                    return ojsNormaisFiltradas.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge variant="outline">Outras</Badge>
                            <span className="text-xs text-muted-foreground">
                              ({ojsNormaisFiltradas.length})
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {ojsNormaisFiltradas.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded hover:bg-muted/50">
                              <div className="font-medium text-sm">
                                {item.ds_orgao_julgador || item.localizacao || 'Localização'}
                              </div>
                              {item.sigla && (
                                <div className="text-xs text-muted-foreground">
                                  Sigla: {item.sigla} {item.vara && `• Vara: ${item.vara}`}
                                </div>
                              )}
                              {item.papel && (
                                <div className="text-xs text-muted-foreground">
                                  Papel: {item.papel}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })()}
                  
                  {(() => {
                    const temResponsavel = servidorOjResults.agrupado?.responsavel?.length > 0;
                    const temFavoritas = servidorOjResults.agrupado?.favoritas?.length > 0;
                    const temNormais = servidorOjResults.agrupado?.normais?.length > 0;
                    
                    const ojsResponsavelFiltradas = temResponsavel ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.responsavel) : [];
                    const ojsFavoritasFiltradas = temFavoritas ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.favoritas) : [];
                    const ojsNormaisFiltradas = temNormais ? 
                      filtrarEOrdenarOJs(servidorOjResults.agrupado.normais) : [];
                    
                    const totalFiltradas = ojsResponsavelFiltradas.length + 
                                          ojsFavoritasFiltradas.length + 
                                          ojsNormaisFiltradas.length;
                    
                    if (servidorOjResults.ojs_localizacoes?.length === 0) {
                      return (
                        <div className="text-center text-muted-foreground py-4">
                          Nenhuma OJ ou localização encontrada para este servidor.
                        </div>
                      );
                    } else if (filtroCidade && totalFiltradas === 0) {
                      return (
                        <div className="text-center text-muted-foreground py-4">
                          Nenhuma OJ encontrada para a cidade "{filtroCidade}".
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              
              {/* Seção de Verificação em Lote */}
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verificação em Lote de OJs</h3>
                <p className="text-sm text-muted-foreground">
                  Compare uma lista de OJs com as OJs cadastradas do servidor
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ojs-input">OJs para Verificar</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Formato de Importação
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96" align="end">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">Formatos aceitos para importação:</p>
                          
                          <div className="space-y-2">
                            <div className="border rounded p-2 bg-muted/50">
                              <p className="text-xs font-medium mb-1">Formato 1 - Array simples:</p>
                              <pre className="text-xs font-mono">
{`[
  "1ª Vara do Trabalho de Campinas",
  "2ª Vara do Trabalho de Campinas",
  "Vara do Trabalho de Piracicaba"
]`}
                              </pre>
                            </div>
                            
                            <div className="border rounded p-2 bg-muted/50">
                              <p className="text-xs font-medium mb-1">Formato 2 - Objeto com OJs:</p>
                              <pre className="text-xs font-mono">
{`{
  "ojs": [
    "1ª Vara do Trabalho de Campinas",
    "2ª Vara do Trabalho de Campinas"
  ]
}`}
                              </pre>
                            </div>
                            
                            <div className="border rounded p-2 bg-muted/50">
                              <p className="text-xs font-medium mb-1">Formato 3 - Texto simples (uma por linha):</p>
                              <pre className="text-xs font-mono">
{`1ª Vara do Trabalho de Campinas
2ª Vara do Trabalho de Campinas
Vara do Trabalho de Piracicaba`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Textarea
                    id="ojs-input"
                    placeholder="Digite ou cole as OJs aqui, uma por linha ou separadas por vírgula"
                    value={ojsInputText}
                    onChange={(e) => setOjsInputText(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <div>
                      <input
                        type="file"
                        id="file-import"
                        accept=".json,.txt"
                        onChange={handleFileImport}
                        style={{ display: 'none' }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-import')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Arquivo
                      </Button>
                    </div>
                    <Button 
                      onClick={handleBatchVerification}
                      disabled={loadingVerification || !ojsInputText.trim() || !servidorOjResults}
                    >
                      {loadingVerification ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Verificar OJs
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {verificationResults && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Resultado da Verificação</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportResults}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Exportar JSON
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Existentes:</span>
                            <span className="text-muted-foreground">
                              {verificationResults.existentes.length} de {verificationResults.total}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">Faltantes:</span>
                            <span className="text-muted-foreground">
                              {verificationResults.faltantes.length} de {verificationResults.total}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Total Verificadas:</span>
                            <span className="text-muted-foreground">{verificationResults.total}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">OJs do Servidor:</span>
                            <span className="text-muted-foreground">{verificationResults.serverTotal}</span>
                          </div>
                        </div>
                      </div>
                      
                      {verificationResults.existentes.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            OJs Existentes ({verificationResults.existentes.length})
                          </Label>
                          <div className="border rounded-lg p-3 max-h-32 overflow-y-auto bg-green-50/50">
                            <div className="text-xs text-green-700 space-y-1">
                              {verificationResults.existentes.map((oj: string, idx: number) => (
                                <div key={idx}>{oj}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {verificationResults.faltantes.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            OJs Faltantes ({verificationResults.faltantes.length})
                          </Label>
                          <div className="border rounded-lg p-3 max-h-32 overflow-y-auto bg-red-50/50">
                            <div className="text-xs text-red-700 space-y-1">
                              {verificationResults.faltantes.map((oj: string, idx: number) => (
                                <div key={idx}>{oj}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      </Card>
      
      <ProcessoDetalhesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detalhes={processoDetalhes}
        loading={loadingDetalhes}
      />
    </>
  );
};