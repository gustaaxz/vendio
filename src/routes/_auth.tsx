import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect para dashboard se já logado
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <Store className="h-5 w-5" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Lado esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur">
            <Store className="h-4 w-4" />
          </div>
          ShopManager
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Controle sua loja de forma
            <br />
            simples e profissional.
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            Estoque, vendas, clientes e financeiro em um único sistema. Feito para micro e pequenos
            comércios brasileiros.
          </p>
        </div>
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} ShopManager. Todos os direitos reservados.
        </p>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex items-center gap-2 font-bold text-lg">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            ShopManager
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
