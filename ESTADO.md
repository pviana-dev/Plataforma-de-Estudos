# Estado do projeto — 23/09/2026

Retomada rápida: o que está pronto, o que está em teste e o que ficou combinado.
O **README.md** explica *como a plataforma funciona*; este arquivo diz *onde paramos*.

## Onde o código está

| Ramo | O que é |
|---|---|
| **`main`** | a versão em uso no dia a dia. Recebeu o ramo `fases-do-conteudo` por fast-forward em 23/09 (até `0cb2287`). |
| **`fases-do-conteudo`** | já mergeado na `main`; não recebe mais trabalho. |
| **`escada-por-conteudo`** | itens 32 e 33; **mergeado na `main`** (fast-forward) em 23/09. |
| **`rotina-propria`** | itens 34 a 39, **commitados em 24/09; ainda não mergeados na `main`**. |
| tag **`v1-antes-das-fases`** | marca o estado anterior a esse trabalho todo. |

```
git checkout main                 # voltar ao que funciona hoje
git checkout f7b87bb               # a main antes da escada por conteúdo
```

**Antes de testar, exporte os dados** (botão *Exportar* no cabeçalho). Se quiser voltar atrás:
`git checkout main` + *Importar* o JSON. O git não desfaz mudança de dado.

## O que o ramo traz (em ordem)

1. **Fases do conteúdo** — todo conteúdo nasce *em andamento* (a agenda marca **uma volta de cada
   vez**, chamada *Retomar*) e, ao ser marcado como **concluído**, entra na escada da repetição
   espaçada contada daquele dia.
2. **Cadastro de disciplinas e conteúdos** — conteúdo virou ficha: escolhe-se numa lista filtrada
   pela disciplina, com criação na hora. A **fase mora na ficha**, então fechar um conteúdo fecha
   todas as sessões que falam dele. **Aba própria `Disciplinas`**, depois de Agenda (renomear,
   concluir e reabrir, por conteúdo ou pela disciplina inteira, com **filtro por disciplina**);
   antes era uma tela dentro de *Ajustes*, que agora só tem o atalho para a aba.
3. **A agenda se resolve sozinha** — registrar uma sessão do conteúdo dá o lembrete **vencido** por
   cumprido e faz nascer o próximo. Só o que já venceu é consumido; uma sessão fecha um lembrete.
4. **A aba virou Agenda**, com três visões: **Por dia** (padrão), **Por assunto** e **Mês**, e
   **duas sub-abas**: *A fazer* (hoje + atrasado + próximos dias) e *Concluídos* (dias anteriores).
   O corte é por **dia**, não por "feita": o que você marca hoje só muda de lado **em D+1**.
   Clicar num item do card *Revisões de hoje* salta para o original no cronograma, abrindo a lista
   se ela estiver encolhida. Na visão **Por dia** cada item traz *ver sessão*, *✎ card* e *editar*.
   A visão **Por assunto** passou a ser **alfabética** (era atraso + pior taxa): é a visão de
   procurar, e a urgência já tem as telas dela. O corte dos 4 avisa quando escondeu algum atrasado.
   A tabela **Prioridade para a reta final** saiu do Progresso (e `tabelaPrioridade` foi removida).
5. **Continuar um conteúdo** — botão *▶ continuar* nas sessões de dias anteriores.
6. **Continuidade garantida** — conteúdo aberto nunca fica sem agendamento (`garantirRetomadas`).
7. **Dificuldade em três níveis** — Fácil, Médio, Difícil. É **só dela** que saem a cadência da
   volta (4/2/1 dia) e o tamanho do plano (2/3/5 revisões).
8. **Estudo/Revisão aposentado** — a fase do conteúdo responde o que ele dizia. A **tela de edição**
   também: uma volta abre como *Editar retomada*, com os rótulos e as mensagens próprios
   (`termosDoItem`). Conteúdo concluído continua dizendo *revisão*. Suíte `testes/retomada.js`.
   **Varredura de vocabulário** depois disso: rótulo que cobre o CONJUNTO virou *agenda*/*item*
   (`Agenda de hoje`, `Agenda por assunto`, `Atrasados`, `Na agenda`, `Já concluídos`, contagens em
   "itens"); rótulo que fala de uma revisão de verdade continua *revisão*. **`+ Adicionar revisão`
   foi revisto e mantido** — ele cria mesmo uma revisão avulsa (`manual`), e volta não se cria à mão.

## Decisões tomadas pelo Pedro (não reabrir sem ele)

- Conteúdo existente **nasceu em andamento** na migração — e por isso cada fila automática foi
  reduzida à volta mais próxima. Feitas e manuais ficaram intactas.
- **Lembrete de conteúdo aberto também atrasa**: aquele dia era para ter sido usado.
- **A taxa de acerto não entra no cronograma** — só a dificuldade.
- A descrição do item da agenda **é herdada** pela sessão criada a partir dele.
- Sessão do **mesmo dia** não ganha botão de continuar: continuar é somar horas nela.

9. **Cronômetro que vara a madrugada** — o tempo passou a ser lançado no dia em que a sessão
   **começou**, não no dia em que o botão de encerrar foi clicado (23h30 → 0h30 = uma hora da
   quarta). O bloco ganhou `viradas`, que conta quantos dias a medição atravessou. Suíte
   `testes/meianoite.js`.

10. **Renomeações de tela** — a aba *Pontos importantes* virou **`Anotações`** (o card da lista virou
   *Todas as anotações*, para não repetir o título; o botão virou *+ Nova anotação*; a tela sobreposta,
   *Editar anotação*), e a etiqueta **`manual`** saiu da lista de sessões — aparecia em quase toda
   linha sem mudar nada do que se faz ali. O dado segue na ficha da sessão, em *Esta sessão*.
   O id interno da aba continua `erros`, e `db.erros` não mudou de nome: renomear o dado obrigaria
   a migrar backup e nuvem sem ganho nenhum.

11. **Excluir conteúdo** (aba Disciplinas, `✕ excluir`, com confirmação) — some a ficha e os itens da
   agenda que falam SÓ dele; **as sessões e as horas ficam intactas**. A guarda que faz a exclusão
   pegar é `temCadastro(alvo)`: sessão sem ficha não agenda nada — está em `gerarRevisoes`,
   `garantirRetomadas` e `gerarRevisoesGrupo`. Sem ela, `garantirRetomadas` remarcaria a volta no
   dia seguinte. Suíte `testes/excluirconteudo.js`.

12. **Renomear conteúdo de dentro da sessão** — cada etiqueta no formulário ganhou um **✎** que
   chama a mesma rotina da aba Disciplinas (`pedirNomeDoConteudo` → `renomearConteudo`): propaga
   para sessões, agenda e anotações, e recusa nome duplicado na disciplina. O aviso de alcance
   (`alcanceDoConteudo` / `fraseAlcance`) é o mesmo nos dois ✎, de propósito.
   **Cuidado ao mexer:** o ✎ do formulário **não pode chamar `render()`** — `formRegistroHtml()`
   remonta os campos a partir do registro SALVO e apagaria o que está digitado. Ele remenda o DOM
   em `trocarNomeNoForm`, começando pelo `data-assunto` (é dele que `lerAssuntosForm` lê ao salvar;
   com o nome velho ali, salvar recriaria a ficha antiga). Suíte `testes/renomearform.js`.
   Saíram junto os cinco listeners do antigo campo digitável da etiqueta e o CSS de `cursor:text`.

13. **A INTEGRAÇÃO FOI REMOVIDA.** Ela existia para: "estudei LAI anteontem, registrar LAI hoje sem
   integrar abre duas filas". Confirmado no README do commit `26fb38d`, com esse mesmo exemplo.
   O problema acabou em `8319be6` (21/09), que trouxe `escadaEmAberto`, `voltaEmAberto` e
   `resolverLembrete` — medido: LAI anteontem + LAI hoje dá **3 itens** (escada) ou **1 volta**
   movida para a frente, sem grupo nenhum. Saíram 12 funções e ~250 linhas.
   - `migrarGrupos()` desfaz grupos de backup antigo e **fica para sempre**. Regra: card volta para a
     sessão mais recente que cobria; sessão volta ao plano **automático**, nunca a `manual` (era a
     armadilha do `sairDoGrupo`: manual não recebe volta nunca mais). Histórico atravessa inteiro.
   - **O que ficou descoberto:** a unificação usa o CONJUNTO de conteúdos da sessão. `[LAI]` e
     `[LAI, Licitações]` ainda geram 2 itens. Só acontece com sessões de vários conteúdos que se
     sobrepõem em parte; com um conteúdo por sessão, nunca. Ver Pendências.
   - Suítes: `ui.js` (reescrita: prova que o formulário não integra e que estudar de novo não abre
     fila nova), `encadeada.js` (reescrita: a migração desfazendo o grupo mais complexo), `ui2/ui4/ui5`
     aparadas, `editarrev`/`rodape`/`cores`/`rotina`/`continuidade`/`subagenda` ajustadas.

14. **Ordem das anotações à mão** (aba Anotações) — alça ⠿ em cada anotação: arrastar, ou ↑/↓ com a
   alça focada (é o caminho do celular, onde o arrastar do HTML não existe). Só reordena DENTRO do
   card (mesmo dia + mesmo conteúdo). Grava `ordem` 0..n-1 no card inteiro, lendo a ordem do DOM em
   `gravarOrdemDoCard`. **Cuidado ao mexer:** nada de `render()` durante o arrasto — redesenhar
   cancela o arrasto do navegador; e o id viaja em `anotArrastada`, não no `dataTransfer`, que não
   dá para ler no `dragover`. `ordemDasAnotacoes` põe quem tem `ordem` antes de quem não tem, então
   card arrumado à mão não volta para a ordem automática. Suíte `testes/ordemanot.js`.

15. **Disciplinas: criar e renomear** na aba Disciplinas (`+ Nova disciplina` e `✎` no cabeçalho).
   `renomearDisciplina` propaga para os CINCO lugares que escrevem o nome: `db.disciplinas`,
   `db.registros`, `db.revisoes`, `db.erros` e `db.conteudos` — mais os filtros de `ui`.
   Suíte `testes/disciplinacrud.js`.

16. **UM CONTEÚDO ABERTO, UMA VOLTA SÓ** — era o item (b) das pendências, e o Pedro reportou pelo
   lado visível ("um mesmo conteúdo não pode ter dois cards para retomar"). Reproduzido e resolvido:
   - `chaveSessao` passou a **ordenar** os conteúdos (`[A,B]` e `[B,A]` eram coisas diferentes);
   - `garantirRetomadas` varre as sessões da **mais recente para a mais antiga** e cria a volta
     levando só os conteúdos SEM cobertura (`conteudosSemVolta`); `gerarRevisoes` usa o mesmo.
     Por isso a volta grava `assuntos` — pode ser um subconjunto da sessão — e `contextoRevisao`
     dá preferência a essa lista quando ela existe.
   - A volta **não** grava `disciplina`: ela vem da sessão dona. Gravar fazia `disciplinas()` —
     que varre `db.revisoes` — manter viva a disciplina de uma sessão apagada.
   - Cobertura conta **qualquer pendente** (volta, escada ou manual), não só voltas.
   - Corrigido de quebra: `garantirRetomadas()` roda DEPOIS do `render()` do arranque e não
     redesenhava — quem abrisse numa base que precisava de volta via a agenda vazia até clicar
     numa aba. Suíte `testes/umavolta.js` (6 formatos de sobreposição).

17. **Salvar sessão não replaneja mais à toa** (reportado pelo Pedro: a mensagem "N revisão(ões)
   agendada(s)" aparecia sempre). Era sintoma de coisa maior — `salvarRegistro` chamava
   `gerarRevisoes` em TODO salvamento, e `gerarRevisoes` apaga as automáticas pendentes da sessão
   e as refaz. Medido: escada de 3 itens virava 6 itens novos ao salvar sem mexer em nada.
   - `planoRelevante(r)` define o que decide o plano: data, conteúdos (ordenados), dificuldade,
     `planoDe` e tipo. Tempo/questões/acertos/descrição ficam de fora.
   - Replaneja se isso mudou **ou** se a sessão está sem nenhuma automática pendente — esta segunda
     metade é o que conserta quem ficou sem fila, e é de onde as suítes `dificuldade` e `horizonte`
     dependem (elas salvam sem mexer para forçar a geração).
   - A mensagem passou a contar o que aconteceu, em três formas. Suíte `testes/salvarsemmexer.js`.

18. **Compositor de anotações: caixa maior e quebra de linha visível.** O Pedro reportou que a
   quebra "não era respeitada" — medido, ela SEMPRE foi: o dado guardava `\n` e a tela renderizava
   `<p>…<br>…</p>`. O que enganava era a caixa de 2 linhas com `resize:none`: ao apertar Enter o
   texto rolava para fora do campo. `min-height` foi para 132px, ganhou `max-height:52vh` e
   `crescerCaixa()` no `input` (guard para `scrollHeight===0`, que é o caso do jsdom). O rodapé
   perdeu o estilo solto e virou `.ajuda-composer`, miúdo e colado na caixa. Suíte
   `testes/quebralinha.js`.

19. **Tempo saiu dos números da aba Sessões** (decisão do Pedro: indicador de tempo acumulado gera
   ansiedade). Saíram `Tempo na semana`, `Tempo total` e também o `· 1h30 no filtro` do primeiro
   bloco — manter o terceiro anularia a mudança. Entraram **Conteúdos estudados** (distintos, com
   as disciplinas) e **Conteúdos concluídos** (com barra de progresso e quantos seguem abertos).
   Os quatro blocos passaram a respeitar o filtro; antes dois respeitavam e dois não.
   Intocados de propósito: a coluna *Tempo* de cada sessão, o total no separador de dia e a aba
   *Progresso* — ali o tempo é dado ao lado do que foi feito, não placar acumulado.
   `testes/tempos.js` foi reescrita para guardar a decisão (nenhum bloco pode voltar a somar horas).

20. **Aba Questões reorganizada** — tabela de *Lançamentos* removida; no lugar, **gráfico de
   questões dia a dia** (barra empilhada: acertos + erros = total), logo abaixo do botão de lançar.
   *Desempenho por disciplina* foi para o fim. Seletor de período 7/30/90 (`ui.qPeriodo`), tooltip
   com data/acertos/erros/total/taxa, alvo de hover = faixa do dia.
   - **Empilhado, não lado a lado:** acerto é parte do total; barras vizinhas comparariam níveis
     diferentes. A imagem de referência que o Pedro mandou fazia lado a lado.
   - **Azul/laranja (`--s1`/`--s2`), não verde/vermelho:** medido com o validador do skill dataviz,
     verde/vermelho dá ΔE 4,1 em deuteranopia (piso é 8); azul/laranja dá 24,7 e passa em claro e
     escuro. Não trocar sem rodar o validador de novo.
   - **`listaAvulsos()`:** as baterias avulsas ganharam bloco próprio porque `editar-lancamento` e
     `excluir-lancamento` só existiam na tabela removida — sem isso ficariam ineditáveis (a suíte
     `lancamentos` pegou).
   - **Ordem da aba:** indicadores → botão de lançar → filtros → gráfico → desempenho → avulsas.
   - **`.chips-rolagem`:** a linha de filtros rola na horizontal em vez de quebrar (o rótulo e o
     `limpar ✕` ficam fora da rolagem, fixos). **Só em Questões, por escolha do Pedro** (22/09):
     cheguei a converter Progresso e Disciplinas e ele preferiu manter a quebra de linha lá —
     revertido. A classe existe se um dia mudar de ideia.
   - **Seleção MÚLTIPLA, só em Questões** (`ui.qDiscs`, uma lista): o chip é interruptor
     (`aria-pressed`, não `aria-selected`) e o resultado é a AGREGAÇÃO das escolhidas. Lista vazia =
     todas, de propósito — evita zero escolhidas com a tela vazia. `linhasPorConteudo`,
     `linhasPorDisciplina` e `listaAvulsos` recebem a lista. Renomear disciplina remapeia dentro
     dela; `restaurarTela` descarta nome que não existe mais e converte o formato antigo (string).
   - **Filtro por disciplina** recorta a aba INTEIRA:
     indicadores, gráfico, tabela de desempenho (`linhasPorConteudo`/`linhasPorDisciplina` passaram
     a aceitar `disc`) e baterias avulsas. Acompanha o renome de disciplina.
   Suíte `testes/grafquestoes.js`.

21. **Anotar deixou de exigir sessão.** Era regra do commit inicial (`26fb38d`), não desta série de
   mudanças: `conteudosDisponiveis()` só devolvia o que estivesse numa sessão, e o que vinha só de
   anotação antiga era marcado `orfao` e recusado como destino novo. Fazia sentido quando conteúdo
   era texto livre dentro da sessão; com o cadastro, virou estorvo — não dava para anotar um ponto
   de uma matéria ainda não começada.
   - A função passou a somar CADASTRO (disciplinas + fichas) + sessões + anotações.
   - `orfao` (trava) virou `semSessao` (aviso): a lista marca "— ainda sem sessão", e a marca cai
     sozinha quando a primeira sessão daquele conteúdo entra.
   - Suíte `testes/anotarsemsessao.js`; `feedback` e `feedback2` tinham asserções que PRENDIAM a
     regra antiga e foram reescritas para a intenção nova.

22. **Aba Anotações: números e "onde entra".**
   - Saíram **Taxa de acerto**, **Por desatenção** e o *"N refeitas e acertadas"* — os três medem
     desempenho em questão, e a aba é de conhecimento. Entraram **★ Para a véspera**, **Última
     anotação** (num conteúdo) e **Conteúdos anotados** (numa disciplina, com barra). A contagem de
     questões ficou como contexto. Tom novo `.tile.t-star`. `separacao.js` prendia os antigos e foi
     reescrita.
   - **`seletorConteudo` virou `camposAlvoAnotacao`**: dois selects em cascata
     (`alvoDisciplina` → `alvoConteudo`), o segundo refeito no `change` SEM render (senão o texto
     digitado se perde). Leitor único: `lerAlvoAnotacao(raiz)`. Conteúdo vazio = disciplina inteira.
   - `ui.alvoAnot` guarda o último destino: o compositor fica aberto depois de salvar, e reescolher
     a cada ponto era trabalho à toa. `cancelar-composer` limpa.
   - Cinco suítes usavam o seletor único e foram convertidas: `anotalivre`, `feedback`, `feedback2`,
     `fumaca`, `semrotulo`. Suíte nova: `testes/anotacampos.js`.

23. **Agenda reorganizada** — de cima para baixo: indicadores, **+ Adicionar revisão**, **Agenda de hoje**
   (agora **fixo**: aparece em qualquer filtro, inclusive em *Concluídos*) e um card só com os filtros
   **Situação** (A fazer / Concluídos) e **Organizar** (Por dia / Por assunto / Mês) — antes *Mostrar*
   e *Ver* —, um abaixo do outro. Na visão *Por assunto* entra um terceiro, **Assunto**
   (`ui.aAssunto`, lembrado entre recargas; o salto do card de hoje o limpa). Saíram as frases-guia
   da Situação, do botão de adicionar e da visão por assunto. Suíte `testes/filtroagenda.js`.

24. **Criar conteúdo pela aba Disciplinas** — botão **+ Novo conteúdo** (menor, logo abaixo do filtro
   de disciplinas). Obedece ao filtro: cria na disciplina escolhida; em *Todas* fica travado pedindo a
   escolha (com uma disciplina só, é ela). Aceita **vários, um por linha** (dá para colar o edital);
   repetido é pulado. O conteúdo sem nenhuma sessão aparece como **a estudar** — não é fase nova, sai
   da contagem de sessões — e não gera nada na agenda até a primeira sessão. A dificuldade continua
   sendo escolhida na sessão. Decisão do Pedro em 23/09 (antes o conteúdo só nascia na sessão).
   **✓ concluir disciplina pula os a estudar** (fecha só o que já tem sessão, e esses ganham a escada
   de revisões como sempre); o botão e a confirmação dizem quantos ficaram de fora. Disciplina sem nada
   estudado em aberto mostra *reabrir* (se houver concluído) ou nenhum dos dois.
   Suíte `testes/novoconteudo.js`.

25. **Anotações: sublistas, cores pelo nome e caixa que cresce.**
   - `- `, `-- ` e `--- ` no começo da linha fazem três níveis de lista (`textoFormatado`); um item não
     desce dois níveis de uma vez. Quatro traços ou `--` no meio da linha continuam texto.
   - Os botões de cor viraram **vermelho, verde e azul** (eram atenção, regra e lei); *grifar* ficou.
     Só o rótulo mudou — marcadores e ids são os mesmos, nada a migrar.
   - A caixa do compositor nasce com ~2 linhas (`min-height:3.4em`, era 132px) e cresce até o teto de
     antes (52vh). A da edição (`#eEnsinamento`, classe `cresce`) faz o mesmo.
   Suíte `testes/sublistas.js`; `edanot` e `quebralinha` ajustadas ao tamanho novo.

26. **Botões ghost invisíveis no tema escuro** — `html[data-tema="escuro"] .btn{color:#1b2224}` era mais
   específica que `.btn.ghost` e pintava de quase-preto o texto dos botões de fundo neutro (filtros das
   Anotações, Cancelar/Fechar, "+ adicionar", "outra dica", "ver tudo de novo"). Virou `.btn:not(.ghost)`.
   Varredura de contraste com Chromium (Playwright) em todas as abas e telas sobrepostas, nos dois
   temas: no escuro não sobrou nada. No claro, os botões pequenos `.act` sobre o cabeçalho de card
   ficam em 2,98:1 (cinza sobre areia) — legíveis, mas no limite; não mexido. Suíte `testes/escuroghost.js`.

27. **Objetivo de estudo: Sem objetivo, Concurso, Vestibular/ENEM** (23/09). Decisões do Pedro, na memória
   `objetivos-de-estudo` — **escola/faculdade foi descartada** (usa Sem objetivo). Seletor no **?**; o chip do
   topo abre a mesma tela.
   - `db.objetivo` + configuração guardada por modo: `dataProva` (concurso) e `vestibular.dias` (N dias, nome
     livre). Trocar de modo não apaga nada e zera `posProva`. `migrarObjetivo` deduz o modo pela data em
     `carregar()` **e** em `aplicarDados()` (importar, nuvem, arquivo). `CONFIG.DATA_DA_PROVA` saiu; a primeira
     abertura pergunta (`modalObjetivo`).
   - Núcleo: `diasDeProva`, `ultimaProva`, `proximaProva`, `diaDeProva`, `foraDaProva`. `ultimoDiaRevisao` usa o
     **último** dia; `precisaPerguntarPosProva` também (senão perguntaria no 1º dia).
   - **Ligação opcional** a um dia (só vestibular com 2+ dias): `vestibular.disciplinas[nome]` e `ficha.diaProva`.
     `limiteDe(sessão)` = véspera do dia mais tardio entre os conteúdos dela (um sem ligação → limite geral).
     `itemEmSilencio` esconde em `revisoesDetalhadas` (agenda, hoje, calendário, pinos) e nas contagens do
     Progresso; `sessaoEmSilencio` impede `gerarRevisoes`/`replanejarTudo` de mexer no que está guardado.
     `renomearDisciplina` agora propaga para **seis** lugares.
   - Pós-prova "continuo": vira Sem objetivo, re-data os itens manuais escondidos (`dataOriginal`) e
     `espalharRetorno` limita a 3 primeiras revisões por dia.
   - Suíte `testes/objetivos.js`; `anotacampos`, `horizonte` e `semprova` tinham asserções do comportamento
     antigo (rótulo da estrela, "continuo" apagava a data, caixa "estudo contínuo") e foram atualizadas.
   - A **★ se chama "Importante" em todos os modos** (decisão do Pedro, 23/09), não só no Sem objetivo.
   - **Revisão à mão liberada depois da prova** (decisão do Pedro, 23/09): as travas de `enviarRevisao` só
     valem com a prova à frente. "Encerrei" para só o automático (`gerarRevisoes` e `garantirRetomadas`).

28. **Depois do merge na `main`** (23/09): o card **Agenda de hoje** da aba Agenda ganhou destaque (`.card-hoje`:
   moldura verde de 2px, título maior numa faixa própria). As **disciplinas perderam as cores** no Progresso:
   eram 6 cores, e da sétima disciplina em diante tudo ficava cinza. Pelo método do skill dataviz, cor não se
   inventa depois da paleta acabar, e ali ela não identificava nada, porque o nome já está escrito ao lado da
   barra e dentro do botão. As barras ficaram numa cor só (`COR_BARRAS`) e o filtro perdeu o pontinho;
   `coresDisciplina` saiu.

29. **Barras de filtro com fundo próprio** (`.barra-filtro`, tokens `--filtro-fundo`/`--filtro-borda` nos dois
   temas): Progresso, Questões, Agenda (Situação/Organizar) e Disciplinas, que são as que usam rótulo + botões de
   aba. É um verde-acinzentado entre a superfície e o `accent-soft`: discreto, e sem competir com o botão
   escolhido. O rótulo "Filtrar:" passou do `--muted` para o `--text-2` dentro delas: sobre o fundo tingido o
   cinza claro cairia para 3,35:1 (já era 3,6:1 antes); ficou em 5,3:1 no claro e 6,8:1 no escuro. Ficaram de
   fora os filtros de listas suspensas (Sessões, Anotações) e o "Agrupar por", que é um alternador dentro de um card.

30. **Minimizar um card da Agenda por assunto** (seta + nome do conteúdo viram um botão só). Só aquele card
   fecha; minimizado, ele mostra "N itens · próximo DD/MM", e a etiqueta "tem atraso" continua visível. O estado
   fica no **sessionStorage** (`plataforma-estudos:minimizados`): sobrevive ao F5 e some ao fechar e abrir de novo,
   como o Pedro pediu. Não entra no db, no backup nem na nuvem. A chave é a do card (`chaveCard`: disciplina +
   conteúdos); renomear o conteúdo reabre o card. Suíte `testes/minimizar.js`; `rotina.js` passou a contar os
   botões do conteúdo sem o de minimizar. Conferido no Chromium com F5 real (`page.reload`) e aba nova.

31. **Badge "estudo" com cor própria** (`.badge.b-estudo`: accent-soft + accent-ink, 4,95:1 no claro e 6,24:1 no
   escuro). Antes ele era cinza neutro, igual ao "Médio" da dificuldade, e na lista de Sessões os dois ficavam lado
   a lado. Não usa verde/vermelho/âmbar porque essas cores já significam Fácil, Difícil e revisão; e não tem
   a borda do `b-misto` ("em andamento").

32. **A escada é do conteúdo** (23/09, ramo `escada-por-conteudo`). Pedido do Pedro: revisões de conteúdo
   concluído em intervalos crescentes, recalculadas quando há revisão extra ou atraso, e a dificuldade
   mudando os intervalos. Antes de implementar, medimos o export real (`estudos-2026-09-23.json`): 26 de 27
   sessões com um conteúdo só; **nenhuma escada automática pendente**, porque 8 sessões estavam presas no
   antigo plano *manual*; e **Lógica Proposicional concluída sem revisão nenhuma**. Decisões do Pedro:
   - **Garantia de revisão**: havendo revisões, as próximas nascem depois delas; não havendo, a escada nasce.
   - **As revisões manuais andam junto**, quantas forem; a extra não pula degrau (fica no da anterior).
   - **A prova não corta a escada**: seguem depois dela; só o dia da prova é pulado; parar é *Encerrei*.
     A pergunta do pós-prova não segura mais o agendamento. A revisão à mão depois da prova é aceita.
   - **`LAI, LGPD` = `LGPD, LAI`**: `chaveConteudos` único (três pontos ainda juntavam sem ordenar:
     `chaveCard`, a revisão à mão e `sessaoDoDia`).
   - O resto como eu recomendei: contato empurra (revisão em dia/atrasada/adiantada, revisão à mão, sessão fora
     da agenda); a revisão à mão já existente ocupa o degrau mais perto; fácil ×1,5 e difícil ×0,7 nos passos;
     sem compressão antes da prova; a ligação do vestibular não corta mais, **mas o silêncio continua**.

   Como ficou: `continuarEscada`, `reancorarEscada` (com `passo` e `degrau` gravados no item — é o que deixa
   salvar de novo sem empurrar de novo), `reespacarEscada` (mudou a dificuldade da sessão mais recente do
   conteúdo), `juntarIrmas`, `garantirEscadas`/`garantirAgenda`. `resolverLembrete` passou a casar **por
   conteúdo** e a cumprir também a revisão à mão. Plano *manual* convertido na carga
   (`db.planosManuaisMigrados`). Saíram `DISTRIBUICAO`, `DIAS_MINIMOS`, `ANTECIPACAO_PRIORITARIA`,
   `ESPACAMENTO_MIN_DIAS`, `calcularOffsets`, `numeroDeRevisoes`, `escadaEmAberto`. Suíte nova `testes/escada.js`;
   13 suítes antigas ajustadas à regra nova (cada mudança comentada no próprio teste).
   **Simulado no export real**: nenhuma data antiga muda; Lógica Proposicional (fácil) ganha 24/09, 27/09,
   03/10, 16/10…; Análise Combinatória continua depois da revisão à mão de hoje; nada cai em 11/10.

33. **Hoje no topo, madrugada dividida e agenda curta** (23/09, mesmo ramo). Pedidos do Pedro:
   - **Que dia é hoje**: no botão da prova (`#chipData`), numa segunda linha *Hoje dd/mm/aaaa* (rótulo igual ao "Prova") com as datas
     alinhadas em grade. Primeiro ficou embaixo do nome da plataforma; o Pedro não gostou e pediu no botão.
   - **Cronômetro que passa da meia-noite**: ao encerrar, pergunta *tudo na sessão do dia em que começou*
     (o comportamento do item 9) ou *dividir por dia* — a parte até a meia-noite fica na sessão de origem e
     o resto vai para uma sessão nova do dia seguinte, criada sozinha, igual à original (`fatiasPorDia`,
     `criarContinuacoes`, `finalizarCrono`). Com destino *Nova sessão*, a do dia seguinte nasce ao salvar o
     formulário (`ui.prefill.divisao`). O instante em que parou fica em `db.cronometro.parado`: fechar a
     pergunta não perde nada, e o chip para de contar e mostra *escolher o dia*. Suíte `meianoite.js` ampliada.
   - **Agenda curta por padrão**: de cada card, as **2 próximas revisões** e a **próxima retomada**
     (`soAsProximas`, `REVISOES_VISIVEIS`, `RETOMADAS_VISIVEIS`); o atraso conta como próximo. Na barra de
     filtros da Agenda, **Revisões: Só as 2 próximas / Todas as agendadas** (o rótulo diz "Revisões" porque a retomada é sempre uma) (`ui.agendaCompleta`, lembrado na
     tela), em botões menores que os de Situação/Organizar e sem frase explicativa (tirada a pedido do
     Pedro); o seletor de Assunto ficou um pouco maior. Vale também para os próximos 7 dias da aba Hoje. O card
     *Agenda de hoje* não é cortado (hoje é hoje), nem os números do topo (contam a agenda inteira). Suíte
     nova `agendacurta.js`; `nomerev`, `proximos`, `v2` e `visoes` abrem em *Todas* porque contam itens.

34. **Rotina própria e datas em cadeia** (23/09, ramo `rotina-propria`). Pedido do Pedro: deixar o usuário montar a
   própria rotina (ou trazer uma de fora) e facilitar a criação dos agendamentos.
   - **Chave nos ajustes** `db.agendaAutomatica` (padrão ligada). Desligada, `agendamentoAtivo()` é falso: nada
     automático é criado, empurrado ou refeito. Ao desligar, *manter* (padrão; pendentes automáticas viram `manual`)
     ou *apagar as automáticas pendentes* (`desligarAgendaAutomatica`). Aviso na aba Agenda e no formulário de sessão.
   - **Várias datas de uma vez** no *+ Adicionar revisão* (só ao criar; editar continua com uma data): etiquetas
     `datas`, *+ adicionar esta data*, *a cada N dias, K vezes* e *escada D+1, 3, 7, 16, 35*. Cada data vira um
     card (`salvarRevisaoManual`, extraída de `enviarRevisao`).
   - **Defeito antigo corrigido de passagem**: no formulário de revisão, trocar a disciplina não atualizava a lista de
     conteúdos (ficava vazia). Agora `opcoesDeConteudo` refaz as opções sem redesenhar o formulário.
   - Suíte nova `rotinapropria.js`.

35. **Dias da retomada e dificuldade obrigatória** (23/09, ramo `rotina-propria`). Pedido do Pedro.
   - **Dificuldade obrigatória e sem padrão** em toda sessão nova (formulário, cronômetro, *continuar*, item da
     agenda): o seletor começa em *Escolha a dificuldade…* e o registro é recusado sem ela. Ordem Difícil, Médio,
     Fácil. **Defeito corrigido de passagem**: `guardarRascunhoRegistro` trocava a dificuldade vazia por 3
     (*Difícil*) sempre que o formulário era redesenhado (ex.: ao trocar a disciplina).
   - **Retomada**: `diasDaVolta` = o que a pessoa escolheu nos ajustes (`db.diasRetomada`, 1 a 30 dias por
     dificuldade) ou `diasDaVoltaPadrao` — dificuldade × dias até a prova (ou o *revisar até*): até 30 dias
     1/1/2, até 90 dias 1/2/3, mais ou sem prazo 1/2/4 (difícil/médio/fácil; o último é o ritmo de antes).
     **Tempo de estudo previsto** (esclarecido pelo Pedro: não é só a prova, vale também sem objetivo): campo
     próprio nos ajustes, `db.estudoAte` (data, com atalhos +1/+3/+6 meses e +1 ano). `fimDoEstudoPrevisto`:
     esse campo → a prova à frente → o *revisar até* → sem prazo. Preenchido, manda sobre a prova.
   - Suíte nova `diasretomada.js`; 10 suítes passaram a escolher a dificuldade antes de registrar.

36. **Ajustes e ajuda separados** (23/09, ramo `rotina-propria`). A **engrenagem** (`#btnAjustes`, `.btn-ajustes`: o
   mesmo bloco cheio na cor da identidade do livro da marca) abre `modalAjustes` — só o formulário; o **?** abre
   `modalAjuda` — como o cronograma é montado (com os dias de hoje) e as metodologias. Um leva ao outro; o botão
   da prova (`abrir-ajustes`) e o pós-prova do vestibular abrem os ajustes. Suíte nova `ajustesajuda.js`.
   Depois, a pedido do Pedro: a **engrenagem** e os botões de ícone do cabeçalho (?, ↓, ↑, ◐) ganharam o mesmo
   hover (verde fechado, sobe 2px, brilho); nos ajustes, **Meta diária** veio para antes de *Revisar até*; as
   caixas da retomada mostram apagado o número que **está valendo** e o recalculam na hora quando o tempo previsto
   ou o *revisar até* mudam (`atualizarDiasPadraoAjustes`); as opções de marcar (`.opcao`) têm hover visível
   mesmo marcadas; os atalhos *+1 mês…* ganharam fundo de botão (`.act.atalho`). Os ajustes ficaram em **uma
   coluna** (`.campos.uma-coluna`: nada lado a lado — nem as caixas da retomada, nem as opções de objetivo, nem
   nome e data de cada dia de prova). **Saiu o teto de um ano** (`HORIZONTE_MAX_DIAS`): "revisar até", datas de
   prova e estudo previsto aceitam qualquer data futura; sem "revisar até", o horizonte segue 180 dias à frente.
   **Campo não é mais `<label>`** (`campo()` gera `<div>` + `aria-labelledby`): o label ocupava a linha toda, e
   clicar no branco ao lado de "Data da prova" abria o calendário. Só o controle responde ao clique, no app todo
   (também os quatro campos montados à mão e as linhas Difícil/Médio/Fácil). Caixas de número não ocupam mais a
   largura toda (`max-width:130px`; as da retomada, 72px).
   **Mensagem ao salvar sessão** (reportado pelo Pedro: mudar a dificuldade de um conteúdo em andamento dizia
   "cronograma refeito: N revisão(ões) até dd/mm"). Era texto do tempo em que toda sessão tinha escada: contava a
   retomada como revisão, pela sessão, e mostrava o horizonte. Agora `resumoDaAgenda` fala por conteúdo:
   "próxima retomada qua, 26/09" e/ou "N revisões na agenda, a próxima …". Mesma varredura: a dica do calendário
   do Progresso e a confirmação de transformar sessão em revisão dizem "item(ns) da agenda".

37. **Mural "Falta estudar" na aba Hoje** (23/09, ramo `rotina-propria`), no lugar do card *Para lembrar* (saíram
   `CONFIG.DICAS`, `ui.dicaIdx` e *outra dica*). Ideia do Pedro: um mural de lembrete dos conteúdos a estudar, que
   some com a primeira sessão. **Lista montada pela pessoa, sem digitar** (esclarecido pelo Pedro): `ficha.mural`
   marca quem está nele, e `filaAEstudar` = `mural && aEstudar`, ordenada por `ficha.prioridade`. **+ Adicionar**
   (`modalMural`) oferece, em caixas de marcar por disciplina, os conteúdos do cadastro sem sessão e fora do mural;
   **✕** (`tirar-afazer`) tira do mural sem apagar. Arrastar pela alça ⠿ ou ↑↓ grava a prioridade
   (`gravarOrdemMural`). **▶ estudar** abre a sessão com disciplina e conteúdo. O arrastar das anotações foi **generalizado** (`ARRASTAVEIS`, `moverItem`) e serve às duas
   listas. Suíte nova `mural.js`.

38. **Filtros da Agenda: disciplina e conteúdo** (24/09, ramo `rotina-propria`). Pedido do Pedro: disciplina
   primeiro, conteúdo depois, e um botão pequeno para limpar. `ui.aDisciplina` (novo) e `ui.aAssunto` (agora uma
   `chaveAssunto` de conteúdo, não mais a chave do card) valem nas **três visões** (antes o de assunto era só da
   visão por assunto); o conteúdo lista só os da disciplina escolhida, e trocar a disciplina limpa o conteúdo.
   **✕ limpar** aparece quando há filtro. O card *Agenda de hoje* segue sem filtro; saltar dele limpa os dois.

39. **Ajuda virou tutorial** (24/09, ramo `rotina-propria`). Pedido do Pedro: a ajuda deve explicar como usar o
   sistema, as abas e as relações entre elas. `modalAjuda` (tela larga) tem um índice e nove seções em
   `details.tutorial` (a primeira aberta): começo, abas, ligações, retomadas e revisões, cronômetro, rotina própria,
   ajustes, dados, metodologias. Números vêm de `diasDaVolta`, `degrausDa` e `ultimoDiaRevisao`. Estilo próprio
   (`.aj-*`) com os tokens do projeto. **Ao mudar uma regra ou um rótulo de botão, atualizar a ajuda junto.**
   Depois, a pedido do Pedro: o índice em botões virou um **sumário lateral** fixo (`.aj-sumario`, marca a seção
   escolhida; no celular, a caixa `#ajudaIr`), e cada subtópico ganhou um **fio separador** (`.aj-item`, itens de
   lista; tracejado entre blocos de texto).

## O que falta (sinalizado em 23/09)

- ~~**Commit e merge do ramo `escada-por-conteudo`**~~ — **FEITO** em 23/09, a pedido do Pedro. Ao abrir
  com dados antigos, a carga converte o plano manual e cria as revisões que faltam: exportar antes.
- **Dois pedidos de 23/09 com referência ambígua, esperando o Pedro dizer a quais se referem:**
  "implemente o caminho 2 que você recomendou" — o único *caminho 2* da conversa (recalcular por conteúdo e
  dividir o item quando só parte dele tem contato) **já está feito** no item 32; e "corrija o ponto levantado
  em 1" — não ficou claro qual ponto.
- **LAI ainda está "em andamento"** nos dados do Pedro, embora ele tenha dito que terminou de estudar. Enquanto
  não for concluída (✓ no card da agenda, no formulário da sessão ou na aba Disciplinas), ela não entra na
  escada; concluída, as revisões manuais de 28/09 e 06/10 ficam e a escada continua depois delas.
- **Silêncio do vestibular**: mantido (item 32). Se a regra "a prova não corta nada" valer também para ele,
  é tirar `itemEmSilencio`/`sessaoEmSilencio` e o seletor de dia por conteúdo na aba Disciplinas.
- **Cronômetro parado esperando a escolha**: se a pessoa nunca responder, ele fica assim (o chip avisa). Não há
  prazo para escolher sozinho — de propósito, para não decidir por ela.

- ~~**Fundo do sumário da Ajuda mais claro**~~ — **aprovado** pelo Pedro em 24/09 (`#f6f9f7`, só no tema claro).

## Pendências

- ~~**Merge do ramo na `main`**~~ — **FEITO** em 23/09, depois do teste do Pedro.
- ~~**Reestruturação da aba Agenda**~~ — **FEITO**, ver item 23. O botão *Adicionar revisão* ficou
  logo abaixo dos indicadores.
- ~~**Unificação por CONTEÚDO (item (b))**~~ — **FEITO**, ver itens 16 e 32. O que segue abaixo é o
  registro de como o problema foi entendido. O item continua com `rev.registroId` (a sessão dona dá a
  disciplina e o contexto), mas a escada, o empurrão e o lembrete passaram a ser **por conteúdo**
  (`rev.assuntos` diz de quais). A reforma completa (53 pontos) não foi necessária: medido no export,
  26 de 27 sessões têm um conteúdo só.

  <details><summary>diagnóstico original</summary>
  Tudo gira em `chaveSessao` (`index.html:848`), usada em 13 lugares: duas sessões só dividem
  card/escada/volta quando têm o **conjunto exato** de conteúdos. São dois problemas diferentes:

  1. **`chaveSessao` não ordena os nomes** — `join(" | ")` na ordem em que foram adicionados.
     Medido: `[LAI, Licitações]` + `[LAI, Licitações]` = 1 item; `[LAI, Licitações]` +
     `[Licitações, LAI]` = **2 itens**. Mesmos conteúdos, ordem diferente. Isto é **bug puro, sem
     trade-off** — basta ordenar antes de juntar. Uma linha + teste. Não foi feito.
  2. **Sobreposição parcial** — `[LAI]` + `[LAI, Licitações]` = 2 itens, LAI chamado duas vezes.
     Aqui NÃO há resposta certa: "a mais recente carrega a volta" (regra vigente, da CONTINUAÇÃO)
     só resolve quando a sessão maior é a mais nova; "quem cobre mais vai primeiro" resolve sempre,
     mas entrega a volta à sessão ANTIGA — e o item herda dela a **dificuldade**, que define a
     cadência (`diasDaVolta(dificuldadeDe(reg))`), além do contexto do *continuar*.

  **Saída limpa:** o plano passar a ser do CONTEÚDO, não da sessão — a revisão apontar para a ficha
  em vez de `rev.registroId` (**53 pontos** no arquivo) + migração. Porte comparável ao da remoção
  da integração, mas no núcleo do agendamento. O código já *diz* que é assim (comentário em
  `telaHistorico`: "o plano deixou de ser da sessão — é do conteúdo"); só a implementação ficou para
  trás.

  **Antes de retomar, medir:** o problema 2 só existe com sessões de **vários conteúdos**. Com um
  conteúdo por sessão, a chave por conjunto é idêntica à chave por conteúdo. Contar no JSON
  exportado quantas sessões têm `assuntos.length > 1` decide se vale o esforço.</details>
- **Defeito guardado (já corrigido, padrão a varrer):** `entrarNoGrupo` deixava a revisão com
  `grupoId` **e** `registroId`. Corrigido em `a098e69`, mas vale procurar outros pontos onde o
  `registroId` sobrevive esquecido depois que o dono vira o grupo.
- **Supabase**: código pronto e inativo; falta criar o projeto, rodar o SQL, incluir `{{ .Token }}`
  no template do Magic Link e preencher `NUVEM`.
- **PWA**: combinado, não começado; exige hospedar em HTTPS antes.
- **Linha do conteúdo apertada no celular (aba Disciplinas)** — já era assim antes do item 27: os três botões
  espremem o nome até uma palavra por linha. O seletor de dia foi para baixo do nome para não piorar.

## Testes

```
cd testes && ./rodar.sh          # todas (97 suítes)
cd testes && ./rodar.sh fases    # só as que casam com "fases"
```

Elas abrem o `index.html` de verdade num DOM (jsdom) e clicam nos botões. **97 suítes verdes** no ramo `rotina-propria`.

**Duas armadilhas já conhecidas do banco de testes:**
- data: usar sempre a data **local** (`iso()` local), nunca `toISOString()`, que vira o dia em UTC e
  quebra tudo depois das 21h em UTC−3;
- seeds que já usam as escalas novas precisam declarar `fasesMigradas`, `conteudosMigrados` e
  `dificuldadesMigradas`, senão as migrações de carga os convertem de novo;
- conteúdo **concluído** no seed ganha a escada inteira já na carga (garantia de revisão). Suíte que testa
  tela e conta itens precisa de um `revisarAte` curto para ficar só com o que o seed trouxe;
- **rodar logo depois da meia-noite**: cronômetro de seed "iniciado há 30 min" cruza o dia e abre a pergunta da
  madrugada. `cronofaixas` e `temporev` respondem "tudo no dia em que começou" quando ela aparece.
