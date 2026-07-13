import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Admin" }] }),
  component: TicketsAdmin,
});

function TicketsAdmin() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [responding, setResponding] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from("support_tickets").select("*, profiles(email, full_name)").order("created_at", { ascending: false });
    setTickets(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const respond = async (id: string) => {
    const msg = responding[id];
    if (!msg) return;
    const { error } = await supabase.from("support_tickets").update({
      admin_response: msg, status: "resolvido"
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Resposta enviada");
    setResponding((s) => ({ ...s, [id]: "" }));
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Tickets de suporte</h1>
      {tickets.map((t) => (
        <Card key={t.id}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {(t as any).profiles?.email} · {t.category} · {new Date(t.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
              <Badge>{t.status}</Badge>
            </div>
            <p className="text-sm">{t.message}</p>
            {t.admin_response ? (
              <div className="border-l-2 border-primary pl-3 text-sm">
                <div className="text-xs font-semibold text-primary">Resposta</div>
                {t.admin_response}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Textarea
                  placeholder="Escrever resposta..."
                  value={responding[t.id] ?? ""}
                  onChange={(e) => setResponding((s) => ({ ...s, [t.id]: e.target.value }))}
                />
                <Button size="sm" onClick={() => respond(t.id)}>Enviar e resolver</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
