# Atualização Cãominhada Pet Salute 2026
Deploy: Correção de Realtime no Supabase e Alívio do API Gateway
- Remoção da tabela inexistente 'expenses' do canal Realtime (eliminando erros de canal e reconexões em loop)
- Ajuste no polling de segurança para 30s (redução de 75% no volume de requisições ao API Gateway)
- Orientação para habilitar Realtime em registrations e institutions no Supabase
Timestamp: 2026-09-22 09:30:00
Status: Pronto para redeploy na Vercel

