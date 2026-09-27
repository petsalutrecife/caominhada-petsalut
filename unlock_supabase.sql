-- =========================================================================
-- SCRIPT DE DESBLOQUEIO E OTIMIZAÇÃO EMERGENCIAL DO SUPABASE
-- Execute no SQL Editor do seu Dashboard Supabase:
-- https://supabase.com/dashboard/project/fgzbpypmqpcthrpvywjd/sql
-- =========================================================================

-- 1. Destrava o PostgREST (erro PGRST002 / 503) forçando a reconstrução do cache
NOTIFY pgrst, 'reload schema';

-- 2. Reorganiza e limpa as tabelas, eliminando páginas de memória mortas
VACUUM ANALYZE public.registrations;
VACUUM ANALYZE public.institutions;
VACUUM ANALYZE public.sponsors;

-- 3. Confirmação
SELECT 'Supabase e PostgREST desbloqueados com sucesso!' AS status;
