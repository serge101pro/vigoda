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
      coop_cart_items: {
        Row: {
          added_by: string
          cart_id: string
          created_at: string
          id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          spending_category:
            | Database["public"]["Enums"]["spending_category"]
            | null
          unit_price: number
        }
        Insert: {
          added_by: string
          cart_id: string
          created_at?: string
          id?: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          spending_category?:
            | Database["public"]["Enums"]["spending_category"]
            | null
          unit_price: number
        }
        Update: {
          added_by?: string
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          spending_category?:
            | Database["public"]["Enums"]["spending_category"]
            | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "coop_cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "coop_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_carts: {
        Row: {
          approval_required: boolean | null
          auto_order_time: string
          created_at: string
          deadline_time: string
          delivery_address: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          approval_required?: boolean | null
          auto_order_time?: string
          created_at?: string
          deadline_time?: string
          delivery_address?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          approval_required?: boolean | null
          auto_order_time?: string
          created_at?: string
          deadline_time?: string
          delivery_address?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coop_carts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_addresses: {
        Row: {
          address: string
          apartment: string | null
          comment: string | null
          created_at: string
          entrance: string | null
          floor: string | null
          id: string
          intercom: string | null
          is_default: boolean | null
          lat: number | null
          lng: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          apartment?: string | null
          comment?: string | null
          created_at?: string
          entrance?: string | null
          floor?: string | null
          id?: string
          intercom?: string | null
          is_default?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          apartment?: string | null
          comment?: string | null
          created_at?: string
          entrance?: string | null
          floor?: string | null
          id?: string
          intercom?: string | null
          is_default?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      notification_settings: {
        Row: {
          created_at: string
          discount_alerts: boolean | null
          email_enabled: boolean | null
          family_updates: boolean | null
          id: string
          order_updates: boolean | null
          price_rise_alerts: boolean | null
          promo_notifications: boolean | null
          push_enabled: boolean | null
          reminder_time: string | null
          shopping_reminders: boolean | null
          telegram_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_alerts?: boolean | null
          email_enabled?: boolean | null
          family_updates?: boolean | null
          id?: string
          order_updates?: boolean | null
          price_rise_alerts?: boolean | null
          promo_notifications?: boolean | null
          push_enabled?: boolean | null
          reminder_time?: string | null
          shopping_reminders?: boolean | null
          telegram_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_alerts?: boolean | null
          email_enabled?: boolean | null
          family_updates?: boolean | null
          id?: string
          order_updates?: boolean | null
          price_rise_alerts?: boolean | null
          promo_notifications?: boolean | null
          push_enabled?: boolean | null
          reminder_time?: string | null
          shopping_reminders?: boolean | null
          telegram_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          organization_id: string
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id: string
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id?: string
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          id: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      org_balance_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          organization_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          organization_id: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          organization_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_balance_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_balance_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          organization_id: string
          paid_at: string | null
          pdf_url: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          organization_id: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          organization_id?: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          current_month_spent: number | null
          id: string
          is_active: boolean | null
          monthly_limit: number | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_month_spent?: number | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_month_spent?: number | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_upd_documents: {
        Row: {
          created_at: string
          document_number: string
          id: string
          organization_id: string
          pdf_url: string | null
          period_end: string
          period_start: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          document_number: string
          id?: string
          organization_id: string
          pdf_url?: string | null
          period_end: string
          period_start: string
          total_amount: number
        }
        Update: {
          created_at?: string
          document_number?: string
          id?: string
          organization_id?: string
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_upd_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          approval_threshold: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          inn: string | null
          kpp: string | null
          legal_address: string | null
          name: string
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          approval_threshold?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          inn?: string | null
          kpp?: string | null
          legal_address?: string | null
          name: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_threshold?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          inn?: string | null
          kpp?: string | null
          legal_address?: string | null
          name?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partner_wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          referral_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          referral_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          referral_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_wallet_transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_settings: {
        Row: {
          camera_enabled: boolean | null
          created_at: string
          geolocation_enabled: boolean | null
          id: string
          personal_recommendations: boolean | null
          share_anonymous_stats: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          camera_enabled?: boolean | null
          created_at?: string
          geolocation_enabled?: boolean | null
          id?: string
          personal_recommendations?: boolean | null
          share_anonymous_stats?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          camera_enabled?: boolean | null
          created_at?: string
          geolocation_enabled?: boolean | null
          id?: string
          personal_recommendations?: boolean | null
          share_anonymous_stats?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_rules: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          pack_size: number
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          pack_size: number
          unit: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          pack_size?: number
          unit?: string
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
          telegram_chat_id: string | null
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
          telegram_chat_id?: string | null
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
          telegram_chat_id?: string | null
          total_savings?: number | null
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
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
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
      referrals: {
        Row: {
          activated_at: string | null
          bonus_earned: number
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          activated_at?: string | null
          bonus_earned?: number
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          activated_at?: string | null
          bonus_earned?: number
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
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
      user_preferences: {
        Row: {
          created_at: string
          dietary_restrictions: string[] | null
          favorite_stores: string[] | null
          id: string
          monthly_budget: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_stores?: string[] | null
          id?: string
          monthly_budget?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_stores?: string[] | null
          id?: string
          monthly_budget?: number | null
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
      activate_referral: {
        Args: { referred_user_id: string }
        Returns: boolean
      }
      get_top_referrers: {
        Args: { limit_count?: number }
        Returns: {
          is_current_user: boolean
          rank_position: number
          referrer_hash: string
          total_earned: number
          total_referrals: number
        }[]
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      get_user_referral_stats: {
        Args: never
        Returns: {
          active_referrals: number
          total_earned: number
          total_invited: number
          user_position: number
        }[]
      }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["org_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_test_admin: { Args: { _user_id: string }; Returns: boolean }
      set_subscription_plan: {
        Args: { _plan: Database["public"]["Enums"]["subscription_plan"] }
        Returns: boolean
      }
    }
    Enums: {
      org_role: "admin" | "manager" | "employee"
      spending_category:
        | "lunch"
        | "corporate_event"
        | "office_kitchen"
        | "other"
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
      org_role: ["admin", "manager", "employee"],
      spending_category: [
        "lunch",
        "corporate_event",
        "office_kitchen",
        "other",
      ],
      subscription_plan: ["free", "solo", "family", "corp"],
    },
  },
} as const
