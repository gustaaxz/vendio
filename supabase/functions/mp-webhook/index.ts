// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    // Mercado Pago envia 'topic' e 'id' na query string ou no body (depende do tipo de notificação: Webhook vs IPN)
    const type = url.searchParams.get("type") || url.searchParams.get("topic");
    const id = url.searchParams.get("data.id") || url.searchParams.get("id");

    let body = {};
    try {
      body = await req.json();
    } catch (_) {}
    
    // O MP também pode mandar via body
    const eventType = type || (body as any).type;
    const eventId = id || (body as any)?.data?.id;

    if (!eventType || !eventId) {
      return new Response("OK - No event or id", { status: 200 });
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (!MP_ACCESS_TOKEN) throw new Error("Missing MP_ACCESS_TOKEN");

    if (eventType === "payment") {
      // Fetch payment details
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${eventId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });
      const payment = await mpRes.json();

      if (payment.status === "approved" && payment.external_reference) {
        // external_reference formato: "lifetime_ORGID"
        const [plan, orgId] = payment.external_reference.split("_");
        if (plan === "lifetime" && orgId) {
          await supabase.from("organizations").update({
            plan: "premium",
            plan_status: "active",
            plan_ends_at: null, // Vitalício
          }).eq("id", orgId);
        }
      }
    } 
    else if (eventType === "subscription_preapproval") {
      // Fetch preapproval details
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${eventId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });
      const preapproval = await mpRes.json();

      if (preapproval.status === "authorized" && preapproval.external_reference) {
        const [plan, orgId] = preapproval.external_reference.split("_");
        if (plan === "monthly" && orgId) {
          const nextBillingDate = new Date(preapproval.next_payment_date);
          await supabase.from("organizations").update({
            plan: "profissional",
            plan_status: "active",
            plan_ends_at: nextBillingDate.toISOString(),
          }).eq("id", orgId);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
