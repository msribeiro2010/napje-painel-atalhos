export type ChamadoComPerfil = {
  id: string;
  titulo: string;
  created_at: string;
  created_by: string | null;
  created_by_profile?: {
    nome_completo: string | null;
    email: string;
  } | null;
  [key: string]: unknown;
};

export type DashboardAction = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant: 'default' | 'outline';
  customComponent?: React.ReactNode;
};

export type AITool = {
  name: string;
  url: string;
};