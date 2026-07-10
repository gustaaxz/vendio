import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { Database } from "../database.types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export function useCustomers() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ["customers", organization?.id],
    queryFn: async () => {
      if (!organization) throw new Error("No organization selected");
      
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("org_id", organization.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateCustomer() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: Omit<CustomerInsert, "org_id">) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("customers")
        .insert([{ ...customer, org_id: organization.id }] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", organization?.id] });
    },
  });
}

export function useUpdateCustomer() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...customer }: CustomerUpdate & { id: string }) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await (supabase.from("customers") as any)
        .update(customer)
        .eq("id", id)
        .eq("org_id", organization.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", organization?.id] });
    },
  });
}

export function useDeleteCustomer() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization) throw new Error("No organization selected");

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .eq("org_id", organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", organization?.id] });
    },
  });
}
