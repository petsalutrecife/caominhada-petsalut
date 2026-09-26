-- =========================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE PARA O PROJETO CÃOMINHADA PET SALUT
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- (https://supabase.com/dashboard/project/fgzbpypmqpcthrpvywjd/sql)
-- =========================================================================

-- 1. Criação do Bucket Público 'caominhada-media'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'caominhada-media',
  'caominhada-media',
  true,
  10485760, -- Limite de 10 MB por arquivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

-- 2. Habilitação de Leitura Pública (Qualquer visitante pode visualizar fotos e comprovantes)
DROP POLICY IF EXISTS "Public Read Access caominhada-media" ON storage.objects;
CREATE POLICY "Public Read Access caominhada-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'caominhada-media');

-- 3. Habilitação de Upload Público/Anon (Participantes podem enviar fotos e comprovantes no formulário de inscrição)
DROP POLICY IF EXISTS "Public Upload caominhada-media" ON storage.objects;
CREATE POLICY "Public Upload caominhada-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'caominhada-media');

-- 4. Habilitação de Atualização de Arquivos (Upsert)
DROP POLICY IF EXISTS "Public Update caominhada-media" ON storage.objects;
CREATE POLICY "Public Update caominhada-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'caominhada-media');

-- 5. Habilitação de Exclusão (Admin)
DROP POLICY IF EXISTS "Public Delete caominhada-media" ON storage.objects;
CREATE POLICY "Public Delete caominhada-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'caominhada-media');

-- Mensagem de confirmação
SELECT 'Bucket caominhada-media configurado com sucesso e políticas de acesso ativas!' AS status;
