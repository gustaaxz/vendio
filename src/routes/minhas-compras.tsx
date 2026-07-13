import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/minhas-compras")({
  ssr: false,
  head: () => ({ meta: [{ title: "Minhas compras — Vendio" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: MyPurchases,
});

function MyPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("sales")
        .select("*, sale_items(*), stores(name, slug)")
        .eq("buyer_user_id", user.id)
        .order("created_at", { ascending: false });
      setPurchases(data ?? []);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark size={28} /> <span className="font-bold">Vendio</span>
          </Link>
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Início</Button></Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-3xl font-bold">Minhas compras</h1>
        {purchases.length === 0 && <p className="text-muted-foreground">Você ainda não fez compras.</p>}
        {purchases.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  {p.sale_items?.map((it: any) => (
                    <div key={it.id} className="font-medium">
                      {formatBRL(Number(it.subtotal))} - {it.quantity} × {it.name_snapshot}:{" "}
                      <Link to="/loja/$slug" params={{ slug: p.stores?.slug ?? "" }} className="text-primary hover:underline">
                        {p.stores?.name}
                      </Link>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(p.created_at).toLocaleString("pt-BR")}
                    {" · "}{p.paid ? "Pago" : "Aguardando pagamento"}
                  </div>
                </div>
                <div className="font-bold text-lg text-primary">{formatBRL(Number(p.total))}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
