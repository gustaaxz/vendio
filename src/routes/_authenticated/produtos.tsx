import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMyStore } from "@/hooks/useMyStore";
import { useProdutos, useProdutoMutations, type Produto } from "@/hooks/useStoreData";
import { formatBRL } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, AlertTriangle, PackagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Vendio" }] }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const { data: store } = useMyStore();
  const { data: produtos = [] } = useProdutos(store?.id);
  const m = useProdutoMutations(store?.id);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Produto | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = produtos.filter((p) =>
    (p.name + " " + (p.category ?? "")).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} produtos cadastrados`}
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="h-4 w-4 mr-2" /> Novo produto
              </Button>
            </DialogTrigger>
            <ProductForm
              produto={editing}
              onSubmit={async (data) => {
                if (editing) await m.update.mutateAsync({ id: editing.id, ...data });
                else await m.add.mutateAsync(data);
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        }
      />

      <Input placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const low = p.stock <= p.min_stock;
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.category || "Sem categoria"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Remover">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover {p.name}?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => m.remove.mutate(p.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">{formatBRL(Number(p.price))}</div>
                  <div className="text-right">
                    <div className="text-sm">{p.stock} unidades</div>
                    {low && (
                      <Badge variant="destructive" className="text-[10px] mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Estoque baixo
                      </Badge>
                    )}
                  </div>
                </div>
                {low && (
                  <RestockButton onSubmit={(qty) => m.restock.mutate({ id: p.id, qty })} />
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-12">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}

function RestockButton({ onSubmit }: { onSubmit: (qty: number) => void }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(10);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full mt-3">
          <PackagePlus className="h-3.5 w-3.5 mr-2" /> Repor estoque
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Repor estoque</DialogTitle></DialogHeader>
        <Label>Quantidade a adicionar</Label>
        <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} />
        <DialogFooter>
          <Button onClick={() => { onSubmit(qty); setOpen(false); }}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  produto,
  onSubmit,
}: {
  produto: Produto | null;
  onSubmit: (d: Partial<Produto>) => Promise<void>;
}) {
  const [name, setName] = useState(produto?.name ?? "");
  const [category, setCategory] = useState(produto?.category ?? "");
  const [price, setPrice] = useState(produto?.price ?? 0);
  const [stock, setStock] = useState(produto?.stock ?? 0);
  const [minStock, setMinStock] = useState(produto?.min_stock ?? 0);

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{produto ? "Editar" : "Novo"} produto</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Preço</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div><Label>Estoque</Label><Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></div>
          <div><Label>Mín.</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit({ name, category, price, stock, min_stock: minStock })}>
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
