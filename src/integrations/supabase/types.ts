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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          address: string
          admin_notes: string | null
          cart_items: Json
          city: string
          converted_order_id: string | null
          created_at: string
          full_name: string
          id: string
          landmark: string | null
          phone: string
          pincode: string
          state: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          cart_items?: Json
          city: string
          converted_order_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          landmark?: string | null
          phone: string
          pincode: string
          state: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          cart_items?: Json
          city?: string
          converted_order_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          landmark?: string | null
          phone?: string
          pincode?: string
          state?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          category: string | null
          created_at: string
          custom_image_url: string | null
          custom_text: string | null
          id: string
          product_id: string | null
          product_name: string | null
          quantity: number
          selected_frame: string | null
          selected_size: string | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          custom_image_url?: string | null
          custom_text?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          selected_frame?: string | null
          selected_size?: string | null
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          custom_image_url?: string | null
          custom_text?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          selected_frame?: string | null
          selected_size?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          products_count: number | null
          slug: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          products_count?: number | null
          slug: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          products_count?: number | null
          slug?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number
          min_order_amount: number
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order_amount?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order_amount?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          link_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          link_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          link_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Hero_Banners: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          category: string | null
          created_at: string
          custom_image_deleted_at: string | null
          custom_image_url: string | null
          custom_text: string | null
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          selected_frame: string | null
          selected_size: string | null
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          custom_image_deleted_at?: string | null
          custom_image_url?: string | null
          custom_text?: string | null
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          selected_frame?: string | null
          selected_size?: string | null
          unit_price: number
        }
        Update: {
          category?: string | null
          created_at?: string
          custom_image_deleted_at?: string | null
          custom_image_url?: string | null
          custom_text?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          selected_frame?: string | null
          selected_size?: string | null
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
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          order_number: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          allow_custom_text: boolean
          allowed_fonts: Json
          base_price: number
          border_styles: Json
          category: string
          created_at: string
          description: string | null
          design_layers: Json
          design_template_url: string | null
          frame_color_options: Json
          frames: Json | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_customizable: boolean | null
          is_featured: boolean | null
          name: string
          photo_count: number
          photo_slots: Json
          quantity: number | null
          shape: string | null
          sizes: Json | null
          tags: string[]
          thickness_options: Json | null
          updated_at: string
          variant_images: Json | null
        }
        Insert: {
          allow_custom_text?: boolean
          allowed_fonts?: Json
          base_price?: number
          border_styles?: Json
          category: string
          created_at?: string
          description?: string | null
          design_layers?: Json
          design_template_url?: string | null
          frame_color_options?: Json
          frames?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_customizable?: boolean | null
          is_featured?: boolean | null
          name: string
          photo_count?: number
          photo_slots?: Json
          quantity?: number | null
          shape?: string | null
          sizes?: Json | null
          tags?: string[]
          thickness_options?: Json | null
          updated_at?: string
          variant_images?: Json | null
        }
        Update: {
          allow_custom_text?: boolean
          allowed_fonts?: Json
          base_price?: number
          border_styles?: Json
          category?: string
          created_at?: string
          description?: string | null
          design_layers?: Json
          design_template_url?: string | null
          frame_color_options?: Json
          frames?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_customizable?: boolean | null
          is_featured?: boolean | null
          name?: string
          photo_count?: number
          photo_slots?: Json
          quantity?: number | null
          shape?: string | null
          sizes?: Json | null
          tags?: string[]
          thickness_options?: Json | null
          updated_at?: string
          variant_images?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reels: {
        Row: {
          category: string
          comments_count: number
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          likes_count: number
          price: number
          product_link: string
          product_name: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          comments_count?: number
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          likes_count?: number
          price?: number
          product_link: string
          product_name: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          comments_count?: number
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          likes_count?: number
          price?: number
          product_link?: string
          product_name?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          guest_name: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          photos: string[] | null
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          guest_name?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          guest_name?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      special_offers: {
        Row: {
          code: string | null
          created_at: string
          cta_text: string
          display_order: number
          gradient_from: string
          gradient_to: string
          icon_name: string
          id: string
          is_active: boolean
          link: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          cta_text?: string
          display_order?: number
          gradient_from?: string
          gradient_to?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          link?: string
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          cta_text?: string
          display_order?: number
          gradient_from?: string
          gradient_to?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          link?: string
          subtitle?: string
          title?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      youtube_videos: {
        Row: {
          created_at: string
          display_order: number
          duration: string | null
          id: string
          is_active: boolean
          likes: string | null
          thumbnail: string | null
          title: string
          updated_at: string
          video_id: string
          views: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          duration?: string | null
          id?: string
          is_active?: boolean
          likes?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          video_id: string
          views?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          duration?: string | null
          id?: string
          is_active?: boolean
          likes?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          video_id?: string
          views?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
