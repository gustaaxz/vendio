import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Produto = {
  id: string;
  store_id: string;
  name: string;
  category: string | null;
  price: number;
  cost: number | null;
  stock: number;
  min_stock: number;
  sku: string | null;
  image_url: string | null;
  active: boolean;
};

export type Cliente = {
  id: string;
  store_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  user_id: string | null;
};

export type Venda = {
  id: string;
  store_id: string;
  customer_id: string | null;
  buyer_user_id: string | null;
  total: number;
  payment_method: string;
  created_at: string;
  notes: string | null;
  sale_items?: SaleItem[];
  customers?: { name: string } | null;
};

export type SaleItem = {
  id: string;
  product_id: string | null;
  name_snapshot: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Movimento = {
  id: string;
  store_id: string;
  type: "entrada" | "saida";
  description: string;
  amount: number;
  category: string | null;
  created_at: string;
};

export function useProdutos(storeId?: string) {
  return useQuery({
    queryKey: ["produtos", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });
}

export function useClientes(storeId?: string) {
  return useQuery({
    queryKey: ["clientes", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Cliente[];
    },
  });
}

export function useVendas(storeId?: string) {
  return useQuery({
    queryKey: ["vendas", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, sale_items(*), customers(name)")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Venda[];
    },
  });
}

export function useMovimentos(storeId?: string) {
  return useQuery({
    queryKey: ["movimentos", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Movimento[];
    },
  });
}

export function useProdutoMutations(storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["produtos", storeId] });

  return {
    add: useMutation({
      mutationFn: async (p: Partial<Produto>) => {
        const { error } = await supabase.from("products").insert({ ...p, store_id: storeId } as any);
        if (error) throw error;
      },
      onSuccess: () => {
        invalidate();
        toast.success("Produto cadastrado");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: async ({ id, ...p }: Partial<Produto> & { id: string }) => {
        const { error } = await supabase.from("products").update(p as any).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        invalidate();
        toast.success("Produto atualizado");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        invalidate();
        toast.success("Produto removido");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    restock: useMutation({
      mutationFn: async ({ id, qty }: { id: string; qty: number }) => {
        const { data: p } = await supabase.from("products").select("stock").eq("id", id).maybeSingle();
        const cur = (p?.stock ?? 0) as number;
        const { error } = await supabase.from("products").update({ stock: cur + qty }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        invalidate();
        toast.success("Estoque reposto");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  };
}

export function useClienteMutations(storeId?: string) {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["clientes", storeId] });
  return {
    add: useMutation({
      mutationFn: async (c: Partial<Cliente>) => {
        const { error } = await supabase.from("customers").insert({ ...c, store_id: storeId } as any);
        if (error) throw error;
      },
      onSuccess: () => {
        inv();
        toast.success("Cliente cadastrado");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: async ({ id, ...c }: Partial<Cliente> & { id: string }) => {
        const { error } = await supabase.from("customers").update(c as any).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        inv();
        toast.success("Cliente atualizado");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("customers").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        inv();
        toast.success("Cliente removido");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  };
}

export function useMovimentoMutations(storeId?: string) {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: async (m: Partial<Movimento>) => {
        const { error } = await supabase.from("movements").insert({ ...m, store_id: storeId } as any);
        if (error) throw error;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["movimentos", storeId] });
        toast.success("Movimento registrado");
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  };
}

export function useCreateVenda(storeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      customer_id: string | null;
      buyer_user_id?: string | null;
      payment_method: string;
      items: { product_id: string | null; name: string; quantity: number; unit_price: number }[];
      notes?: string | null;
    }) => {
      const total = args.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
      const { data: sale, error } = await supabase
        .from("sales")
        .insert({
          store_id: storeId,
          customer_id: args.customer_id,
          buyer_user_id: args.buyer_user_id ?? null,
          payment_method: args.payment_method,
          total,
          notes: args.notes ?? null,
        } as any)
        .select("id")
        .single();
      if (error) throw error;
      const items = args.items.map((i) => ({
        sale_id: sale!.id,
        product_id: i.product_id,
        name_snapshot: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.quantity * i.unit_price,
      }));
      const { error: e2 } = await supabase.from("sale_items").insert(items as any);
      if (e2) throw e2;
      // decrement stock
      for (const i of args.items) {
        if (!i.product_id) continue;
        const { data: p } = await supabase.from("products").select("stock").eq("id", i.product_id).maybeSingle();
        if (p) await supabase.from("products").update({ stock: Math.max(0, (p.stock ?? 0) - i.quantity) }).eq("id", i.product_id);
      }
      // financial entry
      await supabase.from("movements").insert({
        store_id: storeId,
        sale_id: sale!.id,
        type: "entrada",
        description: `Venda #${sale!.id.slice(0, 8)}`,
        amount: total,
        category: "vendas",
      } as any);
      return sale!.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas", storeId] });
      qc.invalidateQueries({ queryKey: ["produtos", storeId] });
      qc.invalidateQueries({ queryKey: ["movimentos", storeId] });
      toast.success("Venda registrada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
