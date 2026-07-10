// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orgId, planType, backUrls } = await req.json();

    if (!orgId || !planType) {
      throw new Error("Missing orgId or planType");
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    
    if (!MP_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Mercado Pago Access Token not configured in Supabase." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (planType === "lifetime") {
      const preferenceData = {
        items: [
          {
            title: "ShopManager Pro - Acesso Vitalício",
            description: "Pagamento único para acesso vitalício ao ShopManager SaaS.",
            quantity: 1,
            currency_id: "BRL",
            unit_price: 499.00,
          }
        ],
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: `lifetime_${orgId}`,
        notification_url: Deno.env.get("WEBHOOK_URL"), 
      };

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferenceData)
      });

      const mpData = await response.json();
      if (!response.ok) throw new Error(`MP API error: ${JSON.stringify(mpData)}`);

      return new Response(
        JSON.stringify({ init_point: mpData.init_point }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } 
    else if (planType === "monthly") {
      const preapprovalData = {
        reason: "ShopManager Pro - Mensal",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 49.90,
          currency_id: "BRL"
        },
        back_url: backUrls.success,
        external_reference: `monthly_${orgId}`
      };

      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preapprovalData)
      });

      const mpData = await response.json();
      if (!response.ok) throw new Error(`MP API error: ${JSON.stringify(mpData)}`);

      return new Response(
        JSON.stringify({ init_point: mpData.init_point }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    throw new Error("Invalid planType");
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
