export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          advertiser: string
          budget: number
          clicks: number
          created_at: string
          created_by: string | null
          end_date: string | null
          format: string
          id: string
          impressions: number
          name: string
          spent: number
          start_date: string | null
          status: string
        }
        Insert: {
          advertiser?: string
          budget?: number
          clicks?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          format?: string
          id?: string
          impressions?: number
          name: string
          spent?: number
          start_date?: string | null
          status?: string
        }
        Update: {
          advertiser?: string
          budget?: number
          clicks?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          format?: string
          id?: string
          impressions?: number
          name?: string
          spent?: number
          start_date?: string | null
          status?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_name: string | null
          category: string
          content: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          id: string
          premium: boolean
          status: string
          summary: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_name?: string | null
          category?: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          premium?: boolean
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          premium?: boolean
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          status: string
        }
        Insert: {
          article_id: string
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          status?: string
        }
        Update: {
          article_id?: string
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_outbox: {
        Row: {
          attempts: number
          category: string
          created_at: string
          html_body: string
          id: string
          last_error: string | null
          metadata: Json
          notification_id: string | null
          sent_at: string | null
          status: string
          subject: string
          text_body: string | null
          to_email: string
          to_name: string | null
        }
        Insert: {
          attempts?: number
          category?: string
          created_at?: string
          html_body: string
          id?: string
          last_error?: string | null
          metadata?: Json
          notification_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          text_body?: string | null
          to_email: string
          to_name?: string | null
        }
        Update: {
          attempts?: number
          category?: string
          created_at?: string
          html_body?: string
          id?: string
          last_error?: string | null
          metadata?: Json
          notification_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          text_body?: string | null
          to_email?: string
          to_name?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          id: string
          name: string
          size: string | null
          type: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          size?: string | null
          type?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          size?: string | null
          type?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email: boolean
          in_app: boolean
          push: boolean
          types: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          email?: boolean
          in_app?: boolean
          push?: boolean
          types?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          email?: boolean
          in_app?: boolean
          push?: boolean
          types?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          link: string | null
          metadata: Json
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          link?: string | null
          metadata?: Json
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          link?: string | null
          metadata?: Json
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          body: string | null
          content_ids: Json
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          media_url: string | null
          page_slug: string
          section_key: string
          section_type: string
          sort_order: number
          style: Json
          subtitle: string | null
          title: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          body?: string | null
          content_ids?: Json
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          media_url?: string | null
          page_slug: string
          section_key: string
          section_type?: string
          sort_order?: number
          style?: Json
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          body?: string | null
          content_ids?: Json
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          media_url?: string | null
          page_slug?: string
          section_key?: string
          section_type?: string
          sort_order?: number
          style?: Json
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          id: string
          meta_description: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          meta_description?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          meta_description?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      premium_plans: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          duration: string
          features: Json
          highlighted: boolean
          id: string
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          duration: string
          features?: Json
          highlighted?: boolean
          id?: string
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          duration?: string
          features?: Json
          highlighted?: boolean
          id?: string
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      premium_settings: {
        Row: {
          category: string
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          key: string
          label?: string
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          amount: number
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string
          payment_reference: string
          phone: string | null
          plan_name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method: string
          payment_reference: string
          phone?: string | null
          plan_name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_reference?: string
          phone?: string | null
          plan_name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          id: string
          plan: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          plan?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          plan?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          options: Json
          status: string
          title: string
          total_votes: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          options?: Json
          status?: string
          title: string
          total_votes?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          options?: Json
          status?: string
          title?: string
          total_votes?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          featured: boolean
          id: string
          program_slot: string | null
          scheduled_at: string | null
          source: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          views: number
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          program_slot?: string | null
          scheduled_at?: string | null
          source?: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          views?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          program_slot?: string | null
          scheduled_at?: string | null
          source?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enqueue_notification_email: {
        Args: {
          _description: string
          _link: string
          _notification_id: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_email_failed: {
        Args: { _error: string; _id: string }
        Returns: undefined
      }
      mark_email_sent: { Args: { _id: string }; Returns: undefined }
      notify_admins: {
        Args: {
          _description: string
          _icon: string
          _link: string
          _metadata: Json
          _title: string
          _type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "reader" | "premium"
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
    Enums: {
      app_role: ["admin", "editor", "reader", "premium"],
    },
  },
} as const
