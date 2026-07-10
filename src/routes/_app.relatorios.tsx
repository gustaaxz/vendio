import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/relatorios")({
  component: RelatoriosRoute,
});

function RelatoriosRoute() {
  const exportCSV = (type: string) => {
    toast.success(`Exportação de ${type} iniciada! (Em breve)`);
    // Aqui vai a lógica de gerar o CSV e baixar
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios e Exportação</h1>
        <p className="text-muted-foreground">Exporte seus dados em CSV para planilhas ou contabilidade.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Relatório de Produtos</h3>
              <p className="text-sm text-muted-foreground">Estoque atual e valores</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 mt-auto" onClick={() => exportCSV("Produtos")}>
            <Download className="w-4 h-4" /> Baixar CSV
          </Button>
        </div>

        <div className="bg-card border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Relatório de Clientes</h3>
              <p className="text-sm text-muted-foreground">Lista de clientes cadastrados</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 mt-auto" onClick={() => exportCSV("Clientes")}>
            <Download className="w-4 h-4" /> Baixar CSV
          </Button>
        </div>

        <div className="bg-card border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg text-green-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Relatório de Vendas</h3>
              <p className="text-sm text-muted-foreground">Histórico de vendas realizadas</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 mt-auto" onClick={() => exportCSV("Vendas")}>
            <Download className="w-4 h-4" /> Baixar CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
