-- ============================================================
-- ShopManager — Schema Inicial
-- Multi-tenant via organization_id + Row Level Security
-- ============================================================

-- ===================== TABELAS =====================

-- Organizações (cada loja é uma organização)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'basico' CHECK (plan IN ('basico', 'profissional', 'premium')),
  plan_status TEXT DEFAULT 'trial' CHECK (plan_status IN ('trial', 'active', 'cancelled', 'past_due')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  mp_customer_id TEXT,
  mp_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros da organização (relacionamento user ↔ org)
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes da loja
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Cliente avulso',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'pix', 'cartao')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens de venda
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Movimentações financeiras
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== INDEXES =====================

CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(org_id);
CREATE INDEX IF NOT EXISTS idx_customers_org ON public.customers(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_org ON public.sales(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org ON public.transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.org_members(org_id);

-- ===================== UPDATED_AT TRIGGER =====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================== ROW LEVEL SECURITY =====================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ---------- organizations ----------
CREATE POLICY "Members can view their orgs"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their orgs"
  ON public.organizations FOR UPDATE
  USING (id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role = 'owner'));

-- ---------- org_members ----------
CREATE POLICY "Members can view org members"
  ON public.org_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves as members"
  ON public.org_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ---------- products ----------
CREATE POLICY "Members can view products"
  ON public.products FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admin+ can insert products"
  ON public.products FOR INSERT
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

CREATE POLICY "Admin+ can update products"
  ON public.products FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

CREATE POLICY "Admin+ can delete products"
  ON public.products FOR DELETE
  USING (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- ---------- customers ----------
CREATE POLICY "Members can view customers"
  ON public.customers FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admin+ can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

CREATE POLICY "Admin+ can update customers"
  ON public.customers FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

CREATE POLICY "Admin+ can delete customers"
  ON public.customers FOR DELETE
  USING (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- ---------- sales ----------
CREATE POLICY "Members can view sales"
  ON public.sales FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

-- ---------- sale_items ----------
CREATE POLICY "Members can view sale items"
  ON public.sale_items FOR SELECT
  USING (sale_id IN (SELECT s.id FROM public.sales s WHERE s.org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid())));

CREATE POLICY "Members can insert sale items"
  ON public.sale_items FOR INSERT
  WITH CHECK (sale_id IN (SELECT s.id FROM public.sales s WHERE s.org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid())));

-- ---------- transactions ----------
CREATE POLICY "Members can view transactions"
  ON public.transactions FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admin+ can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- ===================== SIGNUP TRIGGER =====================
-- Quando um usuário se registra, cria automaticamente uma organização e o associa como owner

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_name TEXT;
  org_slug TEXT;
  new_org_id UUID;
BEGIN
  -- Usar o display_name dos metadados, ou fallback para o e-mail
  org_name := COALESCE(
    NEW.raw_user_meta_data ->> 'org_name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Gerar slug único a partir do nome
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Criar a organização
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  -- Associar o usuário como owner
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que roda após cada novo signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================== SALE PROCEDURE =====================
-- Stored procedure atômica para criar venda + itens + atualizar estoque + registrar movimentação

CREATE OR REPLACE FUNCTION public.create_sale(
  p_org_id UUID,
  p_customer_id UUID DEFAULT NULL,
  p_customer_name TEXT DEFAULT 'Cliente avulso',
  p_payment_method TEXT DEFAULT 'pix',
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID AS $$
DECLARE
  new_sale_id UUID;
  sale_total DECIMAL(10,2) := 0;
  item JSONB;
  item_qty INTEGER;
  item_price DECIMAL(10,2);
BEGIN
  -- Verificar que o usuário é membro desta org
  IF NOT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = p_org_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: você não é membro desta organização';
  END IF;

  -- Calcular total
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    item_qty := (item ->> 'quantity')::INTEGER;
    item_price := (item ->> 'price')::DECIMAL(10,2);
    sale_total := sale_total + (item_qty * item_price);
  END LOOP;

  -- Criar a venda
  INSERT INTO public.sales (org_id, customer_id, customer_name, payment_method, total)
  VALUES (p_org_id, p_customer_id, p_customer_name, p_payment_method, sale_total)
  RETURNING id INTO new_sale_id;

  -- Inserir itens e atualizar estoque
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    item_qty := (item ->> 'quantity')::INTEGER;
    item_price := (item ->> 'price')::DECIMAL(10,2);

    INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, price)
    VALUES (
      new_sale_id,
      NULLIF(item ->> 'product_id', '')::UUID,
      item ->> 'product_name',
      item_qty,
      item_price
    );

    -- Atualizar estoque do produto
    IF (item ->> 'product_id') IS NOT NULL AND (item ->> 'product_id') != '' THEN
      UPDATE public.products
      SET stock = GREATEST(0, stock - item_qty)
      WHERE id = (item ->> 'product_id')::UUID AND org_id = p_org_id;
    END IF;
  END LOOP;

  -- Registrar movimentação financeira
  INSERT INTO public.transactions (org_id, type, description, amount)
  VALUES (
    p_org_id,
    'entrada',
    'Venda #' || upper(substr(new_sale_id::text, 1, 6)) || ' - ' || p_customer_name,
    sale_total
  );

  RETURN new_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
