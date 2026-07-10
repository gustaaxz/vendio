export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "basico" | "profissional" | "premium";
          plan_status: "trial" | "active" | "cancelled" | "past_due";
          trial_ends_at: string | null;
          mp_customer_id: string | null;
          mp_subscription_id: string | null;
          created_at: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          support_faq: string | null;
          logo_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "basico" | "profissional" | "premium";
          plan_status?: "trial" | "active" | "cancelled" | "past_due";
          trial_ends_at?: string | null;
          mp_customer_id?: string | null;
          mp_subscription_id?: string | null;
          created_at?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          support_faq?: string | null;
          logo_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: "basico" | "profissional" | "premium";
          plan_status?: "trial" | "active" | "cancelled" | "past_due";
          trial_ends_at?: string | null;
          mp_customer_id?: string | null;
          mp_subscription_id?: string | null;
          created_at?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          support_faq?: string | null;
          logo_url?: string | null;
        };
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: "owner" | "admin" | "cashier";
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: "owner" | "admin" | "cashier";
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "cashier";
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          category: string;
          price: number;
          stock: number;
          code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          category?: string;
          price?: number;
          stock?: number;
          code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          category?: string;
          price?: number;
          stock?: number;
          code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          phone: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          phone?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          phone?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          org_id: string;
          customer_id: string | null;
          customer_name: string;
          payment_method: "dinheiro" | "pix" | "cartao";
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          customer_id?: string | null;
          customer_name?: string;
          payment_method: "dinheiro" | "pix" | "cartao";
          total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          customer_id?: string | null;
          customer_name?: string;
          payment_method?: "dinheiro" | "pix" | "cartao";
          total?: number;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          price?: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          price?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          org_id: string;
          type: "entrada" | "saida";
          description: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          type: "entrada" | "saida";
          description: string;
          amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          type?: "entrada" | "saida";
          description?: string;
          amount?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      user_org_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      create_sale: {
        Args: {
          p_org_id: string;
          p_customer_id: string | null;
          p_customer_name: string;
          p_payment_method: string;
          p_items: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
