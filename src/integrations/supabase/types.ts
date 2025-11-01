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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contact_requests: {
        Row: {
          company_name: string
          contact_person: string
          created_at: string
          duration: string | null
          email: string
          id: string
          location: string | null
          message: string
          phone: string | null
          professional_id: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_person: string
          created_at?: string
          duration?: string | null
          email: string
          id?: string
          location?: string | null
          message: string
          phone?: string | null
          professional_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_person?: string
          created_at?: string
          duration?: string | null
          email?: string
          id?: string
          location?: string | null
          message?: string
          phone?: string | null
          professional_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          daily_wage_net: number | null
          education: string | null
          id: string
          is_searchable: boolean
          languages: string[] | null
          profile_status: Database["public"]["Enums"]["approval_status"]
          skills: string[] | null
          technologies: string[] | null
          terms_accepted: boolean
          updated_at: string
          user_id: string
          work_experience: string | null
          city: string
          range: number | null
          available: boolean
          availablefrom: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          daily_wage_net?: number | null
          education?: string | null
          id?: string
          is_searchable?: boolean
          languages?: string[] | null
          profile_status?: Database["public"]["Enums"]["approval_status"]
          skills?: string[] | null
          technologies?: string[] | null
          terms_accepted?: boolean
          updated_at?: string
          user_id: string
          work_experience?: string | null
          city?: string
          range?: number | null
          available?: boolean
          availablefrom?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          daily_wage_net?: number | null
          education?: string | null
          id?: string
          is_searchable?: boolean
          languages?: string[] | null
          profile_status?: Database["public"]["Enums"]["approval_status"]
          skills?: string[] | null
          technologies?: string[] | null
          terms_accepted?: boolean
          updated_at?: string
          user_id?: string
          work_experience?: string | null
          city?: string
          range?: number | null
          available?: boolean
          availablefrom?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          email_awaiting_approval: string | null
          email_denied_register: string | null
          email_from_address: string | null
          email_profile_approved: string | null
          email_profile_banned: string | null
          email_success_register: string | null
          email_user_deletion: string | null
          homepage_about: string | null
          homepage_hero_subtitle: string | null
          homepage_hero_title: string | null
          homepage_services: string | null
          id: string
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: string | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          email_awaiting_approval?: string | null
          email_denied_register?: string | null
          email_from_address?: string | null
          email_profile_approved?: string | null
          email_profile_banned?: string | null
          email_success_register?: string | null
          email_user_deletion?: string | null
          homepage_about?: string | null
          homepage_hero_subtitle?: string | null
          homepage_hero_title?: string | null
          homepage_services?: string | null
          id?: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          email_awaiting_approval?: string | null
          email_denied_register?: string | null
          email_from_address?: string | null
          email_profile_approved?: string | null
          email_profile_banned?: string | null
          email_success_register?: string | null
          email_user_deletion?: string | null
          homepage_about?: string | null
          homepage_hero_subtitle?: string | null
          homepage_hero_title?: string | null
          homepage_services?: string | null
          id?: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          industry: string | null
          company_size: string | null
          website: string | null
          description: string | null
          contact_person: string | null
          profile_status: Database["public"]["Enums"]["approval_status"]
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
          address: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          industry?: string | null
          company_size?: string | null
          website?: string | null
          description?: string | null
          contact_person?: string | null
          profile_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
          address?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          industry?: string | null
          company_size?: string | null
          website?: string | null
          description?: string | null
          contact_person?: string | null
          profile_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
          address?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          file_id: string
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_coordinates: {
        Row: {
          id: number
          city_name: string
          latitude: number
          longitude: number
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          city_name: string
          latitude: number
          longitude: number
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          city_name?: string
          latitude?: number
          longitude?: number
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      distance_cache: {
        Row: {
          id: number
          city_a: string
          city_b: string
          distance_km: number
          created_at: string
        }
        Insert: {
          id?: number
          city_a: string
          city_b: string
          distance_km: number
          created_at?: string
        }
        Update: {
          id?: number
          city_a?: string
          city_b?: string
          distance_km?: number
          created_at?: string
        }
        Relationships: []
      }
      homepage_services: {
        Row: {
          id: string
          icon: string
          title: string
          description: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          icon: string
          title: string
          description: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          icon?: string
          title?: string
          description?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profileimages: {
        Row: {
          uid: string
          src: string
          cloudinary_public_id: string | null
          created: string | null
          updated: string | null
        }
        Insert: {
          uid: string
          src: string
          cloudinary_public_id?: string | null
          created?: string | null
          updated?: string | null
        }
        Update: {
          uid?: string
          src?: string
          cloudinary_public_id?: string | null
          created?: string | null
          updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profileimages_uid_fkey"
            columns: ["uid"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      scheduled_availability_emails: {
        Row: {
          id: string
          user_id: string
          professional_id: string
          available_date: string
          email_data: Json
          scheduled_date: string
          resend_email_id: string | null
          status: string
          created_at: string
          updated_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          professional_id: string
          available_date: string
          email_data: Json
          scheduled_date: string
          resend_email_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          professional_id?: string
          available_date?: string
          email_data?: Json
          scheduled_date?: string
          resend_email_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          sent_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cache_city_coordinates: {
        Args: {
          city_name_param: string
          lat_param: number
          lon_param: number
        }
        Returns: boolean
      }
      cache_distance: {
        Args: {
          city_a_param: string
          city_b_param: string
          distance_param: number
        }
        Returns: boolean
      }
      get_cached_distance: {
        Args: {
          city_a_param: string
          city_b_param: string
        }
        Returns: number
      }
      get_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
        }[]
      }
      get_or_cache_city_coordinates: {
        Args: {
          city_name_param: string
        }
        Returns: {
          latitude: number
          longitude: number
        }[]
      }
      get_homepage_services: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          icon: string
          title: string
          description: string
          sort_order: number
        }[]
      }
      get_professionals_for_public: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          masked_full_name: string
          first_name: string
          birth_date: string
          age: number
          work_experience: string
          education: string
          skills: string[]
          languages: string[]
          technologies: string[]
          city: string
          available: boolean
          availablefrom: string | null
        }[]
      }
      get_profile_for_public: {
        Args: { _user_id: string }
        Returns: {
          id: string
          user_id: string
          masked_full_name: string
          first_name: string
          surname: string
          masked_email: string
          masked_phone: string
          birth_date: string
          age: number
          role: string
          work_experience: string
          education: string
          skills: string[]
          languages: string[]
          technologies: string[]
          masked_daily_wage: string
          city: string
          range: number | null
          available: boolean
          availablefrom: string | null
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "professional" | "user" | "company"
      approval_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "professional", "user", "company"],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
