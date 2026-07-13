import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/BrandLogo";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={28} />
            <span className="font-bold">Vendio · Admin</span>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link to="/admin" className="hover:text-primary">Lojas</Link>
            <Link to="/admin/tickets" className="hover:text-primary">Tickets</Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Meu painel</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6"><Outlet /></main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
