# Estado do projeto — 22/09/2026

Retomada rápida: o que está pronto, o que está em teste e o que ficou combinado.
O **README.md** explica *como a plataforma funciona*; este arquivo diz *onde paramos*.

## Onde o código está

| Ramo | O que é |
|---|---|
| **`main`** | a versão em uso no dia a dia. Último commit: agendamento de longo prazo (horizonte, teto, pós-prova). |
| **`fases-do-conteudo`** | tudo o que veio depois, **ainda não mergeado**. É o que está em teste. |
| tag **`v1-antes-das-fases`** | marca o estado anterior a esse trabalho todo. |

```
git checkout main                 # voltar ao que funciona hoje
git checkout fases-do-conteudo    # testar o novo
git diff main fases-do-conteudo   # ver a diferença
```

**Antes de testar, exporte os dados** (botão *Exportar* no cabeçalho). Se quiser voltar atrás:
`git checkout main` + *Importar* o JSON. O git não desfaz mudança de dado.

## O que o ramo traz (em ordem)

1. **Fases do conteúdo** — todo conteúdo nasce *em andamento* (a agenda marca **uma volta de cada
   vez**, chamada *Retomar*) e, ao ser marcado como **concluído**, entra na escada da repetição
   espaçada contada daquele dia.
2. **Cadastro de disciplinas e conteúdos** — conteúdo virou ficha: escolhe-se numa lista filtrada
   pela disciplina, com criação na hora. A **fase mora na ficha**, então fechar um conteúdo fecha
   todas as sessões que falam dele. Tela própria em *Ajustes → Disciplinas e conteúdos* (renomear,
   concluir e reabrir, por conteúdo ou por disciplina).
3. **A agenda se resolve sozinha** — registrar uma sessão do conteúdo dá o lembrete **vencido** por
   cumprido e faz nascer o próximo. Só o que já venceu é consumido; uma sessão fecha um lembrete.
4. **A aba virou Agenda**, com três visões: **Por dia** (padrão), **Por assunto** e **Mês**.
5. **Continuar um conteúdo** — botão *▶ continuar* nas sessões de dias anteriores.
6. **Continuidade garantida** — conteúdo aberto nunca fica sem agendamento (`garantirRetomadas`).
7. **Dificuldade em três níveis** — Fácil, Médio, Difícil. É **só dela** que saem a cadência da
   volta (4/2/1 dia) e o tamanho do plano (2/3/5 revisões).
8. **Estudo/Revisão aposentado** — a fase do conteúdo responde o que ele dizia.

## Decisões tomadas pelo Pedro (não reabrir sem ele)

- Conteúdo existente **nasceu em andamento** na migração — e por isso cada fila automática foi
  reduzida à volta mais próxima. Feitas e manuais ficaram intactas.
- **Lembrete de conteúdo aberto também atrasa**: aquele dia era para ter sido usado.
- **A taxa de acerto não entra no cronograma** — só a dificuldade.
- A descrição do item da agenda **é herdada** pela sessão criada a partir dele.
- Sessão do **mesmo dia** não ganha botão de continuar: continuar é somar horas nela.

## Pendências

- **Merge do ramo na `main`** — depende do Pedro testar com os dados dele.
- **Defeito guardado (já corrigido, padrão a varrer):** `entrarNoGrupo` deixava a revisão com
  `grupoId` **e** `registroId`. Corrigido em `a098e69`, mas vale procurar outros pontos onde o
  `registroId` sobrevive esquecido depois que o dono vira o grupo.
- **Supabase**: código pronto e inativo; falta criar o projeto, rodar o SQL, incluir `{{ .Token }}`
  no template do Magic Link e preencher `NUVEM`.
- **PWA**: combinado, não começado; exige hospedar em HTTPS antes.

## Testes

```
cd testes && ./rodar.sh          # todas (72 suítes)
cd testes && ./rodar.sh fases    # só as que casam com "fases"
```

Elas abrem o `index.html` de verdade num DOM (jsdom) e clicam nos botões. **72 suítes verdes** no
ramo e na `main`.

**Duas armadilhas já conhecidas do banco de testes:**
- data: usar sempre a data **local** (`iso()` local), nunca `toISOString()`, que vira o dia em UTC e
  quebra tudo depois das 21h em UTC−3;
- seeds que já usam as escalas novas precisam declarar `fasesMigradas`, `conteudosMigrados` e
  `dificuldadesMigradas`, senão as migrações de carga os convertem de novo.
