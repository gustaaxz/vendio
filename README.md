# ShopManager - Plataforma SaaS de Gestão de PDV e Lojas Modernas

Bem-vindo ao repositório oficial e ao manual de engenharia do **ShopManager**. Este documento destina-se a desenvolvedores corporativos, arquitetos de software e engenheiros DevOps que desejam compreender profundamente a arquitetura, as decisões técnicas, a infraestrutura e os padrões de código adotados na construção desta plataforma SaaS (Software as a Service) de frente de caixa (PDV) e gestão comercial empresarial.

O ShopManager não é apenas um projeto básico; é uma plataforma desenhada para escalabilidade horizontal, resiliência de dados e segurança de nível corporativo, entregando tudo isso através de uma interface de usuário ultrarrápida, fluida e com fortes garantias de UX (User Experience).

---

## 📑 Índice Analítico Completo

1. [Visão Geral da Arquitetura do Sistema](#1-visão-geral-da-arquitetura-do-sistema)
2. [Stack Tecnológica e Racionalidade das Escolhas](#2-stack-tecnológica-e-racionalidade-das-escolhas)
3. [Arquitetura de Banco de Dados e Paradigma Multi-Tenancy](#3-arquitetura-de-banco-de-dados-e-paradigma-multi-tenancy)
4. [Dicionário de Dados e Tipagem do Banco (DDL)](#4-dicionário-de-dados-e-tipagem-do-banco-ddl)
5. [Segurança no Banco: Row Level Security (RLS) Detalhado](#5-segurança-no-banco-row-level-security-rls-detalhado)
6. [Mecanismos de Integração de Pagamentos (Mercado Pago)](#6-mecanismos-de-integração-de-pagamentos-mercado-pago)
7. [Arquitetura Serverless (Deno Edge Functions)](#7-arquitetura-serverless-deno-edge-functions)
8. [Estrutura de Roteamento Baseada em Arquivos (TanStack Router)](#8-estrutura-de-roteamento-baseada-em-arquivos-tanstack-router)
9. [Gerenciamento de Estado, Contextos React e Cache Global](#9-gerenciamento-de-estado-contextos-react-e-cache-global)
10. [Design System, UX e Acessibilidade (Shadcn/UI & Tailwind)](#10-design-system-ux-e-acessibilidade-shadcnui--tailwind)
11. [Componentes Funcionais Detalhados da Camada de Visualização](#11-componentes-funcionais-detalhados-da-camada-de-visualização)
12. [Estratégia de Empacotamento, Pipeline de Deploy e CI/CD (Vercel)](#12-estratégia-de-empacotamento-pipeline-de-deploy-e-cicd-vercel)
13. [Workflow e Arquitetura Absoluta de Diretórios (Codebase Map)](#13-workflow-e-arquitetura-absoluta-de-diretórios-codebase-map)
14. [Roadmap Técnico e Expansões Modulares Futuras](#14-roadmap-técnico-e-expansões-modulares-futuras)
15. [Guia do Desenvolvedor (Setup Local Extensivo)](#15-guia-do-desenvolvedor-setup-local-extensivo)
16. [Testes, Manutenção e Boas Práticas Estritas de Tipagem](#16-testes-manutenção-e-boas-práticas-estritas-de-tipagem)

---

## 1. Visão Geral da Arquitetura do Sistema

O **ShopManager** foi meticulosamente projetado seguindo uma arquitetura hipermoderna e baseada no paradigma *Serverless* e *Jamstack*. Em vez de depender de um backend monolítico tradicional (como Node.js rodando Express, Django ou Laravel em contêineres e instâncias EC2 da AWS sujeitas a *idle time* e quebras verticais de escala), nós aproveitamos totalmente o ecossistema maduro do **Supabase** como nosso Backend-as-a-Service (BaaS). Isso reduz drasticamente a latência de infraestrutura, elimina custos ociosos na nuvem e retira a esmagadora complexidade do gerenciamento de DevOps.

A aplicação frontend atua como uma *Single Page Application* (SPA) agressivamente otimizada, totalmente renderizada do lado do cliente (Client-Side Rendering) e empacotada através do bundler ultra-rápido **Vite**. A maior parte da renderização (Virtual DOM Diffing) ocorre na máquina cliente (browser), poupando carga de servidor.

Toda a comunicação com a camada de persistência de dados (Banco de Dados) é feita via chamadas seguras para a API RESTful exposta pelo Supabase. Essa API não é escrita por nós de forma manual; ela é gerada dinamicamente e automaticamente através da poderosa ferramenta **PostgREST** no momento em que construímos nossas tabelas no Postgres, usando introspecção de *schema*.

O modelo de negócio da ferramenta opera como um **B2B SaaS Multi-Tenant** (Business-to-Business, Software as a Service, Múltiplos Inquilinos). Nesse paradigma, clientes corporativos muito distintos (uma farmácia e uma loja de roupas) compartilham a mesma instância subjacente do banco de dados relacional. Contudo, os dados são impenetravelmente isolados uns dos outros através de políticas em nível de motor de banco (Row Level Security). O sistema "sabe" criptograficamente quem você é e filtra tudo silenciosamente.

---

## 2. Stack Tecnológica e Racionalidade das Escolhas

A seleção da stack não foi feita baseada em "hypes" ou tendências efêmeras, mas sim baseada em produtividade real, previsibilidade, estabilidade de tipagem e manutenibilidade a longo prazo (para os próximos 5 anos de vida útil mínima do código).

### 2.1. Frontend Core Engine
- **React 18:** O motor de renderização primário de interface gráfica. Foi selecionado por seu ecossistema que não tem igual na indústria web hoje. As melhorias do Concurrent Mode, as transições automáticas de render e os hooks nativos fornecem o balanço perfeito de flexibilidade e poder.
- **TypeScript (Strict Mode):** Utilizado em exatos 100% da base de código do ShopManager. O uso estrito de tipagem estática elimina virtualmente categorias inteiras de bugs de *runtime* (como o infame `TypeError: undefined is not a function`). Refatorar componentes globais não é uma aposta cega, o compilador indica exatamente onde a mudança afetou o restante da árvore do app.
- **Vite:** O bundler Rollup/Esbuild escolhido para substituir permanentemente o Webpack antigo e o CRA (Create React App). Oferece *Hot Module Replacement* (HMR) quase na casa dos milissegundos localmente, tornando o tempo de feedback de desenvolvimento absurdamente rápido, e um tempo de build para produção altamente otimizado por via de code splitting otimizado.

### 2.2. Ecossistema de Roteamento e Estado
- **TanStack Router:** Substituiu por completo o uso obsoleto do React Router DOM tradicional. O TanStack Router inova fornecendo roteamento baseado na estrutura rígida de arquivos (pasta `routes/`), similar ao Next.js, mas mantendo a leveza de uma SPA sem Server-Side Rendering (SSR). Ele é *Fully Type-Safe*. Se um programador escrever acidentalmente um link para `/produts` no JSX, o TypeScript bloqueará toda a compilação.
- **React Context API Nativo:** Gerenciador de dependência global utilizado esparsamente (mas eficientemente) apenas para o estado que permeia o aplicativo inteiro, que é unicamente o **Estado de Autenticação** e os **Metadados da Organização logada**. Optamos por não usar Redux, Zustand ou MobX porque dados de servidor em cache local (Server State) não precisam de stores globais complexas, e o estado de UI local é resolvido localmente.

### 2.3. Estilização, Componentização e Design Engine
- **Tailwind CSS (v3+):** Framework CSS do tipo *utility-first* adotado primariamente para uma construção ágil e limpa da UI, evadindo completamente do paradigma de separação por arquivos (CSS Modules ou arquivos .css enormes sem escopo limpo).
- **Radix UI Primitives:** Fornece o esqueleto lógico da UI para coisas extremamente complexas no DOM (Modais Acessíveis focados no teclado, Menus Dropdown que respeitam *focus traps*, *Popovers* que não saem da tela). Radix lida com as mecânicas, não tem CSS próprio.
- **Shadcn/ui:** É a ponte mágica do nosso UI. Ao invés de uma biblioteca engessada como o MUI ou AntDesign (que adicionam dependências gigantescas via NPM), nós usamos os componentes da Shadcn. Copiamos o código-fonte base dos botões e tabelas e os inserimos na nossa pasta `components/ui`. Assim, temos propriedade total de 100% do comportamento visual e lógico, utilizando Tailwind.
- **Lucide React:** Uma bifurcação mantida e amplamente otimizada do Feather Icons. Leve e carregada dinamicamente por nome.

### 2.4. Backend e Data-Tier (Supabase)
- **Supabase Core:** Uma verdadeira infraestrutura "Firebase-Alternative" baseada exclusivamente em padrões abertos e *open-source*. É composto por serviços separados orquestrados juntos.
- **PostgreSQL 15:** Provavelmente o motor relacional mais confiável e testado do planeta. Utilizado porque a integridade relacional entre um Pedido (Sale), e seus Itens (Products) precisa ser garantida em nível transacional forte (ACID compliance).
- **Supabase Auth (GoTrue):** Um fork do projeto do Netlify escrito em Go que emite e valida JWTs (JSON Web Tokens) criptograficamente seguros para os usuários. Ele tem ligação direta com as colunas do PostgreSQL.
- **Deno Edge Functions:** Em vez de usar servidores AWS Lambda pesados em Node.js com cold-starts demorados (de 2 a 3 segundos), usamos instâncias do v8 no Deno rodando globalmente na "borda" (CDN de funções) que ligam em menos de 50 milissegundos. Ideal para integrações relâmpago de pagamento, webhooks e manipulação paralela sem trancar a API.

---

## 3. Arquitetura de Banco de Dados e Paradigma Multi-Tenancy

O desenvolvimento corporativo SaaS tem várias ramificações para a segregação de inquilinos (Tenants).
- A abordagem **Database-per-Tenant** (Um banco de dados completo para cada lojista) foi brutalmente descartada porque, apesar de ultra-segura, impossibilita gerenciar 10.000 lojas e custa uma fortuna em overhead de infraestrutura RDS.
- A abordagem **Schema-per-Tenant** também não atende nossa necessidade porque as migrações no backend precisariam iterar milhares de esquemas sempre que o time de engenharia decidisse adicionar uma coluna simples (como `logo_url`).
- Portanto, abraçamos e aperfeiçoamos o método **Pool-Tenant Architecture**.

O *Pool-Tenant* (Banco Único Compartilhado) significa que todos os dados de vendas da "Loja do João" e da "Loja da Maria" dormem confortavelmente misturados na mesmíssima tabela física `sales` no disco de memória do Postgres.
Como evitamos a catástrofe de dados vazados? Como evitamos a mescla?
Através do uso rígido e absoluto da chave estrangeira universal `org_id` em toda e qualquer tabela de negócios, atrelada à Segurança de Linha de Baixo Nível (que explicaremos abaixo no Tópico 5).

---

## 4. Dicionário de Dados e Tipagem do Banco (DDL)

Cada entidade no banco tem um significado pragmático na lógica do PDV. O esquema relacional obedece às regras formais de normalização até a terceira forma normal (3NF), exceto em cenários de relatórios consolidados onde desnormalizamos pontualmente por performance pura.

### Tabela Raiz: `organizations`
Esta não é a tabela de usuários (pessoas), é a tabela da empresa em si. A conta matriz.
- `id` (UUID Primary Key): Identificador matemático infalsificável.
- `name` (String): O nome fantasia ex: "Schroeder Games".
- `plan` (Enum): `basico`, `profissional`, `premium`. Determina o pacote de features que o Frontend libera de forma seletiva no código-fonte.
- `plan_status` (Enum): `active`, `past_due`, `cancelled`, `trial`. Variáveis atualizadas automaticamente pelo webhook de pagamentos do Mercado Pago.
- Campos de Perfil de Loja: `address`, `phone`, `email`, `support_faq`, `logo_url`. Utilizados na renderização do aplicativo do lado do consumidor final e nas Configurações da Dashboard.

### Tabela de Vínculo Pivot: `org_members`
Resolve o fato de que um usuário dono de uma empresa pode ser gerente na empresa do amigo sem criar dois logins para a mesma pessoa. O usuário loga, escolhe em qual `organization` vai trabalhar com base no seu `role`.
- Relaciona o `user_id` único do Supabase Auth com o `org_id` da Organização pai.
- O campo vital `role` (Papel Funcional) é um texto ENUM que limita acessos em nível lógico. Os três pilares de acesso implementados são: `owner` (Acesso Master), `admin` (Edição avançada), `cashier` (Uso do PDV).

### Tabelas de Regra de Negócio (Domínio do PDV)
As tabelas centrais da ferramenta que lidam com as funções principais de comércio varejista:
- **Tabela `products`:** Cuida do inventário. Tem controle da quantidade física alocada de `stock`, preço final de venda `price`, e taxonomias como `category` e identificadores como `code` (SKU).
- **Tabela `customers`:** Uma caderneta virtual de relacionamento CRM básico, vinculando perfis comprando recorrentemente.
- **Tabela `sales`:** Atua como "cabeçalho da compra". Não carrega itens, mas marca um total final transacionado e atrela o timestamp da venda e o cliente associado.
- **Tabela `transactions`:** Fluxo de caixa detalhado (Cash Flow). Cada entrada de uma Venda reflete num Input positivo. Permite que o painel financeiro debite custos paralelos, retiradas do caixa e exiba a margem analítica de lucros.

---

## 5. Segurança no Banco: Row Level Security (RLS) Detalhado

O coração, o pulmão e o cérebro da segurança cibernética do ShopManager não estão limitados às checagens do Frontend (que podem ser hackeadas no Console do Chrome) nem ao backend middleware clássico (que tem vulnerabilidades a Injeção de SQL). Nós utilizamos o **Row Level Security (RLS)** em tempo de execução no *Database Engine*.

No Postgres com RLS ativado, uma query escrita livremente por um atacante de fora (ex: `SELECT * FROM sales`) é silenciosamente interceptada e o Postgres a reescreve atrelando condições obrigatórias. 

### Exemplo de Estratégia de Bloqueio em Tabela:
Se um Usuário A (Dono da loja 1) tentar buscar dados globais, a Política associada à Tabela "Produtos" atua da seguinte maneira, escrita no próprio banco:

```sql
CREATE POLICY "Permite que membros apenas da loja leiam os dados"
  ON public.products FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members 
      WHERE user_id = auth.uid() -- Aqui, auth.uid() é avaliado usando a secret do JWT (Não adulterável)
    )
  );
```

**Como Funciona Na Prática:**
O usuário emite o JWT enviado da interface Client-Side (React). A API do Supabase decodifica o JWT usando as chaves master privadas do Deno e envia variáveis transacionais locais ao PostgreSQL via um Contexto Local. A função `auth.uid()` intercepta esse identificador nativo e então permite que o SQL só traga e entregue a resposta da rede JSON contendo as chaves pertinentes exclusivamente às linhas que passaram no `USING` clause de segurança. Zero margem para *Cross-Tenant Data Leaks*.

### Resolução de Recursões Complexas
É notório que consultar a tabela de membros enquanto avalia quem pode ler a tabela de membros resulta em um Erro Recursivo (Infinite Loop 42710 / 500 error). 
Para a tabela `org_members` em específico, nossa engenharia não passa pelo `org_id IN ()`, mas simplifica a leitura da segurança diretamente contra o perfil isolado de chave:
```sql
CREATE POLICY "Membros veem seus próprios vínculos"
  ON public.org_members FOR SELECT
  USING (user_id = auth.uid());
```
Garantindo performance com carga O(1) e segurança O(N).

---

## 6. Mecanismos de Integração de Pagamentos (Mercado Pago)

Toda plataforma SaaS necessita de um fluxo constante, confiável e automatizado de conversão de clientes Free (Trial) em clientes Premium pagos. A arquitetura de monetização acoplada nativamente via Edge Functions foca no checkout da multinacional **Mercado Pago** (LatAm).

### O Fluxo da Transação de Assinatura (Checkout Automático)
1. O Lojista clica no botão "Assinar Plano de R$49,90" diretamente de seu dashboard (em `_app.planos.tsx`).
2. O Client-Side React não se comunica de modo inseguro diretamente com o Mercado Pago. Ele emite um `HTTP POST` protegido via Auth Bearer Token (da própria sessão) direcionado à **Edge Function `create-checkout`**.
3. A Edge Function autenticada levanta do cofre global de ambiente de produção (Vault) a `MERCADO_PAGO_ACCESS_TOKEN`.
4. Ela monta um JSON de *Checkout Preference* estrito com as descrições de plano, valor total fechado e os URLs de retorno pós-pagamento. Crucialmente, ela anexa o ID organizacional de nossa base nos campos de `external_reference` do payload gerado da plataforma terceira para manter rastreio bidirecional entre Sistemas Diferentes (Supabase x MP).
5. O link de Sandbox/Production *Init_Point* é retornado, a promessa React é finalizada, e nós redirecionamos programaticamente o fluxo completo do *window.location* com um loading amigável.

### A Concretização via Webhook Assíncrono Ininterrupto
Quando o banco emissor do cartão finaliza e processa os dados (o que pode demorar até dois dias em caso de Boleto):
1. O robô do Mercado Pago dispara um `HTTP POST` notificador na nossa nuvem contra nossa Function Webhook Externa (URL de notificação IPN).
2. Nossa Função levanta um mecanismo `HMAC` (Assinatura baseada em Hash) avaliado nativamente nas assinaturas dos *Headers* e valida. Não há espaço para intrusões.
3. Se o Pagamento diz `status: "approved"`, cruzamos o ID retornado contra a coluna atrelada.
4. O Backend então inicia o módulo `supabase.auth.admin` operando num perfil interno apelidado de `Service Role` que ignora por completo o Row Level Security de bancos, aplicando uma atualização imediata para as linhas de organização colocando-a como `"plan_status": "active"`.
5. No exato instante da atualização, se o lojista já estivesse tentando recarregar o Frontend do PDV barrado por inadimplência, a rechecagem do `useAuth()` capturará sua liberação do banco em milissegundos sem *cache misses*.

---

## 7. Arquitetura Serverless (Deno Edge Functions)

Nossas funções não hospedam Node.js tradicional por um motivo: Pesos gigantescos de contêineres Docker alocando processador esperando requests passivamente. O Ecossistema Deno via V8 Isolates cria lógicas serverless puras:
As nossas duas pastas principais ficam alojadas localmente em:
```bash
supabase/functions/create-checkout
supabase/functions/mp-webhook
```
Elas utilizam TS nativo sem a necessidade de um *package.json* em subpastas, graças à importação baseada em URL do sistema revolucionário do Deno, mantendo os pesos das bibliotecas do SDK do Supabase ultra leves importadas diretamente das CDNs esm.sh. 

---

## 8. Estrutura de Roteamento Baseada em Arquivos (TanStack Router)

Lutamos ativamente contra as raízes baseadas na configuração complexa de Rotas baseadas em Arrays e Configurações pesadas JSX utilizadas em anos passados no ecossistema Web (React Router v5, etc). O ShopManager consolida a nova tendência global usando o *TanStack Router* (Da famosa família TanStack).

### Mapeamento Direto do Arquivo Base
O projeto se auto descobre lendo nomes de extensões.
- **Root (`__root.tsx`)**: O componente superior e inflexível da arquitetura de navegação. Ele contém ferramentas de layout de ordem global. Nele nós residimos as declarações invisíveis que afetam globalmente o sistema (Por exemplo, o gerenciador de mensagens toast globais, ferramentas dev e providers base).
- **Redirecionamentos Lógicos Index (`index.tsx`)**: A Raiz absoluta (`/`). Atua não como uma Landing Page, mas como um guarda de trânsito em um entroncamento (*Switch Redirector*): O usuário já logou? Envie-o discretamente sem flicker de tela para `/vendas`. Não logou? Jogue-o para `/login`.
- **Aninhamento Padrão por Sintaxe de Layout (`_app.tsx`)**: A presença essencial da sublinha minúscula `_` designa uma Rota sem URL, apenas provendo Layout e aninhamento. Ela envelopa o conteúdo central na *Sidebar* Principal com ícones e o Header fixo de navegação.
- **Páginas de Funcionalidades Subsequentes**: O `_app.produtos.tsx` traduz implicitamente para o layout ser acionado `/produtos`. O sistema faz injeções dessas sub-telas na Tag vazia chamada `<Outlet />` na camada principal sem renderizar a SideBar em toda troca, resultando no carregamento assombrosamente rápido (apenas as tabelas refazem as requisições *diffing*).
- **Geração Mágica (`routeTree.gen.ts`)**: Para fechar a magia da Tipagem. A CLI silenciosa no modo dev varre arquivos e escreve no `routeTree`. Qualquer chamada `navigate({ to: "/prdtus"})` acusaria erro imediato em qualquer lugar do projeto. Total confiança e paz mental na escala de código.

---

## 9. Gerenciamento de Estado, Contextos React e Cache Global

Decisão Arquitetônica: Abstenção proposital de Redux, MobX, Contextos Massivos aninhados em *Provider Hells*. 
Nossa estratégia é pautada na Localidade do Estado e Isolamento de Informações Compartilhadas.

### O Contexto Base: Autenticação Segregada
O principal e quase único estado que deve ser injetado nas veias de todas as raízes do app está abrigado isoladamente no arquivo `src/lib/auth.tsx`.
Este *React Context Provider* executa toda a dança de busca do Usuário e dos dados aninhados da Empresa associada à sua conta em um fluxo contínuo e síncrono da interface.

1. Instanciação Oculta de Listeners de Eventos Supabase `onAuthStateChange`. Se a chave mudar para 'SIGNED_OUT' (Por inatividade ou expiração remota) o Token cai.
2. Com um token ativo em mãos, fazemos paralelismo lógico `Promise.all` acionando 3 *fetchs* cruzados. Capturamos o perfil org_members do cliente e todas as informações essenciais de metadados das permissões organizacionais.
3. Isso provê aos demais milhares de sub-componentes (no estilo hook puro `const { organization, role } = useAuth()`) toda e absoluta certeza de quem eles estão rendendo visualização na UI sem ter de puxar e polular isso repetidamente com novos chamados ao backend a cada visualização local (Diminuindo as cotas gastas nos servidores e banda de download do frontend).

---

## 10. Design System, UX e Acessibilidade (Shadcn/UI & Tailwind)

Não dependemos de bibliotecas genéricas (Boostrap/Materialize) antigas. Optamos pela arquitetura moderna Baseada na Abstração de Classes através do **Tailwind CSS**. A camada lógica subjacente do Design System é construída inteiramente através das ferramentas do ecossistema do **Shadcn/UI**.

### Princípios Base da Filosofia da Interface
- **Estética Ultra Premium Base HSL:** Eliminamos as cores primitivas (e.g. hex #FF0000) de dentro do CSS direto e portamos tudo no `index.css` global como variáveis de espectro cromático CSS formatados como `hsl(var(--background))` de modo que no exato milissegundo que acionarmos o Dark Mode, a reversão de paleta de luz afeta 100% da visualização automaticamente. Esteticamente superior com efeitos sutis tipo *Glassmorphism*.
- **Tailwind-Merge e CVA (Class Variance Authority):** Como evitamos poluir arquivos de componentes reutilizáveis base (Os arquivos dentro de `src/components/ui/*.tsx`)? Usando bibliotecas secundárias como o `clsx` atrelado ao `twMerge`. Nós unimos lógicas complexas condicionais com segurança sem ter que lidar com "Conflitos de Classe" indesejados quando se injetam propriedades nas renderizações por Props. O CVA permite separar Botões entre variações perfeitamente desenhadas `variant: "outline" | "ghost" | "destructive"` unindo design com engenharia fortemente tipada sem *inline-styles* macarrônicos.

### Ferramenta Pragmática de Acessibilidade: AccessibilityToolbar.tsx
Trata-se de um botão flutuante e dinâmico isolado globalmente no Layout `_app`. Não intrusivo, exibe um painel tipo *Sheet Panel/Drawer* deslizando suavemente pela borda direita que implementa ações avançadas baseadas em interações de alto nível do PDV, pensadas especificamente para ambientes estressantes no varejo físico.
- **Temas & Contrastes Visuais:** Alívio imediato no brilho intenso de telas corporativas que não desligam durante 8h. Alto Contraste para lojistas de baixa capacidade acuidade visual. Fontes customizadas no dom com classes `.text-xl` readequadas em todo lugar.
- **Privacidade Operacional (Hide Money Values):** Funcionalidade específica que converte e oblitera o rendimento de cifras faturadas (`R$ ****`) da Dashboard financeira quando o caixa opera fisicamente próximo ao seu cliente em quiosques não protegidos. 
- **Utilities Produtivas de Baixo Atrito:** Mini Calculadora em overlay nativa sem forçar troca de telas por aplicativos embutidos de OS, provendo total rapidez de fluxo em uma plataforma *web-only*. Bloco rápido e limpezas profundas no `LocalStorage/Cookies` locais previstos num botão destrutivo contra cache corrompido global do site hospedado no hardware frágil.

---

## 11. Componentes Funcionais Detalhados da Camada de Visualização

1. **Gestor de PDV Rápido (Vendas de Front-End Rápido - `_app.vendas.tsx`):**  O balcão de vendas de linha de frente. Substituímos interações modais bloqueantes, menus de dropdown de cliques em favor de uma interface de listagem em Greha Limpa, onde toques rápidos ativam empilhamentos do carrinho dinâmico no painel direito. Foco puro e absoluto em UI transacional fluida, maximizada para tempos de uso contínuo de cliques diretos em monitores touch.
2. **Dashboard de Resumo Financeiro (`_app.financeiro.tsx`):** Tela de ingestão da alta direção, estruturada em blocos modulares (`Cards`). Resumo totalizado, agregação de saídas/entradas. Feita a arquitetura prevendo que a inteligência artificial ou cálculos matemáticos na SQL da Nuvem processe a soma para retornar o balanço, preservando a RAM fraca dos tablets ou computadores Celeron frequentemente instalados nestes cenários.
3. **Painel Base de Configurações Organizacionais (`_app.configuracoes.tsx`):** Módulo de controle unificado para administração da "Loja". Usa arquitetura base de separação por abas *Tabs*, injeta edições assíncronas do perfil local e reflete os salvamentos nos bancos e recarrega os stores de Redux globais, fazendo o painel mudar de nome (Personalizando `Sidebar` global em real-time e com notificação nativa da biblioteca `Sonner`).
4. **Relatórios Baseados em CSV Puro (`_app.relatorios.tsx`):** Painéis dedicados ao tráfego denso de informações. Como a ferramenta visa facilitar os lojistas, desenhamos de forma simplificada as integrações de extração de tabelas massivas de vendas usando transformadores brutos via javascript de Data-Blobs diretamente acopladas num Botão Unificado. Nenhum *File System* temporário rodando na nuvem gerando relatórios de memória com custos altos, a serialização crua dos nós do postgres trafegam à formatação local no Browser com máxima eficácia.

---

## 12. Estratégia de Empacotamento, Pipeline de Deploy e CI/CD (Vercel)

Esta infraestrutura exclui virtualmente todo e qualquer processo complexo de Jenkins, NGINX em contêineres e configurações SSH de VPS tradicionais e lentas por parte de nossa infraestrutura. 

1. **Build Tooling Ultra Leve:** Nosso script `npm run build` instrui nativamente a plataforma Vite para engatilhar as funções compiladoras do RollupJS e minificadores puros SWC em Rust. Essa arquitetura varre dependências mortas por processo de "Tree Shaking" (Dessa forma, importar só dois ícones do Lucide Library não embute 2 megabytes do repositório final de produção de maneira ineficiente).
2. **Deployment Nativo e Rules Redirecionadoras com a Vercel:** O projeto encontra-se espelhado, hospedado, roteado em Edge global network na infraestrutura unificada da provedora **Vercel**. Todo commit aceito via `git push origin main` ativa a *Pipeline de Continual Integration (CI)* interna deles que testará processos, construirá assets otimizados (chunk hashing e gzipping), invalidará cache das bordas de DNS globais, subirá nossa versão e disponibilizará. O arquivo isolado `vercel.json` implementa o mecanismo imperativo crucial base para Single Page Apps (SPA) - "SPA Fallback Catch All", direcionando qualquer requisição *Deep-Linked 404* como `/clientes` que passaria fora do servidor e falharia para diretamente reentrar ao nosso `index.html` injetando a raiz original em 200 (Success) onde a lógica do pacote reasume as rotas localmente pela via React Router interna do dom.

---

## 13. Workflow e Arquitetura Absoluta de Diretórios (Codebase Map)

O organograma estrutural e arquitetônico de engenharia adotado evita a confusão, permitindo que a navegação do código dezenas de desenvolvedores mantenhamos escopos ultra limpos no projeto central modular do Front-End React.

```text
📦 shopmanager-project
 ┣ 📂 src                    # Repositório Absoluto Principal.
 ┃ ┣ 📂 components           # Elementos Atômicos reutilizáveis base (Sem escopo da página global).
 ┃ ┃ ┣ 📂 ui                 # Primitivos modulares (Inputs, Tabelas, Cards) acoplados da CLI de Shadcn/UI com CVA CSS.
 ┃ ┃ ┗ 📜 AccessibilityToolbar.tsx # Agregação de Componente de Sistema de Ferramentas Funcional Complexo (Sidebar).
 ┃ ┣ 📂 lib                  # Sub-arquitetura Lógica Abstrata e Centralização de Serviços Puros Globais.
 ┃ ┃ ┣ 📜 auth.tsx           # Contexto React gerenciador de escopo lógico (Gerência do JWT).
 ┃ ┃ ┣ 📜 database.types.ts  # Dicionário absoluto do TypeScript derivado 100% de Autogeração DDL Supabase Types.
 ┃ ┃ ┣ 📜 supabase.ts        # Client Estático Singleton e Singleton Memory Instance Exporters do Cliente Supabase Padrão.
 ┃ ┃ ┗ 📜 utils.ts           # Utilities independentes de Contextos do Tailwind (clsx e tailwind-merge helper function `cn()`).
 ┃ ┣ 📂 routes               # Controladores Funcionais de Visualização de Rotas baseadas no TanStack.
 ┃ ┃ ┣ 📜 __root.tsx         # Template Global Master Oculto de UI (Injeção de Bibliotecas, Providers Centrais).
 ┃ ┃ ┣ 📜 _app.tsx           # Layout Sub-Root de Logged Users em Nuvem de Envelopamento Estático (Sidebar de Menus Básicos).
 ┃ ┃ ┣ 📜 _app.configuracoes.tsx # Modulo Central de Parametrizações do Dashboard Loja X.
 ┃ ┃ ┣ 📜 _app.financeiro.tsx# Módulo Estático de Fluxos Globais, Analise Descritiva Agregada de Capital Físico.
 ┃ ┃ ┣ 📜 _app.planos.tsx    # Portal Baseado de Upgrade Direcionado à Funções de Checkout.
 ┃ ┃ ┣ 📜 _app.produtos.tsx  # Visão Analítica Estrutural Centralizada de Listagens e Inventário (CUD CRUD).
 ┃ ┃ ┣ 📜 _app.relatorios.tsx# Gerador e Empacotador Client-side Formatter puro, em Blob CSV p/ Downloads assíncronos.
 ┃ ┃ ┣ 📜 _app.vendas.tsx    # Front de Pontos de Terminais Otimizados sem bloqueios.
 ┃ ┃ ┣ 📜 _auth.login.tsx    # Interface de Despacho Público Autenticador Base Seguro de Logins por e-mail Auth Pass.
 ┃ ┃ ┣ 📜 _auth.registro.tsx # Base Complicada Assíncrona Pública e Sub-Inserção Paralela para criação base (Múltipla em Triggers de Auth).
 ┃ ┃ ┗ 📜 index.tsx          # Switch Condicional em Cascatas - Encaminha Logados a PDV, não Logados a Painel Login.
 ┃ ┣ 📜 main.tsx             # Arquivo Ponto Zero do Dom Document. Aciona a renderização de instâncias das configurações básicas.
 ┃ ┣ 📜 routeTree.gen.ts     # Código Gerado Dinamicamente do compilador. JAMAIS alterar em hipótese de trabalho (Type-Gen Engine).
 ┃ ┗ 📜 index.css            # Folhas de Cascata Globais, Ponto Físico Ponto de Inicializações Tailwind At @layers em raízes HSL Token.
 ┃
 ┣ 📂 supabase               # Área Absoluta de Backend.
 ┃ ┣ 📂 functions            # Serviços Serverless e Edge Runtime (Arquitetura sem Servidor, instâncias Deno Runtime Modules via ESM-imports).
 ┃ ┃ ┣ 📂 create-checkout    # Middleware Proxy Lógico Injetando MercadoPago Bearer Secret-keys protegidas contra o navegador vulnerável.
 ┃ ┃ ┗ 📂 mp-webhook         # Ouvinte de Eventos IPN (Listen-Webhooks). Bypassa segurança do RLS internamente para promover Upgrades Administrativos via Supabase Internal Admin SDK.
 ┃ ┗ 📂 migrations           # Arquivos Versionados de Trilha de DDL (Linguagem Lógica e Políticas e Gatilhos de Triggers Auto-Atuáveis RLS DB Schema).
 ┃   ┣ 📜 001_initial_schema.sql         # A Migração Raiz-Gênese. Estabelece Modelagem Atômica e Policies rígidas de Isolamento Mútuo Corporativo O(n).
 ┃   ┗ 📜 002_add_org_profile_fields.sql # AlterTable iterativo subjacente expandindo sem interromper transações nativas as lógicas (Agilidade pura SQL Alter Table).
 ┃
 ┣ 📜 tailwind.config.js     # Configurações de Variáveis de CSS (Custom colors, Breakpoints de Responsividades Globais unificadas de Front-end Design base e Animações Extend).
 ┣ 📜 vite.config.ts         # Parâmetros de transpilação avançada para VITE, acoplando resolvedores puros Node para "Pathing Alises (e.g. `@/`).
 ┣ 📜 vercel.json            # Diretivas de CDN globais, rotas coringa, headers de controles customizados unificados e cache max age rewrite behavior em borda Serverless.
 ┣ 📜 tsconfig.json          # Arquitetura Extensiva estrita e complexa validando sintaxes, JSX modes e Módulos do TS, suprimindo o Any padrão generalista.
 ┗ 📜 package.json           # Manifesto Central e Base unificada do Módulo. NPM engine dependency-locking exato de versões estáveis imutáveis (Locked Trees, Hooks, Scripts Dev).
```

---

## 14. Roadmap Técnico e Expansões Modulares Futuras

O ShopManager foi arquitetado mantendo preceitos lógicos abertos de flexibilização (*Open-Closed Principle*) previstos pela nossa escalabilidade modular base, permitindo integrações incrivelmente vastas e iterativas em *Sprints* contínuos de desenvolvimento (Pós-V1) abrangendo implementações estruturais que requerem alto avanço:

### Expansões Estruturais - Nível 1 (Curto Prazo e Análises Visuais)
- **Implementação Visual de Gráficos Nativos BI:** Adição orgânica da biblioteca robusta e especializada *Recharts* para alimentar, visualizar, agregar métricas volumosas diretamente em interfaces vetoriais temporais (Ex: Vendas da Tarde em comparação Mensal de Sazonalidade), convertendo painéis simples da V1 para ferramentas completas essenciais para a inteligência profunda empresarial em tempo real analítico corporativo.
- **Integração Plena de Scanners Hardware de Automação Comercial Físicos:** Criações de *Event Listeners React Root Global Hooks* que identificam, processam entradas de velocidade ultra-sônicas providas por canhões de Leitura Laser Físicas 1D/2D EAN de balcão (As quais o Sistema Operacional local simula como inputs rápidos unificados de teclados paralelos escondidos) acionando, em qualquer escopo que foque a tela sem usar inputs diretos visíveis text-boxes, automações lógicas pesadas visando zero paradas na Esteira (Pipeline) Operacional Direta do Caixeiro.

### Automações Estruturais - Nível 2 (SaaS Inteligente Médio Prazo Faturador e Cobranças Assíncronas Administrativas Recorrentes Contínuas)
- **Processos de Faturamento Legal Fisco-Governamentais (NF-e/NFC-e XML Emissor Contínuos):** Acesso às API de credenciamento terceirizadas e estaduais unificadas fiscais brasileiras remotamente hospedadas fora de escopo complexos do app, rodando através de Arquitetura paralela isolada escalável de instâncias assíncronas separadas (*Serverless Queues / Batch Scheduling Cron-job Workers Background Threads* Supabase Integrations). Gerar, formatar certidões em fila e disparar lote consolidado fiscal no término contábil do fechamento diário noturno automatizado Z ou X Z-reads do Caixa.
- **Trilhas Profundas Financeiras de Status Mapeados Bidirecional Stripe/MercadoPago Global Recorrências:** Extensão total dos escopos abrangentes do endpoint Serverless no `mp-webhook` (Lógica atual de processamento restrito ao Approved). Lidar organicamente em escopos isolados contra falhas técnicas sistemáticas financeiras reais do banco (Declined Card, Chargebacks/Fraud Blocks suspeitosos de operadoras e Expiração temporal contratual inativa de Billing Plan Subscriptions) disparando eclesialmente sem input ou dependência de Humano Engenheiro a exclusão autônoma no banco RLS. Redirecionar os caixas e barramentos da Nuvem SaaS sem fricção em tela dura de Restrição Ativa Administrativa.

### Topologias Descentralizadas Distribuídas em Massa - Nível 3 (Visões Arquitetônicas Master Corporativas e Confiabilidade Máxima Física)
- **Topologia Relacional Organizacional em Sub-Filiais Hierárquicas Tree-Mode:** Permitir inserções nas tabelas nativas de auto-referências recursivas lógicas de metadados Foreign Key nativos colunáveis do postgres, (A coluna recursiva de vinculação base associando Organizações Subordinadas). Onde um Mega-Franqueado central Consolida e interliga Matrizes corporativas atrelando visualizações agregadas de Múltiplas Lojas Distribuídas ao redor do estado sem precisar efetuar Logout-Logout. Alterar complexamente as lógicas pesadas nativas intrínsecas das Rules Globais RLS Base Postgres para validações Recursivas Matriciais Criptografadas Tree-Traversing SQL em Views rápidas agregadas sem perda na segurança de Isolation Tenancy.
- **Topologias Operacionais Resilientes Desconectadas Híbridas (Sincronizações Multi-Local First Disconnected Fallbacks Node):** A conversão parcial agressiva de pontos Críticos do POS (Point-Of-Sale Cashier Terminal Interface) num modelo Base Local-Storage Avançado PWA de Offline Capabilities Nativo IndexedDB PWA Caches Web Workers Background APIs locais de sincronismos assíncronos offline temporários paralelos RXDB base (No-SQL Client Side Engine State) preservando e garantindo vendas contra intempéries temporárias de Conexões Externas Web, gerando pilhas pendentes sincronizáveis RPC via Batches PUSH Rest (Triggers Local-Updates to Nuvem-Base Resiliency) preservando fluxo contínuo.

---

## 15. Guia do Desenvolvedor (Setup Local Extensivo)

Aos novos engenheiros do time, a clonagem, instanciação e compilação de pacotes se faz com estrita dependência das chaves locais controladas nos escopos segregados pela plataforma central `Supabase.com` do modo Staging (Local). 
Cuidem incansavelmente e vigorosamente ao manejar as *Keys*.

### Primeiros Preparos Requisitos (Toolchains)
O ambiente do sistema necessitará de:
- **Node.js**: A versão mínima absoluta deve ser a atualizada >v18.17 LTS atrelada firmemente ao NPM.
- **Repositório Staging Supabase**: Um Projeto SaaS vazio do Supabase (Nuvem Gratuita) e com SQL Executado Inteiramente para testes livres locais paralelos descartáveis (Não sujar a produção).

### Execução Inicial Segregada Steps CLI
```bash
# 1. Clonagem Absoluta do Base
git clone <URL_DO_REPOSITÓRIO_INTERNO_REMOTO_CORPORATIVO>

# 2. Navegação Básica Front-end Base
cd shopmanager-project

# 3. Empacotamento Fixado em Package-Lock Deterministico Unificado Sem Surpresas Globais NPM Node
npm install
```

### Configurações Inflexíveis de Ambiente
É estritamente mandatório configurar nativamente na raiz Base Root Project as configurações variáveis secretas. Instancie o arquivo renomeado nativamente de `env.local.example` para somente `.env.local` não indexável local por versionamentos do tipo git de modo rígido contendo com absoluta certeza chaves de conectividades em Staging baseados nas credenciais segregadas:
```env
# Interligação das Bases Rest HTTP (Interceptáveis globalizadas) nativas expostas Pelo Runtime Env VITE
VITE_SUPABASE_URL=https://<INSTANCIA_PROJETO_SEPARADO_STAGING_OU_PROD>.supabase.co
VITE_SUPABASE_ANON_KEY=<CHAVE_ANONIMA_DO_APP_CLIENT_SIDE_SEGURA_FRONTEND_VITE>
```

### Ligando Front End Compiler Motor Hot Reload Vite
O projeto deve acender e rodar compiladores e Bundlers de forma paralela usando VITE no terminal acionando base SWC minificadas rápidas:
```bash
npm run dev
```
As instâncias da aplicação nativamente fluem pelo `http://localhost:5173`. Modificações visíveis no DOM (React Render Hooks) operam HMR injetando alterações no HTML Virtual nativo Dom Diffing sob milessegundos na interface paralela paralela.

---

## 16. Testes, Manutenção e Boas Práticas Estritas de Tipagem (Guidelines Globais do Time)

Na fase final do projeto e na manutenção vitalícia do software corporativo em anos:
- As edições no PostgreSQL (DDL Modificações de estrutura ou tipos, inserções de colunas nativas via Alter tables nativas Base Scripts). SEMPRE deverão engatilhar localmente ou no Cloud base as Re-Gerações rígidas nativas automáticas unificadas determinísticas Autodeclaratórias Supabase Type Typescript.
  Para refletir no front as DDLs Execute no SDK Node Base:
  ```bash
  npx supabase gen types typescript --project-id <SEU-ID-DE-PROJECT-REF> > src/lib/database.types.ts
  ```
- **Fuga de Tipagem `// @ts-ignore` ou Tipagem Cast Genérica Abstrata Insegura (`as any`):** Totalmente restrita ao último caso da hierarquia onde exista comprovadamente o bloqueio nativo impenetrável por inferência abstrata genérica errônea do Engine de mapeamentos estritos nativos de Sub-Módulos em Mismatch TypeScript Supabase API Node Library em intersecções de Dicionários aninhados profundamente mapeados, onde o Frontend Typescript paralisa com bloqueadores Falso-Positivos do tipo de falhas `Argument not assignable to type never`. Tais escapes de segurança de Runtime Base Genérica de checagem exigem os apontamentos explícitos em PR (Pull Requests). 

O ShopManager foi desenhado para ser implacável e altamente coeso em código e visão!
