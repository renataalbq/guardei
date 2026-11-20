-- Projetos novos do Supabase não liberam as tabelas para a API automaticamente.
-- Libera ler/criar/alterar para quem está logado (inclusive conta anônima);
-- as policies de RLS da 0001 continuam limitando cada pessoa aos próprios dados.
-- Sem DELETE (o app usa deleted_at) e nada para o papel `anon` (sem sessão).

grant usage on schema public to authenticated;
grant select, insert, update on table public.challenges to authenticated;
grant select, insert, update on table public.cells to authenticated;
