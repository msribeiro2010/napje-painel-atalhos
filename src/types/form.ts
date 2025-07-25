export interface FormData {
  resumo: string;
  resumoCustom: string;
  grau: string;
  orgaoJulgador: string;
  perfilUsuario: string;
  cpfUsuario: string;
  nomeUsuario: string;
  processos: string;
  notas: string;
  chamadoOrigem: string;
  isDraft?: boolean;
}

export interface DescriptionSection {
  title: string;
  content: string;
  key: string;
  fullWidth?: boolean;
  paired?: boolean;
}