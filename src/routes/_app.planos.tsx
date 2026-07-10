import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/planos")({
  head: () => ({ meta: [{ title: "Planos e Assinatura — ShopManager" }] }),
  component: PlanosPage,
});

function PlanosPage() {
  const { organization, membership } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const isOwner = membership?.role === "owner";
  const planStatus = organization?.plan_status; // 'trial', 'active', 'past_due', 'canceled'
  const isTrial = planStatus === "trial";

  const getTrialDaysLeft = () => {
    if (!organization?.trial_ends_at) return 0;
    const diff = new Date(organization.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSubscribe = async (planType: "monthly" | "lifetime") => {
    if (!isOwner) return toast.error("Apenas o proprietário pode alterar o plano.");
    
    setLoading(planType);
    try {
      // Chama a Edge Function que irá gerar o link do Mercado Pago
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          orgId: organization?.id,
          planType,
          // Urls de redirecionamento após a compra
          backUrls: {
            success: `${window.location.origin}/dashboard?payment=success`,
            failure: `${window.location.origin}/planos?payment=failure`,
            pending: `${window.location.origin}/planos?payment=pending`,
          }
        },
      });

      if (error) throw error;
      
      if (data?.init_point) {
        // Redireciona para o checkout seguro do MP
        window.location.href = data.init_point;
      } else {
        throw new Error("Link de pagamento não retornado.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        "Ainda estamos configurando os pagamentos. As credenciais do Mercado Pago não foram inseridas no servidor.",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Meu Plano"
        subtitle="Gerencie sua assinatura do ShopManager"
      />

      {/* Status Banner */}
      <div className={`mb-8 rounded-xl border p-4 flex items-start gap-4 ${
        planStatus === 'active' 
          ? "bg-success/10 border-success/20 text-success-foreground"
          : isTrial && getTrialDaysLeft() > 3
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-warning/10 border-warning/20 text-warning-foreground"
      }`}>
        {planStatus === 'active' ? (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
        ) : (
          <AlertCircle className="h-6 w-6 shrink-0" />
        )}
        
        <div>
          <h3 className="font-semibold text-base">
            {planStatus === 'active' 
              ? "Assinatura Ativa" 
              : isTrial 
                ? `Você está no período de Trial (${getTrialDaysLeft()} dias restantes)`
                : "Seu período de teste expirou"}
          </h3>
          <p className="text-sm mt-1 opacity-90">
            {planStatus === 'active'
              ? "Obrigado por utilizar o ShopManager Pro! Todos os recursos estão liberados."
              : isTrial
                ? "Aproveite para testar todos os recursos do ShopManager. Escolha um plano abaixo para não perder o acesso quando o trial acabar."
                : "Para continuar usando o sistema e registrando vendas, escolha um de nossos planos abaixo."}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mensal */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col relative">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold">Assinatura Mensal</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Acesso completo ao sistema com cobrança recorrente no cartão.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{formatBRL(49.90)}</span>
              <span className="text-muted-foreground font-medium">/mês</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <ul className="space-y-3 text-sm mb-8 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Vendas ilimitadas no PDV
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Gestão de estoque completa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Controle financeiro avançado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Suporte técnico humanizado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Atualizações gratuitas
              </li>
            </ul>
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null || !isOwner}
            >
              {loading === "monthly" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading === "monthly" ? "Redirecionando..." : "Assinar Mensal"}
            </Button>
            {!isOwner && <p className="text-xs text-center mt-2 text-muted-foreground">Apenas o proprietário pode assinar.</p>}
          </div>
        </div>

        {/* Vitalício / Anual */}
        <div className="rounded-2xl border-2 border-primary bg-card overflow-hidden flex flex-col relative shadow-[0_0_30px_-10px_var(--color-primary)]">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            MAIS POPULAR
          </div>
          <div className="p-6 border-b border-border bg-primary/5">
            <h3 className="text-xl font-bold">Pagamento Único</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Garante acesso vitalício ao sistema sem mensalidades.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{formatBRL(499.00)}</span>
              <span className="text-muted-foreground font-medium">taxa única</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <ul className="space-y-3 text-sm mb-8 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> <span className="font-medium">Tudo do plano mensal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sem taxas recorrentes (PIX/Cartão)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Prioridade de suporte
              </li>
            </ul>
            <Button 
              size="lg" 
              className="w-full shadow-[var(--shadow-glow)]" 
              onClick={() => handleSubscribe("lifetime")}
              disabled={loading !== null || !isOwner}
            >
              {loading === "lifetime" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading === "lifetime" ? "Redirecionando..." : "Comprar Acesso Vitalício"}
            </Button>
            {!isOwner && <p className="text-xs text-center mt-2 text-muted-foreground">Apenas o proprietário pode assinar.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
