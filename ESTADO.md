# Estado do projeto — 23/09/2026

Retomada rápida: o que está pronto, o que está em teste e o que ficou combinado.
O **README.md** explica *como a plataforma funciona*; este arquivo diz *onde paramos*.

## Onde o código está

| Ramo | O que é |
|---|---|
| **`main`** | a versão em uso no dia a dia. Recebeu o ramo `fases-do-conteudo` por fast-forward em 23/09 (até `0cb2287`). |
| **`fases-do-conteudo`** | já mergeado na `main`; não recebe mais trabalho. |
| **`escada-por-conteudo`** | itens 32 e 33; **mergeado na `main`** (fast-forward) em 23/09. |
| **`rotina-propria`** | itens 34 a 46, **commitados em 24/09; ainda não mergeados na `main`**. |
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

40. **Ajustes finos (24/09, depois do commit `729c4bb`)**: nos ajustes, as opções de **objetivo** voltaram a ficar
   lado a lado (`.opcoes.lado-a-lado`), os **títulos dos campos** ficaram maiores e mais fortes (14px, 600, cor do
   texto) e a opção do **agendamento automático** ficou maior, numa linha só (quebra só abaixo de 480px).
   **Ancoragem de rolagem** ao minimizar/expandir um card da Agenda por assunto (`manterNoLugar`): o cabeçalho
   clicado continua embaixo do mouse e o resto da página se acomoda — antes a página "pulava". Teste em `minimizar.js`.

41. **Remanejar leva as seguintes junto** (24/09). Pergunta do Pedro: com o dia cheio, mover um card para o dia
   seguinte arrasta os que dependem dele? Medido: **não** pelo botão *remarcar* (e a ordem podia inverter), e pela
   edição da data **sim, mas com a distância errada** (+6 virava +11: `fixarPassos` lia a sequência sem o item
   editado). Agora os dois passam por `remanejarItem`: lê as distâncias com as datas de antes e empurra as revisões
   do mesmo conteúdo que vinham **depois** (pela data antiga), cada uma mantendo a distância. Puxar para mais cedo
   não mexe nas outras. Retomada não tem seguintes. `nomerev` e `rotinarev` ajustados; casos novos em `escada.js`.

42. **"Retomar" virou "Continuar"** (24/09, pedido do Pedro, para uma linguagem mais comum). Só textos da tela: o
   item se chama **Continuar**; onde é preciso substantivo, **card** (*Editar card*, *Excluir card*, *Data/Nome/
   Detalhes do card* — escolha do Pedro, mais genérica); "volta" também saiu da tela (*card de continuar*). Ajustes:
   *Dias até continuar um conteúdo em andamento*; Ajuda: seção *Continuar e revisar*. **O dado e o código continuam
   `retomada`** (`ehRetomada`, `garantirRetomadas`…) — renomear exigiria migrar os dados salvos. O botão
   *▶ continuar* das Sessões passa a combinar com o item da agenda. Testes com texto: `retomada`, `fases`,
   `salvarsemmexer`, `ui5`.

43. **▶ continuar herda da sessão de origem** (24/09, pedido do Pedro): disciplina, conteúdos, **dificuldade** e
   **sem revisão**; não herda tempo, questões nem descrição. Revoga, só para o *continuar*, a regra do item 35
   ("continuar também pede a dificuldade de hoje"); a sessão nova do zero continua sem padrão. De passagem:
   `guardarRascunhoRegistro` passou a guardar o *sem revisão*, que se perdia quando o formulário era redesenhado.

44. **O botão "/" das anotações era o itálico** (24/09). O Pedro pediu itálico e perguntou o que fazia o "/": o
   itálico já existia (`_texto_` → `<em>`), mas o **I** inclinado sem serifa parecia uma barra. Agora ele tem serifa
   (`.fmt-i`, Georgia itálico), como nos editores de texto, e a dica diz o que faz.

45. **Conteúdo já estudado traz a dificuldade** (24/09, pedido do Pedro). A dificuldade já era guardada por
   conteúdo (a da sessão mais recente, `dificuldadeDaFicha`), só não preenchia o formulário. Agora, numa sessão
   nova, escolher um conteúdo com sessão (`adicionarAssuntoForm`) ou abrir o formulário já com ele (item da
   agenda) preenche o campo (`dificuldadeHerdada`; vários conteúdos → a mais alta) e mostra de onde veio
   (`#dicaDificuldade`). Conteúdo nunca estudado segue sem padrão e obrigatório.

46. **Frases-guia tiradas das abas** (24/09, pedido do Pedro): Hoje ("Só para conferência…"); Sessões (dica dos
   conteúdos, "sessão de outro dia não vira revisão…", o texto da fase no formulário); Agenda, edição (a ajuda do
   nome — também a versão do card de continuar — e "Tempo e questões não ficam aqui…"); Disciplinas (o parágrafo do
   topo); Anotações (o parágrafo do topo, a ajuda do "Sim — caiu numa questão", a do conteúdo em branco e a frase da
   barra de formatação); Questões ("se editam lá…" e a lista "Sem questões ainda"); Progresso ("todas as disciplinas."
   só sai quando não há filtro; "só este dia" → "só o dia selecionado"; saiu o bloco *Prática intercalada* e a função
   `sugestaoIntercalada`). O que só essas frases explicavam foi para a **Ajuda** (seção *As abas, uma a uma*):
   descrição que diferencia sessões, só sessão de hoje vira revisão, nome em branco segue a ordem, tempo e questões
   entram pela sessão, + Novo conteúdo e Excluir, anotação na disciplina inteira, "caiu numa questão", atalhos da
   caixa de texto (`-`, `--`, `---`, `\==`), onde se editam as questões. 7 testes passaram a conferir a ausência.

47. **Próximos 7 dias só informativos e anotações minimizáveis** (24/09, pedido do Pedro). Na aba **Hoje**, a
   lista *Próximos 7 dias* não tem mais a caixa de marcar (`itemRevisao` com `leitura`); o resto da aba e a Agenda
   continuam com ela. Na aba **Anotações**, cada bloco se minimiza como os cards da Agenda: o nome vira o botão
   (`minimizar-anot`), o cabeçalho segue com a contagem, o estado fica no mesmo `sessionStorage` e a ancoragem de
   rolagem vale igual. Suíte nova `minimizaranot.js`.

48. **Três pedidos de 24/09.** (1) **+ Nova disciplina** abre uma tela do app (`modalNovaDisciplina`: cabeçalho com
   o "+" no bloco verde, campo maior, erro na própria tela) no lugar do `prompt()`. (2) **Lista numerada** no *+ Novo
   conteúdo*: `separarLista` tira a marca do começo ("1.", "2)", "1 -", "1.1", "-", "•", "a)") e separa "1. X 2. Y" (ou
   "1.X 2.Y", ou "X 2. Y 3. Z" com numeração seguida) numa linha só — um por linha e numerado valem juntos, na mesma
   caixa; número que é parte do nome fica ("Lei 8.112/1990", "3 Poderes"). (3) **Questões das sessões editáveis na aba
   Questões**: card *Questões das sessões* (`listaQuestoesDasSessoes`, 8 + ver todas) com `modalQuestoesDaSessao`, que
   grava em `reg.questoes/acertos` — o mesmo dado da sessão, então a aba Sessões já mostra o novo. Suíte nova
   `questoessessao.js`; `disciplinacrud` e `novoconteudo` ajustados.

49. **Varredura geral e correções** (24/09, pedido do Pedro). Revisão do app inteiro; cada defeito foi reproduzido
   antes de corrigir. Suíte nova `varredura.js` (falha nos 11 pontos na versão anterior).
   - **Salvar os Ajustes** só replaneja se mudou algo que decide datas (objetivo, datas de prova, revisar até, estudo
     previsto, dias até continuar, automático). E replanejar (`replanejarTudo`) **mantém o card atrasado** onde está
     (`manterAtrasadas`) — antes mudar a meta diária remarcava todos os cards de continuar e sumia com os atrasados.
   - **Excluir uma sessão** não apaga mais a escada do conteúdo: os itens passam para outra sessão que fale dos mesmos
     conteúdos; só sai o que não tem mais sessão. O aviso agora diz quantas baterias de questões saem junto.
   - **Dado danificado** não é apagado: cópia em `plataforma-estudos:v1:danificado`, tela avisando e botão para baixá-la.
   - **Todas as portas de entrada** (navegador, importar, arquivo, nuvem) passam por `prepararDados` — importar backup
     antigo pulava migrações (sem fichas nem agenda até o F5, e depois Difícil virava Médio).
   - **Revisão feita no modelo antigo** (sem sessão) não é desmarcada nem perde as questões ao ser editada.
   - **Editar sessão antiga** não recria a ficha de um conteúdo excluído (só entram no cadastro os nomes novos).
   - **Progresso** conta as baterias avulsas (barras, painel do dia e sequência), como a aba Questões.
   - **Arquivo .json e nuvem**: quem está mais novo ganha, comparando com a data do dado **ao abrir** (`dataDoLocal`) —
     a gravação da própria abertura fazia o navegador limpo parecer mais novo que o arquivo/nuvem.
   - **Bateria de sessão antiga** (fora das 60 recentes) edita sem trocar de sessão; **excluir conteúdo** tira o nome
     dele dos cards mistos pendentes.
   - **Pergunta curta do app** (`pedirValor`, `#dialogo`, por cima da tela sobreposta) no lugar do `prompt()` em renomear
     disciplina/conteúdo e **remarcar** (que pedia a data digitada). Testes respondem a ela por `testes/_dialogo.cjs`.
   - **Excluir disciplina** sem uso (sem sessão, anotação nem revisão à mão), com os conteúdos "a estudar" dela.
   - Textos: README (aba Disciplinas), avisos de lista vazia, Ajuda (lista numerada), "Faltam até a prova" → "Na agenda",
     contagem de conteúdos da disciplina = cadastro. Código morto removido (`concluirRevisao`, `propagarRenomeacao`,
     o replanejamento que nunca acontecia em `mudarLigacao`).
   - **Decisões do Pedro sobre o que ficou em aberto (24/09):** o card *Questões das sessões* lista **só** as sessões
     com questões (fica como está); disciplina com sessão **não se exclui** — o caminho é renomear; o teste do arquivo
     .json no Chrome fica de lado, porque o próximo passo é ligar um banco de dados; com dois aparelhos na nuvem, vale
     a última gravação (aceito).

50. **Caixas das questões iguais em todo lugar** (24/09, pedido do Pedro). Editar a sessão e editar pela aba Questões
   usam as mesmas caixas do registrar (`camposQuestoes`): sem questões, vêm **vazias** com o exemplo apagado (20 / 14),
   em vez de um "0" para apagar. O acerto zero só aparece quando há questões. Ponto 12 da `varredura.js`.

51. **Ícone da aba do navegador** (24/09, pedido do Pedro): o livro aberto da marca do cabeçalho, branco no bloco
   verde (`--accent-forte`), embutido no próprio `index.html` — sem arquivo à parte. Três versões do mesmo desenho:
   PNG 64px (Safari mais antigo não usa ícone SVG), SVG (os demais) e `apple-touch-icon` 180px (iPhone/iPad).

52. **Do cronômetro até a sessão** (24/09, pedido do Pedro). Com uma sessão escolhida como destino do tempo — antes
   de iniciar ou já rodando nela —, o cronômetro mostra **ver na aba Sessões →** (`botaoIrParaSessao`): leva à aba
   Sessões, rola até a linha e a acende (`ui.focoSessao`, uso único). Filtro que esconderia a sessão é limpo, com
   aviso. Sem sessão escolhida (nenhum destino ou "Nova sessão"), não aparece. Suíte nova `cronosessao.js`.

   **Pendente — ícone no Safari:** no Chrome o ícone novo (item 51) aparece; no Safari 26.3 não apareceu nem
   abrindo por `http://127.0.0.1` (logo, não é só o `file://`). Próxima tentativa, combinada para depois: o ícone
   em arquivo de imagem ao lado do `index.html`, em vez de embutido (data URI).

53. **Levantamento: celular, tablet e computador** (24/09, só levantamento — nada alterado). Resultado completo em
   **`LEVANTAMENTO-CELULAR.md`**. Computador pronto; no celular, duas telas abrem fora da tela (registrar/editar
   sessão e lançar questões), reordenar não funciona no toque, a aba Disciplinas fica esmagada e os dados não passam
   entre aparelhos. **Ordem combinada com o Pedro:** primeiro preparar para o celular, depois o PWA (que depende de
   hospedar — ainda não hospedado). Continua em outro momento.

54. **Falta estudar automático** (24/09, pedido do Pedro). O mural deixou de ser montado à mão: **todo conteúdo
   cadastrado sem sessão aparece nele sozinho** (`filaAEstudar` = `aEstudar`), e sai na primeira sessão. Saíram o
   botão "+ Adicionar conteúdos a estudar", o modal de escolha (`modalMural`) e o ✕. Fica a ordem: arrastar/↑↓
   grava `prioridade`; conteúdo novo entra no fim. O campo `mural` das fichas antigas ficou sem uso. Conteúdo
   concluído sem sessão não entra (não é "falta estudar"). `mural.js` reescrita; Ajuda e README atualizados.

55. **Primeiros passos no celular** (24/09; itens 1, 4 e 6 do `LEVANTAMENTO-CELULAR.md`).
   - **Aba Disciplinas** (item 4): em tela estreita (≤620px) o nome do conteúdo fica com a linha inteira e
     renomear/concluir/excluir descem para a linha de baixo (`.item-conteudo`). Antes: uma palavra por linha e o
     "renomear" por cima do nome.
   - **Zoom do iPhone** (item 6): em tela de toque (`pointer:coarse`), campos com 16px — abaixo disso o Safari do
     iPhone amplia a página ao tocar no campo. No computador, nada muda.
   - **Aviso do rodapé (toast)**: usa a largura da tela (era preso à metade dela e, no celular, virava uma coluna
     estreita).
   - **Item 1 era falso alarme**: a ferramenta de medição alargava a página. Medido sem ela, registrar sessão e
     lançar questões já cabiam. Ficou só uma precaução no CSS (caixa e campos podem encolher). Corrigido no
     levantamento, com o aviso para quem medir de novo.

56. **Celular, segunda leva** (24/09; itens 3, 5, 7, 8, 9 e 10 do `LEVANTAMENTO-CELULAR.md`). Conferido no Chrome
   com emulação de celular (390px), tablet (820px) e computador (1280px — igual a antes). Suíte nova `celular.js`.
   - **Reordenar no toque** (3): em tela de toque (`pointer:coarse`) a alça ⠿ some e aparecem botões **↑ ↓**
     (`setasDeToque`, ação `mover-toque`, o mesmo `moverItem` das setas do teclado), no mural e nas anotações.
   - **Sessões em cartões** (5): até 620px, cada sessão é um bloco — conteúdo e descrição em cima; data ·
     disciplina · tempo, etiquetas e ▶ continuar embaixo. Só CSS, sobre as marcas `s-data`, `s-cont`… das células.
   - **Abas numa linha só** (7): até 620px, uma faixa que rola para o lado (esmaecida na ponta para dizer que há
     mais); a aba aberta é trazida para a vista. Cabeçalho mais baixo. **Em 25/09, depois de abrir no celular, o
     Pedro pediu as abas no ALTO** (tinham ido para o pé da tela, como num app): a faixa fica logo abaixo do
     cabeçalho e presa no topo ao rolar (`position:sticky`). No tablet, como estava (ele aprovou).
   - **Gráfico de questões** (8): no celular nasce com metade da largura, letras do tamanho de verdade e menos datas.
   - **"ver no cronograma ↓"** (9) fica visível no toque. **Tablet** (10): o cabeçalho empilha até 900px.

57. **Celular, terceira leva** (25/09, pedido do Pedro: "1 e 2 da maneira que você achar melhor").
   - **Filtros da aba Sessões recolhíveis**: até 620px ficam atrás do botão **Filtros** (`toggle-filtros-reg`,
     `ui.filtrosRegAbertos`), que diz quantos estão valendo ("1 ativo"). No computador o botão não existe
     (`.so-celular`) e os campos ficam à vista, como antes.
   - **"Registrado hoje" e "Desempenho por disciplina/conteúdo" em cartões** (`.tab-cartao`): nome em cima; os
     números embaixo com o rótulo junto (`data-rot`, porque o cabeçalho da coluna some); a barra de acerto inteira.
   - Conferido no Chrome com emulação de celular e no computador (igual a antes). Testes em `celular.js`.
   - **Não feito, a pedido:** o teste num iPhone de verdade (barra do Safari, teclado, cronômetro bloqueado).

58. **O mesmo filtro em todas as abas** (25/09, pedido do Pedro: "como o filtro das Anotações"). Uma peça só,
   `filtroDiscCont(pre, …)` + `FILTROS_DC`: caixa de **Disciplina** e caixa de **Conteúdo** em cascata (a disciplina
   manda no conteúdo; escolher um conteúdo escolhe a disciplina dele), valor do conteúdo = `chaveAssunto`, escolha
   velha que não está mais nas opções vale como "todos". **Decisões do Pedro:** vale em **todas as telas** (não só no
   celular); a aba **Questões mantém as várias disciplinas** em botões e ganhou só a caixa de Conteúdo.
   - **Sessões**: + Conteúdo (`fAssunto`). **Agenda**: as duas caixas que já havia, no visual novo. **Disciplinas**:
     os botões viraram as caixas (`cAssunto` mostra só aquele conteúdo; o cabeçalho da disciplina segue falando dela
     inteira). **Progresso**: os botões viraram as caixas (`pAssunto`; clicar numa barra continua filtrando a
     disciplina). **Questões**: `qAssunto` recorta números, gráfico, listas e desempenho; o card de filtro só aparece
     quando há o que escolher.
   - Renomear disciplina ou conteúdo leva a escolha dos filtros junto. Suíte nova `filtrosdc.js`; `subagenda`,
     `mural` e `novoconteudo` passaram a usar as caixas.
   - **Ajustes pedidos no mesmo dia:** na aba **Questões** a fileira de botões de disciplina também virou caixa — a
     caixa de **Disciplinas** abre uma lista de caixinhas de marcar (uma, várias ou todas; fecha ao clicar fora),
     então as várias disciplinas ao mesmo tempo continuam valendo. Saiu o CSS da fileira (`chips-rolagem`).
     `grafquestoes.js` atualizada. Na **Agenda**, o quadro de Disciplina/Conteúdo ganhou respiro da linha
     **Revisões** (que só aparece em "A fazer") e da linha Organizar.

59. **Estrutura do Supabase pronta para colar** (25/09, antes de hospedar). `supabase/estrutura.sql`: tabela `dados`
   (uma linha por conta), RLS com uma política por operação (ler/criar/atualizar a própria linha; sem apagar; `anon`
   sem acesso) e **histórico de versões** (`dados_historico` + gatilho: guarda a versão anterior no máximo a cada 6 h,
   por 30 dias; receita de recuperar no fim do arquivo). Conferido num Postgres local (PGlite) com as peças do
   Supabase simuladas — 16 verificações, incluindo rodar duas vezes. README (passo a passo) e o comentário do
   `NUVEM` atualizados: **SMTP próprio** (sem ele o código só chega para a equipe do projeto), `{{ .Token }}` nos
   modelos **Magic Link e Confirm signup**, e desligar novos cadastros depois de criar as contas.
   **Revisão do mesmo dia**, simulando as permissões padrão do Supabase (que liberam tudo em tabela nova): o SQL
   passou a **tirar** as sobras (a conta logada tinha DELETE e TRUNCATE — o TRUNCATE passa por cima do RLS) e a
   fechar as funções internas; o histórico passou a guardar **sempre que os dados encolhem** (antes, dentro das 6 h,
   uma gravação por cima com dado velho perdia a versão boa) e tem teto de 200 por conta. Suíte nova `supabase.js`
   (PGlite, 22 verificações). No app: o dado sabe **de que conta é** (`db.contaNuvem`) — entrar com outra conta no
   mesmo navegador subia os dados da primeira para a segunda; agora pergunta e troca (`nuvem.js`, 7 testes novos).
   **Ainda não testado contra um Supabase real** — o primeiro login é o teste que falta.

60. **Supabase criado e ligado** (25/09). O Pedro criou o projeto (`vosdzokcqnbxmrqqrpkv`, São Paulo), rodou o
   `supabase/estrutura.sql` (as duas tabelas com RLS ligado — o aviso "sem RLS" do editor é alarme falso: o arquivo
   liga logo depois do `create table`), configurou SMTP próprio (um Gmail criado para isso, com senha de app) e os
   modelos Confirm signup e Magic Link com `{{ .Token }}`. `NUVEM` preenchido com a URL e a chave **publishable**.
   Checagem só de leitura contra o projeto real: login por e-mail ligado; sem login, ler e gravar em `dados` e em
   `dados_historico` são recusados (42501). `nuvem.js` passou a esvaziar o NUVEM por conta própria (não chama o
   Supabase real). **Primeiro login real: FEITO em 25/09** (conta do Pedro; o código chegou pelo SMTP). O único
   tropeço foi o e-mail digitado errado no Username do SMTP → `535 Username and Password not accepted` — o motivo
   só aparece em **Logs → Auth** (`auth_logs`), não no Audit Log nem no log "edge". **Falta:** o login da outra
   pessoa (no aparelho dela — depende de hospedar) e, depois, desligar **Allow new users to sign up**.
   **Defeito achado no primeiro uso real (Safari):** depois de entrar, o chip dizia "Sem conexão — The string did
   not match the expected pattern." Gravar no Supabase devolve **201 Created com corpo vazio** (não 204), e o app
   tentava ler o vazio como JSON; a gravação tinha dado certo, mas aparecia como falha e ficava "pendente".
   `chamarNuvem` passou a ler o texto primeiro (vazio = null). O servidor falso de `nuvem.js` respondia 204 — agora
   responde 201 vazio e o `json()` dele falha no vazio, como o navegador (a versão anterior falha no teste novo).

61. **Login com senha e tela de acesso** (25/09, pedido do Pedro; **a plataforma passou a exigir a conta**). Tela de
   acesso (`#acesso`, `portaoFechado`, `pintarAcesso`) cobre o app inteiro — o app nem é desenhado por baixo.
   **Entrar** (e-mail + senha, `grant_type=password`); **Primeiro acesso** (código por e-mail → `conferirCodigo`
   tipo `email` → **criar senha**, `PUT /auth/v1/user` com `data.senha_criada`); **Esqueci a senha** (`/recover` →
   código tipo `recovery` → senha nova); conta antiga sem senha → pede para criar (`conferirSeTemSenha`, pelo
   `GET /auth/v1/user`). "Primeiro acesso" num e-mail que já tem senha é recusado (o código sozinho não entra).
   Sair encerra a sessão também no Supabase (`/logout`). Senha mínima 8; erros traduzidos (`traduzirErroAcesso`).
   Pergunta do objetivo e do pós-prova esperam a entrada (`objetivoPendente`, `concluirEntrada`).
   **Dois defeitos corrigidos junto:** renovar a sessão **sem internet apagava a sessão** (com login obrigatório,
   trancaria a pessoa fora do app) — agora só sai se o Supabase recusar (4xx); e a renovação perdia os campos da
   sessão. Suíte nova `login.js` (34 verificações); o Supabase falso virou `testes/_nuvemfalsa.cjs` (usado também
   por `nuvem.js`). As suítes antigas abrem o app com `window.__semLogin` (o app real nunca liga).
   **No Supabase (Pedro):** modelo **Reset Password** com `{{ .Token }}` e senha mínima 8.

62. **Perfil no cabeçalho** (25/09, pedido do Pedro). Círculo com a **inicial do nome** (`#btnPerfil`, `pintarPerfil`,
   `inicialDe`) e um menu: nome e e-mail, situação da sincronização (`#chipNuvem`, agora "Sincronizado às…"),
   **Editar perfil** (`modalPerfil`: nome; e-mail só leitura; senha nova opcional), **Baixar backup**, **Enviar
   backup** (`#btnExportar`/`#btnImportar` foram para o menu), o arquivo no computador (`#chipArquivo`; com conta, vira
   "Salvar também num arquivo .json") e **Sair da conta**. Configurações, ajuda e modo noturno ficaram lado a lado.
   Pontinho no círculo quando a sincronização para (âmbar) ou falha (vermelho). O **nome** é pedido ao criar a senha
   (primeiro acesso e conta antiga; não no "esqueci") e mora na conta do Supabase (`user_metadata.full_name`, o
   "Display name" do painel), com cópia na sessão. **Banco:** o nome não pede mudança; o **Enviar backup** pediu a
   `supabase/alteracao-01-backup-enviado.sql` — o app marca o envio (`importadoEm`) e o gatilho guarda a versão da
   nuvem sempre que a marca muda (antes, um backup maior enviado dentro das 6 h passava sem guardar a anterior).
   Testes em `login.js` (menu, perfil, nome) e `supabase.js` (alteração 01).
   **Banco do projeto real conferido em 25/09:** o Pedro rodou a alteração 01 e uma consulta de conferência deu os 7
   itens "ok" (4 regras de acesso, permissões enxutas, anon sem acesso, histórico que guarda quando encolhe e quando
   chega backup, gatilho ligado, funções internas fechadas) — o banco está igual ao `estrutura.sql` atual.
   No mesmo dia o Pedro configurou o modelo **Reset Password** (com `{{ .Token }}`) e a **senha mínima 8**, e testou
   no app real: criar a senha, o nome no Editar perfil e o círculo com a inicial — ok. (Commit ainda não pedido.)
   **Ajustes do mesmo dia (pedido do Pedro):** o item da conta no menu virou **"Conta e sincronização"**, com o mesmo
   desenho dos outros itens; a situação vai no título e, só quando há algo a dizer, numa palavra miúda à direita
   ("sem conexão", "salvando…"). Todos os ícones do menu viraram traço fino (SVG), na cor da marca — o ☁ e o 🗎
   saíam como emoji colorido. O **nome é opcional** (criar a senha e Editar perfil); sem ele, o círculo usa a inicial
   do e-mail e o topo do menu mostra só o e-mail. O painel "Conta e sincronização" perdeu **Trazer da nuvem** e
   **Sair da conta** (sair fica só no menu do perfil).

63. **Conta sempre à vista e cronômetro no meio do cabeçalho** (25/09, pedido do Pedro).
   - **"Conta e sincronização" aparece já na abertura** (antes ficava escondido até a primeira resposta do Supabase,
     que demora mais depois de o app ficar fechado): com a conta configurada e alguém logado, o estado de partida é
     `iniciando` → "carregando…" no item. Aberto o painel antes da resposta, ele mostra "Carregando a sua conta…" (com
     uma rodinha) e se redesenha sozinho quando a conta responde (`esperarConta`, assíncrona, até 20 s).
   - **Cronômetro rodando embaixo da contagem da prova** (`#centroTopo`: `#regressiva` + `#cronoChip`), não mais à
     direita. Na versão web (>900px) a contagem sobe ~16px e o conjunto não empurra as abas (3px, medido); no celular
     o cabeçalho só cresce um pouco (o Pedro pediu o deslocamento só na web).
   - Testes em `login.js` (conta carregando, painel que se atualiza, cronômetro no meio).

64. **Marca e perfil maiores** (25/09, pedido do Pedro). "Plataforma de Estudos" 25→29px e o bloco do livro 36→44px
   (no celular, 24px e 40px); o círculo do perfil 36→44px, letra 19px. **Celular e tablet** (cabeçalho empilhado): o
   perfil sai da fileira de botões e fica no **canto superior direito** (primeiro foi o esquerdo; o Pedro pediu o
   direito no mesmo dia), na altura do nome; o nome se afasta (54px) e o menu abre alinhado pela direita.
   Na mesma leva, a fileira de baixo do cabeçalho empilhado ocupa a largura toda: **datas à esquerda, ajustes/ajuda/
   tema à direita**, meio vazio. O cabeçalho passou a empilhar **até 1060px** (era 900): com o nome maior, a 980px
   ele já encostava na contagem da prova — medido a 1100px (folga de 21px) e a 980px (empilhado). O ajuste do
   cronômetro na web acompanha (≥1061px).

65. **Cabeçalho mais enxuto e cronômetro que lembra a sessão** (25/09, pedidos do Pedro).
   - **Cronômetro no cabeçalho um pouco menor** (web e celular; o card da aba Hoje ficou como era, a pedido) e a
     **contagem de dias até a prova** também (número 27→23px, menos folga).
   - **O card Prova/Hoje não abre mais os Ajustes**: tocar nele mostra o aviso "A data da prova pode ser alterada em
     Ajustes (⚙)" (`info-datas`) — tocar por engano no celular jogava a pessoa nos Ajustes.
   - **⚙ e ◐ trocaram de lugar**: datas, ◐, ?, ⚙ e o perfil.
   - **Sem data de prova** (sem objetivo, ou concurso/vestibular com data a definir): a **contagem some** e o card
     das datas mostra **só hoje** (antes: "Estudo contínuo · sem data de prova" e "Sem objetivo").
   - **A sessão escolhida no cronômetro fica escolhida** — ao fechar e abrir, ao encerrar — e só zera em **outro dia**
     (`cronoDestino` no estado de tela, apagado quando o dia salvo não é hoje e na virada do dia). Cronômetro que
     criou uma sessão nova passa a apontar para ela.
   - Testes: `cronosessao.js` (memória do cronômetro), `objetivos`/`semprova` (sem data de prova), `ajustesajuda`
     (o card das datas — o teste antigo passava por acaso, lendo o título de um modal já fechado), `login` (ordem).

66. **Contagem da prova sem os fogos** (25/09, pedido do Pedro). Saíram os 🔥 (antes: 1 de cada lado, 2 na última
   quinzena, 3 na última semana); a urgência continua na cor (vermelha na última semana). O espaço virou letra maior
   no limite de o card não crescer — busca feita no navegador: número 23→**32px** na web e 21→**28px** no celular,
   rótulo 12,5→**15px**; a altura é quem limita, e a largura que sobra ficou de respiro dos lados. Medido: 225×42
   (era 226×42) na web, 216×38 (era 218×38) no celular. `cabecalho.js` reescrita para a contagem sem fogo.

67. **Dois textos a menos** (25/09, pedido do Pedro): saiu a frase "Para sair da conta, use o círculo do perfil." do
   painel Conta e sincronização, e o botão **Ir para a aba Disciplinas** dos Ajustes.

68. **Reconectar quando a internet volta** (25/09). Ao evento `online`, se a conta estava *offline* (ou
   presa em *iniciando*), a nuvem é reiniciada; se só havia gravação pendente, ela sobe. A sessão continua
   guardada: sem internet ninguém é deslogado (`renovarSessao` só desloga em resposta 4xx). Teste em `nuvem.js`.

69. **Revisões até a prova, escolhidas por conteúdo** (25/09, pedido do Pedro; escolhas dele: *eu escolho as
   datas*, *depois da prova volta ao automático*, entradas na *aba Disciplinas e no card da Agenda por assunto*).
   Botão **até a prova** só em conteúdo **concluído** com prova à frente (`podeEscolherAteProva`). Janela
   `modalRevisoesProva`: Automáticas / Eu escolho, quantidade (1 até os dias livres, máx. 30) e uma data por
   revisão, sugeridas por igual até a véspera (`sugerirDatasAteProva`). Salvar (`definirRevisoesProva`): saem as
   automáticas pendentes do conteúdo e as pendentes até a prova; nascem itens `manual:true, planoProva:true`, no
   degrau da última feita; `ficha.revisoesProva = <data da prova>`. `pausaAteProva` faz `continuarEscada` e
   `reespacarEscada` só criarem depois da prova; `reancorarEscada` e `remanejarItem` não empurram `planoProva`.
   Passada a data, `garantirEscadas` apaga o sinal e a escada segue. Reabrir o conteúdo (`marcarConteudos`) tira
   o sinal e as escolhidas pendentes. Meta na linha do conteúdo e selo "datas suas até DD/MM" no card da Agenda.
   Suíte `revprova.js` (31 verificações).

70. **Personalizar na Agenda e filtros mais justos no celular** (25/09, pedido do Pedro). O botão das revisões
   até a prova saiu do card da Agenda por assunto (ficou só o selo "datas suas até DD/MM") e virou o atalho
   **Personalizar revisões até a prova**, logo abaixo da linha *Revisões* (só em *A fazer* e quando há conteúdo
   que pode). Vindo dali, a janela tem um seletor de conteúdo (só os concluídos, com "(personalizado)" nos que já
   estão), que começa no conteúdo do filtro (`ui.aAssunto`) ou na disciplina filtrada. O modo "Eu escolho
   quantas e quando" passou a se chamar **Personalizar**. No celular, os filtros da Agenda ficaram mais justos:
   o rótulo não reserva mais 72px, o espaço entre os botões caiu para 6px e os botões diminuíram um pouco. Em
   390px, *Situação: A fazer · Concluídos* e *Revisões: …* cabem numa linha só. Banco: nenhuma mudança (os campos
   novos `revisoesProva`/`planoProva` vão dentro do JSON). `revprova.js` com 37 verificações.

71. **Uma entrada só, sem emoji** (25/09, pedido do Pedro). Saiu o botão "até a prova" da aba Disciplinas
   (`botaoAteProva` removida): a única entrada é o atalho **Personalizar revisões até a prova** da Agenda. Na
   linha do conteúdo, em Disciplinas, continua só o aviso "N revisões escolhidas até DD/MM — automático
   pausado até lá". Saiu também o emoji de calendário do atalho, do aviso e do selo do card. O texto da Ajuda
   foi da aba Disciplinas para a da Agenda. `revprova.js` com 39 verificações.

72. **Telas mais limpas e o Excluir no canto** (26/09, pedidos do Pedro).
   - **Tempo (min) vazio** quando a sessão não tem tempo (antes vinha "0" ao reabrir), igual às questões.
   - **Pistas que saíram dos botões:** "você escolhe a disciplina…" (Nova anotação), "ligadas a uma sessão já
     registrada" (Lançar questões feitas) e "em X / escolha uma disciplina…" (Novo conteúdo — travado, o pedido
     da disciplina ficou só no `title`). Saiu também "N lançamentos feitos fora de uma sessão" (Baterias avulsas)
     e "Ordenado pela pior taxa de acerto…" (Desempenho), que ganhou um botão só de seta (`q-ordem-taxa`,
     `ui.qOrdemTaxa`, lembrado na tela) para inverter a ordem pela taxa.
   - **Celular:** anotação com ↑ ↓/estrela/editar numa faixa em cima e o texto embaixo na largura toda; Período
     (7·30·90) numa linha; "Questões dia a dia" com o resumo na linha de baixo.
   - **Excluir:** o ✕ saiu do card da bateria avulsa (fica só no editor). Nas quatro telas de edição (sessão,
     revisão/card, anotação, lançamento) o botão (`.excluir-tela`) fica **sempre no canto inferior direito**, com
     contorno e fundo vermelho; no celular os botões da esquerda encolhem e "Salvar alterações"/"Continuar hoje"
     viram "Salvar"/"Continuar" (`.so-largo`). E **todo excluir diz só "Excluir"** — saíram "Excluir ponto",
     "Excluir lançamento", "Excluir revisão" e "Excluir card".

73. **Revisão de UX e correções** (26/09, pedido do Pedro: "corrija tudo o que você identificou"). Relatório com 35
   itens em 3 grupos, feito com capturas reais (Chrome com emulação de aparelho, 390/820/1280 px, claro e escuro).
   - **Defeitos**: a faixa "Sessão cronometrada: 0min ( → )… o domínio" aparecia em todo registro aberto pela agenda,
     pelo ▶ estudar e pelo ▶ continuar (só o cronômetro traz horário); o ✓ de um item de outro dia abria um formulário
     que não salvava (a revisão tocada não estava na lista); o rótulo do dia contava só a amostra ("3 itens" num dia com
     11); "+ Novo conteúdo" travado não respondia ao toque; estados vazios que mentiam (Questões: "botão abaixo" que não
     existe; Falta estudar: "tudo cadastrado já tem sessão" sem cadastro); "Failed to fetch" cru no painel da conta; o
     card Agenda do Progresso misturava "no dia" e total; a ordem das Sessões contava como filtro; plurais com "(s)".
     **Achado na correção**: o painel "Personalizar" das revisões até a prova aparecia com "Automáticas" marcado — o
     display de `.campo` vencia o `hidden`; entrou `[hidden]{display:none!important}`.
   - **Uso**: o ✓ e o ▶ estudar abrem o registro por cima da aba atual; cronômetro com o grupo **Estudar hoje** e ▶ estudar
     perguntando *Cronometrar agora / Registrar sessão* (`escolher`, `comecarCronoNoConteudo`); **`confirmar`/`avisar`**
     (janela do app) no lugar dos 19 `confirm()` e 4 `alert()` — nos testes, `w.__confirmarNativo` responde pelo
     `w.confirm` e `w.__escolha` pelo `escolher`; Disciplinas com *✎ editar* (nome + **Excluir** no canto, como no item 72)
     e *✓ concluir* na linha; Lançar questões escolhe o conteúdo (liga à sessão mais recente dele); Ajustes com rodapé
     fixo; nomes sem jargão (Baixar cópia dos dados, Restaurar uma cópia, Questões fora das sessões, Espaçado); vermelho só
     para atraso; áreas de toque em `pointer:coarse`; `--muted` #5f676a (≥4,5:1) e ajustes de contraste no escuro; foco
     preso na janela aberta; aria-label no ✓ e na ★; `*assim*` vira negrito.
   - **Tela limpa**: as frases do cronômetro, da agenda, do registro, do card de continuar, da Nova revisão, do Lançar,
     do Personalizar, dos Ajustes, do mural e do Progresso foram para a Ajuda (conferido item a item).
   - **Não feito, por ser decisão do Pedro**: coluna/selo "estudo" (item 31); Progresso abrir no dia de hoje (preso em
     `virada.js`); e os 4 de "vale reconsiderar" (exemplos 60/20/14 nos campos, números do topo da Agenda contando tudo,
     tamanho do cabeçalho no celular, card da prova só avisando).
   - Suíte nova `revisaoux.js`; ajustadas: continuidade, fases, novoconteudo, converter, arquivo, login, grafquestoes,
     excluirconteudo, varredura, renomear, lancamentos, ajustesajuda, hojerev, retomada, trava, mural, celular, juntar,
     e as 65 que simulam `confirm` ganharam `__confirmarNativo`. **107 suítes verdes.**
   - **Depois, a pedido do Pedro:** a opção *Criar os agendamentos automaticamente* dos Ajustes ficou menor (13px, menos
     folga): com 14px ela media 540px numa área de 558, e a barra de rolagem vertical do navegador fazia surgir a barra
     lateral. Continua numa linha só no computador; abaixo de 640px quebra a linha em vez de rolar.

74. **Três pedidos de 26/09** (depois do item 73).
   - **Saiu "Como o cronograma é montado?"** do pé da Agenda (`ajudaCronograma` removida); o texto já estava na Ajuda,
     seção Continuar e revisar.
   - **Revisões até a prova personalizadas mandam na Agenda**: em *Todas as agendadas*, as `planoProva` ficam ativas e as
     outras pendentes do conteúdo (a escada que recomeça depois da prova e as marcadas à mão) aparecem **bloqueadas** —
     apagadas, sem ✓ nem editar, com "bloqueada até DD/MM" (`bloqueadaPelaProva`, em `itemRevisao` e `linhaRevisao`);
     em *Só as 2 próximas* elas nem aparecem (`soAsProximas`). O ✓ de uma bloqueada é recusado com aviso.
   - **Dificuldade editável na aba Disciplinas**: uma caixa Difícil/Médio/Fácil em cada conteúdo
     (`seletorDificuldadeConteudo`, `definirDificuldadeDoConteudo`). Como a dificuldade do conteúdo é a da sessão MAIS
     RECENTE dele, a mudança entra nessa sessão e passa por `salvarRegistro` — refaz a escada (concluído) ou o card de
     continuar (em andamento), e a aba Sessões e o formulário passam a mostrar a nova. Conteúdo sem sessão guarda a
     escolha em `ficha.dificuldade`, que vem preenchida na primeira sessão (`dificuldadeDaFicha`, `dificuldadeHerdada`,
     dica "Veio da dificuldade escolhida na aba Disciplinas"). Sessão com vários conteúdos: a mudança vale para todos
     eles, e o aviso diz quais.
   - Suíte nova `difconteudo.js`. **108 suítes verdes.**

75. **Supabase acordado** (26/09, pedido do Pedro). O plano gratuito pausa o projeto após 7 dias sem uso. Função
   `public.ping()` (só `select now()`, executável pela chave pública) em `supabase/alteracao-02-manter-acordado.sql` e
   na seção 4 do `estrutura.sql`; o cron-job.org faz `POST /rest/v1/rpc/ping` a cada 3 dias (README → "Manter o
   projeto acordado"). **Falta o Pedro:** rodar a alteração 02 no SQL Editor e criar o job no cron-job.org. O app não
   mudou. Descartados: GitHub Actions (projeto sem remoto; o GitHub desliga agendamentos de repositório parado há 60
   dias), `pg_cron` (atividade de dentro do banco não parece contar) e agendamento no Mac (só com ele ligado).

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
