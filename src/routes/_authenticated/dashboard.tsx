import { createFileRoute } from "@tanstack/react-router";
import { useMyStore } from "@/hooks/useMyStore";
import { useProdutos, useVendas, useMovimentos } from "@/hooks/useStoreData";
import { formatBRL } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Vendio" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: store } = useMyStore();
  const { data: produtos = [] } = useProdutos(store?.id);
  const { data: vendas = [] } = useVendas(store?.id);
  const { data: movs = [] } = useMovimentos(store?.id);

  const now = new Date();
  const today = vendas.filter((v) => new Date(v.created_at).toDateString() === now.toDateString());
  const last7 = vendas.filter((v) => Date.now() - new Date(v.created_at).getTime() < 7 * 864e5);
  const monthSt = new Date(now.getFullYear(), now.getMonth(), 1);
  const month = vendas.filter((v) => new Date(v.created_at) >= monthSt);
  const totalToday = today.reduce((s, v) => s + Number(v.total), 0);
  const total7 = last7.reduce((s, v) => s + Number(v.total), 0);
  const totalMonth = month.reduce((s, v) => s + Number(v.total), 0);
  const ticket = vendas.length ? vendas.reduce((s, v) => s + Number(v.total), 0) / vendas.length : 0;
  const stockLow = produtos.filter((p) => p.stock <= p.min_stock).length;

  // Last 30 days chart
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(5, 10);
    const t = vendas
      .filter((v) => new Date(v.created_at).toDateString() === d.toDateString())
      .reduce((s, v) => s + Number(v.total), 0);
    return { dia: key, total: t };
  });

  // Top produtos por categoria
  const byCat: Record<string, Record<string, number>> = {};
  for (const v of vendas) {
    for (const it of v.sale_items ?? []) {
      const p = produtos.find((x) => x.id === it.product_id);
      const cat = p?.category ?? "Outros";
      byCat[cat] = byCat[cat] || {};
      byCat[cat][it.name_snapshot] = (byCat[cat][it.name_snapshot] ?? 0) + it.quantity;
    }
  }
  const topByCat = Object.entries(byCat).map(([cat, items]) => {
    const top = Object.entries(items).sort((a, b) => b[1] - a[1])[0];
    return { cat, name: top?.[0] ?? "—", qty: top?.[1] ?? 0 };
  });

  const catData = Object.entries(byCat).map(([cat, items]) => ({
    name: cat,
    value: Object.values(items).reduce((a, b) => a + b, 0),
  }));
  const colors = ["hsl(var(--primary))", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dashboard" subtitle="Visão geral da sua loja" />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<DollarSign />} label="Vendas hoje" value={formatBRL(totalToday)} sub={`${today.length} pedidos`} />
        <StatCard icon={<TrendingUp />} label="Últimos 7 dias" value={formatBRL(total7)} sub={`${last7.length} pedidos`} />
        <StatCard icon={<ShoppingCart />} label="Mês" value={formatBRL(totalMonth)} sub={`Ticket ${formatBRL(ticket)}`} />
        <StatCard icon={<Package />} label="Estoque baixo" value={String(stockLow)} sub={`${produtos.length} produtos ativos`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas — últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={days}>
                <XAxis dataKey="dia" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vendas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                    {catData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top produtos por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {topByCat.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {topByCat.map((t) => (
                <div key={t.cat} className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-xs text-muted-foreground">{t.cat}</div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-primary">{t.qty} unidades vendidas</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {movs.slice(0, 8).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
          ) : (
            <ul className="divide-y">
              {movs.slice(0, 8).map((m) => (
                <li key={m.id} className="py-2 flex items-center justify-between text-sm">
                  <span>{m.description}</span>
                  <span className={m.type === "entrada" ? "text-green-600" : "text-red-600"}>
                    {m.type === "entrada" ? "+" : "-"} {formatBRL(Number(m.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
