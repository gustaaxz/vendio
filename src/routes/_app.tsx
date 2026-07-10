import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  Store,
  ArrowLeft,
  LogOut,
  Settings,
  Loader2,
  Crown,
  Lock,
  FileText,
  Bell,
} from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/vendas", label: "Vendas (PDV)", icon: ShoppingCart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
] as const;

function AppLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, organization, membership, loading, signOut, authError } = useAuth();

  // Auth guard — redireciona para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const roleLabel =
    membership?.role === "owner"
      ? "Proprietário"
      : membership?.role === "admin"
        ? "Administrador"
        : "Caixa";

  // Lógica do Paywall
  const planStatus = organization?.plan_status; // 'trial', 'active', 'past_due', 'canceled'
  const plan = organization?.plan;
  const trialEndsAt = organization?.trial_ends_at ? new Date(organization.trial_ends_at).getTime() : 0;
  
  const isTrial = planStatus === "trial";
  const isTrialExpired = isTrial && Date.now() > trialEndsAt;
  const isPlanActive = planStatus === "active" || (plan as string) === "lifetime" || (plan as string) === "premium";
  
  const isBlocked = !isPlanActive && isTrialExpired;
  
  const trialDaysLeft = isTrial ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate">{organization?.name || "ShopManager"}</span>
          </Link>
        </div>

        {/* Org info */}
        {organization && (
          <div className="px-6 pb-4 border-b border-sidebar-border">
            <div className="text-sm font-medium text-white truncate">
              {organization.name}
            </div>
            <div className="text-xs text-sidebar-foreground/60 mt-0.5">
              {roleLabel} •{" "}
              <span className="capitalize">
                {isTrial
                  ? `Trial (${trialDaysLeft} dias)`
                  : (plan as string) === "free" ? "Expirado" : plan}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-3 space-y-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {/* Usuário */}
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-white shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {user.user_metadata?.full_name || user.email}
              </div>
              <div className="text-[10px] text-sidebar-foreground/60 truncate">
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Você não possui novas notificações no momento.")}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white rounded-lg hover:bg-sidebar-accent/30 transition"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              Notificações
            </div>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </button>

          <Link
            to="/planos"
            className="flex items-center gap-2 px-3 py-2 text-xs text-warning hover:text-warning/80 font-medium rounded-lg hover:bg-warning/10 transition"
          >
            <Crown className="h-3.5 w-3.5" />
            Meu Plano
          </Link>

          <Link
            to="/configuracoes"
            className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white rounded-lg hover:bg-sidebar-accent/30 transition"
          >
            <Settings className="h-3.5 w-3.5" />
            Configurações
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white rounded-lg hover:bg-sidebar-accent/30 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white rounded-lg hover:bg-sidebar-accent/30 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden relative">
        {authError && (
          <div className="bg-destructive/15 text-destructive p-4 text-center font-medium border-b border-destructive/20">
            Erro de Carregamento: {authError}
          </div>
        )}
        {isBlocked && loc.pathname !== "/planos" ? (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-6">
            <div className="max-w-md w-full bg-card border shadow-xl rounded-2xl p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning/20 mb-4">
                <Lock className="h-6 w-6 text-warning" />
              </div>
              <h2 className="text-xl font-bold mb-2">Acesso Bloqueado</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Seu período de testes acabou ou sua assinatura está inativa. 
                Para continuar usando o sistema, por favor, assine um de nossos planos.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link to="/planos">Ver Planos Disponíveis</Link>
              </Button>
            </div>
          </div>
        ) : null}
        <Outlet />
      </main>
      <AccessibilityToolbar />
      <Toaster position="top-right" richColors />
    </div>
  );
}
