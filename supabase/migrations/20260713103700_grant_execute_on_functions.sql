-- Conceder permissão de execução nas funções de autorização para os usuários da aplicação
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon;

GRANT EXECUTE ON FUNCTION public.is_store_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_owner(UUID, UUID) TO anon;
