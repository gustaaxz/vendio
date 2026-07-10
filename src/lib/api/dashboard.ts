import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export function useDashboardStats() {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "stats", organization?.id],
    queryFn: async () => {
      if (!organization) throw new Error("No organization selected");

      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("org_id", organization.id);

      if (productsError) throw productsError;

      // Buscar clientes
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id", { count: "exact" })
        .eq("org_id", organization.id);

      if (customersError) throw customersError;

      // Buscar vendas do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: salesMonth, error: salesError } = await supabase
        .from("sales")
        .select("total")
        .eq("org_id", organization.id)
        .gte("created_at", startOfMonth.toISOString());

      if (salesError) throw salesError;

      const totalMes = salesMonth.reduce((acc, curr: any) => acc + curr.total, 0);
      const lucro = totalMes * 0.3; // Aproximação da demo
      const qtdMes = salesMonth.length;

      return {
        productsCount: products?.length ?? 0,
        customersCount: customers?.length ?? 0,
        totalMes,
        lucro,
        qtdMes,
      };
    },
    enabled: !!organization?.id,
  });
}
