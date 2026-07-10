import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatBRL, useStore } from "@/lib/store";
import {
  Package,
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ShopManager" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { produtos, clientes, vendas, movimentos } = useStore();

  const stats = useMemo(() => {
    const now = new Date();
    const doMes = vendas.filter((v) => {
      const d = new Date(v.data);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const total = doMes.reduce((s, v) => s + v.total, 0);
    const lucro = total * 0.3;
    return { totalMes: total, lucro, qtdMes: doMes.length };
  }, [vendas]);

  const vendasPorDia = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("pt-BR", { weekday: "short" });
      days[key] = 0;
    }
    vendas.forEach((v) => {
      const d = new Date(v.data);
      const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 7) {
        const key = d.toLocaleDateString("pt-BR", { weekday: "short" });
        if (key in days) days[key] += v.total;
      }
    });
    return Object.entries(days).map(([dia, total]) => ({ dia, total }));
  }, [vendas]);

  const porCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    vendas.forEach((v) =>
      v.itens.forEach((it) => {
        const prod = produtos.find((p) => p.id === it.produtoId);
        const cat = prod?.categoria ?? "Outros";
        map[cat] = (map[cat] ?? 0) + it.quantidade * it.preco;
      }),
    );
    return Object.entries(map).map(([categoria, total]) => ({ categoria, total }));
  }, [vendas, produtos]);

  const cards = [
    { label: "Produtos cadastrados", value: produtos.length, icon: Package, tint: "text-primary" },
    { label: "Clientes", value: clientes.length, icon: Users, tint: "text-chart-2" },
    { label: "Vendas do mês", value: stats.qtdMes, icon: ShoppingBag, tint: "text-chart-4" },
    { label: "Lucro estimado", value: formatBRL(stats.lucro), icon: TrendingUp, tint: "text-success" },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader title="Dashboard" subtitle="Visão geral da sua loja" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.tint}`} />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Vendas nos últimos 7 dias</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Categorias mais vendidas</h3>
          <div className="h-64 mt-4">
            {porCategoria.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                Sem dados ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="categoria" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                    formatter={(v: number) => formatBRL(v)}
                  />
                  <Bar dataKey="total" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Atividades recentes</h3>
        {movimentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda. Registre uma venda no PDV.</p>
        ) : (
          <ul className="divide-y divide-border">
            {movimentos.slice(0, 8).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-lg ${
                      m.tipo === "entrada" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {m.tipo === "entrada" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.descricao}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.data).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-semibold ${m.tipo === "entrada" ? "text-success" : "text-destructive"}`}
                >
                  {m.tipo === "entrada" ? "+" : "-"}
                  {formatBRL(m.valor)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
