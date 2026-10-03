-- =============================================================================
-- Alteração 03 (02/10) — as tarefas da Agenda contam para o histórico
-- Rodar UMA vez no SQL Editor do projeto que JÁ tem a estrutura (estrutura.sql).
-- O que muda: excluir uma tarefa passa a guardar a versão anterior da nuvem no
-- histórico, como já acontece ao excluir uma sessão, anotação, conteúdo ou
-- lançamento. Sem rodar isto, nada quebra: as tarefas continuam indo para a
-- nuvem; só a exclusão de uma delas não dispara a cópia na hora (a cópia das 6
-- horas segue valendo).
-- =============================================================================

create or replace function public.itens_do_conteudo(c jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select coalesce(sum(case when jsonb_typeof(c -> k) = 'array' then jsonb_array_length(c -> k) else 0 end), 0)::integer
    from unnest(array['registros', 'erros', 'conteudos', 'lancamentos', 'tarefas']) as k
$$;

revoke execute on function public.itens_do_conteudo(jsonb) from public, anon, authenticated;
