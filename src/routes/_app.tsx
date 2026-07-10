import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  Store,
  ArrowLeft,
} from "lucide-react";
import { Toaster } from "sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/vendas", label: "Vendas (PDV)", icon: ShoppingCart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

function AppLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            ShopManager
          </Link>
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
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
