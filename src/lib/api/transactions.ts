import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { Database } from "../database.types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

export function useTransactions() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ["transactions", organization?.id],
    queryFn: async () => {
      if (!organization) throw new Error("No organization selected");
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("org_id", organization.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateTransaction() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, "org_id">) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, org_id: organization.id }] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", organization?.id] });
    },
  });
}
