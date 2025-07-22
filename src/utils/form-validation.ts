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
  const requiredFields = ['notas'];
  
  for (const field of requiredFields) {
    if (!formData[field as keyof FormData]) {
      toast.error(`Campo obrigatório não preenchido: ${field}`);
      return false;
    }
  }

  // Validar resumo
  const resumoFinal = formData.resumo === 'Outro (personalizado)' ? formData.resumoCustom : formData.resumo;
  if (!resumoFinal) {
    toast.error('Campo obrigatório não preenchido: resumo');
    return false;
  }

  // Validar CPF se preenchido
  if (formData.cpfUsuario && !validarCPF(formData.cpfUsuario)) {
    toast.error('CPF inválido');
    return false;
  }

  return true;
};