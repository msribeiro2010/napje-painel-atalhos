export interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size?: number;
}

export interface KnowledgeBaseItem {
  id: string;
  titulo: string;
  problema_descricao: string;
  solucao: string;
  categoria?: string;
  tags?: string[];
  arquivo_print?: string; // URL da imagem no storage (compatibilidade)
  media_files?: MediaFile[]; // Múltiplas imagens e vídeos
  visualizacoes?: number;
  util_count?: number;
  notificacao_semanal?: boolean; // Ativar notificações semanais
  mensagem_notificacao?: string; // Mensagem personalizada para notificação
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseFormData {
  titulo: string;
  problema_descricao: string;
  solucao: string;
  categoria: string;
  tags: string[];
  arquivo_print?: File | null; // Arquivo de imagem selecionado (compatibilidade)
  media_files: File[]; // Múltiplos arquivos de mídia
  notificacao_semanal: boolean; // Ativar notificações semanais
  mensagem_notificacao: string; // Mensagem personalizada para notificação
}