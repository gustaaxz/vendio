import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyStore } from "@/hooks/useMyStore";
import { slugify } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function OnboardingDialog() {
  const { user } = useAuth();
  const { data: store, isLoading } = useMyStore();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (name) setSlug(slugify(name));
  }, [name]);

  const open = !isLoading && !!user && !store;
  if (!open) return null;

  const submit = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Informe o nome e o endereço da loja");
      return;
    }
    setSaving(true);
    try {
      // Ensure store_owner role
      await supabase.from("user_roles").insert({ user_id: user!.id, role: "store_owner" as any });
      const { error } = await supabase.from("stores").insert({
        owner_id: user!.id,
        name: name.trim(),
        slug: slug.trim(),
        phone: phone.trim() || null,
        description: description.trim() || null,
        email: user!.email ?? null,
      } as any);
      if (error) throw error;
      await supabase.from("profiles").update({ onboarding_completed: true, phone }).eq("id", user!.id);
      toast.success("Loja criada com sucesso!");
      qc.invalidateQueries({ queryKey: ["my-store"] });
    } catch (e: any) {
      if (e.message?.includes("stores_slug_key") || e.code === "23505") {
        toast.error("Este endereço já está em uso. Escolha outro.");
      } else {
        toast.error(e.message ?? "Erro ao criar loja");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Vamos criar sua loja</DialogTitle>
          <DialogDescription>
            Essas informações aparecerão para seus clientes na vitrine pública.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="lname">Nome da loja *</Label>
            <Input id="lname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Robux Store" />
            <p className="text-xs text-muted-foreground mt-1">
              O nome só pode ser alterado uma vez pela plataforma. Depois disso, apenas via suporte.
            </p>
          </div>
          <div>
            <Label htmlFor="lslug">Endereço público *</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">vendio.app/loja/</span>
              <Input
                id="lslug"
                value={slug}
                disabled
                placeholder="robux-store"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lphone">Telefone / WhatsApp</Label>
            <Input id="lphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
          </div>
          <div>
            <Label htmlFor="ldesc">Descrição (opcional)</Label>
            <Textarea id="ldesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <Button className="w-full" onClick={submit} disabled={saving}>
            {saving ? "Criando..." : "Criar minha loja"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
