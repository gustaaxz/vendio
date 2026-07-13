
# Reformulação do ShopManager → novo produto

Muitas mudanças pedidas são estruturais (multi-tenant, contas de compradores, Mercado Pago, admin real). Hoje o sistema é 100% local (Zustand + localStorage, sem backend, sem auth). Pra fazer tudo com qualidade, proponho dividir em **5 fases**. Cada fase é entregável sozinha.

---

## Fase 1 — Rebranding + ajustes visuais e de UX (sem backend)

Rápido, resolve boa parte das reclamações visuais.

- **Novo nome + ícone**: sugestões — **Lojix**, **Vendio**, **Praxis Retail**, **Tindra**. Preciso que você escolha um (ou proponha). Gero um logo SVG próprio.
- **Preços coerentes**: alinhar landing e painel para **R$ 49 / R$ 99 / R$ 149 por mês**.
- **Exportação (Excel/CSV/PDF) em todos os planos**, não como diferencial.
- **Navegação sem hash na URL**: âncoras "Recursos / Planos / Depoimentos" usam `scrollIntoView` + `history.replaceState` pra limpar a URL.
- **Depoimentos redesenhados**: foto (avatar gerado), nome, nome da loja, estrelas 1–5.
- **Design mais chamativo**: gradientes, hero com mockup do painel, seções com mais respiro, tipografia display, microinterações.
- **Substituir todos `confirm()`/`alert()`** por AlertDialog do shadcn + toasts sonner (excluir produto, excluir cliente, etc.).
- **Vendas / PDV**:
  - Trocar rótulo de "Carrinho" → "Novo pedido / Registro de venda" (fase 1 mantém o fluxo, remoção total do PDV acontece na fase 4).
  - Trocar "1un" por "N unidades".
- **Produtos**: campo **estoque mínimo** + toast/badge de "estoque baixo" quando `estoque <= min`. Botão "Repor estoque" que soma quantidade.
- **Dashboard mais completo**:
  - Cards: vendas **hoje**, **últimos 7 dias**, **último mês**.
  - Gráfico de vendas por dia (30d).
  - Gráfico de vendas por categoria.
  - **Nova seção "Top produtos por categoria"**: para cada categoria, lista decrescente dos produtos mais vendidos com quantidade (ex.: "Jogos → Super Mario Bros: 194 un").
  - Ticket médio, forma de pagamento mais usada, clientes ativos.

## Fase 2 — Backend real (Lovable Cloud) + autenticação

Necessário pra tudo abaixo. Ativo o Lovable Cloud (Supabase gerenciado).

- Tabelas: `stores`, `store_members`, `products`, `customers`, `sales`, `sale_items`, `movements`, `support_tickets`, `user_roles`.
- Auth por email/senha. Sem tela de "cadastro" pública — só login.
- Migração dos dados locais é descartada (sistema entra em modo real).
- Roles: `admin` (plataforma), `store_owner`, `buyer`.

## Fase 3 — Onboarding do lojista + Admin

- **Primeiro login do lojista**: modal obrigatório pede nome da loja, telefone, email, descrição (opcional), **slug** para o link público.
- **Regras**: nome da loja editável **1 vez**; depois só via suporte (abre ticket).
- **Página de configurações da loja**: editar telefone/email/descrição; seção **"Excluir conta"** que abre ticket de suporte (não exclui direto).
- **Aba Admin** (só role `admin`):
  - Criar loja manualmente (fallback caso automação falhe): email do cliente, nome da loja, plano.
  - Lista de lojas, status, plano.
  - Fila de tickets de suporte (renomear loja, excluir conta).
- **Formulário público "Quero criar minha loja"** substitui o registro atual.

## Fase 4 — Storefront público por loja + contas de comprador

- Rota `/@:slug` (ex.: `/@robux-store`) — vitrine pública com produtos da loja, layout de e-commerce.
- **Conta de comprador** separada (role `buyer`): só pode comprar, uma conta serve pra qualquer loja.
- Histórico de compras do comprador: `"R$ 49,90 - 500 Robux: Robux Store"`.
- No painel do lojista, **PDV é removido**; vendas passam a vir da storefront. Fica só o histórico + registro manual opcional (venda no balcão).

## Fase 5 — Pagamentos (Mercado Pago) + acessibilidade

- Integração **Mercado Pago Checkout Pro** via server function:
  - Comprador → checkout → webhook em `/api/public/mp-webhook` valida assinatura, marca venda como paga, atualiza estoque, registra no histórico do comprador.
  - Assinatura mensal do lojista (49/99/149) também via MP.
  - Secret `MP_ACCESS_TOKEN` via `add_secret`; webhook secret idem.
- **Botão de acessibilidade funcional**: painel real com — aumentar/diminuir fonte, alto contraste, escala de cinza, sublinhar links, cursor grande, reduzir animações. Preferências salvas em `localStorage`. (Sem API externa — não existe uma API pública boa que faça isso melhor que aplicar classes no `<html>`; o "widget que consome API" da UserWay/etc. é fechado e pago. Se você quiser um desses pagos, me diga qual.)

---

## Perguntas antes de começar

1. **Qual nome novo?** (Lojix / Vendio / Praxis Retail / Tindra / outro que você preferir)
2. **Posso começar pela Fase 1** (é a que mais melhora a percepção imediata, sem backend) e depois seguir sequencialmente conforme você aprova cada fase?
3. **Mercado Pago**: você já tem conta e vai gerar o Access Token, correto?
