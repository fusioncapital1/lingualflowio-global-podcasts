export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      podcasts: {
        Row: {
          audio_file_size: number | null
          audio_file_url: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          original_language: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_file_size?: number | null
          audio_file_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          original_language?: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_file_size?: number | null
          audio_file_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          original_language?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          podcast_id: string
          status: string | null
          target_language: string
          transcript_original: string | null
          transcript_translated: string | null
          translated_audio_url: string | null
          voice_clone_enabled: boolean | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          podcast_id: string
          status?: string | null
          target_language: string
          transcript_original?: string | null
          transcript_translated?: string | null
          translated_audio_url?: string | null
          voice_clone_enabled?: boolean | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          podcast_id?: string
          status?: string | null
          target_language?: string
          transcript_original?: string | null
          transcript_translated?: string | null
          translated_audio_url?: string | null
          voice_clone_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      translated_episodes: { // New table definition
        Row: {
          id: string // UUID
          podcast_id: string // UUID
          language_code: string
          voice_name: string
          audio_storage_path: string
          file_size: number | null
          duration_seconds: number | null
          status: string // e.g., 'completed', 'failed', 'processing'
          created_at: string // TIMESTAMPTZ
          user_id: string | null // UUID
        }
        Insert: {
          id?: string // UUID, default gen_random_uuid()
          podcast_id: string // UUID
          language_code: string
          voice_name: string
          audio_storage_path: string
          file_size?: number | null
          duration_seconds?: number | null
          status?: string // Default 'pending'
          created_at?: string // Default now()
          user_id?: string | null
        }
        Update: {
          id?: string
          podcast_id?: string
          language_code?: string
          voice_name?: string
          audio_storage_path?: string
          file_size?: number | null
          duration_seconds?: number | null
          status?: string
          created_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translated_episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translated_episodes_user_id_fkey" // Assuming this constraint name if you add it
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users" // Supabase default for auth.users
            referencedColumns: ["id"]
          }
        ]
      } // End of new table definition
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
