import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMyStore } from "@/hooks/useMyStore";
import { useMovimentos, useMovimentoMutations } from "@/hooks/useStoreData";
import { formatBRL } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, ArrowDownRight, ArrowUpRight, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Vendio" }] }),
  component: FinPage,
});

function FinPage() {
  const { data: store } = useMyStore();
  const { data: movs = [] } = useMovimentos(store?.id);
  const m = useMovimentoMutations(store?.id);
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState(0);

  const entradas = movs.filter((x) => x.type === "entrada").reduce((s, x) => s + Number(x.amount), 0);
  const saidas = movs.filter((x) => x.type === "saida").reduce((s, x) => s + Number(x.amount), 0);

  const exportCsv = () => {
    const header = "Data,Tipo,Descrição,Valor\n";
    const rows = movs.map((m) => `${new Date(m.created_at).toLocaleString("pt-BR")},${m.type},${m.description.replace(/,/g, ";")},${m.amount}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `financeiro-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="Entradas e saídas da sua loja"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Novo movimento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova movimentação</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Descrição</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
                  <div><Label>Valor</Label><Input type="number" step="0.01" value={val} onChange={(e) => setVal(Number(e.target.value))} /></div>
                </div>
                <DialogFooter>
                  <Button onClick={async () => {
                    await m.add.mutateAsync({ type: tipo, description: desc, amount: val });
                    setOpen(false); setDesc(""); setVal(0);
                  }}>Registrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-600" /> Entradas</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{formatBRL(entradas)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-red-600" /> Saídas</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{formatBRL(saidas)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground">Saldo</div>
          <div className="text-2xl font-bold text-primary mt-1">{formatBRL(entradas - saidas)}</div>
        </CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
        <CardContent>
          {movs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem movimentações.</p>
          ) : (
            <ul className="divide-y">
              {movs.map((mo) => (
                <li key={mo.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div>{mo.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(mo.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <div className={mo.type === "entrada" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {mo.type === "entrada" ? "+" : "-"} {formatBRL(Number(mo.amount))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
