
DROP POLICY IF EXISTS profiles_select_public_basic ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS products_auth_read ON public.products;
CREATE POLICY products_owner_read ON public.products
  FOR SELECT TO authenticated
  USING (public.is_store_owner(store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (id, store_id, name, description, category, price, stock, sku, image_url, active, created_at, updated_at)
  ON public.products TO anon;

DROP POLICY IF EXISTS stores_read_all_auth ON public.stores;
CREATE POLICY stores_read_scoped ON public.stores
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR active = true);
REVOKE SELECT ON public.stores FROM anon;
GRANT SELECT (id, owner_id, name, slug, description, phone, email, logo_url, cover_url, active, created_at)
  ON public.stores TO anon;

DROP POLICY IF EXISTS sales_owner_write ON public.sales;
CREATE POLICY sales_owner_write ON public.sales
  FOR ALL TO authenticated
  USING (public.is_store_owner(store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_store_owner(store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS sale_items_write ON public.sale_items;
CREATE POLICY sale_items_write ON public.sale_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_items.sale_id
    AND (public.is_store_owner(s.store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_items.sale_id
    AND (public.is_store_owner(s.store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY user_roles_admin_manage ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id, active);
CREATE INDEX IF NOT EXISTS idx_sales_store ON public.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON public.sales(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON public.sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_movements_store ON public.movements(store_id);
CREATE INDEX IF NOT EXISTS idx_movements_sale ON public.movements(sale_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
