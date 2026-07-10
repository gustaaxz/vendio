import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { Database } from "../database.types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];

export type SaleWithItems = Sale & {
  items: SaleItem[];
};

export function useSales() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ["sales", organization?.id],
    queryFn: async () => {
      if (!organization) throw new Error("No organization selected");
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          items:sale_items(*)
        `)
        .eq("org_id", organization.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as SaleWithItems[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateSale() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: string | null;
      customerName: string;
      paymentMethod: "dinheiro" | "pix" | "cartao";
      items: {
        product_id: string | null;
        product_name: string;
        quantity: number;
        price: number;
      }[];
    }) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await supabase.rpc("create_sale", {
        p_org_id: organization.id,
        p_customer_id: params.customerId,
        p_customer_name: params.customerName,
        p_payment_method: params.paymentMethod,
        p_items: params.items as any,
      } as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", organization?.id] });
      queryClient.invalidateQueries({ queryKey: ["products", organization?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", organization?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organization?.id] });
    },
  });
}
