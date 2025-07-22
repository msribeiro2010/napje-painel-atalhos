export interface KnowledgeBaseItem {
  id: string;
  titulo: string;
  problema_descricao: string;
  solucao: string;
  categoria?: string;
  tags?: string[];
  arquivo_print?: string; // URL da imagem no storage
  visualizacoes?: number;
  util_count?: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseFormData {
  titulo: string;
  problema_descricao: string;
  solucao: string;
  categoria: string;
  tags: string[];
  arquivo_print?: File | null; // Arquivo de imagem selecionado
}