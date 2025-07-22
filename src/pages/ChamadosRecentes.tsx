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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chamados Recentes</h1>
              <p className="text-gray-600">Histórico dos últimos chamados criados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Clock />
            <DateDisplay />
            {/* Campo de busca */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por título, descrição, processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando chamados...</p>
          </div>
        ) : filteredChamados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {chamados.length === 0 ? 'Nenhum chamado encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-600">
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
              <div className="mb-4 text-sm text-gray-600">
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