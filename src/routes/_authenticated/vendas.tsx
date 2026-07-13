import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMyStore } from "@/hooks/useMyStore";
import {
  useProdutos, useClientes, useVendas, useCreateVenda, type Produto,
} from "@/hooks/useStoreData";
import { formatBRL } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendas")({
  head: () => ({ meta: [{ title: "Vendas — Vendio" }] }),
  component: VendasPage,
});

type CartItem = { produto: Produto; qtd: number };

function VendasPage() {
  const { data: store } = useMyStore();
  const { data: produtos = [] } = useProdutos(store?.id);
  const { data: clientes = [] } = useClientes(store?.id);
  const { data: vendas = [] } = useVendas(store?.id);
  const create = useCreateVenda(store?.id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<string>("avulso");
  const [pgto, setPgto] = useState("pix");
  const [q, setQ] = useState("");

  const total = cart.reduce((s, i) => s + i.qtd * Number(i.produto.price), 0);
  const addToCart = (p: Produto) => {
    setCart((c) => {
      const ex = c.find((i) => i.produto.id === p.id);
      if (ex) return c.map((i) => (i.produto.id === p.id ? { ...i, qtd: i.qtd + 1 } : i));
      return [...c, { produto: p, qtd: 1 }];
    });
  };

  const finalizar = async () => {
    if (cart.length === 0) return;
    await create.mutateAsync({
      customer_id: clienteId === "avulso" ? null : clienteId,
      payment_method: pgto,
      items: cart.map((i) => ({
        product_id: i.produto.id,
        name: i.produto.name,
        quantity: i.qtd,
        unit_price: Number(i.produto.price),
      })),
    });
    setCart([]);
    setClienteId("avulso");
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Vendas" subtitle="Registro de vendas e histórico" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Produtos</CardTitle></CardHeader>
          <CardContent>
            <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
            <div className="grid gap-2 md:grid-cols-2 max-h-[500px] overflow-auto">
              {produtos.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
                <button
                  key={p.id}
                  disabled={p.stock <= 0}
                  onClick={() => addToCart(p)}
                  className="p-3 border rounded-lg text-left hover:bg-muted disabled:opacity-50"
                >
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{p.stock} un.</span>
                    <span className="text-primary font-bold">{formatBRL(Number(p.price))}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Novo pedido</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="avulso">Cliente avulso</SelectItem>
                {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={pgto} onValueChange={setPgto}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de débito</SelectItem>
                <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
            <div className="border rounded-lg divide-y max-h-64 overflow-auto">
              {cart.length === 0 && <p className="text-xs text-muted-foreground p-3">Sem itens</p>}
              {cart.map((i) => (
                <div key={i.produto.id} className="p-2 flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{i.produto.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.qtd} unidades × {formatBRL(Number(i.produto.price))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6"
                      onClick={() => setCart((c) => c.map((x) => x.produto.id === i.produto.id ? { ...x, qtd: Math.max(1, x.qtd - 1) } : x))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-xs">{i.qtd}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6"
                      onClick={() => setCart((c) => c.map((x) => x.produto.id === i.produto.id ? { ...x, qtd: x.qtd + 1 } : x))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6"
                      onClick={() => setCart((c) => c.filter((x) => x.produto.id !== i.produto.id))}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span><span className="text-primary">{formatBRL(total)}</span>
            </div>
            <Button className="w-full" disabled={cart.length === 0 || create.isPending} onClick={finalizar}>
              Finalizar venda
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Últimas vendas</CardTitle></CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
          ) : (
            <ul className="divide-y">
              {vendas.slice(0, 10).map((v) => (
                <li key={v.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div>{v.customers?.name ?? "Cliente avulso"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleString("pt-BR")} — {v.sale_items?.length ?? 0} itens
                    </div>
                  </div>
                  <div className="font-semibold text-primary">{formatBRL(Number(v.total))}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
