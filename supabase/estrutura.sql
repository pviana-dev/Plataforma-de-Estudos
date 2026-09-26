-- =============================================================================
-- Plataforma de Estudos — estrutura no Supabase
-- Rodar UMA vez: Supabase → SQL Editor → New query → colar tudo → Run.
-- Pode rodar de novo sem estragar nada (tudo é "se não existir" / "substitui").
--
-- O que o app usa (index.html, bloco NUVEM):
--   GET  /rest/v1/dados?select=conteudo,atualizado_em&id=eq.<usuário>   → ler
--   POST /rest/v1/dados  (Prefer: resolution=merge-duplicates)          → gravar (upsert)
-- Uma linha por conta: o JSON inteiro da plataforma em `conteudo`.
-- =============================================================================


-- 1. A TABELA DOS DADOS ------------------------------------------------------
create table if not exists public.dados (
  id            uuid        primary key references auth.users (id) on delete cascade,
  conteudo      jsonb       not null,
  atualizado_em timestamptz not null default now()
);

alter table public.dados enable row level security;


-- 2. QUEM PODE O QUÊ (RLS) ---------------------------------------------------
-- Cada conta só enxerga e só grava a PRÓPRIA linha. Uma política por operação:
-- o app lê, cria e atualiza (a gravação é um upsert, que precisa das três).
-- Não há política de apagar: pelo app, ninguém apaga a linha.
drop policy if exists "cada um vê o seu"    on public.dados;   -- a política única da versão antiga do README
drop policy if exists "ler o proprio"       on public.dados;
drop policy if exists "criar o proprio"     on public.dados;
drop policy if exists "atualizar o proprio" on public.dados;

create policy "ler o proprio" on public.dados
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "criar o proprio" on public.dados
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "atualizar o proprio" on public.dados
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- PERMISSÕES. O Supabase dá a toda tabela nova do esquema public TUDO para anon e
-- authenticated (inclusive DELETE e TRUNCATE — e TRUNCATE passa por cima das regras
-- acima e apagaria as linhas de todo mundo). Aqui se tira tudo e se devolve só o
-- que o app usa: quem entrou lê, cria e atualiza; quem não entrou, nada.
revoke all on public.dados from anon, authenticated;
grant select, insert, update on public.dados to authenticated;


-- 3. REDE DE SEGURANÇA: HISTÓRICO DE VERSÕES ----------------------------------
-- A sincronização é "quem grava por último ganha". Se um aparelho com dados
-- velhos (ou vazios) gravar por cima, a versão boa se perderia. Aqui, antes de
-- cada atualização, a versão ANTERIOR é guardada:
--   · SEMPRE que os dados ENCOLHEM (menos sessões, anotações, conteúdos ou
--     baterias de questões do que antes) — é a cara de uma gravação por cima com
--     dado velho, e também de uma exclusão que você pode querer desfazer;
--   · SEMPRE que chega um BACKUP ENVIADO pelo menu do perfil (o app marca o
--     envio em `importadoEm`): ele troca tudo de uma vez;
--   · e, no dia a dia, no máximo uma a cada 6 horas.
-- Ficam as dos últimos 30 dias, até 200 por conta (cabe folgado no plano
-- gratuito). Recuperar é pelo SQL Editor (receita no fim do arquivo).
create table if not exists public.dados_historico (
  id           bigint      generated always as identity primary key,
  usuario      uuid        not null references auth.users (id) on delete cascade,
  conteudo     jsonb       not null,
  gravado_em   timestamptz not null,               -- quando aquela versão tinha sido gravada
  arquivado_em timestamptz not null default now()  -- quando foi para o histórico
);
create index if not exists dados_historico_usuario_idx
  on public.dados_historico (usuario, arquivado_em desc);

alter table public.dados_historico enable row level security;

drop policy if exists "ler o proprio historico" on public.dados_historico;
create policy "ler o proprio historico" on public.dados_historico
  for select to authenticated
  using ((select auth.uid()) = usuario);

revoke all on public.dados_historico from anon, authenticated;
grant select on public.dados_historico to authenticated;   -- só ler; quem escreve é o gatilho

revoke all on sequence public.dados_historico_id_seq from anon, authenticated;

-- quantos itens criados pela pessoa um conteúdo tem (o que só diminui quando algo é apagado)
create or replace function public.itens_do_conteudo(c jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select coalesce(sum(case when jsonb_typeof(c -> k) = 'array' then jsonb_array_length(c -> k) else 0 end), 0)::integer
    from unnest(array['registros', 'erros', 'conteudos', 'lancamentos']) as k
$$;

create or replace function public.arquivar_versao_anterior()
returns trigger
language plpgsql
security definer          -- o gatilho escreve no histórico mesmo sem permissão da conta
set search_path = ''
as $$
begin
  if public.itens_do_conteudo(new.conteudo) < public.itens_do_conteudo(old.conteudo)
     or (new.conteudo ->> 'importadoEm') is distinct from (old.conteudo ->> 'importadoEm')
     or not exists (
       select 1 from public.dados_historico h
        where h.usuario = old.id
          and h.arquivado_em > now() - interval '6 hours')
  then
    insert into public.dados_historico (usuario, conteudo, gravado_em)
    values (old.id, old.conteudo, old.atualizado_em);
  end if;
  -- limpeza: só os últimos 30 dias, e no máximo 200 versões por conta
  delete from public.dados_historico
   where usuario = old.id
     and (arquivado_em < now() - interval '30 days'
          or id in (select h.id from public.dados_historico h
                     where h.usuario = old.id
                     order by h.arquivado_em desc, h.id desc
                     offset 200));
  return new;
end;
$$;

-- as duas funções são de uso interno (do gatilho): ninguém as chama de fora
revoke execute on function public.arquivar_versao_anterior() from public, anon, authenticated;
revoke execute on function public.itens_do_conteudo(jsonb)   from public, anon, authenticated;

drop trigger if exists arquivar_antes_de_atualizar on public.dados;
create trigger arquivar_antes_de_atualizar
  before update on public.dados
  for each row
  when (old.conteudo is distinct from new.conteudo)
  execute function public.arquivar_versao_anterior();


-- =============================================================================
-- CONFERIR (rode depois, se quiser ver que ficou tudo no lugar)
-- =============================================================================
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select tablename, policyname, cmd from pg_policies where schemaname = 'public';

-- =============================================================================
-- RECUPERAR UMA VERSÃO ANTIGA (só se precisar — pelo SQL Editor)
-- =============================================================================
-- 1) ver as versões guardadas de uma conta:
--    select h.id, h.gravado_em, h.arquivado_em, pg_size_pretty(pg_column_size(h.conteudo)::bigint) as tamanho
--      from public.dados_historico h join auth.users u on u.id = h.usuario
--     where u.email = 'email@da.pessoa' order by h.arquivado_em desc;
-- 2) devolver a versão escolhida (troque 123 pelo id da linha acima):
--    update public.dados d set conteudo = h.conteudo, atualizado_em = now()
--      from public.dados_historico h where h.id = 123 and d.id = h.usuario;
--    (a versão que estava valendo vai para o histórico antes de ser trocada)
