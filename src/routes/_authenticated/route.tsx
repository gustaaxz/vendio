import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  ArrowLeft,
  Settings,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Toaster } from "sonner";
import { BrandMark } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyStore } from "@/hooks/useMyStore";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/suporte", label: "Suporte", icon: LifeBuoy },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AppLayout() {
  const loc = useLocation();
  const nav_hook = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { data: store, isLoading } = useMyStore();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <BrandMark size={32} />
            <span className="text-lg tracking-tight">
              Vendio<span className="text-primary">.</span>
            </span>
          </Link>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-sidebar-accent/50" />
              <Skeleton className="h-3 w-1/2 bg-sidebar-accent/50" />
            </div>
          ) : store ? (
            <div className="mt-4 rounded-lg bg-sidebar-accent/40 p-3 text-xs">
              <div className="font-semibold text-white truncate">{store.name}</div>
              <a
                href={`/loja/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 mt-1"
              >
                Ver vitrine <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
        </div>
        <nav className="flex-1 px-3 space-y-1">
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
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-sidebar-accent/50"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-3">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/20">
            <div className="font-semibold text-white text-sm truncate">{userName}</div>
            <div className="text-xs text-sidebar-foreground/70 truncate mb-1">{userEmail}</div>
            {store && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-primary">
                Plano {store.plan}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/40"
              onClick={async () => {
                await signOut();
                nav_hook({ to: "/" });
              }}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : store ? (
          <Outlet />
        ) : (
          <div className="flex-1 h-full flex items-center justify-center p-8 text-center bg-muted/20">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold">Bem-vindo(a) à Vendio!</h2>
              <p className="text-muted-foreground">
                Por favor, crie sua loja usando a janela aberta para começar a usar o painel de controle.
              </p>
            </div>
          </div>
        )}
      </main>
      <OnboardingDialog />
      <Toaster position="top-right" richColors />
    </div>
  );
}
