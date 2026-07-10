import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { Database } from "../database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export function useProducts() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ["products", organization?.id],
    queryFn: async () => {
      if (!organization) throw new Error("No organization selected");
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("org_id", organization.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateProduct() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<ProductInsert, "org_id">) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("products")
        .insert([{ ...product, org_id: organization.id }] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", organization?.id] });
    },
  });
}

export function useUpdateProduct() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: ProductUpdate & { id: string }) => {
      if (!organization) throw new Error("No organization selected");

      const { data, error } = await (supabase.from("products") as any)
        .update(product)
        .eq("id", id)
        .eq("org_id", organization.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", organization?.id] });
    },
  });
}

export function useDeleteProduct() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization) throw new Error("No organization selected");

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("org_id", organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", organization?.id] });
    },
  });
}
