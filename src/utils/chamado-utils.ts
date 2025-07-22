import { Chamado } from '@/hooks/useChamados';

export const formatarUsuario = (chamado: Chamado) => {
  const partes = [];
  if (chamado.nome_usuario_afetado) partes.push(chamado.nome_usuario_afetado);
  if (chamado.cpf_usuario_afetado) partes.push(chamado.cpf_usuario_afetado);
  if (chamado.perfil_usuario_afetado) partes.push(chamado.perfil_usuario_afetado);
  if (chamado.orgao_julgador) partes.push(chamado.orgao_julgador);
  return partes.join(' / ');
};

export const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Aberto': return 'bg-blue-500';
    case 'Em andamento': return 'bg-yellow-500';
    case 'Fechado': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const copiarDescricao = (chamado: Chamado) => {
  let texto = `Título: ${chamado.titulo}\n\n`;
  texto += `Descrição: ${chamado.descricao}\n\n`;
  
  if (chamado.numero_processo) {
    texto += `Número do Processo: ${chamado.numero_processo}\n\n`;
  }
  
  if (chamado.nome_usuario_afetado || chamado.cpf_usuario_afetado || chamado.perfil_usuario_afetado) {
    texto += `Usuário: `;
    const dadosUsuario = [];
    if (chamado.nome_usuario_afetado) dadosUsuario.push(chamado.nome_usuario_afetado);
    if (chamado.cpf_usuario_afetado) dadosUsuario.push(chamado.cpf_usuario_afetado);
    if (chamado.perfil_usuario_afetado) dadosUsuario.push(chamado.perfil_usuario_afetado);
    texto += dadosUsuario.join(' - ') + '\n\n';
  }
  
  navigator.clipboard.writeText(texto);
  return texto;
};