/**
 * Utilitários para manipulação e validação de CPF
 */

/**
 * Formata um CPF adicionando pontos e hífen
 * @param valor - CPF sem formatação
 * @returns CPF formatado (000.000.000-00)
 */
export const formatarCPF = (valor: string): string => {
  const somenteNumeros = valor.replace(/\D/g, '');
  
  if (somenteNumeros.length <= 11) {
    return somenteNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }
  return valor;
};

/**
 * Remove formatação do CPF, deixando apenas números
 * @param cpf - CPF formatado ou não
 * @returns CPF apenas com números
 */
export const limparCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Valida se um CPF é válido
 * @param cpf - CPF a ser validado (formatado ou não)
 * @returns true se o CPF for válido, false caso contrário
 */
export const validarCPF = (cpf: string): boolean => {
  const somenteNumeros = limparCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (somenteNumeros.length !== 11) return false;
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(somenteNumeros)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(somenteNumeros[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(somenteNumeros[9])) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(somenteNumeros[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(somenteNumeros[10])) return false;
  
  return true;
};

/**
 * Máscara de CPF para inputs
 * @param valor - Valor atual do input
 * @returns Valor formatado com máscara
 */
export const mascaraCPF = (valor: string): string => {
  return formatarCPF(valor);
};