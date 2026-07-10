import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/configuracoes")({
  component: ConfiguracoesRoute,
});

function ConfiguracoesRoute() {
  const { user, organization, membership } = useAuth();
  const [loading, setLoading] = useState(false);

  const [orgData, setOrgData] = useState({
    name: organization?.name || "",
    address: organization?.address || "",
    phone: organization?.phone || "",
    email: organization?.email || "",
    support_faq: organization?.support_faq || "",
  });

  const handleOrgSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("organizations")
        // @ts-ignore
        .update(orgData)
        .eq("id", organization.id);
      if (error) throw error;
      toast.success("Dados da loja atualizados!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar os dados da loja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie o perfil da loja e sua conta.</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store">Dados da Loja</TabsTrigger>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-6">
          <div className="bg-card border rounded-2xl p-6">
            <form onSubmit={handleOrgSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Loja</Label>
                <Input
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={orgData.phone}
                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input
                    type="email"
                    value={orgData.email}
                    onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                    placeholder="contato@sualoja.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={orgData.address}
                  onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Suporte / FAQ</Label>
                <Textarea
                  value={orgData.support_faq}
                  onChange={(e) => setOrgData({ ...orgData, support_faq: e.target.value })}
                  placeholder="Informações úteis de suporte para seus clientes..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="bg-card border rounded-2xl p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail (Login)</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input value={user?.user_metadata?.full_name || ""} disabled />
                <p className="text-xs text-muted-foreground">O nome é definido na criação da conta.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
