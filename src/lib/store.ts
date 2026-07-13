import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Produto = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  codigo?: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
};

export type ItemVenda = { produtoId: string; nome: string; quantidade: number; preco: number };
export type Venda = {
  id: string;
  clienteId: string | null;
  clienteNome: string;
  itens: ItemVenda[];
  total: number;
  pagamento: "dinheiro" | "pix" | "cartao";
  data: string;
};

export type Movimento = {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
};

type Store = {
  produtos: Produto[];
  clientes: Cliente[];
  vendas: Venda[];
  movimentos: Movimento[];
  addProduto: (p: Omit<Produto, "id">) => void;
  updateProduto: (id: string, p: Partial<Produto>) => void;
  removeProduto: (id: string) => void;
  reporEstoque: (id: string, qtd: number) => void;
  addCliente: (c: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, c: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
  addVenda: (v: Omit<Venda, "id" | "data">) => void;
  addMovimento: (m: Omit<Movimento, "id" | "data">) => void;
  reset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seedProdutos: Produto[] = [
  { id: uid(), nome: "Camiseta Básica", categoria: "Vestuário", preco: 49.9, estoque: 32, estoqueMinimo: 10 },
  { id: uid(), nome: "Caderno Universitário", categoria: "Papelaria", preco: 24.5, estoque: 120, estoqueMinimo: 20 },
  { id: uid(), nome: "Mouse Sem Fio", categoria: "Informática", preco: 89.9, estoque: 15, estoqueMinimo: 5 },
  { id: uid(), nome: "Café 500g", categoria: "Alimentos", preco: 22.0, estoque: 60, estoqueMinimo: 15 },
  { id: uid(), nome: "Fone Bluetooth", categoria: "Informática", preco: 149.0, estoque: 8, estoqueMinimo: 10 },
];
const seedClientes: Cliente[] = [
  { id: uid(), nome: "Maria Souza", telefone: "(11) 98765-4321", email: "maria@email.com" },
  { id: uid(), nome: "João Pereira", telefone: "(21) 91234-5678", email: "joao@email.com" },
  { id: uid(), nome: "Ana Lima", telefone: "(31) 99999-1111", email: "ana@email.com" },
];

export const useStore = create<Store>()(
  persist(
    (set) => ({
      produtos: seedProdutos,
      clientes: seedClientes,
      vendas: [],
      movimentos: [],
      addProduto: (p) => set((s) => ({ produtos: [{ ...p, id: uid() }, ...s.produtos] })),
      updateProduto: (id, p) =>
        set((s) => ({ produtos: s.produtos.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      removeProduto: (id) => set((s) => ({ produtos: s.produtos.filter((x) => x.id !== id) })),
      reporEstoque: (id, qtd) =>
        set((s) => ({
          produtos: s.produtos.map((x) =>
            x.id === id ? { ...x, estoque: x.estoque + qtd } : x,
          ),
        })),
      addCliente: (c) => set((s) => ({ clientes: [{ ...c, id: uid() }, ...s.clientes] })),
      updateCliente: (id, c) =>
        set((s) => ({ clientes: s.clientes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCliente: (id) => set((s) => ({ clientes: s.clientes.filter((x) => x.id !== id) })),
      addVenda: (v) =>
        set((s) => {
          const venda: Venda = { ...v, id: uid(), data: new Date().toISOString() };
          const produtos = s.produtos.map((p) => {
            const it = v.itens.find((i) => i.produtoId === p.id);
            return it ? { ...p, estoque: Math.max(0, p.estoque - it.quantidade) } : p;
          });
          const mov: Movimento = {
            id: uid(),
            tipo: "entrada",
            descricao: `Venda #${venda.id.slice(0, 6).toUpperCase()} - ${v.clienteNome}`,
            valor: v.total,
            data: venda.data,
          };
          return { vendas: [venda, ...s.vendas], produtos, movimentos: [mov, ...s.movimentos] };
        }),
      addMovimento: (m) =>
        set((s) => ({
          movimentos: [{ ...m, id: uid(), data: new Date().toISOString() }, ...s.movimentos],
        })),
      reset: () =>
        set({ produtos: seedProdutos, clientes: seedClientes, vendas: [], movimentos: [] }),
    }),
    {
      name: "vendio-store",
      version: 2,
      migrate: (persisted: unknown, version) => {
        const state = (persisted ?? {}) as Partial<Store>;
        if (version < 2 && state.produtos) {
          state.produtos = state.produtos.map((p) => ({
            ...p,
            estoqueMinimo: p.estoqueMinimo ?? 5,
          }));
        }
        return state as Store;
      },
    },
  ),
);

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatUnidades = (n: number) => `${n} ${n === 1 ? "unidade" : "unidades"}`;
