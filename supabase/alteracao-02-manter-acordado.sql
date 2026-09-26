-- =============================================================================
-- Alteração 02 (26/09) — manter o projeto acordado
-- Rodar UMA vez no SQL Editor do projeto que JÁ tem a estrutura (estrutura.sql).
-- Por quê: no plano gratuito, o Supabase PAUSA o projeto depois de 7 dias sem uso
-- (os dados ficam, mas a plataforma para de sincronizar até alguém religar no painel).
-- O que muda: cria a função `ping()`, que só devolve a hora do banco — não lê nem
-- grava nada — e é a ÚNICA coisa que a chave pública consegue chamar sem conta.
-- O Mac chama todo dia (launchd: supabase/manter-acordado.plist, ver README →
-- "Manter o projeto acordado"):
--   POST /rest/v1/rpc/ping   (cabeçalho apikey: <chave publishable>)   → "2026-09-26T..."
-- Tabelas, regras de acesso e permissões ficam iguais.
-- =============================================================================

create or replace function public.ping()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() $$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- CONFERIR: select public.ping();
