import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChamados, Chamado } from '@/hooks/useChamados';
import { toast } from 'sonner';
import { copiarDescricao } from '@/utils/chamado-utils';

export const useChamadosRecentes = () => {
  const navigate = useNavigate();
  const { buscarChamadosRecentes, excluirChamado } = useChamados();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarChamados = async () => {
      setLoading(true);
      const dados = await buscarChamadosRecentes(20);
      setChamados(dados);
      setLoading(false);
    };

    carregarChamados();
  }, []);

  const handleCopiarDescricao = (chamado: Chamado) => {
    copiarDescricao(chamado);
    toast.success('Descrição copiada para a área de transferência!');
  };

  const criarTemplateDoChamado = (chamado: Chamado) => {
    const params = new URLSearchParams({
      resumo: chamado.titulo,
      grau: chamado.grau || '',
      processos: chamado.numero_processo || '',
      orgaoJulgador: chamado.orgao_julgador || '',
      perfilUsuario: chamado.perfil_usuario_afetado || '',
      cpfUsuario: chamado.cpf_usuario_afetado || '',
      nomeUsuario: chamado.nome_usuario_afetado || '',
      chamadoOrigem: chamado.chamado_origem || '',
      notas: chamado.descricao
    });
    
    navigate(`/?${params.toString()}`);
    toast.success('Template criado! Dados carregados no formulário.');
  };

  const editarChamado = (chamado: Chamado) => {
    const params = new URLSearchParams({
      resumo: chamado.titulo,
      grau: chamado.grau || '',
      processos: chamado.numero_processo || '',
      orgaoJulgador: chamado.orgao_julgador || '',
      perfilUsuario: chamado.perfil_usuario_afetado || '',
      cpfUsuario: chamado.cpf_usuario_afetado || '',
      nomeUsuario: chamado.nome_usuario_afetado || '',
      chamadoOrigem: chamado.chamado_origem || '',
      notas: chamado.descricao,
      editId: chamado.id
    });
    
    navigate(`/criar-chamado?${params.toString()}`);
    toast.success('Dados carregados para edição!');
  };

  const handleExcluirChamado = async (id: string) => {
    const sucesso = await excluirChamado(id);
    if (sucesso) {
      setChamados(chamados.filter(chamado => chamado.id !== id));
    }
  };

  const duplicarChamado = (chamado: Chamado) => {
    // Mantém apenas o resumo preenchido
    const params = new URLSearchParams({
      resumo: chamado.titulo,
    });
    
    navigate(`/criar-chamado?${params.toString()}`);
    toast.success('Chamado duplicado! Preencha os novos dados.');
  };

  return { 
    chamados, 
    loading, 
    handleCopiarDescricao, 
    criarTemplateDoChamado, 
    duplicarChamado,
    editarChamado, 
    handleExcluirChamado 
  };
};