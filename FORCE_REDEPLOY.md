# Atualização Cãominhada Pet Salute 2026
Deploy: Otimização de polling e conexões do Supabase + Isolamento de dados
- Redução drástica da frequência de polling para proteger o pool de conexões do Supabase Postgres
- Event-driven sync via WebSockets / canais do Supabase
- Bloqueio de requisições simultâneas duplicadas (lock & rate-limit)
- Isolamento total entre ONGs (cada uma vê estritamente seus dados)
Timestamp: 2026-09-11 23:14:00
Status: Deploy forçado para produção na Vercel
