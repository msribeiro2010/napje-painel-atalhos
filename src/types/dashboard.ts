export type ChamadoComPerfil = {
  id: string;
  assunto: string;
  descricao?: string;
  status?: string;
  prioridade?: string;
  created_at: string;
  usuario_criador?: string;
  categoria?: string;
  subcategoria?: string;
  tags?: string[];
  tempo_estimado?: number;
  data_vencimento?: string;
  anexos?: string[];
  observacoes_internas?: string;
  historico_status?: any[];
  feedback_usuario?: string;
  numero_protocolo?: string;
  orgao_julgador?: string;
  vara_origem?: string;
  tipo_processo?: string;
  usuario_criador_nome?: string;
  [key: string]: unknown;
};

export type DashboardAction = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
  customComponent?: React.ReactNode;
};

export type AITool = {
  name: string;
  url: string;
};