import { FormData } from '@/types/form';
import { toast } from 'sonner';

const validarCPF = (cpf: string) => {
  const somenteNumeros = cpf.replace(/\D/g, '');
  
  if (somenteNumeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(somenteNumeros)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(somenteNumeros[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(somenteNumeros[9])) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(somenteNumeros[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(somenteNumeros[10])) return false;
  
  return true;
};

export const validateForm = (formData: FormData): boolean => {
  // Validar resumo
  const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
  if (!resumoFinal) {
    toast.error('Campo obrigatório não preenchido: Resumo');
    return false;
  }

  // Validar grau
  if (!formData.grau) {
    toast.error('Campo obrigatório não preenchido: Grau');
    return false;
  }

  // Validar órgão julgador
  if (!formData.orgaoJulgador) {
    toast.error('Campo obrigatório não preenchido: Órgão Julgador');
    return false;
  }

  // Validar descrição do problema
  if (!formData.notas) {
    toast.error('Campo obrigatório não preenchido: Descrição do Problema');
    return false;
  }

  // Validar CPF se preenchido
  if (formData.cpfUsuario && !validarCPF(formData.cpfUsuario)) {
    toast.error('CPF inválido');
    return false;
  }

  return true;
};