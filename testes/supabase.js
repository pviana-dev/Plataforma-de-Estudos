/* A ESTRUTURA DO SUPABASE (supabase/estrutura.sql), conferida num Postgres de
   verdade que roda dentro do Node (PGlite). As peças que o Supabase traz são
   imitadas: o esquema auth, auth.uid() lendo o usuário do token, os papéis anon
   e authenticated — e as PERMISSÕES PADRÃO dele, que liberam tudo em tabela nova
   (foi assim que apareceu o furo do TRUNCATE, 25/09). Confere: cada conta só lê e
   grava a própria linha, quem não entrou não vê nada, ninguém apaga, e o
   histórico guarda a versão anterior (a cada 6 h, sempre que os dados encolhem,
   por 30 dias, até 200). Não substitui o primeiro login num Supabase real. */
const fs = require("fs");
(async () => { try {
const { PGlite } = await import("@electric-sql/pglite");
const db = new PGlite();

const q = async (sql, p) => (await db.query(sql, p)).rows;
let falhas = 0; const ok = (n, c, x) => { console.log((c ? "  ok   " : "  FALHA") + "  " + n + (c ? "" : "   → " + JSON.stringify(x))); if (!c) falhas++; };
// o que o Supabase já traz: esquema auth, usuários, auth.uid() lendo o JWT, papéis anon/authenticated
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  grant usage on schema auth to anon, authenticated;
  -- como no Supabase: tabela/função/sequência nova no public nasce liberada para anon e authenticated
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  insert into auth.users values ('11111111-1111-1111-1111-111111111111','a@x.com'),('22222222-2222-2222-2222-222222222222','b@x.com');
`);
const sql = fs.readFileSync(__dirname + "/../supabase/estrutura.sql", "utf8");
await db.exec(sql);
await db.exec(sql);            // rodar de novo não pode quebrar
ok("o arquivo roda (e roda de novo) sem erro", true);
const A = "11111111-1111-1111-1111-111111111111", B = "22222222-2222-2222-2222-222222222222";
const como = async (uid, fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`);
  try { return await fn(); } finally { await db.exec("reset role;"); } };
const tenta = async fn => { try { await fn(); return "ok"; } catch (e) { return "erro: " + e.message; } };
// upsert como o app faz (POST com merge-duplicates = insert ... on conflict do update)
const upsert = (uid, conteudo) => q(`insert into public.dados (id, conteudo, atualizado_em) values ($1,$2,now())
  on conflict (id) do update set conteudo = excluded.conteudo, atualizado_em = excluded.atualizado_em`, [uid, conteudo]);
ok("A grava a própria linha", (await como(A, () => tenta(() => upsert(A, { registros: [1] })))) === "ok");
ok("A regrava (upsert) a própria linha", (await como(A, () => tenta(() => upsert(A, { registros: [1, 2] })))) === "ok");
ok("A lê a própria linha", (await como(A, () => q("select conteudo from public.dados")))[0]?.conteudo.registros.length === 2);
ok("A não grava na linha de B", (await como(A, () => tenta(() => upsert(B, { x: 1 })))).startsWith("erro"));
await como(B, () => upsert(B, { registros: [9] }));
ok("B não vê a linha de A", (await como(B, () => q("select id from public.dados"))).every(r => r.id === B));
ok("quem não entrou (anon) não lê nada", (await tenta(async () => { await db.exec("set role anon"); try { await q("select * from public.dados"); } finally { await db.exec("reset role"); } })).startsWith("erro"));
ok("ninguém apaga pelo app", (await como(A, () => tenta(() => q("delete from public.dados where id=$1", [A])))).startsWith("erro") ||
   (await q("select count(*)::int n from public.dados where id=$1", [A]))[0].n === 1);
// histórico: a 2ª gravação de A guardou a 1ª
let h = await q("select usuario, conteudo from public.dados_historico where usuario=$1", [A]);
ok("a versão anterior foi para o histórico", h.length === 1 && h[0].conteudo.registros.length === 1, h);
await como(A, () => upsert(A, { registros: [1, 2, 3] }));
h = await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]);
ok("no máximo uma versão a cada 6 horas", h[0].n === 1, h);
await q("update public.dados_historico set arquivado_em = now() - interval '7 hours' where usuario=$1", [A]);
await como(A, () => upsert(A, { registros: [1, 2, 3, 4] }));
h = await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]);
ok("passadas 6 horas, guarda outra", h[0].n === 2, h);
await q("update public.dados_historico set arquivado_em = now() - interval '31 days' where usuario=$1 and arquivado_em < now() - interval '1 hour'", [A]);
await q("update public.dados_historico set arquivado_em = now() - interval '7 hours' where usuario=$1 and arquivado_em > now() - interval '1 hour'", [A]);
await como(A, () => upsert(A, { registros: [5] }));
h = await q("select count(*)::int n from public.dados_historico where usuario=$1 and arquivado_em < now() - interval '30 days'", [A]);
ok("o que passou de 30 dias sai", h[0].n === 0, h);
ok("A lê o próprio histórico e não o de B",
   (await como(A, () => q("select distinct usuario from public.dados_historico"))).every(r => r.usuario === A));
ok("A não escreve no histórico direto", (await como(A, () => tenta(() => q("insert into public.dados_historico (usuario, conteudo, gravado_em) values ($1,'{}',now())", [A])))).startsWith("erro"));
// gravar o mesmo conteúdo não gera versão
const antes = (await q("select count(*)::int n from public.dados_historico"))[0].n;
await q("update public.dados_historico set arquivado_em = now() - interval '7 hours'");
await como(A, () => upsert(A, { registros: [5] }));
ok("regravar o mesmo conteúdo não enche o histórico", (await q("select count(*)::int n from public.dados_historico"))[0].n === antes);
// recuperar pela receita do fim do arquivo
const alvo = (await q("select id, conteudo from public.dados_historico where usuario=$1 order by arquivado_em desc limit 1", [A]))[0];
await q("update public.dados d set conteudo = h.conteudo, atualizado_em = now() from public.dados_historico h where h.id = $1 and d.id = h.usuario", [alvo.id]);
ok("a receita de recuperar devolve a versão escolhida",
   JSON.stringify((await q("select conteudo from public.dados where id=$1", [A]))[0].conteudo) === JSON.stringify(alvo.conteudo), alvo.conteudo);
// --- as correções da revisão ---
ok("a conta logada não consegue TRUNCATE (que passaria por cima do RLS)",
   (await como(A, () => tenta(() => q("truncate public.dados")))).startsWith("erro"));
ok("nem apagar linhas", (await como(A, () => tenta(() => q("delete from public.dados"))))==="ok" &&
   (await q("select count(*)::int n from public.dados"))[0].n === 2 ||
   (await como(A, () => tenta(() => q("delete from public.dados")))).startsWith("erro"));
ok("ninguém de fora executa a função do gatilho",
   (await como(A, () => tenta(() => q("select public.itens_do_conteudo('{}'::jsonb)")))).startsWith("erro"));
ok("e a gravação continua funcionando (o gatilho roda mesmo assim)",
   (await como(A, () => tenta(() => upsert(A, { registros: [1,2,3,4,5,6] })))) === "ok");
// encolheu → guarda SEMPRE, mesmo dentro das 6 horas
const n0 = (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n;
await como(A, () => upsert(A, { registros: [] }));             // um aparelho vazio grava por cima
const ultima = (await q("select conteudo from public.dados_historico where usuario=$1 order by id desc limit 1", [A]))[0];
ok("dados que encolhem (aparelho vazio por cima) guardam a versão boa na hora, mesmo dentro das 6 horas",
   (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n === n0 + 1 &&
   ultima.conteudo.registros.length === 6, ultima);
// teto de 200 por conta
for (let i = 0; i < 205; i++){ await como(A, () => upsert(A, { registros: Array(i % 2 ? 3 : 2).fill(0) })); }
ok("no máximo 200 versões por conta", (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n <= 200,
   (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n);
// --- alteração 01: backup enviado guarda a versão anterior, mesmo dentro das 6 horas e sem encolher ---
await db.exec(fs.readFileSync(__dirname + "/../supabase/alteracao-01-backup-enviado.sql", "utf8"));
ok("a alteração 01 roda por cima da estrutura", true);
await q("update public.dados_historico set arquivado_em = now() - interval '7 hours' where usuario=$1", [A]);
await como(A, () => upsert(A, { registros: [1, 2, 3] }));                // uma versão normal (abre a janela de 6 h)
const antesEnvio = (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n;
await como(A, () => upsert(A, { registros: [1, 2, 3, 4], importadoEm: 111 }));   // enviou um backup MAIOR, 1 minuto depois
const depoisEnvio = (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n;
const guardada = (await q("select conteudo from public.dados_historico where usuario=$1 order by id desc limit 1", [A]))[0];
ok("enviar um backup guarda a versão da nuvem na hora (maior, dentro das 6 h)",
   depoisEnvio === antesEnvio + 1 && guardada.conteudo.registros.length === 3, { antesEnvio, depoisEnvio, guardada });
await como(A, () => upsert(A, { registros: [1, 2, 3, 4, 5], importadoEm: 111 }));  // edição comum depois do envio
ok("editar depois do envio (mesma marca) não guarda de novo",
   (await q("select count(*)::int n from public.dados_historico where usuario=$1", [A]))[0].n === depoisEnvio);
ok("e a função continua fechada para quem está de fora",
   (await como(A, () => tenta(() => q("select public.arquivar_versao_anterior()")))).startsWith("erro"));
console.log(falhas ? "\n" + falhas + " FALHA(S)" : "\nestrutura do Supabase conferida");

process.exit(falhas ? 1 : 0);
} catch (e) { console.error("ERRO:", e.message); process.exit(2); } })();
