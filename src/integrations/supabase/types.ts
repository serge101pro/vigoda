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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          recipe_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          recipe_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          recipe_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calories_per_day: number | null
          created_at: string
          days: number
          description: string | null
          discount: number | null
          id: string
          image: string | null
          is_popular: boolean | null
          meals_per_day: number
          name: string
          price: number
          price_per_day: number | null
          rating: number | null
          reviews: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          calories_per_day?: number | null
          created_at?: string
          days?: number
          description?: string | null
          discount?: number | null
          id?: string
          image?: string | null
          is_popular?: boolean | null
          meals_per_day?: number
          name: string
          price: number
          price_per_day?: number | null
          rating?: number | null
          reviews?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          calories_per_day?: number | null
          created_at?: string
          days?: number
          description?: string | null
          discount?: number | null
          id?: string
          image?: string | null
          is_popular?: boolean | null
          meals_per_day?: number
          name?: string
          price?: number
          price_per_day?: number | null
          rating?: number | null
          reviews?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          in_stock: boolean | null
          name: string
          old_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name: string
          old_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name?: string
          old_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bonus_points: number | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          total_savings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bonus_points?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          phone?: string | null
          total_savings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bonus_points?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          total_savings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: string
          id: string
          name: string
          product_id: string | null
          recipe_id: string
        }
        Insert: {
          amount: string
          id?: string
          name: string
          product_id?: string | null
          recipe_id: string
        }
        Update: {
          amount?: string
          id?: string
          name?: string
          product_id?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          description: string
          id: string
          recipe_id: string
          step_number: number
        }
        Insert: {
          description: string
          id?: string
          recipe_id: string
          step_number: number
        }
        Update: {
          description?: string
          id?: string
          recipe_id?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_subscriptions: {
        Row: {
          author_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          author_id: string | null
          calories: number | null
          carbs: number | null
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          fat: number | null
          id: string
          image: string | null
          is_user_created: boolean | null
          name: string
          protein: number | null
          rating: number | null
          review_count: number | null
          servings: number
          time_minutes: number
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image?: string | null
          is_user_created?: boolean | null
          name: string
          protein?: number | null
          rating?: number | null
          review_count?: number | null
          servings?: number
          time_minutes: number
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image?: string | null
          is_user_created?: boolean | null
          name?: string
          protein?: number | null
          rating?: number | null
          review_count?: number | null
          servings?: number
          time_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean | null
          list_id: string
          name: string
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          list_id: string
          name: string
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          list_id?: string
          name?: string
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          is_shared: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_shared?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_shared?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id?: string
        }
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
      subscription_plan: "free" | "solo" | "family" | "corp"
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
      subscription_plan: ["free", "solo", "family", "corp"],
    },
  },
} as const
