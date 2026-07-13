import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/suporte")({
  head: () => ({ meta: [{ title: "Suporte — Vendio" }] }),
  component: SupportPage,
});

function SupportPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("duvida");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setTickets(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const send = async () => {
    if (!subject || !message) return toast.error("Preencha assunto e mensagem");
    setLoading(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user!.id, subject, message, category,
    } as any);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Ticket criado!");
    setSubject(""); setMessage("");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Suporte" subtitle="Fale com nossa equipe" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Novo chamado</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Categoria</Label>
              <select className="w-full border rounded-md h-10 px-3 bg-background" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="duvida">Dúvida</option>
                <option value="problema">Problema técnico</option>
                <option value="mudar_nome">Alterar nome da loja</option>
                <option value="excluir_conta">Excluir minha conta</option>
                <option value="cobranca">Cobrança / Plano</option>
              </select>
            </div>
            <div><Label>Assunto</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div><Label>Mensagem</Label><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
            <Button onClick={send} disabled={loading} className="w-full">Enviar</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Meus chamados</CardTitle></CardHeader>
          <CardContent>
            {tickets.length === 0 && <p className="text-sm text-muted-foreground">Nenhum chamado ainda.</p>}
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li key={t.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{t.subject}</div>
                    <Badge variant={t.status === "resolvido" ? "default" : "secondary"}>{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.message}</p>
                  {t.admin_response && (
                    <div className="mt-2 border-t pt-2 text-sm">
                      <div className="text-xs font-semibold text-primary">Resposta da equipe:</div>
                      <p>{t.admin_response}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
