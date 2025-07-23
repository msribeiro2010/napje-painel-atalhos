import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChamadosRecentes } from '@/hooks/useChamadosRecentes';
import { ChamadoCard } from '@/components/ChamadoCard';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';

const ChamadosRecentes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    chamados,
    loading,
    handleCopiarDescricao,
    criarTemplateDoChamado,
    duplicarChamado,
    editarChamado,
    handleExcluirChamado
  } = useChamadosRecentes();

  const filteredChamados = useMemo(() => {
    if (!searchTerm.trim()) return chamados;
    
    const searchLower = searchTerm.toLowerCase();
    return chamados.filter(chamado => 
      chamado.titulo.toLowerCase().includes(searchLower) ||
      chamado.descricao.toLowerCase().includes(searchLower) ||
      (chamado.numero_processo && chamado.numero_processo.toLowerCase().includes(searchLower)) ||
      (chamado.orgao_julgador && chamado.orgao_julgador.toLowerCase().includes(searchLower)) ||
      (chamado.nome_usuario_afetado && chamado.nome_usuario_afetado.toLowerCase().includes(searchLower)) ||
      (chamado.cpf_usuario_afetado && chamado.cpf_usuario_afetado.toLowerCase().includes(searchLower)) ||
      (chamado.chamado_origem && chamado.chamado_origem.toLowerCase().includes(searchLower))
    );
  }, [chamados, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8f5e4] dark:bg-[#23201a] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="mr-4 text-[#7c6a3c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] bg-[#f8f5e4] dark:bg-[#2d2717] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#7c6a3c] dark:text-[#f8f5e4]">Chamados Recentes</h1>
              <p className="text-[#bfae7c] dark:text-[#bfae7c]">Histórico dos últimos chamados criados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Clock />
            <DateDisplay />
            {/* Campo de busca */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#bfae7c] dark:text-[#bfae7c]" />
              <Input
                type="text"
                placeholder="Buscar por título, descrição, processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320] text-[#7c6a3c] dark:text-[#f8f5e4] placeholder:text-[#bfae7c] dark:placeholder:text-[#bfae7c]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bfae7c] dark:border-[#bfae7c] mx-auto"></div>
            <p className="text-[#bfae7c] dark:text-[#bfae7c] mt-4">Carregando chamados...</p>
          </div>
        ) : filteredChamados.length === 0 ? (
          <Card className="bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-[#bfae7c] dark:text-[#bfae7c] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#7c6a3c] dark:text-[#f8f5e4] mb-2">
                {chamados.length === 0 ? 'Nenhum chamado encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-[#bfae7c] dark:text-[#bfae7c]">
                {chamados.length === 0 
                  ? 'Ainda não há chamados criados no sistema.' 
                  : 'Tente ajustar os termos da sua busca.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchTerm && (
              <div className="mb-4 text-sm text-[#bfae7c] dark:text-[#bfae7c]">
                Mostrando {filteredChamados.length} de {chamados.length} chamados
              </div>
            )}
            {filteredChamados.map((chamado) => (
              <ChamadoCard
                key={chamado.id}
                chamado={chamado}
                onCopiar={handleCopiarDescricao}
                onTemplate={criarTemplateDoChamado}
                onDuplicar={duplicarChamado}
                onEditar={editarChamado}
                onExcluir={handleExcluirChamado}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChamadosRecentes;