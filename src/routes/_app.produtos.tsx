import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatBRL } from "@/lib/utils";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/lib/api/products";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({ meta: [{ title: "Produtos — ShopManager" }] }),
  component: Produtos,
});

const CATEGORIAS = [
  "Acessórios",
  "Alimentos",
  "Automotivo",
  "Bebidas",
  "Brinquedos",
  "Calçados",
  "Casa e Decoração",
  "Eletrônicos",
  "Entretenimento",
  "Esporte e Lazer",
  "Ferramentas",
  "Filmes e Séries",
  "Higiene e Beleza",
  "Informática",
  "Jogos",
  "Livros e Revistas",
  "Móveis",
  "Papelaria",
  "Pet Shop",
  "Quintal e Jardim",
  "Saúde",
  "Vestuário",
  "Outros",
];

type Produto = Database["public"]["Tables"]["products"]["Row"];

function Produtos() {
  const { data: produtos = [], isLoading } = useProducts();
  const { mutateAsync: addProduto } = useCreateProduct();
  const { mutateAsync: updateProduto } = useUpdateProduct();
  const { mutateAsync: removeProduto } = useDeleteProduct();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Produto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = produtos.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()),
  );

  const submit = async (form: FormData) => {
    const data = {
      name: String(form.get("nome")),
      category: String(form.get("categoria")),
      price: Number(form.get("preco")),
      stock: Number(form.get("estoque")),
    };
    if (!data.name || !data.category) return toast.error("Preencha nome e categoria");
    
    setSubmitting(true);
    try {
      if (edit) {
        await updateProduto({ id: edit.id, ...data });
        toast.success("Produto atualizado");
      } else {
        await addProduto(data);
        toast.success("Produto cadastrado");
      }
      setOpen(false);
      setEdit(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar produto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title="Produtos"
        subtitle="Gestão de inventário"
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEdit(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{edit ? "Editar produto" : "Novo produto"}</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(new FormData(e.currentTarget));
                }}
              >
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" defaultValue={edit?.name} required />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select name="categoria" defaultValue={edit?.category || CATEGORIAS[0]}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      defaultValue={edit?.price ?? 0}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estoque">Estoque</Label>
                    <Input
                      id="estoque"
                      name="estoque"
                      type="number"
                      defaultValue={edit?.stock ?? 0}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : edit ? "Salvar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar produto ou categoria..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">Categoria</th>
                <th className="text-right px-4 py-3 font-medium">Estoque</th>
                <th className="text-right px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    Carregando produtos...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        p.stock > 10
                          ? "bg-success/10 text-success"
                          : p.stock > 0
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatBRL(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEdit(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm("Excluir produto?")) {
                            try {
                              await removeProduto(p.id);
                              toast.success("Produto removido");
                            } catch (e: any) {
                              toast.error(e.message || "Erro ao remover produto");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
