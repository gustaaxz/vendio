import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatBRL, useStore, type ItemVenda } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Trash2, Search, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vendas")({
  head: () => ({ meta: [{ title: "PDV — ShopManager" }] }),
  component: Vendas,
});

function Vendas() {
  const { produtos, clientes, vendas, addVenda } = useStore();
  const [q, setQ] = useState("");
  const [clienteId, setClienteId] = useState<string>("avulso");
  const [pagamento, setPagamento] = useState<"dinheiro" | "pix" | "cartao">("pix");
  const [itens, setItens] = useState<ItemVenda[]>([]);

  const filtered = produtos.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()));
  const total = useMemo(() => itens.reduce((s, i) => s + i.preco * i.quantidade, 0), [itens]);

  const add = (id: string) => {
    const p = produtos.find((x) => x.id === id);
    if (!p) return;
    if (p.estoque <= 0) return toast.error("Sem estoque");
    setItens((prev) => {
      const ex = prev.find((i) => i.produtoId === id);
      if (ex) {
        if (ex.quantidade >= p.estoque) {
          toast.error("Estoque insuficiente");
          return prev;
        }
        return prev.map((i) =>
          i.produtoId === id ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }
      return [...prev, { produtoId: id, nome: p.nome, preco: p.preco, quantidade: 1 }];
    });
  };

  const dec = (id: string) =>
    setItens((prev) =>
      prev
        .map((i) => (i.produtoId === id ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter((i) => i.quantidade > 0),
    );

  const rm = (id: string) => setItens((prev) => prev.filter((i) => i.produtoId !== id));

  const finalizar = () => {
    if (itens.length === 0) return toast.error("Adicione produtos");
    const cliente = clientes.find((c) => c.id === clienteId);
    addVenda({
      clienteId: cliente?.id ?? null,
      clienteNome: cliente?.nome ?? "Cliente avulso",
      itens,
      total,
      pagamento,
    });
    toast.success(`Venda de ${formatBRL(total)} registrada`);
    setItens([]);
  };

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader title="Vendas (PDV)" subtitle="Ponto de venda ágil" />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Produtos */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p.id)}
                disabled={p.estoque <= 0}
                className="text-left p-4 rounded-xl border border-border bg-background hover:border-primary hover:shadow-[var(--shadow-soft)] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="text-xs text-muted-foreground">{p.categoria}</div>
                <div className="font-medium mt-1 line-clamp-2">{p.nome}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-primary">{formatBRL(p.preco)}</span>
                  <span className="text-xs text-muted-foreground">{p.estoque}un</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carrinho */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col h-fit sticky top-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Carrinho
          </h3>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Cliente</label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="avulso">Cliente avulso</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pagamento</label>
              <Select value={pagamento} onValueChange={(v) => setPagamento(v as typeof pagamento)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4 max-h-64 overflow-y-auto">
            {itens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Toque em um produto para adicionar
              </p>
            ) : (
              <ul className="space-y-2">
                {itens.map((i) => (
                  <li key={i.produtoId} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{i.nome}</div>
                      <div className="text-xs text-muted-foreground">{formatBRL(i.preco)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => dec(i.produtoId)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">{i.quantidade}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => add(i.produtoId)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => rm(i.produtoId)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Itens</span>
              <span>{itens.reduce((s, i) => s + i.quantidade, 0)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatBRL(total)}</span>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={finalizar}>
              Finalizar venda
            </Button>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Últimas vendas</h3>
        {vendas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há vendas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Data</th>
                  <th className="text-left py-2">Cliente</th>
                  <th className="text-left py-2">Pagamento</th>
                  <th className="text-right py-2">Itens</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendas.slice(0, 10).map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5">{new Date(v.data).toLocaleString("pt-BR")}</td>
                    <td>{v.clienteNome}</td>
                    <td className="capitalize">{v.pagamento}</td>
                    <td className="text-right">{v.itens.reduce((s, i) => s + i.quantidade, 0)}</td>
                    <td className="text-right font-semibold">{formatBRL(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
