import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Vendio" }] }),
  component: AdminHome,
});

function AdminHome() {
  const [stores, setStores] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, stores: 0, sales: 0, tickets: 0 });

  const load = async () => {
    const { data: s } = await supabase.from("stores").select("*, profiles!stores_owner_id_fkey(email, full_name)").order("created_at", { ascending: false });
    setStores(s ?? []);
    const [u, st, sa, tk] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("stores").select("id", { count: "exact", head: true }),
      supabase.from("sales").select("id", { count: "exact", head: true }),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "aberto"),
    ]);
    setStats({ users: u.count ?? 0, stores: st.count ?? 0, sales: sa.count ?? 0, tickets: tk.count ?? 0 });
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("stores").update({ active: !active }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(active ? "Loja desativada" : "Loja ativada");
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel administrativo</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Usuários" v={stats.users} />
        <Stat label="Lojas" v={stats.stores} />
        <Stat label="Vendas" v={stats.sales} />
        <Stat label="Tickets abertos" v={stats.tickets} />
      </div>
      <Card>
        <CardHeader><CardTitle>Lojas cadastradas</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {stores.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name} <span className="text-xs text-muted-foreground">/loja/{s.slug}</span></div>
                  <div className="text-xs text-muted-foreground">{(s as any).profiles?.email} · plano {s.plan}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "ativa" : "inativa"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggle(s.id, s.active)}>
                    {s.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold mt-1">{v}</div></CardContent></Card>;
}
