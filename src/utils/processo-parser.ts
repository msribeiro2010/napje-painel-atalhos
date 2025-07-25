import { orgaosJulgadores } from '@/constants/form-options';

/**
 * Extrai o código do órgão julgador do número do processo
 * Formato típico: NNNNNNN-DD.AAAA.J.TR.OOOO
 * Onde OOOO são os últimos 4 dígitos que representam o código do órgão
 */
export const extrairCodigoOrgaoJulgador = (numeroProcesso: string): string | null => {
  if (!numeroProcesso) return null;
  
  // Remove espaços e caracteres especiais, mantendo apenas números e pontos/hífens
  const processoLimpo = numeroProcesso.replace(/[^\d\.\-]/g, '');
  
  // Verifica se está no formato correto (pelo menos os elementos básicos)
  const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
  
  if (!regex.test(processoLimpo)) {
    return null;
  }
  
  // Extrai os últimos 4 dígitos (código do órgão)
  const partes = processoLimpo.split('.');
  if (partes.length >= 5) {
    const codigoOrgao = partes[4];
    return codigoOrgao;
  }
  
  return null;
};

/**
 * Busca o órgão julgador completo baseado no código extraído do processo
 */
export const buscarOrgaoJulgadorPorCodigo = (codigo: string): string | null => {
  if (!codigo) return null;
  
  // Remove zeros à esquerda para comparação
  const codigoLimpo = parseInt(codigo, 10).toString();
  
  const orgao = orgaosJulgadores.find(org => org.codigo === codigoLimpo);
  
  if (orgao) {
    return orgao.nome;
  }
  
  return null;
};

/**
 * Função principal que extrai e busca o órgão julgador automaticamente
 */
export const obterOrgaoJulgadorDoProcesso = (numeroProcesso: string): string | null => {
  const codigo = extrairCodigoOrgaoJulgador(numeroProcesso);
  if (!codigo) return null;
  
  return buscarOrgaoJulgadorPorCodigo(codigo);
};