import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatBRL, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — ShopManager" }] }),
  component: Financeiro,
});

function Financeiro() {
  const { movimentos, addMovimento } = useStore();
  const [open, setOpen] = useState(false);

  const { entradas, saidas, saldo } = useMemo(() => {
    const e = movimentos.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
    const sa = movimentos.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
    return { entradas: e, saidas: sa, saldo: e - sa };
  }, [movimentos]);

  const submit = (form: FormData) => {
    const tipo = String(form.get("tipo")) as "entrada" | "saida";
    const descricao = String(form.get("descricao"));
    const valor = Number(form.get("valor"));
    if (!descricao || !valor) return toast.error("Preencha os campos");
    addMovimento({ tipo, descricao, valor });
    toast.success("Movimentação registrada");
    setOpen(false);
  };

  const cards = [
    { label: "Entradas", value: formatBRL(entradas), icon: ArrowUpRight, tint: "text-success", bg: "bg-success/10" },
    { label: "Saídas", value: formatBRL(saidas), icon: ArrowDownRight, tint: "text-destructive", bg: "bg-destructive/10" },
    { label: "Saldo", value: formatBRL(saldo), icon: TrendingUp, tint: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title="Financeiro"
        subtitle="Entradas, saídas e movimentações"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Nova movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova movimentação</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(new FormData(e.currentTarget));
                }}
              >
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select name="tipo" defaultValue="saida">
                    <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input id="descricao" name="descricao" required />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input id="valor" name="valor" type="number" step="0.01" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <div className={`grid h-8 w-8 place-items-center rounded-lg ${c.bg} ${c.tint}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Movimentações</h3>
        </div>
        {movimentos.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground text-center">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-left px-4 py-3 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movimentos.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">{new Date(m.data).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 font-medium">{m.descricao}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        m.tipo === "entrada"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      m.tipo === "entrada" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {m.tipo === "entrada" ? "+" : "-"}
                    {formatBRL(m.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
