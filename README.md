# Plataforma de Estudos — reta final

Aplicação de página única (`index.html`), sem backend e sem dependências externas.
Abra o arquivo no navegador e use. Todos os dados ficam no **`localStorage`** do próprio navegador.

- **Prova:** 11/10/2026 · **Revisões agendadas até:** 10/10/2026 (trava dura no código)
- Interface em pt-BR, modo claro e escuro, responsiva.

## Como usar

| Aba | Para quê |
|---|---|
| **Hoje** | **Cronômetro de estudo** logo no topo, em card próprio com moldura verde — é a ação mais usada do dia; revisões de hoje, atrasadas e dos próximos 7 dias (estas **agrupadas por dia**, mostrando **3 por vez** com **+ ver todas as N**); **Registrado hoje**, um resumo só de leitura das sessões do dia; meta diária e sequência de dias nos números do topo. |
| **Sessões** | Formulário da sessão de estudo (data, disciplina, **um ou vários assuntos**, tempo, questões, acertos, **dificuldade do assunto**, e **um único campo de descrição** para a sessão) e a lista **Todas as sessões**: resumo do que está filtrado (sessões, tempo somado e média, revisões pendentes), separadores por dia com o total do dia, e por sessão o tempo (com o nº de medições do cronômetro, quando há mais de uma), dificuldade e a situação das revisões. **Questões não aparecem aqui** — elas têm aba própria, porque nem toda sessão tem questões (num assunto novo é normal só estudar). Os campos de questões continuam no formulário, opcionais. Registrar e editar acontecem numa **tela sobreposta** (ver abaixo) — a lista nunca é empurrada para baixo. **Clique em qualquer lugar da linha** para abrir a sessão: a tela de edição traz, além dos campos, um bloco **Esta sessão** com os intervalos do cronômetro, quando foi registrada e a situação das revisões. |
| **Revisões** | **Agenda e alerta** — não é aqui que o tempo é registrado. Abre com **Revisões de hoje** — tudo o que tem a data de hoje: em andamento, em aberto e já concluídas —, e só depois vem o cronograma. Cronograma **por assunto** (ou pelo nome do grupo, nos conteúdos integrados), com uma caixa de seleção por dia recomendado. A lista abre com **4 assuntos** — os mais urgentes, porque atraso e pior taxa vêm primeiro — e um botão **+ ver todos os N assuntos** revela o resto. Verde = feita, destaque = hoje, vermelho = atrasada, neutro = futura. Dá para **adicionar** uma revisão à mão (data, o que foi revisado, tempo e desempenho) e **editar ou excluir** qualquer uma. |
| **Pontos importantes** | Dois filtros: **Disciplina** (mostra todos os cards dela) e **Conteúdo** (mostra só aquele tópico). Ambos listam apenas o que existe nas **sessões já registradas** — aqui não se cria disciplina nem conteúdo. A anotação pode ser feita **na disciplina inteira ou num conteúdo dela**, e o botão **+** no topo da lista está sempre disponível: sem filtro escolhido, o próprio compositor traz o seletor *Onde entra* e a anotação só é salva depois que você escolhe. São anotações de **conhecimento geral** sobre a matéria, não sobre uma questão específica — a aba não tem ligação com as questões que você registra, embora mostre **quantas questões e a taxa de acerto** da disciplina como contexto. A tela tem dois cards: **filtros + indicadores + botão de anotar**, e **Anotações**, com a contagem do que está filtrado. A origem da questão e o tipo do erro são **opcionais** e entram depois, no **editar**, que abre a **tela sobreposta** (centrada, com o Salvar sempre à vista). O texto aceita **formatação leve, com cores** e tem **limite de 2.000 caracteres** (ver abaixo). ★ monta a lista de véspera. |
| **Questões** | Tudo o que foi resolvido: total, acertos, erros, taxa geral, questões da última semana e dias com questões. O desempenho aparece **por disciplina** (padrão) **ou por conteúdo** (botão para alternar), ordenado pela pior taxa, com barra de acerto; os conteúdos ainda sem questões são listados à parte. O agrupamento **segue a integração**: cada grupo de revisão vira um bloco único com o nome do grupo, somando as questões de todos os conteúdos que ele reúne (o nome do grupo já diz isso — a etiqueta *plano integrado* saiu daqui, ela continua no card da aba Revisões); o que não está integrado continua listado conteúdo a conteúdo. O botão **+ Lançar questões feitas**, logo **abaixo dos indicadores**, registra uma bateria feita fora da sessão, **ligada a uma sessão já registrada**. Embaixo, os **lançamentos** — de qual sessão, revisão ou lançamento avulso cada número veio, com *editar* e *✕* nos avulsos. |
| **Progresso** | Meta diária, **estudo na semana** e **questões da semana**, calendário de horas por dia, % de acerto por disciplina, tempo por disciplina, situação das revisões e a tabela de prioridade da reta final. **Clique numa disciplina** (no filtro ou na própria barra) para restringir os gráficos a ela; **clique num dia do calendário** para ver o que foi feito naquele dia e filtrar a aba (ver abaixo). |

### Regra: tempo só em data que já aconteceu

Não dá para lançar **tempo de estudo numa data futura** — nem numa sessão, nem numa revisão. Datas
passadas e o dia de hoje aceitam normalmente. Na prática:

- Sessão com data futura **sem tempo** continua valendo (é um estudo planejado).
- Revisão com data futura fica **planejada**: marcá-la como "já revisei" é recusado, e o tempo que
  estiver digitado no campo é descartado em vez de gravado.
- O cronômetro não é afetado: ele sempre lança o tempo no dia em que foi cronometrado, mesmo quando
  somado a uma revisão de outra data.

### Um ponto importante fica preso a uma sessão registrada

As anotações são de **conhecimento geral** sobre a matéria — não são "o que esta questão me ensinou".

**Elas são completamente à parte do cronograma de revisões**: anotar, classificar ou apagar uma
anotação não cria, não adianta e não remove nenhuma revisão, e nenhuma tela de revisão (Hoje, Revisões,
Progresso) menciona as anotações. Até a versão anterior, 2+ anotações de "Desatenção" num conteúdo
somavam +1 revisão e a antecipavam — essa regra saiu.

A aba também não tem ligação direta com as questões registradas nas sessões e revisões; os blocos de
**quantidade de questões** e **taxa de acerto** aparecem só como contexto da disciplina ou do conteúdo
que você está olhando.

A anotação entra em uma das duas dimensões — **a disciplina inteira** (algo que vale para a matéria
toda: uma pegadinha de enunciado, um jeito de eliminar alternativa) **ou um conteúdo dela** (algo
específico do tópico). É só escolher nos filtros do topo:

- **Disciplina escolhida, conteúdo em "Tudo de …"** → o botão **+** anota na *disciplina inteira*,
  com a etiqueta `disciplina inteira` no botão e no card.
- **Conteúdo escolhido** → o botão **+** anota naquele conteúdo, como antes.

O seletor de conteúdo lista **só conteúdos**; o nível da disciplina é o próprio *"Tudo de
«Disciplina»"*, que mostra as duas dimensões juntas — e cada card diz de onde é (`toda a disciplina`
ou o nome do conteúdo). No **editar**, o campo *Onde entra* move a anotação entre as duas dimensões.

O que a aba **não faz** é criar disciplina ou conteúdo — eles vêm sempre das **sessões de estudo já
registradas**. Na prática:

- Os dois filtros do topo listam só disciplinas e conteúdos que aparecem em algum registro. Uma
  disciplina cadastrada mas sem nenhuma sessão **não aparece** ali.
- Não existe mais o botão **+ novo conteúdo** nem o formulário que criava conteúdo (e disciplina) do nada.
- No **editar**, *Onde entra* é um **seletor** (`Disciplina · toda a disciplina` ou
  `Disciplina · Conteúdo`) com o que já existe — sem campo de texto livre e sem a opção
  *＋ Criar nova disciplina*. Dá para **mover** a anotação, nunca inventar um destino.
- Anotação antiga que aponta para um conteúdo sem sessão continua visível, marcada como
  **— sem sessão de estudo**, para você poder reapontá-la ou apagá-la. Esse destino só aparece no
  seletor da própria anotação órfã: não dá para pendurar outras ali.
- Para anotar sobre um conteúdo novo, registre antes a sessão na aba **Sessões**.

### Disciplinas

Disciplinas são um **cadastro próprio** (`db.disciplinas`), separado dos registros. Em todo formulário
(registro, revisão, novo conteúdo, edição de aprendizado) a disciplina é um **seletor**:
só dá para escolher uma já existente ou **＋ Criar nova disciplina**, no topo da lista — o que abre um
campo de texto para o nome. Isso evita a mesma matéria virar três nomes diferentes por causa de
digitação.

Backups antigos continuam funcionando: as disciplinas que aparecem nos registros, revisões e
aprendizados entram automaticamente na lista.

### Dificuldade e quantas revisões cada assunto recebe

O campo **Dificuldade do assunto** (Sem / Pouca / Média / Bastante / Muita) substituiu o antigo
"domínio 1–5" e é o que comanda o plano de revisões:

1. A dificuldade define quantas revisões o assunto **pede** (1 a 5).
2. O desempenho ajusta: taxa abaixo de 60% pede ao menos 4 e abaixo de 75% ao menos 3.
   Taxa ≥ 90% em assunto fácil corta para no máximo 2. **As anotações da aba Pontos importantes
   não entram nessa conta** — elas são conhecimento à parte e nunca mexem no cronograma.
3. O **tempo que resta até a prova** é o teto — e é ele que impede o cronograma de atrapalhar o
   ritmo de estudo. Como os intervalos da repetição espaçada crescem (≈2, 5, 10, 20, 40, 80 dias),
   cada revisão a mais exige uma janela bem maior:

   | Dias até a véspera | Máximo de revisões |
   |---|---|
   | 1–3 | 1 |
   | 4–9 | 2 |
   | 10–29 | 3 |
   | 30–59 | 4 |
   | 60–119 | 5 |
   | 120+ | 6 |

Com os ~26 dias que faltam, o teto é **3 revisões por assunto** — exatamente a faixa 1–3 pedida para
a reta final. Se a data da prova for adiada nos ajustes, o plano se expande sozinho; se for
antecipada, ele encolhe para caber. Backups antigos com "domínio" são convertidos automaticamente
(domínio 1 = muita dificuldade, domínio 5 = sem dificuldade).

### Sem revisão

A caixa **“Sem revisão — só registrar o estudo”** serve para o conteúdo que você estuda todo dia: a
sessão registra tempo, questões e descrição normalmente (e entra no painel e no mapa de calor), mas
**nenhum cronograma de revisão é criado** para ela. Desmarcar volta a agendar o cronograma próprio.
As duas caixas — *integrar* e *sem revisão* — se excluem automaticamente.

### Integrar conteúdos (grupos de revisão)

No formulário de registro existe a caixa **“Integrar com outro conteúdo”**. Ela **não vale sozinha**:
ao marcá-la aparece do lado o seletor obrigatório **“Juntar com…”**, que diz a qual **grupo de
revisão** a sessão entra. Um grupo tem **nome próprio** e reúne as sessões que devem ser revisadas
juntas — uma revisão só cobre tudo, em vez de uma fila por assunto.

O seletor oferece três caminhos:

- **Um grupo que já existe** na disciplina (mostrando quantos conteúdos ele reúne).
- **Uma sessão que ainda está sozinha** — juntar com ela cria o grupo já com as duas dentro, e o nome
  vem do conteúdo dessa sessão. É o caminho para o caso comum: você estudou LAI ontem e hoje, e quer
  as duas na mesma fila de revisão em vez de dois cards separados.
- **＋ Criar novo grupo…**, com o nome que você digitar.

Logo abaixo abre o **editor do grupo**, dentro do próprio formulário da sessão:

- **Nome do grupo** (obrigatório) — é ele que aparece no card da revisão, na aba Revisões e no bloco *plano
  integrado* da aba Questões. Dá para renomear a qualquer momento, por dentro de qualquer sessão do grupo.
- **Conteúdos revisados juntos** — a lista completa do que o grupo cobre, com a sessão em edição
  sempre presente e as demais em etiquetas removíveis.
- **Trazer outra sessão para o grupo** — um seletor com as outras sessões da disciplina; a escolhida
  vira mais uma etiqueta. As mudanças só valem ao **salvar o registro**.

### Integrar não cria cards novos

Essa é a regra central: **integrar soma o conteúdo aos cards de revisão que já existem**, em vez de
abrir uma fila nova. Na prática:

- A primeira sessão a formar o grupo **doa os cards dela** — as datas já marcadas continuam as mesmas,
  agora com o nome do grupo.
- Cada conteúdo que entra depois **passa a ser coberto por esses mesmos cards**; a fila que ele tinha
  sozinho é descartada (o histórico do que já foi revisado é preservado e vai junto para o card).
- A plataforma só **completa** a fila se o grupo tiver menos cards do que o plano pede — e os que
  faltam entram *depois* do último já marcado, nunca no meio do que você já programou.

Como o plano funciona:

- O plano do grupo segue o conteúdo **mais frágil** do conjunto (maior dificuldade, pior taxa).
- **Tirar um conteúdo do grupo (ou desmarcar a caixa) não recria o plano individual**: a sessão fica
  em modo manual, nada é agendado automaticamente para ela e as revisões passam a ser criadas à mão na
  aba Revisões. A tela avisa isso ao reabrir o registro.
- Se o grupo ficar **sem nenhum conteúdo ligado**, os cards voltam para a sessão de onde vieram (nenhuma
  revisão fica órfã) e o grupo é descartado.

### Editar um ponto importante

O **editar** abre a mesma **tela sobreposta** das sessões e das revisões, em vez de transformar a
linha do card em formulário. O motivo é prático: o formulário é alto (caixa de texto grande, origem,
tipo do erro, onde entra, situação) e, inline, o botão **Salvar** caía abaixo da dobra — era preciso
rolar para salvar. Na tela sobreposta ela abre **centralizada**, e o rodapé de ações fica **fixo no
pé da caixa**, então *Salvar*, *Cancelar* e *Excluir ponto* estão sempre à vista, com a rolagem
terminando no fio acima deles.

**Os campos da questão só aparecem quando são o caso.** A tela pergunta *"Isto apareceu numa
questão?"*, com **Não — é da matéria** marcado por padrão. Marcando **Sim — caiu numa questão**,
abre-se um bloco com **de onde veio** (banca, ENEM, vestibular, simulado), **tipo do erro** e **✓
Refiz depois e acertei**. Para a maioria dos pontos — os que vêm da leitura, da aula, do resumo —
sobram só a caixa de texto, o *onde entra* e o **★ Revisar antes da prova**, que nunca dependeu de
questão nenhuma.

Anotação que **já tem** banca, tipo do erro ou "refiz" abre direto no **Sim**, com o bloco aberto —
nada de campo preenchido escondido. E **voltar para Não limpa esses três campos** ao salvar: ficariam
contradizendo a resposta, e o card continuaria mostrando a etiqueta da banca. O texto da anotação,
esse, não é tocado. O par **Não / Sim** funciona como um sanfona: o bloco **cresce e encolhe** na hora (animação de
~0,2s), com o *Sim* ganhando uma setinha que gira ao abrir. Alternar **não redesenha a tela**, então
o que você já digitou continua onde estava. Fechado, o bloco não ocupa altura nem recebe o foco do
teclado (`visibility` entra no fim da transição), e quem prefere menos movimento — `prefers-reduced-
motion` — vê a troca instantânea.

Atrás, no card, a linha que está sendo editada **fica marcada** (fundo verde claro) e o texto
continua legível — dá para conferir as outras anotações do mesmo conteúdo enquanto edita. Fechar
pelo ✕, pelo fundo escuro, pelo **Esc** ou por *Cancelar* desfaz a edição sem gravar.

### Anotar a qualquer momento

O botão **+ Anotar aprendizado** não depende mais do filtro. Antes ele só existia depois de escolher
uma disciplina ou um conteúdo lá em cima; agora ele está sempre no topo da lista, com a pista
*"você escolhe a disciplina ou o conteúdo na hora de salvar"*.

Sem filtro escolhido, o compositor traz um campo **Onde entra \*** com as disciplinas e os conteúdos
das sessões já registradas. **Salvar sem escolher é recusado** — mensagem no rodapé do compositor,
aviso flutuante, aro vermelho no seletor (que some quando você escolhe) e o texto digitado
**intacto**, para não perder o que já estava escrito. Escrever nada também avisa.

Com disciplina ou conteúdo já filtrado, nada muda: o seletor não aparece e o rodapé continua dizendo
*"Vai entrar em X"*. Trocar o filtro com o compositor aberto o fecha, como sempre fez — o destino
mudaria por baixo do que você está escrevendo.

### Um card por conteúdo e dia

As anotações do **mesmo conteúdo, mesma disciplina e mesmo dia** ficam no **mesmo card** — e as que
não têm conteúdo ficam juntas no card da disciplina, também por dia. **Dia diferente = card
diferente**, mesmo sendo o mesmo conteúdo: cada card é o que você anotou daquele assunto naquele dia.
Em vez de uma pilha de cards repetindo a mesma origem:

```
▌ LAI                          2 anotações        17/09/2026
▌ LEGISLAÇÃO
├─────────────────────────────────────────────────────────────
│▏Vale para órgão e entidade.                        ★  editar
│▏● Desatenção
├─────────────────────────────────────────────────────────────
│▏Prazo de resposta é de 20 dias.                    ☆  editar
│▏● Faltou conteúdo   CESPE 2026 Q42

▌ LAI                           1 anotação        12/09/2026
▌ LEGISLAÇÃO
├─────────────────────────────────────────────────────────────
│▏Não confundir com o prazo do recurso.              ☆  editar
```

- **De onde é vai no topo do card**, em destaque: o conteúdo como título, a disciplina abaixo, miúda,
  e a **contagem** de anotações. Em anotação da matéria inteira, o título é a disciplina e o subtítulo
  vira *toda a disciplina*.
- **A data aparece uma vez só**, no cabeçalho, e é sempre uma data cheia — como o card nunca mistura
  dias, não há mais intervalo de datas. Antes ela se repetia em cada anotação; a data individual de
  cada uma continua acessível no *title* da faixa (passe o mouse).
- **⇅ juntar tudo** (ao lado de *★ só as da véspera*) desfaz a divisão por dia quando você quer ver
  tudo de um assunto de uma vez: cada conteúdo vira **um card único**, com todos os dias dentro. Aí a
  data passa a aparecer **miúda em cada anotação, à esquerda da ★**, e o cabeçalho troca a data por
  *"3 dias"*. O botão vira **⇕ separar por dia** e devolve a tela ao estado original. É só um modo de
  visualização: nada é alterado nas anotações. A escolha **é lembrada** junto com os outros filtros
  (ver *O estado da tela também é lembrado*).
- Dentro, **cada anotação é uma faixa** com seu texto, seu **★** e seu **editar**, e um pé com
  categoria, origem e "refeita e acertada" — que só aparece quando há alguma dessas etiquetas.
  A **barra colorida** de cada faixa é o tipo do erro.
- Anotação marcada para a véspera ganha **fundo âmbar** na faixa, e o card inteiro fica com a barra
  esquerda cor de estrela — dá para varrer a lista pela margem. Cards com véspera vêm primeiro.
- Editar abre o formulário **no lugar daquela faixa**, sem esconder as outras anotações do conteúdo.

### A tela de edição da anotação

Campos: a **Anotação** (um textarea alto, que ocupa a maior parte da tela), **De onde veio — banca,
ENEM, vestibular, simulado**, o **tipo do erro**, **Onde entra** e a **Situação** (refeita / ★ véspera).

O campo *"o que me confundiu"* foi removido: o espaço dele foi para o texto da anotação, que é o que
importa. O que já estava escrito nele **não se perde** — continua guardado e aparece no card; só não
é mais editável.

### Formatação do texto da anotação

O campo da anotação tem uma barra com **B**, *I*, **• lista** e **quatro cores**, e o texto é
renderizado com formatação leve:

| Você escreve | Aparece |
|---|---|
| `**prazo de 20 dias**` | **prazo de 20 dias** |
| `_com ressalva_` | *com ressalva* |
| `==20 dias==` | grifado de amarelo |
| `!!não confunda!!` | vermelho — atenção, pegadinha |
| `++vale para todos++` | verde — regra que vale |
| `@@art. 11@@` | azul — lei, artigo, referência |
| `\==isto\==` | escreve `==isto==` cru, sem virar cor |
| linha começando com `- ` | item de lista |
| **Enter** | a quebra de linha é **mantida** |
| linha em branco | separa parágrafos |

**Por que cor por marcador, e não um editor de texto rico:** o que vai para o banco continua sendo
**texto puro** — a marca custa 4 bytes e quem pinta é o CSS. Isso mantém três coisas: a cor
**acompanha o tema** (nada de texto preto sumindo no modo escuro), não há HTML de fora para
**sanitizar**, e colar um trecho do Word não traz 10 KB de `<span style=...>` junto. **Fonte
(família e tamanho) ficou de fora de propósito**: é o que mais quebra a coerência visual e o que
menos ajuda a estudar — destaque semântico rende mais.

**E se eu quiser escrever `==` de verdade?** Duas regras cuidam disso:

1. **O marcador só vale colado no texto.** `==isto==` pinta; `a == b` não, porque há espaço logo
   depois do `==`. Na prática isso já cobre quase tudo — comparações (`se a == b então c == d`),
   `2 + 2 ++ 3`, `gritou !! de novo` e `@@ solto` saem como texto normal. Antes, `se a == b então c
   == d` pintava o trecho do meio.
2. **Barra invertida antes escreve o símbolo cru.** `\==isto\==` aparece como `==isto==`, sem cor e
   sem a barra na tela. Vale para todos os marcadores: `\**`, `\!!`, `\++`, `\@@`, `\_`.

Os trechos escapados saem do texto antes das trocas e voltam no fim, então não são reprocessados —
escapar o de fora não estraga um marcador de verdade na mesma linha. A barra de formatação ensina
isso no rodapé (*"`\==` escreve == sem virar cor"*), com a explicação completa no tooltip. E, como o
marcador precisa estar colado, o botão de cor **deixa o espaço da seleção do lado de fora**: grifar
`" 20 dias "` vira `==20 dias==`, e não `== 20 dias ==` (que não pintaria).

As quatro cores são **semânticas e fechadas** (`CONFIG.CORES_TEXTO`): grifar, atenção, regra e lei.
Elas apontam para os tokens do tema (`--star`, `--critico`, `--bom`, `--s1`), então mudam junto com
claro/escuro.

**Limite de 2.000 caracteres por anotação** (`CONFIG.MAX_ANOTACAO`), com contador à direita da barra:
fica **âmbar** a partir de 90% e **vermelho** no teto. O `maxlength` trava a digitação e a colagem, o
botão de cor se recusa a estourar o limite (avisa em vez de cortar a marca pela metade), e o
salvamento corta o excesso — três camadas, porque dado que entra por importação não passa pela
caixa. São ~2 KB por anotação: 2.000 anotações ≈ 4 MB, ainda dentro do que a nuvem e o navegador
aguentam com folga.

A **quebra de linha era o problema principal**: o texto era impresso cru, e o HTML engolia os `\n`,
juntando tudo num parágrafo só. Agora cada quebra vira `<br>` e cada linha em branco separa blocos.

**Os botões escrevem marca, nunca texto de exemplo.** Sem seleção, eles deixam o cursor no lugar de
escrever: **B** insere `****` com o cursor no meio, uma cor insere `====` do mesmo jeito, e a
**lista** escreve só `- ` (antes vinha `- item`, `**texto**`, `==grifar==` — palavras que a pessoa
tinha de apagar). Com texto selecionado, envolvem a seleção; com **várias linhas** selecionadas, a
lista marca cada uma. Outras arestas da mesma família que foram junto: clicar na lista numa linha que
**já é item** não empilha outro traço; selecionar **só espaços** não cria marca solta; e o clique de
qualquer botão agora **atualiza o contador e o rascunho salvo** — antes `setRangeText` não disparava
`input`, então formatar pelo botão e recarregar perdia o que tinha sido escrito ali.
O texto é **escapado antes** de qualquer transformação: só os marcadores viram tag, então digitar
`<script>` mostra `<script>` como texto, nunca como HTML.

### Editar o card pela aba Revisões

Cada card da ***Revisão por assunto*** tem **✎ editar card**, que abre o mesmo editor direto no card:

- **Título do card** — dar um título a um card que ainda não é integrado **transforma-o num grupo**,
  com a sessão dele dentro. É o caminho mais curto para nomear uma fila de revisão.
- **Conteúdos revisados neste card** — a lista do que está ligado ali, com ✕ para desligar.
- **Ligar outra sessão a este card** — traz mais conteúdo para a mesma fila, sem criar card novo.

Diferente do editor do formulário de registro (que só aplica ao salvar o registro), aqui o **Salvar
card** aplica na hora.

### Lançar questões ligadas a uma sessão

Nem toda bateria de questões acontece no dia do estudo. O botão **+ Lançar questões feitas**, na aba **Questões** logo abaixo dos indicadores (primeiro o
retrato do desempenho, depois a ação), abre a tela sobreposta com quatro campos:

- **Sessão de estudo** (obrigatório) — as 60 sessões mais recentes, `dd/mm · Disciplina · Conteúdo`.
  É dela que saem a disciplina e o conteúdo a que as questões pertencem: **não se cria conteúdo aqui**.
- **Data das questões** — o dia em que você as fez (padrão hoje, data futura é recusada).
- **Questões feitas** e **Acertos**.

O lançamento **não altera a sessão**: os números dela continuam como estão, e as questões lançadas
entram por fora, com data própria. Elas somam na taxa de acerto do conteúdo e da disciplina, no total
da aba Questões e nas **questões da semana** do Progresso — contando no dia em que foram feitas, não no
dia da sessão.

Na tabela de **Lançamentos**, cada um aparece com a etiqueta `questões` (contra `sessão` e `revisão`)
e tem **editar** e **✕** próprios. Excluir a sessão leva junto os lançamentos ligados a ela.

### Numeração das revisões

O número mostrado (“revisão 2”) é **contínuo dentro do card**, contado por data. Como um card pode
reunir mais de uma sessão — duas sessões do mesmo assunto, ou vários conteúdos integrados — a
contagem é do card inteiro, nunca uma sequência por sessão dentro do mesmo card.
- Um grupo vive dentro de **uma disciplina**: o seletor só oferece grupos e sessões da disciplina do
  registro, e trocar a disciplina no formulário refaz as opções.

> **Mudança de modelo.** Antes, integrar jogava a sessão num plano único da **disciplina inteira**, sem
> perguntar nada — por isso apareciam cards com o nome da matéria (“Legislação”) em vez de se juntarem
> ao conteúdo que já estava sendo revisado. Na primeira abertura desta versão, o que estava integrado
> por disciplina **volta ao plano individual** (as revisões pendentes daquele plano saem, as já feitas
> ficam no histórico) e um aviso explica o que houve. Refaça as integrações pelo novo seletor.

### A tela sobreposta dos formulários

Registrar/editar uma sessão de estudo e criar/editar uma revisão **não expandem mais o card**: abrem
uma **tela por cima da que já está aberta**, larga, com o título no alto e os botões fixos no rodapé.
A página de trás continua inteira no lugar (nada de card que cresce e encolhe, nada de rolar até o
topo para achar o formulário) e não rola junto enquanto a tela está aberta.

- **A rolagem termina no fio acima dos botões.** A caixa é uma coluna de três partes — cabeçalho,
  miolo e rodapé de ações — e **só o miolo rola**: antes a barra de rolagem corria a caixa inteira e
  passava ao lado do *Excluir*, como se os botões fizessem parte da lista de campos. Agora o rodapé é
  filho direto da caixa, fica colado no pé e o scroll acaba onde os campos acabam. Os botões
  continuam pertencendo ao formulário pelo atributo `form=` do HTML, então **Salvar**, **Cancelar** e
  **Excluir** funcionam de onde estão. Vale para todas as telas sobrepostas com rodapé de ações:
  sessão de estudo, revisão, lançamento de questões e editor de card de revisão.
- Todas as telas de edição usam a **mesma paleta** (a verde do editor de card): faixa e caixas em
  verde-claro com borda verde, campos normais. Não existe mais o modo edição em âmbar.
- **Fechar** pelo ✕, pelo fundo escuro ou pelo **Esc** — qualquer um dos três cancela a edição em
  curso, do mesmo jeito que o botão **Cancelar**.
- O conteúdo da tela só é remontado quando muda **o que está sendo editado**; redesenhos da página por
  trás não apagam o que você já digitou.
- Ao **encerrar o cronômetro**, essa tela abre já preenchida com o tempo medido. Se você fechá-la, o
  tempo **não se perde**: o botão *Registrar sessão* passa a mostrar `⏱ 1h20 cronometrados
  esperando registro`, e reabrir traz tudo de volta. Só o botão **Descartar**, dentro do formulário,
  joga a medição fora.

### O nome de cada revisão

Por padrão cada revisão se chama pela **ordem dentro do card** — *Revisão 1*, *Revisão 2*, *Revisão
3* —, e a ordem é sempre **por data**: a mais próxima é a nº 1. No formulário há um campo **Nome da
revisão (opcional)**: preenchido, ele substitui o *Revisão N* no título (o campo mostra o nome
automático como sugestão, para você saber o que está trocando).

**Batizar uma não renumera as outras.** O número sai da **posição por data entre todas as irmãs do
card**, inclusive as que ganharam nome próprio — então, se a 2 vira *Revisão da véspera*, a 3
continua sendo a **3**. Quando a revisão tem nome próprio, a posição dela some do título e aparece
discreta na linha de baixo (*2ª da sequência*), para a sequência não se perder.

Apagar o campo devolve o nome automático. Mudar a **data** reordena a lista (é o critério), e nesse
caso os números acompanham a nova ordem — o nome dado, não: ele segue a revisão.

### Adicionar e editar revisões

Além das revisões que o sistema agenda sozinho, o botão **+ adicionar uma revisão** (e o **+ revisão**
de cada assunto) abre um formulário com data, disciplina, assuntos, **atividade da revisão**,
detalhes, tempo, questões, acertos e dificuldade. Cada linha da rotina tem **editar**, que abre o mesmo formulário no lugar
da linha (com **Excluir revisão**).

Se a disciplina e os assuntos coincidirem com uma sessão de estudo já registrada, a revisão é
**ligada a ela** (entra no mesmo grupo e influencia o replanejamento); senão, fica **avulsa**, com
disciplina e assuntos próprios — útil para revisar algo que você nunca registrou como sessão.

Revisões criadas ou editadas à mão ficam marcadas como **manuais** e o replanejamento automático
nunca as reescreve (as automáticas pendentes continuam sendo recalculadas conforme seu desempenho).

### Atividade da revisão

Cada revisão pode ter uma **atividade predefinida**, escolhida numa lista (e alterável a qualquer
momento, inclusive na hora de concluir). O padrão é **A definir** — toda revisão nasce assim, e o
card só mostra a linha de atividade depois que você escolhe uma ou escreve um detalhe.

| Atividade | O que é |
|---|---|
| Resolver questões | Questões novas do assunto (recordação ativa) |
| Refazer os erros | Refazer as questões erradas e conferir os aprendizados anotados |
| Flashcards | Perguntas rápidas de memória, sem consultar o material |
| Mini-simulado | Bloco de questões cronometrado, no ritmo da prova |
| Mapa mental / esquema | Reconstruir o esquema do assunto de cabeça |
| Leitura da lei seca | Ler os dispositivos cobrados no assunto |
| Rever aula ou trecho | Rever só o ponto que ficou confuso |
| Reler resumo e anotações | Leitura ativa do resumo, marcando o que não lembrava |

No card aparece `Atividade: <nome> — <seu detalhe>`, com apenas as partes que você preencheu. A
descrição da coluna acima é dica do seletor (tooltip), não entra no card.

### Revisão conta como tempo de estudo

Ao concluir uma revisão você informa o **tempo**, e ele soma em tudo: meta diária, mapa de calor,
total estudado, tempo por disciplina/assunto e a sequência de dias. O painel mostra a composição
("3 sessões + 2 revisões"). Uma sessão com vários assuntos rateia também o tempo das suas revisões
entre eles.

### Vários assuntos numa sessão

O campo **Assuntos / tópicos** aceita mais de um: digite e clique **+ adicionar** (ou tecle Enter) para
cada tópico — eles viram etiquetas. Para **renomear**, clique no nome da própria etiqueta e digite:
**Enter** confirma, **Esc** desfaz e o **✕** remove. Não é preciso apagar e criar de novo.

Renomear um assunto deixaria órfãs as **anotações** e as **revisões avulsas** que apontavam para o
nome antigo. Quando a troca é inequívoca — um nome saiu, um entrou, e nenhuma outra sessão usa o
antigo —, a plataforma pergunta se deve **levar tudo junto** e renomeia em bloco. Trocando dois nomes
de uma vez ela não adivinha: aí a ligação se desfaz mesmo, e o conteúdo antigo aparece como
*sem sessão de estudo* na aba Pontos importantes. Se você digitar um assunto e salvar sem adicionar, ele
entra do mesmo jeito. A **descrição continua sendo um campo só**, referente à sessão inteira.

Como as métricas por assunto ficam: a sessão é **rateada** entre os assuntos que ela cobriu (tempo,
questões e acertos divididos igualmente), de modo que os totais do painel não são duplicados e a
**taxa de acerto de cada assunto continua sendo a da sessão**. Para o agendamento, a sessão é tratada
pelo seu **assunto mais frágil** (pior taxa de acerto) — então um tópico ruim no meio de uma
sessão boa ainda puxa as revisões para mais cedo. Cada assunto aparece separadamente em
*Aprendizados*, na tabela de prioridade e no drill-down do painel.

Backups antigos (com um assunto só por registro) são convertidos automaticamente ao abrir ou importar.

### Cronômetro de estudo

Na aba **Hoje** ele é **o primeiro card depois dos números**, com moldura verde: é a feature mais
usada do dia, então não fica no rodapé da tela. O cronômetro tem **um único campo — "O tempo vai para"** — que decide o destino da
medição. Ele é **obrigatório**: o seletor começa em *"Escolha para onde vai o tempo…"* e sem destino
o cronômetro não começa — assim não se cria sessão solta por engano.

**O ▶ Iniciar não é um botão morto.** Ele continua clicável, e clicar sem ter escolhido **explica o
que falta** em vez de não fazer nada: a mensagem aparece no rodapé do formulário, um aviso flutuante
repete, o seletor fica com aro vermelho (que some assim que você escolhe) e o foco vai para ele. O
texto muda conforme o caso — havendo sessão de hoje, ele oferece as duas saídas; **não havendo
nenhuma** (nem sessão hoje, primeiro uso), ele diz para usar *"Nova sessão"*, que é o
caminho de quem ainda não registrou nada.

- **Nova sessão** (padrão) — ao encerrar, o formulário de Registro abre já preenchido com o
  tempo e o intervalo; disciplina e assunto você informa lá.
- **Somar a uma sessão de hoje** — os minutos entram naquele registro (`minutos` acumulado). **Só
  sessões da data atual aparecem** como destino: o bloco cronometrado é sempre de hoje, então somá-lo
  a uma sessão de outro dia não faria sentido.
- **Somar a uma revisão de hoje** — os minutos entram naquela revisão; se ela ainda estava pendente, a
  confirmação de revisão abre com o tempo já preenchido. **Só entra o que está na pauta de hoje**: a
  revisão marcada para hoje e a que ficou para trás e continua pendente (rotulada *atrasada desde
  dd/mm*). Revisão com data futura e revisão já concluída em outro dia **não aparecem**.

### O cronômetro mostra as medições da sessão

Ao **escolher o destino**, o aviso já lista o que aquela sessão (ou revisão) tem cronometrado:
`já cronometrado: [11:00–13:00] [15:00–18:00]`. **Enquanto roda**, a lista aparece completa, com a
medição em andamento destacada em verde no fim: `[11:00–13:00] [15:00–18:00] [18:50–agora]` — dá para
ver de relance tudo o que já entrou ali sem abrir o registro. Em sessão nova não há o que listar, e o
cronômetro mostra só a hora em que começou.

### Os intervalos ficam dentro da sessão

Cada medição vira um bloco, e os intervalos aparecem **um a um dentro da própria sessão** — clique na
linha do histórico e veja o bloco **Esta sessão**:

```
ESTA SESSÃO
Cronômetro · 2 medições   [11:00–13:00] [15:00–18:00]   5h no total
Registrada em             15/09/2026 às 21:04
Revisões                  1 de 3 feitas · próxima em 19/09
```

Duas medições de 11:00–13:00 e 15:00–18:00 aparecem assim, **nunca como `11:00–18:00`** — que daria a
entender sete horas seguidas. Bloco cronometrado num dia diferente do da sessão vem com a data na
frente (`16/09 20:00–20:30`). Sessões antigas, sem blocos gravados, mostram o horário de início e fim
que têm.

No histórico a coluna de tempo fica limpa: o total e, quando há mais de uma, o **nº de medições**. O
detalhe do dia no Progresso mostra as faixas **daquele** dia.

Em todos os casos o tempo entra **também no estudo de hoje**: cada medição vira um *bloco*
(`{data, inicio, fim, minutos}`) guardado no registro/revisão, e o dia do bloco é o que conta na meta
diária, no mapa de calor e na sequência — mesmo que a revisão de destino seja de outra data (o tempo
do bloco é descontado do "tempo próprio" da sessão para nada ser contado duas vezes).

**O cronômetro só lança tempo no dia atual.** O bloco é sempre datado do momento em que você encerra
(inclusive se a medição atravessar a meia-noite) e **o seletor só lista o que é de hoje** — sessões
registradas hoje, a revisão de hoje e as atrasadas ainda pendentes. Nada de outros dias entra na lista. Da mesma forma,
concluir uma revisão futura registra o tempo e a atividade **na data atual**.

Para uma sessão nova: deixe **Nova sessão** e clique em **▶ Iniciar**. Enquanto o
cronômetro roda, um **chip fixo no cabeçalho** mostra o tempo corrido em qualquer aba. Em
**Encerrar e registrar**, a plataforma calcula os minutos e abre o formulário de Registro já
preenchido com a data, o tempo e uma descrição com o intervalo
(`14:05 → 15:32`) — você completa disciplina, assunto, questões, acertos e domínio e salva. O horário de início e fim
fica gravado no registro e aparece no histórico embaixo do tempo.

O cronômetro é gravado **na hora** (sem espera) e conta a partir do instante de início: fechar a aba,
recarregar ou trocar de aba não zera nada. **Descartar** joga a medição fora sem registrar.

Ao **registrar um estudo**, o plano de revisões é criado automaticamente. Ao **marcar uma revisão como feita**,
você informa quantas questões fez e o novo nível de domínio — e o sistema **reagenda o que ainda falta**.

## Backup (importante)

`localStorage` é apagado se você limpar os dados do navegador. Use os botões do topo:

- **↓ Exportar** — baixa `estudos-AAAA-MM-DD.json` com tudo.
- **↑ Importar** — restaura um backup (valida o arquivo e pede confirmação; substitui os dados atuais).

Exporte pelo menos uma vez por semana. No Safari o `localStorage` em `file://` pode ser bloqueado —
nesse caso um aviso laranja aparece no topo; use Chrome/Firefox ou sirva a pasta com `python3 -m http.server`.

## Metodologias aplicadas

1. **Repetição espaçada** — o número de revisões sai da **dificuldade** do assunto e de **quantos degraus da escada cabem no horizonte**, sempre em intervalos crescentes.
2. **Curva do esquecimento (Ebbinghaus)** — a primeira revisão vem cedo, quando o esquecimento é mais rápido.
3. **Recordação ativa** — toda revisão pede questões feitas e acertos; reler não conta como revisão.
4. **Sistema Leitner** — dificuldade alta ou taxa de acerto abaixo de 60% = mais revisões, começando antes.
5. **Prática intercalada** — o painel sugere alternar disciplinas em vez de blocos longos.

O botão **?** no topo abre essa explicação e os ajustes (data da prova e meta diária).

## Parâmetros configuráveis

Estão no objeto `CONFIG`, no topo do `<script>` do `index.html`:

```js
DATA_DA_PROVA: "2026-10-11"        // trava: nenhuma revisão nesta data ou depois
META_DIARIA_MIN: 180               // meta de estudo por dia
REVISOES_POR_DIFICULDADE: {1:1, 2:2, 3:3, 4:4, 5:5}   // 1 = sem dificuldade … 5 = muita
DIAS_MINIMOS: {1:1, 2:4, 3:10, 4:30, 5:60, 6:120}     // janela necessária para N revisões
TAXA_CRITICA: 60                   // % de acerto abaixo disso pede ao menos 4
TAXA_ATENCAO: 75                   // abaixo disso garante ao menos 3
DISTRIBUICAO: {1..6}               // fração do tempo restante, com intervalos crescentes
ANTECIPACAO_PRIORITARIA: 0.8       // assunto fraco antecipa tudo em 20%
INTERVALOS_LIVRES: [1,3,7,16,35,70,140,240,365]   // a escada: dias após o estudo
HORIZONTE_LIVRE: 180               // sem prova nem teto: até onde o plano se estica
HORIZONTE_MAX_DIAS: 365            // teto de planejamento: no máximo um ano
MAX_REVISOES: 9                    // nenhum assunto passa disso
FOLGA_POR_DIFICULDADE: 4           // quão fundo na escada a dificuldade deixa ir
CATEGORIAS_ERRO: [conteudo, interpretacao, bobo, chute, acertei]  // opcionais, editáveis
```

Data da prova, **revisar até** (o teto, até um ano) e meta diária são mudadas pela interface
(botão **?**); alterar qualquer uma delas **replaneja todas as revisões pendentes** — ver
*Até quando o sistema agenda*.

## Estrutura dos dados

```
{ versao, tema, dataProva, revisarAte, posProva, metaDiariaMin,
  // revisarAte = teto do cronograma ("" = sem teto) · posProva = "" | "continuo" | "encerrei"
  cronometro: null | {inicio, disciplina, assunto, destinoTipo, destinoId},   // em andamento
  grupos:    [{id, nome, disciplina, criadoEm}],        // grupos de revisão integrada
  lancamentos: [{id, registroId, data, questoes, acertos, criadoEm}],   // questões lançadas à parte
  registros: [{id, data, disciplina, assuntos[], minutos, questoes, acertos, dominio, anotacoes,
               criadoEm, plano?, grupoId?, inicio?, fim?, blocos?}],   // blocos = medições do cronômetro
  revisoes:  [{id, registroId, data, ordem, feita, feitaEm, minutos, questoes, acertos, dominio,
               nota, manual, grupoId?, disciplina?, assuntos?}],       // grupoId = plano integrado;
                                                                      // disciplina/assuntos = revisão avulsa
  erros:     [{id, disciplina, assunto, fonte, oQueErrei, ensinamento, categoria, refeita, importante, criadoEm}] }
```

O acesso ao `localStorage` está isolado em `carregar/persistir/salvarRegistro/salvarErro/…` — nenhum
outro trecho fala com o armazenamento diretamente.

## Protótipo anterior

As observações do protótipo (`revisor-conteudos:v1`, abas + observações) são importadas
automaticamente na primeira abertura, viram anotações em **Aprendizados** (o texto da observação
entra como o aprendizado) e **os dados antigos não são apagados**.

No JSON exportado, a lista de aprendizados ainda se chama `erros` — o nome interno foi mantido
para que backups antigos continuem sendo lidos.

## Revisão é sessão de estudo

Revisar é estudar. Por isso **todo tempo mora num lugar só — a aba Sessões** — e a aba **Revisões** virou
agenda: ela diz *o que* revisar e *quando*, não guarda horas.

Cada sessão tem um **tipo**:

- **Estudo** (padrão) — o que você já conhecia: gera o cronograma de revisões do conteúdo.
- **Revisão** — cumpre uma revisão que estava agendada. **Não gera cronograma novo**, herda o
  conteúdo da revisão (as etiquetas ficam travadas) e some com as caixas de integração, que não
  fazem sentido ali.
- **Estudo/Revisão** — para o dia em que você revisou **e também viu conteúdo novo** na mesma
  sentada. Funciona **exatamente como Revisão** (cumpre uma revisão agendada, marca a caixa dela,
  não gera plano próprio, as horas ficam na sessão): a diferença é **só o rótulo**, que aparece em
  *Hoje* e em *Sessões*. Internamente o tipo é `misto`, e nenhuma regra de comportamento testa
  `tipo === "revisao"` — tudo passa por `ehTipoRevisao`, justamente para o misto nunca divergir da
  revisão sem querer.

Na coluna **Tipo** cada um tem sua etiqueta: *estudo* neutra, *revisão* âmbar e *estudo/revisão*
verde, com contorno — nem uma coisa nem outra. A coluna é alinhada **à esquerda**, junto do próprio
cabeçalho: alinhada à direita (como estava), a etiqueta longa de *estudo/revisão* ficava espremida
contra a borda da tabela. O filtro de Sessões ganhou as opções **Só
estudo/revisão** e **Revisão e estudo/revisão** (para ver as duas juntas, que é como elas contam nas
horas).

### Os dois caminhos

**Pelo registro:** ao criar a sessão, escolha *Revisão* e aponte qual. A lista traz as de hoje e as
**atrasadas em vermelho**; revisão já cumprida por outra sessão não aparece — **uma revisão vale por
uma sessão só**. Ao salvar, a caixa dela é marcada sozinha.

**Pela aba Revisões:** marcar a caixa abre a tela de sessão já preenchida (tipo Revisão, revisão travada,
data de hoje). É o mesmo formulário, então você registra tempo, questões e descrição de uma vez.

### Trocar o tipo

Uma sessão de **estudo registrada hoje pode virar revisão** — erro de tipo acontece, e no mesmo dia dá
para consertar. Sessão de **outro dia não**: o botão fica travado, com a razão à vista.

Converter apaga as revisões que aquela sessão tinha agendado (a plataforma avisa quantas, antes) e a
tira do grupo, se estiver em um. Se ela já tiver revisão **cumprida**, a conversão é recusada — seriam
horas reais penduradas num plano que deixaria de existir.

O caminho de volta (**revisão → estudo**) é sempre permitido: solta a revisão vinculada e a sessão
segue **sem cronograma próprio**, com a caixa *Sem revisão* marcada. Desmarque-a se quiser que ela
passe a gerar revisões.

**O que pode virar o quê:**

| De ↓ / Para → | Estudo | Revisão | Estudo/Revisão |
|---|---|---|---|
| **Estudo** | — | só no mesmo dia | só no mesmo dia |
| **Revisão** | sempre | — | sempre |
| **Estudo/Revisão** | **não** | sempre | — |

**Estudo/Revisão não volta a ser só estudo.** Ela cumpre uma revisão que já está marcada, e virar
estudo puro deixaria essa revisão órfã de horas que continuariam registradas — o mesmo motivo pelo
qual estudo antigo não vira revisão. Se for mesmo o caso, o caminho é **estudo/revisão → revisão →
estudo**, que é explícito e passa pelas checagens de cada passo. A tela trava a opção e diz a razão;
forçar pelo HTML é recusado no salvamento.

**Desmarcar** solta o vínculo e devolve a revisão para pendente — **a sessão e as horas continuam**.
O mesmo vale ao **excluir a revisão**: a sessão sobrevive, só perde o vínculo. E excluir a sessão
desmarca a revisão.

### As revisões de hoje, também aqui

A aba **Revisões** abre com o card **Revisões de hoje** — o mesmo bloco da aba *Hoje*, com a data no
cabeçalho e a caixa de marcar em cada linha (marcar abre a tela da sessão, como sempre). Quem entra
nesta aba quase sempre quer saber **o que fazer agora**, não percorrer o cronograma inteiro.

Ele mostra **tudo o que tem a data de hoje**, em qualquer situação:

| Situação | Como aparece |
|---|---|
| sendo cronometrada agora | **⏱ Em andamento agora**, em primeiro lugar, com aro verde |
| ainda por fazer | *Para hoje* |
| concluída hoje | *Concluída hoje*, esmaecida, com a caixa marcada |
| era de outro dia e foi cumprida hoje | *Concluída hoje · estava marcada para 17/09* |

A ordem é essa mesma — **em andamento, em aberto, concluídas** — e o cabeçalho resume: *"sex, 19/09 ·
1 em aberto · 2 concluída(s)"*. Na linha de uma revisão já feita, a caixa **desmarca** em vez de
marcar, então dá para corrigir um engano sem sair da tela.

*Em andamento* é literal: a revisão está ligada a uma sessão **e o cronômetro está rodando apontado
para ela**. Só isso — não é um estado guardado, é lido do cronômetro na hora.

As **atrasadas de outros dias** continuam no card próprio mais abaixo; aqui entra apenas a contagem
delas (*"3 atrasada(s) no card abaixo"*), para não duplicar a mesma revisão em dois lugares da mesma
tela. Sem nada com a data de hoje, o card diz isso e aponta o caminho — as atrasadas, se houver, ou o
cronograma logo abaixo.

### Revisões atrasadas

Abaixo da **Revisão por assunto** há o card **Revisões atrasadas**, com o que ficou para trás e um botão
**remarcar** para trazer a revisão para hoje ou para a frente. A data em que ela estava marcada fica
registrada e aparece na linha: *"estava marcada para 15/09"*. Não é permitido remarcar para um dia que
já tem revisão daquele mesmo conteúdo.

### O que saiu

- A revisão não guarda mais **tempo, questões, acertos nem dificuldade** — tudo isso é da sessão. O
  formulário de revisão manual virou só agenda (data, disciplina, conteúdos e detalhes).
- O campo **Atividade da revisão** foi removido: *Detalhes da revisão* já cumpre esse papel, e ganhou
  o espaço dele.
- O **cronômetro** não mira mais revisões: ele soma numa **sessão** (inclusive nas de revisão, marcadas
  com ↻ na lista).

### Na aba Sessões

As sessões de revisão aparecem no histórico junto com as de estudo, com a etiqueta **revisão** na
última coluna e *"cumpriu revisão"* na coluna de revisões. O filtro **Tipo** separa as duas quando
você quiser. Toda sessão que já existia antes desta versão foi marcada como **estudo**.

## Com prova marcada ou sem prazo nenhum

Nos **Ajustes** (botão **?** no cabeçalho) existe a caixa **"Estudo contínuo — não tenho uma prova
marcada"**. Ela muda como o cronograma é montado:

| | Com data de prova | Sem data (estudo contínuo) |
|---|---|---|
| Cronograma | **comprimido** para caber até a véspera — quanto menos tempo, mais cedo e mais juntas | **intervalos clássicos**: D+1, D+3, D+7, D+16, D+35, D+70 a partir de cada estudo |
| Topo da tela | contagem regressiva (vermelha na última semana) | "Estudo contínuo · sem data de prova" |
| Teto do plano | a véspera da prova | horizonte móvel de 180 dias, sempre à frente |
| Mapa de calor | vai até a prova | mostra o mês seguinte |
| Revisão manual | precisa ser antes da prova | qualquer data futura |

Trocar entre os dois modos **reagenda todas as revisões pendentes** na hora; as já feitas ficam como
estão. Dá para ir e voltar quantas vezes quiser — marcar uma prova aperta o cronograma, tirar a data
o afrouxa de volta.

### Quando a data da prova passa

A plataforma continua registrando estudos, questões e anotações normalmente, mas **para de agendar
revisões novas**: sem janela pela frente, o cálculo devolve zero. O topo passa a mostrar há quantos
dias a prova foi.

Se a prova acabou e você quer seguir estudando, há dois caminhos: **marcar a próxima data** (o
cronograma se refaz até ela) ou ligar o **estudo contínuo**, que volta a agendar revisões sem prazo.

## Até quando o sistema agenda

Tudo o que é automático para num dia só: o **horizonte**. Ele sai de três fontes, nesta ordem:

1. **Revisar até** — o teto que você escolhe em *Ajustes*, **até um ano à frente**. Vale inclusive
   depois da prova.
2. **A véspera da prova**, enquanto ela estiver à frente.
3. **180 dias**, quando não há nem uma coisa nem outra.

### Escada ou compressão

O cronograma tem duas réguas, e **quem escolhe é a janela, não a existência de prova**:

- **Cabe a escada** → intervalos crescentes reais: **D+1, D+3, D+7, D+16, D+35, D+70, D+140, D+240,
  D+365**. É a repetição espaçada como ela é, e é o que permite planos de meses ou de um ano.
- **Não cabe** → o plano é **comprimido** em frações da janela (prova perto): quanto menos tempo,
  mais cedo e mais juntas.

Antes essa escolha era *"tem prova ou não tem"*, o que ficava errado nos dois extremos: com prova
daqui a oito meses o plano era comprimido sem necessidade, e sem prova ele parava em 6 revisões.

**Quantas revisões:** a dificuldade dá o piso (1 a 5) e o teto de quão fundo ir na escada
(`dificuldade + 4`, limitado a **9**). Com um ano pela frente, um assunto difícil chega a 9 revisões;
um tranquilo fica em 5. Taxa de acerto baixa continua puxando para cima, como antes.

### A prova passou — e agora?

Antes o sistema **simplesmente parava**: a véspera ficava no passado, a janela virava negativa e
nenhuma revisão nova nascia, sem dizer nada. Agora ele **pergunta uma vez**, na primeira vez que você
abre depois da data (ou na virada do dia, se estiver com a tela aberta):

| Resposta | O que acontece |
|---|---|
| **Sim, continuo — sem data** | a prova sai, o modo vira contínuo e as revisões voltam a nascer |
| **Sim, tenho outra prova** | você informa a data e o ciclo recomeça a partir dela |
| **Não, encerrei por aqui** | o agendamento é desligado — **nada é apagado** |

A resposta fica guardada (`db.posProva`), então a pergunta não vira interrogatório diário. Enquanto
ela não for respondida, **nenhuma revisão nova é agendada** — é o que o texto do aviso promete. Quem
encerrou pode **religar** a qualquer momento em *Ajustes*.

### O teto e as revisões que você criou

Mudar o horizonte (prova, teto ou religar) **replaneja tudo**, e a regra de sempre vale aqui: as
revisões **feitas** e as criadas **à mão** nunca são tocadas — inclusive as que estejam **além do
teto**. É isso que evita o conflito entre o teto e o que você marcou de propósito: o teto governa o
que o sistema cria, não o que você decidiu. O que sai, ao encolher o teto, são apenas as automáticas
que não cabem mais. Ao esticar, as que faltavam são criadas — e nunca duas no mesmo dia para o mesmo
card.

## O calendário e o filtro de dia

O calendário é uma **grade de mês**, no formato de calendário mesmo: nome do mês e ano no topo, setas
**‹ ›** para navegar, atalho **hoje** quando você está noutro mês, e a semana começando no **domingo**.
Cada dia é um círculo com o número dentro:

- **Fundo tingido** conforme o quanto você estudou naquele dia, numa rampa do **verde da identidade**
  — clara o bastante para o número do dia continuar legível em cima (o azul escuro que havia aqui
  dava 1,75:1 de contraste; agora o pior caso é 5,6:1 no claro e 4,4:1 no escuro).
- **Anel verde** em hoje, **anel vermelho** no dia da prova.
- **Círculo cheio** no dia escolhido.
- **Pontinho embaixo** quando há revisão naquele dia — verde se está marcada, vermelho se atrasada,
  cinza-verde se já foi feita. Dá para ver o plano da semana correndo o olho.
- Dias do mês anterior e seguinte **recuam, mas continuam legíveis** e clicáveis: eles ficam
  transparentes sobre o painel, com o número em `--muted` (**3,15:1**). Antes eram `--muted` a 40% de
  opacidade, o que dava **1,5:1** — praticamente invisível. No escuro levam um leve `opacity:.78`
  para manter a mesma hierarquia. Quem recua de verdade é o **pontinho de revisão** deles.
- **O mês inteiro fica sobre um painel próprio** (`--cal-fundo`: `#eeebe1` no claro, `#1e2426` no
  escuro) — um tom vizinho do card, discreto, só para o calendário não flutuar solto na mesma cor do
  resto. Para o painel não comer o passo mais claro da rampa, os dias **sem estudo** ganharam cor
  própria (`--seq0`, que agora é a superfície do card): são os **vãos da grade** que mostram o
  painel, e a rampa continua comparando célula com célula, como antes. Dias de outro mês ficam
  transparentes e recuam para o painel.

**Clicar num dia filtra o painel para aquele dia.** Uma faixa aparece no meio da tela — `dia
18/09/2026` — com o botão *ver tudo de novo*. O que muda:

| Passa a mostrar o dia | Continua acumulado |
|---|---|
| o bloco do topo (vira `18/09` com o tempo daquele dia) | Estudo na semana |
| % de acerto por disciplina / assunto | Questões da semana |
| Tempo de estudo por disciplina / assunto | % de acerto geral |
| Revisões: *feitas no dia* | Sequência |
| o detalhe ao lado do calendário | Prioridade para a reta final |

### O card do dia, ao lado

```
SEX · HOJE                                   limpar ✕
18/09/2026
──────────────────────────────────────────────────────
TEMPO        QUESTÕES        ACERTO
2h           10              40%          ← em vermelho
[▓▓▓▓▓▓▓▓▓▓░░░]  100% da meta de 2h
2 REGISTROS · 1 REVISÃO
▌ LAI              [estudo]            1h30
▌ Legislação · 4/10 questões
▌ Lei 8.112        [revisão]           30min
▌ Legislação
```

Cabeçalho com o dia da semana (e *hoje*, quando é), os três números em colunas — com a **taxa de
acerto pintada** pela mesma regra do resto do sistema —, a barra da meta com a porcentagem, e os
registros do dia em linhas com etiqueta de tipo e o tempo alinhado à direita.

> **Fora da aba por enquanto:** o card **Evolução do % de acerto**. O código continua inteiro — a
> função `linhaEvolucao()` e o card, comentado logo acima dela em `telaPainel()`. Para trazer de
> volta, basta descomentar aquelas duas linhas. Ele mantinha a série completa e destacava o dia
> escolhido, já que filtrar por um dia deixaria um ponto só.

O painel abre com **hoje** já selecionado; *ver tudo de novo* (ou *limpar ✕* no detalhe do dia) volta
ao acumulado.

## Onde os dados ficam

São três camadas, e as três funcionam juntas:

| Camada | Sobrevive a limpar o navegador | Outro aparelho | Precisa configurar |
|---|---|---|---|
| **Navegador** (localStorage) | não | não | nada, é o padrão |
| **Nuvem** (conta por e-mail) | **sim** | **sim** | Supabase, uma vez |
| **Arquivo `.json`** no disco | sim | não | escolher o arquivo |

### O estado da tela também é lembrado

Além dos dados, a plataforma guarda **como você deixou a tela** num registro à parte
(`plataforma-estudos:tela`): a **aba aberta**, os **filtros** de Sessões (disciplina, período,
tipo, ordenação e a **busca digitada**), os do **Pontos importantes** (disciplina, conteúdo, *só as
da véspera*, *juntar tudo*), a visão das **Questões**, a **disciplina e o dia** escolhidos no Progresso,
as listas que você abriu com o **+ ver todos**, e o **texto que estava sendo escrito** numa anotação.
Recarregar devolve tudo no lugar, inclusive o compositor aberto com o rascunho.

Três detalhes de projeto:

- **É estado, não dado.** Fica só neste navegador e **não entra no backup nem na nuvem** — levar seus
  filtros para outro aparelho seria estranho, e eles não valem nada sem os dados.
- **O "hoje" acompanha o relógio.** O dia escolhido no Progresso é o único estado que envelhece: se ele
  fosse guardado cru, abrir a plataforma no dia seguinte mostraria **ontem**. Por isso o retrato
  guarda também o dia em que foi tirado (`gravadoEm`): se o dia selecionado **era o de então**, ele
  passa a ser o novo hoje; um dia escolhido de propósito (12/09, por exemplo) continua onde estava.
  O mesmo vale para o mês aberto no calendário.
- **Referência quebrada é descartada.** Se o filtro apontava para uma disciplina ou um conteúdo que
  não existe mais, ele volta para *Todas* em vez de deixar a lista vazia sem explicação. A **busca
  digitada não é descartada**: ela não aponta para nada que possa sumir.
- **O rascunho vive enquanto o compositor está aberto.** Fechar (pelo *Fechar*, pelo Esc, ou trocando
  o filtro) descarta o texto — reabrir depois não ressuscita o que você já tinha desistido de
  escrever.

### A virada do dia

Deixar a plataforma aberta a noite toda — ou só o celular dormindo com a aba aberta — deixava a tela
presa no dia anterior: *hoje*, a contagem regressiva, as revisões do dia e o Progresso só são
recalculados num redesenho, e nenhum acontecia sozinho. Agora um relógio confere a data **de minuto
em minuto**, e também **quando a aba volta a ficar visível** (o caso do celular). Na virada, a tela é
redesenhada, o dia do Progresso acompanha se estava no *hoje*, o calendário pula para o mês novo e um
aviso explica: *"Virou o dia: a tela agora mostra 19/09/2026"*.

A plataforma também pede ao navegador, no arranque, que trate os dados como **permanentes**
(`navigator.storage.persist()`): sem isso, o navegador pode descartá-los sozinho quando o disco aperta.

## Nuvem: usar em qualquer aparelho, sem mexer em arquivo

É o caminho para **entregar a plataforma para outra pessoa**: ela entra com o e-mail e usa. Nada de
escolher arquivo, nada de exportar backup, e os dados aparecem em qualquer aparelho.

### Configurar (uma vez, você)

1. Crie um projeto no [Supabase](https://supabase.com) (plano gratuito basta).
2. **SQL Editor** → rode:

```sql
create table dados (
  id uuid primary key references auth.users on delete cascade,
  conteudo jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table dados enable row level security;
create policy "cada um vê o seu" on dados
  for all using (auth.uid() = id) with check (auth.uid() = id);
```

3. **Authentication → Email Templates → Magic Link**: inclua `{{ .Token }}` no corpo. É esse código de
   6 dígitos que a plataforma pede — sem link e sem redirecionamento, então funciona até com o arquivo
   aberto localmente.
4. **Project Settings → API**: copie a *URL* e a chave *anon public* para o topo do `<script>`:

```js
const NUVEM = {
  url:   "https://seuprojeto.supabase.co",
  chave: "eyJhbGciOi..."        // anon public — é pública por natureza, pode ficar no código
};
```

Enquanto essas duas linhas estiverem vazias, **nada muda**: o chip da nuvem nem aparece e nenhuma
chamada de rede é feita.

### Como fica para quem usa

O chip no cabeçalho mostra a conta: **Entrar na conta** → e-mail → código de 6 dígitos → **☁ nome**.
Daí em diante cada alteração sobe sozinha (um segundo depois da última mexida) e também ao fechar a
aba. Abrindo em outro aparelho com o mesmo e-mail, os dados vêm junto.

- **Sem conexão** o chip avisa e a plataforma continua inteira, gravando no navegador; o que ficou
  pendente sobe quando a conexão volta.
- **Quem está mais novo ganha**: ao abrir, a plataforma compara a data da nuvem com a local e traz o
  mais recente. O painel tem **Sincronizar agora** e **Trazer da nuvem** para resolver na mão.
- A regra de segurança (RLS) garante que **cada conta só enxerga a própria linha**.
- O botão **↓ exportar** continua ali: quem usa pode sair com os dados quando quiser.

### E o SQLite?

Não resolveria o problema. SQLite no navegador (sql.js, wa-sqlite) guarda o banco em IndexedDB/OPFS —
que **é dado do navegador**, e some na limpeza igual ao localStorage — ou num arquivo no disco, com o
mesmo seletor de sempre. O que decide a durabilidade é **onde os bytes moram**, não o formato. SQLite
faria sentido num servidor, e nesse caso o Supabase (que é Postgres gerenciado) já cumpre o papel.

## Arquivo `.json` no disco

Alternativa local à nuvem, para quem prefere não depender de serviço nenhum.

### Ligar o arquivo (Chrome ou Edge)

O chip no cabeçalho diz onde os dados estão sendo gravados:

| Chip | O que significa |
|---|---|
| **Só no navegador** (âmbar) | nada de arquivo ainda — clique para ligar um |
| **🗎 estudos.json** (verde) | cada alteração está sendo gravada nesse arquivo |
| **Reconectar arquivo** (âmbar) | o navegador quer sua autorização de novo (um clique) |
| **⚠ Falha ao gravar** (vermelho) | a última gravação não passou; o painel mostra o erro |

Clicando nele: **Criar arquivo novo** (o seletor do sistema pergunta onde salvar; o repositório já traz
um `estudos.json` vazio pronto para ser escolhido) ou **Usar um arquivo que já existe**. Se o arquivo
escolhido já tiver dados, a plataforma pergunta o que fazer: **usar os dados do arquivo** ou **gravar
por cima** com o que está aberto.

A partir daí, **toda alteração regrava o arquivo inteiro** (meio segundo depois da última mexida, para
não escrever a cada tecla) e ele também é gravado **ao sair da aba ou fechar o navegador**
(`visibilitychange`, `pagehide` e `beforeunload`).

### O que o navegador não permite

Uma página aberta de um arquivo local **não pode** abrir um caminho fixo do disco sozinha — seria um
buraco de segurança. Daí duas consequências:

- **Você escolhe o arquivo uma vez**, pelo seletor do sistema.
- **A cada nova sessão o navegador pede a autorização de novo** — é o chip *Reconectar*, um clique.
  Enquanto não reconectar, os dados continuam sendo gravados no navegador normalmente.
- Limpar os dados de navegação apaga o localStorage **e** a lembrança de qual era o arquivo; o arquivo
  em si continua intacto no disco. Basta abrir a plataforma, clicar no chip → *Usar um arquivo que já
  existe*, apontar o `.json` e tudo volta.

**Firefox e Safari não têm essa API.** Lá o chip fica escondido e continua valendo o backup manual:
**↓** exporta o `.json`, **↑** importa de volta. O painel explica isso quando não há suporte.

## Cor com função

A identidade continua a mesma — verde-sálvia sobre neutros quentes, cantos arredondados, tipografia
miúda. O que mudou foi **onde a cor aparece**: ela passou a dizer alguma coisa, em vez de enfeitar.

- **Superfícies secundárias com corpo** (teste em avaliação, ver o fim desta seção). `--surface-2`
  era `#eceae2` e dava só **1,07:1** contra o fundo da página: não lia como "outra superfície", lia
  como desbotado — e o texto por cima era `--muted` (`#7d8589`, cinza **frio**, 5% de croma,
  3,12:1), que é exatamente a receita de campo desabilitado. Agora `--surface-2` é `#e9e5d9` e
  `--surface-3` `#ded9c9` (mesma família areia do papel, só com mais corpo), e o texto que fica em
  cima deles usa `--text-2` — rótulos dos filtros, subtítulo do card de anotação, contadores das
  abas, bloco *Esta sessão* e separador de dia na tabela. O cinza-frio ficou reservado para o que é
  **de fato inerte**: dia vazio no painel, revisão já feita.
- **Campos das telas de criação e edição** (mesmo teste). O campo era do tom do fundo da página
  (`--bg`, **1,08:1** contra a tela sobreposta) com um aro de **1,33:1**: um retângulo quase invisível
  dentro de outro — a cara de formulário travado. Agora há dois tokens próprios, `--campo-fundo`
  (`#fdfcfa` claro / `#2a3133` escuro) e `--campo-borda` (`#9e9a8b` / `#616b6d`, **2,75:1** contra o
  campo): o campo é o papel em que se escreve e tem aro visível. Vale para inputs, selects,
  textareas, as pílulas de opção, a caixa de marcar da revisão, os botões secundários e a barra de
  formatação da anotação. O **foco** não muda mais o fundo — só acende o aro verde e o anel.
- **Chrome ativo em verde claro** (mesmo teste). A barra de filtros e o cabeçalho do card de anotação
  eram cinza-areia — o mesmo tom do que está *inerte* —, e por isso liam como desligados. Agora usam
  o token `--chrome` (= `--accent-soft`, o verde claro que já era da identidade) com aro
  `--chrome-borda` (= `--accent`). O cinza-areia ficou reservado para o que é **de fato inerte**: dia
  vazio no painel, revisão já feita, molduras neutras (bloco de assunto, *Esta sessão*, separador de
  dia). Anotação **em edição** passou a usar `--accent-soft`, igual às outras faixas de edição do
  sistema. Para o verde não engolir quem precisa saltar em cima dele, a etiqueta neutra do cabeçalho
  e a etiqueta *filtro ativo* invertem para `--campo-fundo`. A seleção continua distinguível porque
  nunca depende só do preenchimento: é **aro verde + peso da fonte**.
- **Tom cheio** (`--accent-forte`) nas superfícies pintadas — contagem regressiva, aba ativa, botão
  principal, chip do cronômetro. É o mesmo verde, 6% mais fundo: só assim o texto branco por cima
  alcança contraste AA (4,9:1; antes eram 3,9:1).
- **Contagem regressiva preenchida** — é o número mais importante da tela. Verde normalmente,
  **vermelha na última semana**. O **fogo ladeia a contagem**, um grupo em cada
  ponta da caixa (`🔥 12 dias para a prova 🔥`), e **cresce com a urgência**: 🔥 até faltarem 14
  dias, 🔥🔥 na última quinzena, 🔥🔥🔥 na última semana e no dia da prova. Depois que a
  prova passa, e no modo *estudo contínuo*, não há fogo nenhum. O emoji é `aria-hidden`: quem usa
  leitor de tela ouve só "12 dias para a prova".
- **Cabeçalho e abas maiores**: o nome *Plataforma de Estudos* foi de 20px para **25px**, e as abas
  ganharam caixa maior (padding 10×19, texto 14,5px) — dá para acertar o alvo no celular sem mira
  fina. A aba não selecionada também saiu do cinza-frio para `--text-2`, pelo mesmo motivo das
  outras superfícies.
- **Blocos de número com tom semântico**: faixa colorida à esquerda e o número na mesma cor.
  `crítico` (atraso, taxa abaixo de 60%) ganha fundo vermelho-claro; `bom` marca meta batida e dia em
  dia; `accent` marca o que está em andamento.
- **Revisão atrasada** agora tinge o card inteiro de vermelho-claro, com o título em vermelho — não é
  mais só uma listra na borda. A de hoje ficou toda em verde, coerente com o resto.
- **A caixinha de marcar revisão tem o ✓ desenhado**, não escrito: são duas bordas giradas em 45°,
  do tamanho do traço, centradas no pixel. Antes era o glifo `✓` da fonte, que mudava de tamanho e
  de altura conforme a fonte disponível no aparelho e saía torto dentro da caixa quando marcado.
  Agora o traço é sempre o mesmo, fica branco sobre o verde quando marcada, e o **hover mostra uma
  prévia** dele em verde — dá para ver o que o clique vai fazer.
- **Anel de foco** em todo campo e botão (3px do verde), para o teclado saber onde está.
- **Etiquetas de status** usam os mesmos tokens de fundo suave, todas com contraste AA nos dois temas.
- **Botões de adicionar** (`+ Registrar sessão`, `+ Adicionar revisão`, `+ Lançar questões
  feitas`, `+ Anotar aprendizado`) começam todos com **maiúscula**, são curtos e ganharam presença:
  fundo verde-claro, borda tracejada verde, texto em negrito e o `+` num quadrado cheio. No hover o
  botão inteiro se preenche de verde. O complemento (*"que eu fiz ou quero fazer"*, *"ligadas a uma
  sessão já registrada"*) fica numa **pista** cinza ao lado, sem engordar o rótulo.
- **Os filtros de Sessões e de Pontos importantes** são um painel com os campos numa **grade** que se
  redistribui sozinha (nada de campos de larguras aleatórias ao quebrar linha), rótulos em caixa alta
  miúda, a **busca com lupa ocupando a linha inteira**, e uma barra de ações embaixo, separada por um
  fio: ali ficam o **★ só as da véspera** (que agora diz se está ligado) e o **limpar filtros**, que
  só aparece quando há filtro ativo — junto com a etiqueta *filtro ativo*, para você não estranhar uma
  lista curta. Saiu o rótulo em branco (`&nbsp;`) que era usado para alinhar o botão à altura dos
  campos.
- **Filtros** viraram um painel próprio, separado do conteúdo; títulos de card e do modal ganharam uma
  marca vertical verde.
- **"Próximos 7 dias" abre com 3 revisões**, e o botão **+ ver todas as N** mostra o resto — a
  amostra é menor que a da aba Revisões porque aqui o card divide espaço com o resto do dia.
- **Em "Próximos 7 dias", as revisões são agrupadas por dia**: cada dia tem um rótulo próprio
  (`QUI · 18/09 — amanhã · 2 revisões`) e uma linha separando do dia seguinte, em vez de uma fila
  corrida de cards iguais. Como o dia já está no rótulo, o card não repete a data.
- **Cada card de revisão tem relevo**: borda esquerda visível e uma sombra leve; os de **hoje** e os
  **atrasados** ganham sombra colorida (verde e vermelha) e sobem da lista; os já feitos ficam rentes.
- **Só 4 assuntos abertos de cada vez**, com **+ ver todos os N assuntos** no rodapé do card. A
  ordenação já põe atraso e pior taxa na frente, então o que fica escondido é sempre o menos urgente.
- **Na aba Revisões, cada conteúdo é um bloco fechado** — painel com fundo próprio, borda e uma barra
  vertical de 4px à esquerda (vermelha quando há atraso), com o título e os botões num cabeçalho
  separado por um fio. Antes os conteúdos eram apenas faixas divididas por uma linha de 1px, que se
  perdia. Dentro do bloco, cada revisão é um card claro sobre o fundo do painel, e as de **hoje** e as
  **atrasadas** ganham sombra para subir do conjunto.

### Voltar atrás nos tons (rollback pronto)

A mudança das superfícies acima está **em avaliação** e tem desfazer de uma linha. Para voltar ao
visual anterior, escreva `data-tons="classico"` na tag `<html>` (linha 2 do `index.html`):

```html
<html lang="pt-BR" data-tema="claro" data-tons="classico">
```

Isso devolve `--surface-2` e `--surface-3` aos valores antigos (**nos dois temas**), o texto ao
`--muted` de antes, os campos ao fundo/aro anteriores (`--campo-fundo: var(--bg)`,
`--campo-borda: var(--border)`) o chrome ao cinza (`--chrome: var(--surface-2)`) — incluindo as três
regras pontuais que o verde exigiu — e o calendário ao formato sem painel. O bloco que faz isso fica logo depois do tema escuro, no `<style>`, marcado como
**ROLLBACK DOS TONS**. Para **manter** o visual novo, basta apagar esse bloco — ele existe só
enquanto a decisão não estiver tomada.

Os tons de gráfico (`--s1..--s6`, rampa do mapa de calor) **não foram tocados**: são a paleta validada
para daltonismo. Todos os pares texto/fundo criados aqui foram conferidos em AA nos dois temas.
