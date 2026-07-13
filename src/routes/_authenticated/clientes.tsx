import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMyStore } from "@/hooks/useMyStore";
import { useClientes, useClienteMutations, type Cliente } from "@/hooks/useStoreData";
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
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Vendio" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { data: store } = useMyStore();
  const { data: clientes = [] } = useClientes(store?.id);
  const m = useClienteMutations(store?.id);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = clientes.filter((c) =>
    (c.name + " " + (c.email ?? "") + " " + (c.phone ?? "")).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes`}
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="h-4 w-4 mr-2" /> Novo cliente
              </Button>
            </DialogTrigger>
            <ClienteForm
              cliente={editing}
              onSubmit={async (d) => {
                if (editing) await m.update.mutateAsync({ id: editing.id, ...d });
                else await m.add.mutateAsync(d);
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        }
      />
      <Input placeholder="Buscar cliente..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{c.name}</h3>
                {c.email && <p className="text-xs text-muted-foreground truncate">{c.email}</p>}
                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover {c.name}?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => m.remove.mutate(c.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClienteForm({
  cliente,
  onSubmit,
}: {
  cliente: Cliente | null;
  onSubmit: (d: Partial<Cliente>) => Promise<void>;
}) {
  const [name, setName] = useState(cliente?.name ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [phone, setPhone] = useState(cliente?.phone ?? "");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{cliente ? "Editar" : "Novo"} cliente</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit({ name, email, phone })}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}
