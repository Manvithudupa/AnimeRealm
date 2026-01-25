export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          gender: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          username?: string | null
          gender?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          gender?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      watchlists: {
        Row: {
          id: string
          user_id: string
          anime_id: string
          anime_title: string
          anime_poster: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          anime_id: string
          anime_title: string
          anime_poster?: string | null
        }
        Update: {}
        Relationships: []
      }
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

/* ------------------ Helper Types ------------------ */

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema =
  DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

export type Tables<
  TableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Views"])
    : never = never,
> =
  TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Views"])[TableName] extends {
        Row: infer R
      }
      ? R
      : never
    : TableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableNameOrOptions] extends {
          Row: infer R
        }
        ? R
        : never
      : never

export type TablesInsert<
  TableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"]
    : never = never,
> =
  TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
      }
      ? I
      : never
    : TableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][TableNameOrOptions] extends {
          Insert: infer I
        }
        ? I
        : never
      : never

export type TablesUpdate<
  TableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"]
    : never = never,
> =
  TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
      }
      ? U
      : never
    : TableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][TableNameOrOptions] extends {
          Update: infer U
        }
        ? U
        : never
      : never

export type Enums<
  EnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends EnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[EnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> =
  EnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[EnumNameOrOptions["schema"]]["Enums"][EnumName]
    : EnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][EnumNameOrOptions]
      : never

export type CompositeTypes<
  CompositeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeName extends CompositeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[CompositeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> =
  CompositeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[CompositeNameOrOptions["schema"]]["CompositeTypes"][CompositeName]
    : CompositeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][CompositeNameOrOptions]
      : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
