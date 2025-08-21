import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChamados, Chamado } from '@/hooks/useChamados';
import { toast } from 'sonner';
import { copiarDescricao } from '@/utils/chamado-utils';

export const useChamadosRecentes = () => {
  const navigate = useNavigate();
  const { buscarChamadosRecentes, excluirChamado, loading: hookLoading, error, clearCache } = useChamados();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // Combinar estados de loading
  const loading = localLoading || hookLoading;

  // Função para carregar chamados com melhor tratamento de erro
  const carregarChamados = useCallback(async (limite: number = 20) => {
    try {
      setLocalLoading(true);
      console.log(`🔄 Carregando ${limite} chamados recentes...`);
      const dados = await buscarChamadosRecentes(limite);
      setChamados(dados);
      console.log(`✅ ${dados.length} chamados carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar chamados:', error);
      toast.error('Erro ao carregar chamados recentes');
      setChamados([]);
    } finally {
      setLocalLoading(false);
    }
  }, [buscarChamadosRecentes]);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  // Função específica para buscar apenas os últimos 3 chamados para o dashboard
  const buscarUltimos3Chamados = useCallback(async (): Promise<Chamado[]> => {
    try {
      console.log('🔄 Buscando últimos 3 chamados para dashboard...');
      const dados = await buscarChamadosRecentes(3);
      console.log(`✅ ${dados.length} chamados retornados para dashboard`);
      return dados;
    } catch (error) {
      console.error('❌ Erro ao buscar últimos 3 chamados:', error);
      toast.error('Erro ao carregar chamados do dashboard');
      return [];
    }
  }, [buscarChamadosRecentes]);

  const handleCopiarDescricao = useCallback((chamado: Chamado) => {
    try {
      copiarDescricao(chamado);
      toast.success('Descrição copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar descrição:', error);
      toast.error('Erro ao copiar descrição');
    }
  }, []);

  const criarTemplateDoChamado = useCallback((chamado: any) => {
    try {
      const params = new URLSearchParams({
        resumo: chamado.titulo || chamado.assunto || '',
        grau: chamado.grau || chamado.categoria || '',
        processos: chamado.numero_processo || '',
        orgaoJulgador: chamado.orgao_julgador || '',
        perfilUsuario: chamado.perfil_usuario_afetado || '',
        cpfUsuario: chamado.cpf_usuario_afetado || '',
        nomeUsuario: chamado.nome_usuario_afetado || chamado.usuario_criador_nome || '',
        chamadoOrigem: chamado.chamado_origem || '',
        notas: chamado.descricao
      });
      
      navigate(`/?${params.toString()}`);
      toast.success('Template criado! Dados carregados no formulário.');
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast.error('Erro ao criar template do chamado');
    }
  }, [navigate]);

  const editarChamado = useCallback((chamado: any) => {
    try {
      const params = new URLSearchParams({
        resumo: chamado.titulo || chamado.assunto || '',
        grau: chamado.grau || chamado.categoria || '',
        processos: chamado.numero_processo || '',
        orgaoJulgador: chamado.orgao_julgador || '',
        perfilUsuario: chamado.perfil_usuario_afetado || '',
        cpfUsuario: chamado.cpf_usuario_afetado || '',
        nomeUsuario: chamado.nome_usuario_afetado || chamado.usuario_criador_nome || '',
        chamadoOrigem: chamado.chamado_origem || '',
        notas: chamado.descricao,
        editId: chamado.id
      });
      
      navigate(`/criar-chamado?${params.toString()}`);
      toast.success('Dados carregados para edição!');
    } catch (error) {
      console.error('Erro ao editar chamado:', error);
      toast.error('Erro ao abrir chamado para edição');
    }
  }, [navigate]);

  const handleExcluirChamado = useCallback(async (id: string) => {
    try {
      const sucesso = await excluirChamado(id);
      if (sucesso) {
        setChamados(prev => prev.filter(chamado => chamado.id !== id));
        toast.success('Chamado excluído com sucesso');
        // Recarregar lista para manter sincronização
        await carregarChamados();
      }
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
      toast.error('Erro ao excluir chamado');
    }
  }, [excluirChamado, carregarChamados]);

  const duplicarChamado = useCallback((chamado: any) => {
    try {
      // Mantém apenas o resumo preenchido
      const params = new URLSearchParams({
        resumo: chamado.titulo || chamado.assunto || '',
      });
      
      navigate(`/criar-chamado?${params.toString()}`);
      toast.success('Chamado duplicado! Preencha os novos dados.');
    } catch (error) {
      console.error('Erro ao duplicar chamado:', error);
      toast.error('Erro ao duplicar chamado');
    }
  }, [navigate]);

  // Função para recarregar dados manualmente
  const recarregarChamados = useCallback(() => {
    clearCache();
    carregarChamados();
  }, [clearCache, carregarChamados]);

  // Memoizar o retorno para evitar re-renders desnecessários
  const memoizedReturn = useMemo(() => ({
    chamados,
    loading,
    error,
    buscarUltimos3Chamados,
    handleCopiarDescricao,
    criarTemplateDoChamado,
    editarChamado,
    handleExcluirChamado,
    duplicarChamado,
    recarregarChamados,
    carregarChamados
  }), [
    chamados,
    loading,
    error,
    buscarUltimos3Chamados,
    handleCopiarDescricao,
    criarTemplateDoChamado,
    editarChamado,
    handleExcluirChamado,
    duplicarChamado,
    recarregarChamados,
    carregarChamados
  ]);

  return memoizedReturn;
};