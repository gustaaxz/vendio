import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Users,
  ShieldCheck,
  BarChart3,
  ShoppingCart,
  Wallet,
  Check,
  Store,
  MessageCircle,
  Instagram,
  Facebook,
  Bell,
  UserCircle,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopManager — ERP simples para pequenos comércios" },
      {
        name: "description",
        content:
          "Controle sua loja de forma simples e profissional. Estoque, vendas, clientes e financeiro em um único sistema.",
      },
      { property: "og:title", content: "ShopManager — ERP para pequenos comércios" },
      {
        property: "og:description",
        content: "Estoque, vendas e clientes em um único sistema. Teste a demonstração agora.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { session, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            ShopManager
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground transition">Recursos</a>
            <a href="#planos" className="hover:text-foreground transition">Planos</a>
            <a href="#depoimentos" className="hover:text-foreground transition">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => toast.info("Notificações", { description: "Você não possui novas notificações no momento." })} className="text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserCircle className="h-5 w-5" />
                      Minha Conta
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Menu da Loja</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/vendas" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Acessar Painel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/configuracoes" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" /> Editar Conta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer flex items-center gap-2" onClick={() => signOut()}>
                      <LogOut className="h-4 w-4" /> Sair da conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/registro">
                  <Button>Criar conta grátis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> SaaS para pequenos comércios
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Controle sua loja de forma <span className="gradient-text">simples e profissional</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Estoque, vendas e clientes em um único sistema. Feito para mercados, papelarias, lojas
              de roupas, autopeças, assistências técnicas e muito mais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {session ? (
                <Link to="/vendas">
                  <Button size="lg" className="shadow-[var(--shadow-glow)]">
                    Ir para o meu Painel
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/registro">
                    <Button size="lg" className="shadow-[var(--shadow-glow)]">
                      Começar grátis
                    </Button>
                  </Link>
                  <a href="#planos">
                    <Button size="lg" variant="outline">
                      Ver planos
                    </Button>
                  </a>
                </>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Sem instalação</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Acesso em nuvem</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Suporte incluído</div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tudo que sua loja precisa</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Resolvemos 80% dos problemas de uma pequena empresa em um único painel.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Package, title: "Controle de Estoque e Vendas", desc: "Cadastre produtos, controle entradas e saídas com atualização automática a cada venda." },
              { icon: Users, title: "Cadastro de Clientes e Relatórios", desc: "Histórico completo dos seus clientes, com filtros avançados e relatórios dinâmicos." },
              { icon: ShieldCheck, title: "Segurança e Nuvem", desc: "Dados criptografados e acesso de qualquer lugar. Trabalhe do celular ou do computador." },
              { icon: BarChart3, title: "Dashboard e Gráficos", desc: "Métricas em tempo real: vendas do mês, lucro estimado e categorias mais vendidas." },
              { icon: ShoppingCart, title: "PDV Integrado", desc: "Ponto de venda ágil: selecione cliente, produtos, forma de pagamento e finalize." },
              { icon: Wallet, title: "Financeiro", desc: "Controle de entradas, saídas e movimentações. Exportação para PDF e Excel." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Planos que cabem no seu negócio</h2>
            <p className="mt-3 text-muted-foreground">
              Assine mensalmente. Cancele quando quiser. Sem taxa de instalação.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { nome: "Básico", preco: "49", desc: "Para começar a organizar sua loja.", features: ["Cadastro de produtos", "Cadastro de clientes", "Vendas simples", "1 usuário"] },
              { nome: "Profissional", preco: "99", desc: "O plano mais escolhido.", features: ["Tudo do Básico", "PDV completo", "Dashboard + gráficos", "Financeiro", "3 usuários"], popular: true },
              { nome: "Premium", preco: "149", desc: "Para lojas em crescimento.", features: ["Tudo do Profissional", "Relatórios avançados", "Exportação PDF/Excel", "Usuários ilimitados", "Suporte prioritário"] },
            ].map((p) => (
              <div
                key={p.nome}
                className={`relative rounded-2xl border p-8 ${
                  p.popular
                    ? "border-primary bg-card shadow-[var(--shadow-glow)]"
                    : "border-border bg-card shadow-[var(--shadow-soft)]"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Mais popular
                  </span>
                )}
                <h3 className="font-semibold text-lg">{p.nome}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R${p.preco}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/registro" className="block mt-8">
                  <Button className="w-full" variant={p.popular ? "default" : "outline"}>
                    Começar agora
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Quem usa, recomenda</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { nome: "Carla — Papelaria Central", txt: "Antes eu perdia horas contando estoque. Agora controlo tudo do celular em 5 minutos." },
              { nome: "Roberto — Autopeças RB", txt: "O PDV é rápido e simples. Meus funcionários aprenderam a usar em um dia." },
              { nome: "Fernanda — Loja Bella", txt: "Os relatórios me mostram exatamente o que vende mais. Aumentei o lucro em 20%." },
            ].map((d) => (
              <div key={d.nome} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm leading-relaxed">"{d.txt}"</p>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{d.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pronto para organizar sua loja?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Crie sua conta em segundos — 14 dias grátis, sem cartão.
          </p>
          <Link to="/registro" className="inline-block mt-8">
            <Button size="lg" className="shadow-[var(--shadow-glow)]">Criar minha conta</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              ShopManager
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              ERP simples para pequenos comércios. Feito no Brasil.
            </p>
          </div>
          <div className="flex gap-4 items-start text-muted-foreground">
            <a href="#" className="hover:text-foreground"><MessageCircle className="h-5 w-5" /></a>
            <a href="#" className="hover:text-foreground"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="hover:text-foreground"><Facebook className="h-5 w-5" /></a>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShopManager. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
