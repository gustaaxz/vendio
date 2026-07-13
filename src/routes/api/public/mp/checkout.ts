import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Cria uma preferência de checkout do Mercado Pago para uma venda.
// Requer o secret MP_ACCESS_TOKEN configurado no projeto.
export const Route = createFileRoute("/api/public/mp/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.MP_ACCESS_TOKEN;
        if (!token) {
          return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN não configurado. Adicione o segredo no painel." }), { status: 500 });
        }
        const body = (await request.json()) as { sale_id: string };
        const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined as any },
        });
        const { data: sale } = await sb.from("sales").select("*, sale_items(*), stores(name)").eq("id", body.sale_id).maybeSingle();
        if (!sale) return new Response(JSON.stringify({ error: "Venda não encontrada" }), { status: 404 });

        const items = (sale.sale_items ?? []).map((i: any) => ({
          title: i.name_snapshot,
          quantity: i.quantity,
          unit_price: Number(i.unit_price),
          currency_id: "BRL",
        }));
        const origin = request.headers.get("origin") ?? "";
        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            external_reference: sale.id,
            notification_url: `${origin}/api/public/mp/webhook`,
            back_urls: {
              success: `${origin}/minhas-compras`,
              failure: `${origin}/minhas-compras`,
              pending: `${origin}/minhas-compras`,
            },
            auto_return: "approved",
          }),
        });
        if (!mpRes.ok) {
          const t = await mpRes.text();
          return new Response(JSON.stringify({ error: t }), { status: mpRes.status });
        }
        const pref = (await mpRes.json()) as { id: string; init_point: string };
        await sb.from("sales").update({ external_id: pref.id }).eq("id", sale.id);
        return Response.json({ init_point: pref.init_point });
      },
    },
  },
});
