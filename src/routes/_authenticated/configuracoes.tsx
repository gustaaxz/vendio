import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyStore } from "@/hooks/useMyStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Vendio" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { user, signOut } = useAuth();
  const { data: store, refetch } = useMyStore();
  const nav = useNavigate();
  const [name, setName] = useState(store?.name ?? "");
  const [description, setDescription] = useState(store?.description ?? "");
  const [phone, setPhone] = useState(store?.phone ?? "");

  if (!store) return <div className="p-6">Carregando...</div>;

  const save = async () => {
    const update: any = { description, phone };
    if (name !== store.name) {
      update.name = name;
      update.name_locked = true;
    }
    const { error } = await supabase.from("stores").update(update).eq("id", store.id);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    refetch();
  };

  const askDelete = async () => {
    await supabase.from("support_tickets").insert({
      user_id: user!.id, store_id: store.id,
      subject: "Solicitação de exclusão de conta",
      message: `Usuário solicita a exclusão da conta e loja ${store.name}.`,
      category: "excluir_conta",
    } as any);
    toast.success("Solicitação enviada. Nossa equipe entrará em contato.");
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader title="Configurações" subtitle="Dados da sua loja e conta" />
      <Card>
        <CardHeader><CardTitle>Dados da loja</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nome da loja {store.name_locked && <span className="text-xs text-muted-foreground">(bloqueado — contate o suporte)</span>}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={store.name_locked} />
          </div>
          <div>
            <Label>Endereço público</Label>
            <Input value={`/loja/${store.slug}`} disabled />
          </div>
          <div><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label>Plano atual</Label><Input value={store.plan} disabled /></div>
          <Button onClick={save}>Salvar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Conta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => { await signOut(); nav({ to: "/" }); }}>Sair</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Solicitar exclusão de conta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Solicitar exclusão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso abre um chamado com nossa equipe para excluir sua conta e sua loja. Você será notificado por email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={askDelete}>Confirmar solicitação</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
