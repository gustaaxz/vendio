-- Auto-assign admin role when gustavoooschmitt@gmail.com signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles(id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;

  -- Auto-assign admin role to the platform owner
  IF NEW.email = 'gustavoooschmitt@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- If the admin user already exists, ensure they have the admin role
DO $$
DECLARE
  _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'gustavoooschmitt@gmail.com' LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_uid, 'admin') ON CONFLICT DO NOTHING;
  END IF;
END; $$;

-- Restrict user_roles: only admin can INSERT (prevent users from granting roles to others)
GRANT SELECT ON public.user_roles TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;

-- Customers: only admin can INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS customers_owner_all ON public.customers;

CREATE POLICY customers_admin_write ON public.customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY customers_owner_read ON public.customers
  FOR SELECT TO authenticated
  USING (public.is_store_owner(store_id, auth.uid()) OR public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Auto-assign store_owner role when a new store is created (server-side, secure)
CREATE OR REPLACE FUNCTION public.auto_assign_store_owner() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.owner_id, 'store_owner') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS stores_auto_role ON public.stores;
CREATE TRIGGER stores_auto_role AFTER INSERT ON public.stores FOR EACH ROW EXECUTE FUNCTION public.auto_assign_store_owner();
