import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/BrandLogo";
import { ShoppingBag, Phone, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/loja/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Loja ${params.slug} — Vendio` },
      { name: "description", content: `Confira os produtos da loja ${params.slug}.` },
    ],
  }),
  component: Storefront,
});

function Storefront() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ p: any; q: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("id,name,slug,description,phone,email,logo_url,cover_url,active").eq("slug", slug).eq("active", true).maybeSingle();
      setStore(s);
      if (s) {
        const { data: p } = await supabase.from("products").select("id,store_id,name,description,category,price,stock,sku,image_url,active").eq("store_id", s.id).eq("active", true);
        setProducts(p ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const total = cart.reduce((s, i) => s + i.q * Number(i.p.price), 0);
  const add = (p: any) => setCart((c) => {
    const ex = c.find((i) => i.p.id === p.id);
    if (ex) return c.map((i) => i.p.id === p.id ? { ...i, q: i.q + 1 } : i);
    return [...c, { p, q: 1 }];
  });

  const buy = async () => {
    if (!user) {
      toast.info("Entre para finalizar a compra");
      nav({ to: "/auth" });
      return;
    }
    // Create sale as buyer
    const { data: sale, error } = await supabase.from("sales").insert({
      store_id: store.id,
      buyer_user_id: user.id,
      payment_method: "mercado_pago",
      total,
      paid: false,
    } as any).select("id").single();
    if (error) return toast.error(error.message);
    const items = cart.map((i) => ({
      sale_id: sale!.id,
      product_id: i.p.id,
      name_snapshot: i.p.name,
      quantity: i.q,
      unit_price: Number(i.p.price),
      subtotal: i.q * Number(i.p.price),
    }));
    await supabase.from("sale_items").insert(items as any);
    toast.success("Pedido registrado! Combine o pagamento com a loja.");
    setCart([]);
    setCheckout(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!store) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <p className="text-muted-foreground">Loja não encontrada.</p>
      <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Início</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <BrandMark size={24} /> Powered by Vendio
          </Link>
          <div className="flex gap-3">
            {user ? (
              <Link to="/minhas-compras"><Button variant="ghost" size="sm">Minhas compras</Button></Link>
            ) : (
              <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
            )}
            <Button size="sm" onClick={() => setCheckout(true)} disabled={cart.length === 0}>
              <ShoppingBag className="h-4 w-4 mr-2" /> {cart.length} {cart.length === 1 ? "item" : "itens"}
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/20 to-transparent border-b">
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-4xl font-bold">{store.name}</h1>
          {store.description && <p className="text-muted-foreground mt-2 max-w-2xl">{store.description}</p>}
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            {store.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{store.phone}</span>}
            {store.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{store.email}</span>}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto p-8">
        <h2 className="text-xl font-semibold mb-4">Produtos</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground">Esta loja ainda não cadastrou produtos.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-4xl">
                    📦
                  </div>
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{formatBRL(Number(p.price))}</span>
                    <Button size="sm" onClick={() => add(p)} disabled={p.stock <= 0}>
                      {p.stock <= 0 ? "Esgotado" : "Adicionar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalizar pedido</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {cart.map((i) => (
              <div key={i.p.id} className="flex justify-between text-sm">
                <span>{i.q} × {i.p.name}</span>
                <span>{formatBRL(i.q * Number(i.p.price))}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>Total</span><span className="text-primary">{formatBRL(total)}</span>
          </div>
          <Button onClick={buy} className="w-full">
            {user ? "Confirmar pedido" : "Entrar para comprar"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Ao confirmar, a loja é notificada e combina o pagamento com você.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
