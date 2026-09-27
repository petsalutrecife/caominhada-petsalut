-- ==============================================================================
-- CÃOMINHADA PET SALUTE 2026 - TABELA DE GANHADORES DO SORTEIO NA NUVEM SUPABASE
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase do seu projeto.
-- 2. Vá em "SQL Editor" no menu lateral.
-- 3. Cole todo este código e clique no botão "RUN".
-- ==============================================================================

-- 1. Criação da tabela de ganhadores do sorteio
CREATE TABLE IF NOT EXISTS public.raffle_winners (
  id TEXT PRIMARY KEY,
  registration_id TEXT,
  tutor_name TEXT NOT NULL,
  tutor_phone TEXT,
  tutor_whatsapp TEXT,
  pet_name TEXT,
  pet_breed TEXT,
  reg_number TEXT,
  prize_name TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  won_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ativar Row Level Security (RLS)
ALTER TABLE public.raffle_winners ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso para permitir leitura, inserção e limpeza pelo painel
DROP POLICY IF EXISTS "Allow public read on raffle_winners" ON public.raffle_winners;
CREATE POLICY "Allow public read on raffle_winners" 
ON public.raffle_winners FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert on raffle_winners" ON public.raffle_winners;
CREATE POLICY "Allow public insert on raffle_winners" 
ON public.raffle_winners FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on raffle_winners" ON public.raffle_winners;
CREATE POLICY "Allow public update on raffle_winners" 
ON public.raffle_winners FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow public delete on raffle_winners" ON public.raffle_winners;
CREATE POLICY "Allow public delete on raffle_winners" 
ON public.raffle_winners FOR DELETE 
USING (true);

-- 4. Notificar o PostgREST para recarregar o schema cache imediatamente
NOTIFY pgrst, 'reload schema';
