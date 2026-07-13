import { createFileRoute } from "@tanstack/react-router";

// Webhook do Mercado Pago: marca vendas como pagas.
export const Route = createFileRoute("/api/public/mp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.MP_ACCESS_TOKEN;
        if (!token) return new Response("no token", { status: 200 });
        const body = (await request.json().catch(() => ({}))) as any;
        const paymentId = body?.data?.id ?? body?.resource;
        if (!paymentId) return new Response("ok");
        const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return new Response("ok");
        const pay = (await r.json()) as { external_reference?: string; status?: string };
        if (pay.status === "approved" && pay.external_reference) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("sales").update({ paid: true }).eq("id", pay.external_reference);
        }
        return new Response("ok");
      },
    },
  },
});
