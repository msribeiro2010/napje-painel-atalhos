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
  const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

  // Formato específico solicitado
  let description = `Assunto: Tarefa – ${resumoFinal}`;
  if (formData.processos) {
    description += ` - ${formData.processos}`;
  }
  description += `\n\n`;
  
  // Detalhes do Usuário/Processo
  description += `Detalhes do Usuário/Processo:\n`;
  if (formData.chamadoOrigem) {
    description += `- Número do Chamado de Origem: ${formData.chamadoOrigem}\n`;
  }
  
  // Pessoa Relacionada
  if (formData.nomeUsuario || formData.perfilUsuario || formData.cpfUsuario || formData.orgaoJulgador) {
    description += `- Pessoa Relacionada: `;
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    description += `${dadosUsuario.join('/')}\n`;
  }
  
  // Número do Processo
  if (formData.processos) {
    description += `- Número do Processo: ${formData.processos}\n`;
  }
  
  // Grau da Instância
  if (formData.grau) {
    description += `- Grau da Instância: ${formData.grau}\n`;
  }
  
  description += `\n`;
  
  // Descrição
  description += `Descrição: ${limparDescricaoProblema(formData.notas)}`;

  return description;
};

export const formatDescriptionSections = (formData: FormData): DescriptionSection[] => {
  const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

  const sections: DescriptionSection[] = [
    // Assunto
    {
      title: 'Assunto',
      content: `Tarefa – ${resumoFinal}${formData.processos ? ` - ${formData.processos}` : ''}`,
      key: 'assunto',
      fullWidth: true
    }
  ];

  // Detalhes do Usuário/Processo
  let detalhesContent = '';
  if (formData.chamadoOrigem) {
    detalhesContent += `- Número do Chamado de Origem: ${formData.chamadoOrigem}\n`;
  }
  
  if (formData.nomeUsuario || formData.perfilUsuario || formData.cpfUsuario || formData.orgaoJulgador) {
    detalhesContent += `- Pessoa Relacionada: `;
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    detalhesContent += `${dadosUsuario.join('/')}\n`;
  }
  
  if (formData.processos) {
    detalhesContent += `- Número do Processo: ${formData.processos}\n`;
  }
  
  if (formData.grau) {
    detalhesContent += `- Grau da Instância: ${formData.grau}\n`;
  }

  if (detalhesContent) {
    sections.push({
      title: 'Detalhes do Usuário/Processo',
      content: detalhesContent.trim(),
      key: 'detalhes_usuario',
      fullWidth: true
    });
  }

  // Descrição
  sections.push({
    title: 'Descrição',
    content: limparDescricaoProblema(formData.notas),
    key: 'descricao',
    fullWidth: true
  });

  return sections;
};