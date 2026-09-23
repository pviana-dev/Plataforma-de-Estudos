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

## Pendências

- **Merge do ramo na `main`** — depende do Pedro testar com os dados dele.
- ~~**Reestruturação da aba Agenda**~~ — **FEITO**, ver item 23. O botão *Adicionar revisão* ficou
  logo abaixo dos indicadores.
- ~~**Unificação por CONTEÚDO (item (b))**~~ — **FEITO**, ver item 16. O que segue abaixo é o
  registro de como o problema foi entendido; a parte 1 (ordem) e a parte 2 (sobreposição parcial)
  estão resolvidas. O plano continua pendurado na sessão (`rev.registroId`), mas a invariante que
  importava está garantida sem reescrever o núcleo.

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
cd testes && ./rodar.sh          # todas (90 suítes)
cd testes && ./rodar.sh fases    # só as que casam com "fases"
```

Elas abrem o `index.html` de verdade num DOM (jsdom) e clicam nos botões. **90 suítes verdes** no ramo.

**Duas armadilhas já conhecidas do banco de testes:**
- data: usar sempre a data **local** (`iso()` local), nunca `toISOString()`, que vira o dia em UTC e
  quebra tudo depois das 21h em UTC−3;
- seeds que já usam as escalas novas precisam declarar `fasesMigradas`, `conteudosMigrados` e
  `dificuldadesMigradas`, senão as migrações de carga os convertem de novo.
