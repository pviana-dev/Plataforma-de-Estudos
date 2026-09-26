-- =============================================================================
-- Alteração 01 (25/09) — backup enviado pelo menu do perfil
-- Rodar UMA vez no SQL Editor do projeto que JÁ tem a estrutura (estrutura.sql).
-- O que muda: o histórico passa a guardar a versão da nuvem SEMPRE que chega um
-- backup enviado ("Enviar backup (.json)" no menu do perfil). O app marca cada
-- envio em `importadoEm` dentro do conteúdo; o gatilho compara a marca antiga
-- com a nova. Nada mais muda — tabelas, regras de acesso e permissões ficam iguais.
-- O nome do perfil NÃO precisa de nada aqui: ele mora na própria conta do
-- Supabase (user_metadata.full_name).
-- =============================================================================

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

-- a função continua de uso interno do gatilho
revoke execute on function public.arquivar_versao_anterior() from public, anon, authenticated;
