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

  // 1º lugar: Resumo
  let description = `*Resumo\n\n${resumoFinal}`;
  if (formData.processos) {
    description += ` - ${formData.processos}`;
  }
  description += `\n\n`;
  
  // 2º lugar: Descrição do Problema
  description += `Descrição do Problema\n\n${limparDescricaoProblema(formData.notas)}\n\n`;
  
  // 3º lugar: Número dos processos
  if (formData.processos) {
    description += `Número dos processos\n\n${formData.processos}\n\n`;
  }

  // 4º lugar: Número do Chamado de Origem (se preenchido)
  if (formData.chamadoOrigem) {
    description += `Número do Chamado de Origem\n\n${formData.chamadoOrigem}\n\n`;
  }

  // 5º lugar: Perfil do serviço que abriu o chamado
  if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
    description += `*Perfil/CPF/Nome completo do usuário\n\n`;
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    description += `${dadosUsuario.join('/')}\n\n`;
  }

  return description;
};

export const formatDescriptionSections = (formData: FormData): DescriptionSection[] => {
  const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;

  const sections: DescriptionSection[] = [
    // 1º lugar: Resumo
    {
      title: 'Resumo',
      content: resumoFinal + (formData.processos ? ` - ${formData.processos}` : ''),
      key: 'resumo',
      fullWidth: true
    },
    // 2º lugar: Descrição do Problema
    {
      title: 'Descrição do Problema',
      content: limparDescricaoProblema(formData.notas),
      key: 'notas',
      fullWidth: true
    }
  ];

  // 3º lugar: Número dos processos se preenchido
  if (formData.processos) {
    sections.push({
      title: 'Número dos processos',
      content: formData.processos,
      key: 'processos',
      fullWidth: true
    });
  }

  // 4º lugar: Número do Chamado de Origem se preenchido
  if (formData.chamadoOrigem) {
    sections.push({
      title: 'Número do Chamado de Origem',
      content: formData.chamadoOrigem,
      key: 'chamadoOrigem',
      fullWidth: true
    });
  }

  // 5º lugar: Perfil do serviço que abriu o chamado se preenchido
  if (formData.perfilUsuario || formData.cpfUsuario || formData.nomeUsuario || (formData.orgaoJulgador && formData.grau === '1º Grau')) {
    const dadosUsuario = [];
    if (formData.nomeUsuario) dadosUsuario.push(formData.nomeUsuario);
    if (formData.perfilUsuario) dadosUsuario.push(formData.perfilUsuario);
    if (formData.cpfUsuario) dadosUsuario.push(formData.cpfUsuario);
    if (formData.orgaoJulgador && formData.grau === '1º Grau') dadosUsuario.push(limparCodigoOJ(formData.orgaoJulgador));
    
    sections.push({
      title: 'Perfil/CPF/Nome completo do usuário',
      content: dadosUsuario.join('/'),
      key: 'usuario',
      fullWidth: true
    });
  }

  return sections;
};