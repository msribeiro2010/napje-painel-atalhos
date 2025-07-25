import { FormData, DescriptionSection } from '@/types/form';

const limparCodigoOJ = (orgaoJulgador: string): string => {
  // Remove códigos no formato "XX - " do início do nome do órgão julgador
  return orgaoJulgador.replace(/^\d+\s*-\s*/, '').trim();
};

export const limparDescricaoProblema = (texto: string): string => {
  if (!texto) return texto;
  
  // Remove cabeçalho como "Relato de problema técnico..."
  let textoLimpo = texto.replace(/^[^:]*:\s*\n\n/, '');
  
  // Remove seções formatadas como **Processo:**, **Órgão Julgador:**, **Grau:**
  textoLimpo = textoLimpo.replace(/\*\*Processo:\*\*[^\n]*\n/g, '');
  textoLimpo = textoLimpo.replace(/\*\*Órgão Julgador:\*\*[^\n]*\n/g, '');
  textoLimpo = textoLimpo.replace(/\*\*Grau:\*\*[^\n]*\n/g, '');
  
  // Remove **Problema:** e pega apenas o texto que vem depois até encontrar **Detalhes:**
  if (textoLimpo.includes('**Problema:**')) {
    // Extrai apenas o conteúdo entre **Problema:** e **Detalhes:** (ou final do texto)
    const problemaMatch = textoLimpo.match(/\*\*Problema:\*\*\s*(.*?)(?:\*\*Detalhes:\*\*|$)/s);
    if (problemaMatch) {
      textoLimpo = problemaMatch[1].trim();
    }
  } else {
    // Remove **Detalhes:** se não houver **Problema:**
    textoLimpo = textoLimpo.replace(/\*\*Detalhes:\*\*\s*/g, '');
  }
  
  // Remove quebras de linha extras
  textoLimpo = textoLimpo.replace(/\n{3,}/g, '\n\n').trim();
  
  return textoLimpo;
};

export const generateDescription = (formData: FormData): string => {
  let description = '';
  
  // Descrição do Problema
  description += `Descrição do Problema:\n\n${limparDescricaoProblema(formData.notas)}\n\n`;
  
  // Dados do Usuário (se preenchidos)
  if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
    description += `Dados do Usuário:\n\n`;
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    description += `${dadosUsuario.join(' / ')}\n\n`;
  }

  // Número do Chamado de Origem (se preenchido)
  if (formData.chamadoOrigem) {
    description += `Chamado Origem: ${formData.chamadoOrigem}\n\n`;
  }

  return description.trim();
};

export const formatDescriptionSections = (formData: FormData): DescriptionSection[] => {
  const sections: DescriptionSection[] = [
    // Descrição do Problema
    {
      title: 'Descrição do Problema',
      content: limparDescricaoProblema(formData.notas),
      key: 'notas',
      fullWidth: true
    }
  ];

  // Dados do Usuário (se preenchidos)
  if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    
    sections.push({
      title: 'Dados do Usuário',
      content: dadosUsuario.join(' / '),
      key: 'usuario',
      fullWidth: true
    });
  }

  // Número do Chamado de Origem (se preenchido)
  if (formData.chamadoOrigem) {
    sections.push({
      title: 'Chamado Origem',
      content: formData.chamadoOrigem,
      key: 'chamadoOrigem',
      fullWidth: true
    });
  }

  return sections;
};