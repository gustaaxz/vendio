import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Users,
  ShieldCheck,
  BarChart3,
  ShoppingCart,
  Wallet,
  Check,
  Star,
  MessageCircle,
  Instagram,
  Facebook,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, BrandMark } from "@/components/BrandLogo";
import { scrollToSection } from "@/lib/scroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendio — Sistema de gestão para lojas modernas" },
      {
        name: "description",
        content:
          "Vendio é o ERP simples e profissional para pequenos comércios. Estoque, vendas, clientes, financeiro e vitrine online em um só painel.",
      },
      { property: "og:title", content: "Vendio — Sistema de gestão para lojas modernas" },
      {
        property: "og:description",
        content: "Estoque, vendas, clientes e vitrine online em um só painel. Teste agora.",
      },
    ],
  }),
  component: Landing,
});

const testemunhos = [
  {
    nome: "Carla Menezes",
    loja: "Papelaria Central",
    cidade: "São Paulo, SP",
    estrelas: 5,
    txt: "Antes eu perdia horas contando estoque à mão. Agora vejo tudo do celular em 5 minutos e ainda tenho relatórios prontos no fim do mês.",
    avatarSeed: "carla-papelaria",
  },
  {
    nome: "Roberto Alcântara",
    loja: "Autopeças RB",
    cidade: "Curitiba, PR",
    estrelas: 5,
    txt: "O PDV é absurdamente rápido. Meus funcionários aprenderam a usar no primeiro dia e a fila do balcão sumiu.",
    avatarSeed: "roberto-autopecas",
  },
  {
    nome: "Fernanda Duarte",
    loja: "Bella Boutique",
    cidade: "Belo Horizonte, MG",
    estrelas: 4,
    txt: "Os relatórios mostram exatamente o que vende mais. Cortei produtos parados e aumentei o lucro em 22% em três meses.",
    avatarSeed: "fernanda-bella",
  },
];

const planos = [
  {
    nome: "Básico",
    preco: "49",
    desc: "Para começar a organizar sua loja.",
    features: [
      "Cadastro ilimitado de produtos",
      "Cadastro de clientes",
      "PDV completo",
      "Exportação em Excel, CSV e PDF",
      "1 usuário",
    ],
  },
  {
    nome: "Profissional",
    preco: "99",
    desc: "O plano mais escolhido por lojas em operação.",
    features: [
      "Tudo do Básico",
      "Dashboard com gráficos avançados",
      "Vitrine pública da sua loja",
      "Financeiro completo",
      "Até 3 usuários",
    ],
    popular: true,
  },
  {
    nome: "Premium",
    preco: "149",
    desc: "Para lojas em crescimento acelerado.",
    features: [
      "Tudo do Profissional",
      "Relatórios avançados sob demanda",
      "Integração com Mercado Pago",
      "Usuários ilimitados",
      "Suporte prioritário",
    ],
  },
];

function Landing() {
  const handleAnchor = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" aria-label="Vendio — início">
            <BrandLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#recursos" onClick={handleAnchor("recursos")} className="hover:text-foreground transition">Recursos</a>
            <a href="#planos" onClick={handleAnchor("planos")} className="hover:text-foreground transition">Planos</a>
            <a href="#depoimentos" onClick={handleAnchor("depoimentos")} className="hover:text-foreground transition">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="hidden sm:inline-flex">Entrar</Button>
            </Link>
            <a href="#planos" onClick={handleAnchor("planos")}>
              <Button>Começar agora</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Novo · SaaS de gestão para lojas
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.02]">
              O sistema que sua loja
              <br />
              <span className="gradient-text">merecia ter desde o começo.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Vendio unifica estoque, vendas, clientes, financeiro e vitrine online em um painel bonito
              e rápido. Feito para quem quer profissionalizar o negócio sem complicação.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#planos" onClick={handleAnchor("planos")}>
                <Button size="lg" className="shadow-[var(--shadow-glow)]">
                  Ver planos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Experimentar demonstração
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Sem instalação</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Cancele quando quiser</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Suporte em português</div>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl" />
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-glow)]">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Vendas hoje</div>
                  <div className="mt-1 text-2xl font-bold">R$ 3.420</div>
                  <div className="mt-2 h-1.5 rounded-full bg-primary/20">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Últimos 7 dias</div>
                  <div className="mt-1 text-2xl font-bold">R$ 18.900</div>
                  <div className="mt-2 flex items-end gap-1 h-6">
                    {[40, 55, 30, 70, 45, 80, 60].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-accent/70" />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Top produtos · Jogos</span>
                    <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {[
                      ["Super Mario Bros", 194],
                      ["FIFA 24", 128],
                      ["Zelda TOTK", 96],
                    ].map(([n, q]) => (
                      <li key={n as string} className="flex items-center justify-between">
                        <span>{n}</span>
                        <span className="font-semibold text-primary">{q} un</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Tudo que uma loja precisa em um só lugar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Cadastro, vendas, financeiro, relatórios e vitrine pública — todos os planos incluem
              exportação em Excel, CSV e PDF.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Package, title: "Estoque inteligente", desc: "Alerta automático quando um produto atinge o estoque mínimo. Reponha em um clique." },
              { icon: ShoppingCart, title: "Vendas rápidas", desc: "Registre vendas no balcão ou receba pedidos pela vitrine online da sua loja." },
              { icon: Users, title: "Clientes centralizados", desc: "Histórico completo por cliente, cadastro via email e busca instantânea." },
              { icon: BarChart3, title: "Dashboard completo", desc: "Vendas do dia, dos últimos 7 dias, do mês e ranking de produtos por categoria." },
              { icon: Wallet, title: "Financeiro claro", desc: "Entradas, saídas e saldo em tempo real. Nada de planilha manual." },
              { icon: FileSpreadsheet, title: "Exportação em todos os planos", desc: "Excel, CSV e PDF liberados desde o plano Básico. Sem pegadinha." },
              { icon: ShieldCheck, title: "Seguro e na nuvem", desc: "Seus dados criptografados e acessíveis de qualquer dispositivo, 24/7." },
              { icon: Sparkles, title: "Vitrine pública", desc: "Cada loja ganha um link próprio (vendio.app/sua-loja) para vender online." },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Planos honestos, sem surpresa
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mensal, cancele quando quiser. Sem taxa de instalação. Exportação de relatórios
              inclusa em todos os planos.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {planos.map((p) => (
              <div
                key={p.nome}
                className={`relative rounded-2xl border p-8 ${
                  p.popular
                    ? "border-primary bg-card shadow-[var(--shadow-glow)] scale-[1.02]"
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
                  <span className="text-5xl font-bold tracking-tight">R${p.preco}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block mt-8">
                  <Button className="w-full" variant={p.popular ? "default" : "outline"}>
                    Escolher {p.nome}
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
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Lojistas reais, resultados reais
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mais de 1.200 comerciantes já usam o Vendio para organizar o dia a dia.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testemunhos.map((d) => (
              <figure key={d.nome} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < d.estrelas ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{d.txt}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${d.avatarSeed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf`}
                    alt=""
                    className="h-11 w-11 rounded-full border border-border bg-background"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-medium text-sm">{d.nome}</div>
                    <div className="text-xs text-muted-foreground">{d.loja} · {d.cidade}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Pronto para profissionalizar sua loja?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Comece hoje. Sem cartão, sem burocracia — só resultado.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#planos" onClick={handleAnchor("planos")}>
              <Button size="lg" className="shadow-[var(--shadow-glow)]">
                Escolher meu plano <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </a>
            <Link to="/auth">
              <Button size="lg" variant="outline">Ver demonstração</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <BrandMark size={28} />
              <span className="text-lg">Vendio<span className="text-primary">.</span></span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Sistema de gestão para lojas modernas. Feito no Brasil, com carinho.
            </p>
          </div>
          <div className="flex gap-4 items-start text-muted-foreground">
            <a href="#" aria-label="WhatsApp" className="hover:text-foreground"><MessageCircle className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook className="h-5 w-5" /></a>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vendio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
