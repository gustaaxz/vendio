import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  name_locked: boolean;
  description: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  plan: "basico" | "pro" | "premium";
  subscription_status: string;
  active: boolean;
};

export function useMyStore() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Store | null;
    },
  });
}
