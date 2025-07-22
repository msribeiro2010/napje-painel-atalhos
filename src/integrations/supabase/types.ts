export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string
          read: boolean | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message: string
          read?: boolean | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string
          read?: boolean | null
          to_user_id?: string
        }
        Relationships: []
      }
      aniversariantes: {
        Row: {
          created_at: string | null
          data_nascimento: string
          id: number
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_nascimento: string
          id?: number
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string
          id?: number
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      assuntos: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      assuntos_base_conhecimento: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      base_conhecimento: {
        Row: {
          arquivo_print: string | null
          categoria: string | null
          created_at: string
          id: string
          problema_descricao: string
          solucao: string
          tags: string[] | null
          titulo: string
          updated_at: string
          util_count: number | null
          visualizacoes: number | null
        }
        Insert: {
          arquivo_print?: string | null
          categoria?: string | null
          created_at?: string
          id?: string
          problema_descricao: string
          solucao: string
          tags?: string[] | null
          titulo: string
          updated_at?: string
          util_count?: number | null
          visualizacoes?: number | null
        }
        Update: {
          arquivo_print?: string | null
          categoria?: string | null
          created_at?: string
          id?: string
          problema_descricao?: string
          solucao?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          util_count?: number | null
          visualizacoes?: number | null
        }
        Relationships: []
      }
      chamados: {
        Row: {
          assunto_id: string | null
          chamado_origem: string | null
          cpf_usuario_afetado: string | null
          created_at: string
          created_by: string | null
          descricao: string
          grau: string | null
          id: string
          nome_usuario_afetado: string | null
          numero_processo: string | null
          oj_detectada: string | null
          orgao_julgador: string | null
          perfil_usuario_afetado: string | null
          prioridade: number | null
          status: string | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          assunto_id?: string | null
          chamado_origem?: string | null
          cpf_usuario_afetado?: string | null
          created_at?: string
          created_by?: string | null
          descricao: string
          grau?: string | null
          id?: string
          nome_usuario_afetado?: string | null
          numero_processo?: string | null
          oj_detectada?: string | null
          orgao_julgador?: string | null
          perfil_usuario_afetado?: string | null
          prioridade?: number | null
          status?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          assunto_id?: string | null
          chamado_origem?: string | null
          cpf_usuario_afetado?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string
          grau?: string | null
          id?: string
          nome_usuario_afetado?: string | null
          numero_processo?: string | null
          oj_detectada?: string | null
          orgao_julgador?: string | null
          perfil_usuario_afetado?: string | null
          prioridade?: number | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_assunto_id_fkey"
            columns: ["assunto_id"]
            isOneToOne: false
            referencedRelation: "assuntos"
            referencedColumns: ["id"]
          },
        ]
      }
      feriados: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          id: number
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao: string
          id?: number
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          id?: number
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orgaos_julgadores_1grau: {
        Row: {
          codigo: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      orgaos_julgadores_2grau: {
        Row: {
          codigo: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      postit_notes: {
        Row: {
          color: string
          created_at: string
          id: string
          position: Json
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          position?: Json
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          position?: Json
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      processos: {
        Row: {
          created_at: string
          grau: string | null
          id: string
          numero_processo: string
          oj_detectada: string | null
          orgao_julgador: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grau?: string | null
          id?: string
          numero_processo: string
          oj_detectada?: string | null
          orgao_julgador?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grau?: string | null
          id?: string
          numero_processo?: string
          oj_detectada?: string | null
          orgao_julgador?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          nome_completo: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
          nome_completo?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          nome_completo?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          is_online: boolean | null
          last_seen: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          last_seen?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_shortcuts_preferences: {
        Row: {
          created_at: string
          favorite_buttons: string[] | null
          favorite_groups: string[] | null
          group_order: string[] | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_buttons?: string[] | null
          favorite_groups?: string[] | null
          group_order?: string[] | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_buttons?: string[] | null
          favorite_groups?: string[] | null
          group_order?: string[] | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          cpf: string
          created_at: string
          id: string
          nome_completo: string
          perfil: string | null
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          id?: string
          nome_completo: string
          perfil?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          id?: string
          nome_completo?: string
          perfil?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_profile_owner: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
