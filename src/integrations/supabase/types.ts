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
      cart_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          price: number | null
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          price?: number | null
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          price?: number | null
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          buyer_dalali_rate: number
          category_id: string
          created_at: string
          dalali_type: string
          id: string
          image_url: string | null
          name: string
          price: number
          seller_dalali_rate: number
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          buyer_dalali_rate: number
          category_id: string
          created_at?: string
          dalali_type: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          seller_dalali_rate: number
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          buyer_dalali_rate?: number
          category_id?: string
          created_at?: string
          dalali_type?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          seller_dalali_rate?: number
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          buyer_dalali_rate: number
          created_at: string
          dalali_type: string
          id: string
          item_id: string
          order_id: string
          price: number
          quantity: number
          seller_dalali_rate: number
          weight: number
        }
        Insert: {
          buyer_dalali_rate: number
          created_at?: string
          dalali_type: string
          id?: string
          item_id: string
          order_id: string
          price: number
          quantity: number
          seller_dalali_rate: number
          weight: number
        }
        Update: {
          buyer_dalali_rate?: number
          created_at?: string
          dalali_type?: string
          id?: string
          item_id?: string
          order_id?: string
          price?: number
          quantity?: number
          seller_dalali_rate?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
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
          bill_paid: boolean | null
          buyer_dalali: number
          buyer_id: string
          created_at: string
          dalali_amount: number
          id: string
          note: string | null
          order_date: string
          seller_dalali: number
          seller_id: string
          total_bill_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_paid?: boolean | null
          buyer_dalali?: number
          buyer_id: string
          created_at?: string
          dalali_amount: number
          id?: string
          note?: string | null
          order_date?: string
          seller_dalali?: number
          seller_id: string
          total_bill_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_paid?: boolean | null
          buyer_dalali?: number
          buyer_id?: string
          created_at?: string
          dalali_amount?: number
          id?: string
          note?: string | null
          order_date?: string
          seller_dalali?: number
          seller_id?: string
          total_bill_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          id: string
          mobile_number: string | null
          pan_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          id: string
          mobile_number?: string | null
          pan_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          mobile_number?: string | null
          pan_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          phone_number: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          name: string
          phone_number: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          phone_number?: string
          type?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never