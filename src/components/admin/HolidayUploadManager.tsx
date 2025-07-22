import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Download, Calendar, FileText, Trash2, Plus, 
  CheckCircle, AlertCircle, Globe, MapPin, Building
} from 'lucide-react';
import { toast } from 'sonner';
import { useFeriados, useCreateFeriado, useDeleteFeriado } from '@/hooks/useFeriados';

interface HolidayData {
  data: string;
  descricao: string;
  tipo: 'nacional' | 'estadual' | 'municipal';
}

export const HolidayUploadManager = () => {
  const { data: feriados = [], isLoading } = useFeriados();
  const createFeriado = useCreateFeriado();
  const deleteFeriado = useDeleteFeriado();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
  const [uploadData, setUploadData] = useState<string>('');
  const [parsedHolidays, setParsedHolidays] = useState<HolidayData[]>([]);
  const [manualHoliday, setManualHoliday] = useState<HolidayData>({
    data: '',
    descricao: '',
    tipo: 'nacional'
  });

  // Template de exemplo para diferentes formatos
  const templates = {
    csv: `data,descricao,tipo
2026-01-01,Ano Novo,nacional
2026-04-21,Tiradentes,nacional
2026-05-01,Dia do Trabalho,nacional`,
    json: `[
  {"data": "2026-01-01", "descricao": "Ano Novo", "tipo": "nacional"},
  {"data": "2026-04-21", "descricao": "Tiradentes", "tipo": "nacional"},
  {"data": "2026-05-01", "descricao": "Dia do Trabalho", "tipo": "nacional"}
]`,
    text: `01/01/2026 - Ano Novo - nacional
21/04/2026 - Tiradentes - nacional
01/05/2026 - Dia do Trabalho - nacional`
  };

  const parseHolidayData = (data: string, format: 'csv' | 'json' | 'text' | 'auto') => {
    try {
      const holidays: HolidayData[] = [];
      
      if (format === 'json' || (format === 'auto' && data.trim().startsWith('['))) {
        const jsonData = JSON.parse(data);
        holidays.push(...jsonData.map((item: any) => ({
          data: item.data,
          descricao: item.descricao || item.description || item.nome,
          tipo: item.tipo || item.type || 'nacional'
        })));
      } else if (format === 'csv' || (format === 'auto' && data.includes(','))) {
        const lines = data.split('\n').filter(line => line.trim());
        const hasHeader = lines[0].toLowerCase().includes('data') || lines[0].toLowerCase().includes('date');
        const dataLines = hasHeader ? lines.slice(1) : lines;
        
        dataLines.forEach(line => {
          const [dateStr, desc, type] = line.split(',').map(s => s.trim());
          if (dateStr && desc) {
            holidays.push({
              data: convertToISODate(dateStr),
              descricao: desc.replace(/['"]/g, ''),
              tipo: (type?.replace(/['"]/g, '') as 'nacional' | 'estadual' | 'municipal') || 'nacional'
            });
          }
        });
      } else {
        // Formato texto livre
        const lines = data.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
          const isoMatch = line.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
          
          if (dateMatch || isoMatch) {
            const [, day, month, year] = dateMatch || [];
            const [, yearIso, monthIso, dayIso] = isoMatch || [];
            
            const finalDate = dateMatch 
              ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
              : `${yearIso}-${monthIso.padStart(2, '0')}-${dayIso.padStart(2, '0')}`;
            
            const description = line
              .replace(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/, '')
              .replace(/\s*-\s*(nacional|estadual|municipal)\s*$/i, '')
              .replace(/^\s*-\s*/, '')
              .trim();
            
            const typeMatch = line.match(/(nacional|estadual|municipal)/i);
            const type = typeMatch ? typeMatch[1].toLowerCase() as 'nacional' | 'estadual' | 'municipal' : 'nacional';
            
            if (description) {
              holidays.push({
                data: finalDate,
                descricao: description,
                tipo: type
              });
            }
          }
        });
      }
      
      setParsedHolidays(holidays);
      toast.success(`${holidays.length} feriados identificados!`);
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      toast.error('Erro ao processar dados. Verifique o formato.');
    }
  };

  const convertToISODate = (dateStr: string): string => {
    // Tenta converter diferentes formatos para ISO
    const formats = [
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD ou YYYY/MM/DD
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, // DD-MM-YYYY ou DD/MM/YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          const [, year, month, day] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    return dateStr; // Retorna como está se não conseguir converter
  };

  const uploadHolidays = async () => {
    if (parsedHolidays.length === 0) {
      toast.error('Nenhum feriado para enviar');
      return;
    }

    try {
      for (const holiday of parsedHolidays) {
        await createFeriado.mutateAsync(holiday);
      }
      
      toast.success(`${parsedHolidays.length} feriados adicionados com sucesso!`);
      setUploadData('');
      setParsedHolidays([]);
    } catch (error) {
      console.error('Erro ao enviar feriados:', error);
      toast.error('Erro ao enviar alguns feriados');
    }
  };

  const addManualHoliday = async () => {
    if (!manualHoliday.data || !manualHoliday.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createFeriado.mutateAsync(manualHoliday);
      setManualHoliday({ data: '', descricao: '', tipo: 'nacional' });
      toast.success('Feriado adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar feriado:', error);
      toast.error('Erro ao adicionar feriado');
    }
  };

  const downloadTemplate = (format: 'csv' | 'json' | 'text') => {
    const content = templates[format];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feriados_template_${selectedYear}.${format === 'text' ? 'txt' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Template ${format.toUpperCase()} baixado!`);
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'nacional': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'estadual': return <MapPin className="h-4 w-4 text-green-500" />;
      case 'municipal': return <Building className="h-4 w-4 text-orange-500" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    const labels = {
      'nacional': 'Nacional',
      'estadual': 'Estadual', 
      'municipal': 'Municipal'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Gerenciamento de Feriados
          </CardTitle>
          <p className="text-sm text-gray-600">
            Adicione feriados futuros através de upload em lote ou inserção manual
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload em Lote</TabsTrigger>
          <TabsTrigger value="manual">Adicionar Manual</TabsTrigger>
          <TabsTrigger value="manage">Gerenciar Existentes</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload de Feriados</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="year">Ano:</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Templates para download */}
              <div>
                <Label className="text-sm font-medium">Templates Disponíveis</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                    <Download className="h-3 w-3 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('json')}>
                    <Download className="h-3 w-3 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('text')}>
                    <Download className="h-3 w-3 mr-1" />
                    Texto
                  </Button>
                </div>
              </div>

              {/* Área de upload/colagem */}
              <div>
                <Label htmlFor="uploadData">
                  Cole ou digite os dados dos feriados
                </Label>
                <Textarea
                  id="uploadData"
                  value={uploadData}
                  onChange={(e) => setUploadData(e.target.value)}
                  placeholder="Cole aqui os dados dos feriados em formato CSV, JSON ou texto livre..."
                  rows={8}
                  className="mt-2"
                />
              </div>

              {/* Botões de processamento */}
              <div className="flex gap-2">
                <Button onClick={() => parseHolidayData(uploadData, 'auto')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Processar Dados
                </Button>
                {parsedHolidays.length > 0 && (
                  <Button onClick={uploadHolidays} disabled={createFeriado.isPending}>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar {parsedHolidays.length} Feriados
                  </Button>
                )}
              </div>

              {/* Preview dos dados processados */}
              {parsedHolidays.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Feriados Identificados ({parsedHolidays.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {parsedHolidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(holiday.tipo)}
                            <span className="font-medium">{holiday.data}</span>
                            <span>{holiday.descricao}</span>
                          </div>
                          <Badge variant="outline">
                            {getTypeLabel(holiday.tipo)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Feriado Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="manualData">Data</Label>
                  <Input
                    id="manualData"
                    type="date"
                    value={manualHoliday.data}
                    onChange={(e) => setManualHoliday(prev => ({ ...prev, data: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="manualDescricao">Descrição</Label>
                  <Input
                    id="manualDescricao"
                    value={manualHoliday.descricao}
                    onChange={(e) => setManualHoliday(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: Dia do Trabalho"
                  />
                </div>
                
                <div>
                  <Label htmlFor="manualTipo">Tipo</Label>
                  <Select 
                    value={manualHoliday.tipo} 
                    onValueChange={(value: 'nacional' | 'estadual' | 'municipal') => 
                      setManualHoliday(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="estadual">Estadual</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={addManualHoliday} disabled={createFeriado.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Feriado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feriados Cadastrados</CardTitle>
              <p className="text-sm text-gray-600">
                {feriados.length} feriados cadastrados no sistema
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 mx-auto mb-2 animate-pulse text-gray-400" />
                  <p>Carregando feriados...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {feriados.map((feriado) => (
                    <div key={feriado.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(feriado.tipo)}
                        <div>
                          <div className="font-medium">{feriado.descricao}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(feriado.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getTypeLabel(feriado.tipo)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFeriado.mutate(feriado.id)}
                          disabled={deleteFeriado.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
