# Plataforma de Estudos

Aplicação de página única (`index.html`), sem backend e sem dependências externas.
Abra o arquivo no navegador e use. Todos os dados ficam no **`localStorage`** do próprio navegador.

- **Prova:** 11/10/2026 · **Revisões agendadas até:** 10/10/2026 (trava dura no código)
- Interface em pt-BR, modo claro e escuro, responsiva.

## Como usar

O botão da prova, no cabeçalho, diz também **que dia é hoje**: embaixo de *Prova 11/10/2026* vem
*Hoje 23/09/2026* (o rótulo igual ao da prova; a data na cor da identidade), com as datas alinhadas (o dia da semana aparece ao passar o
mouse). Fica em todas as abas: é a referência de "hoje", "atrasado" e "amanhã" que a agenda usa.

| Aba | Para quê |
|---|---|
| **Hoje** | **Cronômetro de estudo** logo no topo, em card próprio com moldura verde — é a ação mais usada do dia; revisões de hoje, atrasadas e dos próximos 7 dias (estas **agrupadas por dia** e **só informativas**, sem caixa de marcar, mostrando **3 por vez** com **+ ver todas as N**); **Registrado hoje**, um resumo só de leitura das sessões do dia; **Falta estudar** (ver abaixo); meta diária e sequência de dias nos números do topo. |
| **Sessões** | Formulário da sessão de estudo (data, disciplina, **um ou vários assuntos**, tempo, questões, acertos, **dificuldade do assunto**, e **um único campo de descrição** para a sessão) e a lista **Todas as sessões**: resumo do que está filtrado (sessões, conteúdos estudados, pendentes na agenda e conteúdos concluídos — **nenhuma soma de horas**, ver abaixo), separadores por dia com o total do dia, e por sessão o tempo (com o nº de medições do cronômetro, quando há mais de uma), e a dificuldade; *sem revisão* aparece como etiqueta ao lado do conteúdo. **Questões não aparecem aqui** — elas têm aba própria, porque nem toda sessão tem questões (num assunto novo é normal só estudar). Os campos de questões continuam no formulário, opcionais. Registrar e editar acontecem numa **tela sobreposta** (ver abaixo) — a lista nunca é empurrada para baixo. **Clique em qualquer lugar da linha** para abrir a sessão: a tela de edição traz, além dos campos, um bloco **Esta sessão** com os intervalos do cronômetro, quando foi registrada e a situação das revisões. |
| **Agenda** | **Lembrete e alerta** — não é aqui que o tempo é registrado. **Filtros** de **Disciplina** e, embaixo, de **Conteúdo** (só os da disciplina escolhida; sem ela, todos, com a disciplina ao lado), valendo nas três visões, com um **✕ limpar** que tira os dois — o card *Agenda de hoje* não obedece a eles. **Revisões:** por padrão, **só as 2 próximas** — de cada conteúdo, as **2 próximas revisões** e a **próxima retomada** (cumprida uma, a seguinte aparece); **Todas as agendadas** mostra a escada inteira, e a escolha fica lembrada. Vale também para os próximos 7 dias da aba **Hoje**. Duas **sub-abas** no topo: **A fazer** (padrão — hoje, o que atrasou e os próximos dias) e **Concluídos** (o que foi marcado em **dias anteriores**). Abre com **Agenda de hoje** — tudo o que tem a data de hoje; **clicar num item dali leva até ele no cronograma abaixo**. Tem **três visões** da mesma agenda: **Por dia** (padrão), **Por assunto** e **Mês**. Cronograma **por assunto**, com uma caixa de seleção por dia recomendado. A lista de assuntos vem em **ordem alfabética** e abre com **4** deles, com um botão **+ ver todos os N assuntos** que revela o resto (e avisa quando há atraso escondido lá dentro). Verde = feita, destaque = hoje, vermelho = atrasada, neutro = futura. Dá para **adicionar** uma revisão à mão (data, o que foi revisado, tempo e desempenho) e **editar ou excluir** qualquer uma. |
| **Disciplinas** | O **cadastro** de disciplinas e conteúdos, agrupado por disciplina. Cada conteúdo mostra **em quantas sessões ele aparece** e a fase (*em andamento* ou *concluído em DD/MM*), com **✎ renomear** — que muda o nome **em todo o sistema** — e **✓ concluir / ↩ reabrir**. No cabeçalho de cada disciplina, **✓ concluir disciplina** fecha de uma vez todos os conteúdos abertos dela (e **↩ reabrir disciplina**, quando já está tudo fechado). Fechar um conteúdo fecha **todas as sessões que falam dele** e começa a escada de revisões daquele dia. Aqui se criam disciplinas (**+ Nova disciplina**, que abre uma tela própria; **✕ excluir** aparece enquanto nada usa a disciplina) e conteúdos (**+ Novo conteúdo**, um por linha ou numerados — `1. Crase 2. Regência`); eles também nascem no formulário da aba **Sessões**. Renomear abre uma pergunta do próprio app, por cima da tela. |
| **Anotações** | Dois filtros: **Disciplina** (mostra todos os cards dela) e **Conteúdo** (mostra só aquele tópico). Ambos listam apenas o que existe nas **sessões já registradas** — aqui não se cria disciplina nem conteúdo. A anotação pode ser feita **na disciplina inteira ou num conteúdo dela**, e o botão **+** no topo da lista está sempre disponível: sem filtro escolhido, o próprio compositor traz o seletor *Onde entra* e a anotação só é salva depois que você escolhe. São anotações de **conhecimento geral** sobre a matéria, não sobre uma questão específica — a aba não tem ligação com as questões que você registra, embora mostre **quantas questões e a taxa de acerto** da disciplina como contexto. A tela tem dois cards: **filtros + indicadores + botão de anotar**, e **Anotações**, com a contagem do que está filtrado. A origem da questão e o tipo do erro são **opcionais** e entram depois, no **editar**, que abre a **tela sobreposta** (centrada, com o Salvar sempre à vista). O texto aceita **formatação leve, com cores** e tem **limite de 2.000 caracteres** (ver abaixo). ★ monta a lista de véspera. |
| **Questões** | Tudo o que foi resolvido: total, acertos, erros, taxa geral, questões da última semana e dias com questões. O desempenho aparece **por disciplina** (padrão) **ou por conteúdo** (botão para alternar), ordenado pela pior taxa, com barra de acerto; Um bloco por conteúdo. O botão **+ Lançar questões**, logo **abaixo dos indicadores**, registra uma bateria feita fora da sessão, **ligada a uma sessão já registrada**. O card **Questões das sessões** lista as sessões com questões e deixa **editar** os números ali mesmo — é o mesmo dado da sessão, então a aba Sessões já mostra o valor novo. Depois dele vem o **gráfico dia a dia**, e o desempenho por disciplina fecha a aba. |
| **Progresso** | Meta diária, **estudo na semana** e **questões da semana**, calendário de horas por dia, % de acerto por disciplina, tempo por disciplina e situação das revisões. **Filtre por disciplina e por conteúdo** (as mesmas duas caixas das outras abas) — ou clique na própria barra de uma disciplina — para restringir os gráficos; **clique num dia do calendário** para ver o que foi feito naquele dia e filtrar a aba (ver abaixo). |

### Salvar uma sessão só replaneja quando o plano mudou

Editar uma sessão **não refaz o cronograma dela** quando o que você mexeu não decide o plano. O que
decide é só isto: **o dia**, **os conteúdos**, a **dificuldade** (que manda na cadência), o **modo do
plano** (*sem revisão* / manual) e o **tipo** da sessão. Tempo, questões, acertos e descrição ficam de
fora — a taxa de acerto saiu do cronograma faz tempo, quem manda no ritmo é a dificuldade.

Antes o plano era refeito a **todo** salvamento: corrigir uma vírgula na descrição apagava as
revisões automáticas da sessão e as recriava. E a mensagem dizia *"N revisão(ões) agendada(s) até
10/10"* sempre — mesmo sem nada ter sido agendado —, o que dava a impressão de que o cronograma
tinha sido refeito. Agora a mensagem conta o que aconteceu:

| Situação | Mensagem |
|---|---|
| sessão nova | `3 revisão(ões) agendada(s) até 10/10` |
| editou, sem mexer no plano | `Alterações salvas — o cronograma continua o mesmo.` |
| editou o dia, os conteúdos ou a dificuldade | `Alterações salvas · cronograma refeito: 3 revisão(ões) até 10/10` |

Uma exceção de propósito: **sessão que está sem cronograma automático nenhum volta a ter um ao ser
salva**. É o que conserta quem ficou para trás — conteúdo fechado antes de existir escada, dado
importado, item apagado à mão. O que não acontece mais é refazer uma fila que já existe.

Revisões **feitas** e as **remarcadas à mão** nunca são tocadas pelo replanejamento, como sempre.

### Os números da aba Sessões não contam horas

Havia aqui **Tempo na semana** e **Tempo total**. Saíram. Um relógio somando tudo o que você já
estudou **cobra em vez de informar** — e quem abre esta aba quer ver *o que* estudou, não *quanto
ainda falta*. O quarto número, o tempo somado do filtro, saiu junto pelo mesmo motivo: deixá-lo ao
lado dos outros dois anularia a mudança.

No lugar entraram dois números de **progresso**, que é o que a plataforma persegue:

| Bloco | O que conta |
|---|---|
| **Sessões listadas** | quantas sessões o filtro devolveu, e em quantos dias diferentes |
| **Conteúdos estudados** | quantos conteúdos distintos essas sessões cobrem, e em quantas disciplinas |
| **Pendentes na agenda** | o que está marcado, e quanto disso atrasou |
| **Conteúdos concluídos** | quantos já foram fechados, com barra de progresso e quantos seguem em andamento |

Os quatro **respeitam o filtro** — antes a semana e o total o ignoravam, o que fazia dois blocos
mudarem e dois não.

**O tempo de cada sessão continua na lista**, na coluna *Tempo*, e o total do dia continua no
separador de dia. Ali ele é **dado ao lado do que você fez**, não um placar acumulado. As horas
também continuam no **Progresso**, que é a aba de olhar para trás de propósito.

### Regra: tempo só em data que já aconteceu

Não dá para lançar **tempo de estudo numa data futura** — nem numa sessão, nem numa revisão. Datas
passadas e o dia de hoje aceitam normalmente. Na prática:

- Sessão com data futura **sem tempo** continua valendo (é um estudo planejado).
- Revisão com data futura fica **planejada**: marcá-la como "já revisei" é recusado, e o tempo que
  estiver digitado no campo é descartado em vez de gravado.
- O cronômetro não é afetado: ele sempre lança o tempo no dia em que foi cronometrado, mesmo quando
  somado a uma revisão de outra data.

### Uma anotação fica presa a uma sessão registrada

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

**Anotar não depende de ter estudado.** Você esbarra num ponto importante de uma matéria que ainda
nem começou — num edital, numa conversa, numa aula que assistiu por acaso — e precisa ter onde
guardar. Então o destino de uma anotação é **qualquer disciplina ou conteúdo do cadastro**, com
sessão ou sem.

> Até a versão anterior, a regra era outra: só aparecia o que estivesse numa **sessão já registrada**.
> Fazia sentido quando conteúdo era texto livre digitado dentro da sessão — sem sessão, não havia
> conteúdo. Com disciplina e conteúdo virando **cadastro**, a regra passou a atrapalhar.

Na prática:

- Os dois filtros do topo listam **tudo o que existe no cadastro**, mais o que aparece nas sessões e
  nas anotações já feitas. Uma disciplina criada na aba **Disciplinas** e nunca estudada aparece ali.
- O que **ainda não tem sessão nenhuma** vem marcado com **— ainda sem sessão**. É aviso, não trava:
  serve para você reconhecer o que ainda não estudou. A marca some sozinha quando a primeira sessão
  daquele conteúdo é registrada.
- A aba continua **não criando** disciplina nem conteúdo: a disciplina se cria na aba **Disciplinas**,
  e o conteúdo no formulário da sessão. Aqui você escolhe entre o que existe.
- No **editar**, *Onde entra* é um **seletor** (`Disciplina · toda a disciplina` ou
  `Disciplina · Conteúdo`) — sem campo de texto livre e sem *＋ Criar nova disciplina*. Dá para
  **mover** a anotação para qualquer destino do cadastro.

### Disciplinas

Disciplinas são um **cadastro próprio** (`db.disciplinas`), separado dos registros. Em todo formulário
(registro, revisão, novo conteúdo, edição de aprendizado) a disciplina é um **seletor**:
só dá para escolher uma já existente ou **＋ Criar nova disciplina**, no topo da lista — o que abre um
campo de texto para o nome. Isso evita a mesma matéria virar três nomes diferentes por causa de
digitação.

Backups antigos continuam funcionando: as disciplinas que aparecem nos registros, revisões e
aprendizados entram automaticamente na lista.

### Dificuldade: três níveis

**Fácil · Médio · Difícil**, e só. Cinco níveis pediam uma distinção que ninguém consegue fazer na
hora de registrar ("pouca" × "média"?) e produziam planos quase idênticos. O padrão é **médio**.

É desses três níveis que saem as duas regras do cronograma:

| Nível | Volta ao conteúdo aberto | Revisões no conteúdo fechado |
|---|---|---|
| **Fácil** | a cada 4 dias | a partir de 2 |
| **Médio** | a cada 2 dias | a partir de 3 |
| **Difícil** | no dia seguinte | a partir de 5 |

O nível também decide o **passo** da escada: fácil multiplica os intervalos por 1,5, difícil por 0,7
(`FATOR_DIFICULDADE`).

**A taxa de acerto ficou de fora do cronograma.** Ela continua medindo desempenho nas telas, mas
não mexe mais na cadência nem no tamanho do plano: a taxa
oscila com o lote de questões do dia, e o cronograma balançava junto sem ninguém ter pedido. Quem
decide o ritmo é a **dificuldade**, e ela é sua.

**O dado antigo foi convertido uma vez, na carga:** 1 e 2 viraram **fácil**, 3 virou **médio**, 4 e 5
viraram **difícil** (`db.dificuldadesMigradas`). A conversão acontece no dado cru, antes da
normalização — convertê-lo depois leria um "3" novo (difícil) como o "3" velho (médio) e rebaixaria
tudo a cada abertura.

### Dificuldade é obrigatória

Toda sessão nova — inclusive a que vem do cronômetro ou de um item da agenda — começa com a
dificuldade em **Escolha a dificuldade…** e **não salva** sem ela (Difícil, Médio ou Fácil). Não há
padrão de propósito: é dela que saem a retomada e a escada, e um "médio" por inércia faria o plano
mentir. Sessões antigas mantêm a que tinham.

**Conteúdo já estudado traz a dificuldade dele.** Ela já é guardada: é a da sessão mais recente do
conteúdo (a mesma que a agenda usa). Numa sessão nova, ao escolher um conteúdo que já teve sessão — ou
quando o formulário já abre com ele, vindo de um item da agenda —, o campo vem preenchido com ela, com o
aviso *"Veio da última sessão deste conteúdo — troque se mudou."*. Com vários conteúdos de dificuldades
diferentes, vale a mais alta. Conteúdo **nunca estudado** continua sem padrão: a escolha é sua.

**A exceção é o ▶ continuar** (aba Sessões): a sessão nova **herda** da sessão de origem a disciplina,
os conteúdos, a **dificuldade** e o **sem revisão** — é o mesmo estudo seguindo. Não herda o que é do
dia: tempo, questões e a descrição. Dá para trocar qualquer um antes de salvar.

### Dificuldade e quantas revisões cada assunto recebe

A dificuldade (Fácil / Médio / Difícil) decide **o tamanho e o passo da escada** — e só ela; a taxa
de acerto e as anotações não entram. Os degraus, em dias depois do fechamento do conteúdo:

| Dificuldade | Degraus |
|---|---|
| Fácil | D+2, 5, 11, 24, 53, 105 |
| Médio | D+1, 3, 7, 16, 35, 70, 140 |
| Difícil | D+1, 2, 5, 11, 25, 49, 98, 168, 256 |

Vale a dificuldade da **sessão mais recente** do conteúdo, de estudo ou de revisão. Revisar e marcar
*difícil* refaz as revisões automáticas pendentes com os passos novos (`reespacarEscada`); as marcadas
à mão ficam onde estão.

### Sem revisão

A caixa **“Sem revisão — só registrar o estudo”** serve para o conteúdo que você estuda todo dia: a
sessão registra tempo, questões e descrição normalmente (e entra no painel e no mapa de calor), mas
**nenhum cronograma de revisão é criado** para ela. Desmarcar volta a agendar o cronograma próprio.
### A integração foi aposentada

Havia aqui a caixa **“Integrar com outro conteúdo”** e os **grupos de revisão**. Ela existia para um
problema real: *"estudei LAI anteontem; se eu registrar LAI hoje sem integrar, nascem duas filas de
revisão para a mesma coisa"*. A documentação original dizia isso com essas palavras.

**Esse problema deixou de existir.** Três mecanismos passaram a resolvê-lo sozinhos, sem ninguém
marcar caixa nenhuma:

| Mecanismo | O que faz |
|---|---|
| escada por conteúdo | conteúdo fechado tem **uma fila só**; estudá-lo de novo empurra a que existe, não abre outra (ver *A escada é do conteúdo*) |
| `voltaEmAberto` | a volta pendente do mesmo conteúdo **anda para a frente** e passa para a sessão nova, em vez de duplicar |
| `resolverLembrete` | registrar a sessão **dá o lembrete vencido por cumprido** e faz nascer o próximo daquele dia |

Medido no cenário que motivou a integração — LAI anteontem, LAI de novo hoje, sem integrar nada:

| Fase do conteúdo | Antes de registrar | Depois |
|---|---|---|
| **Concluído** (escada de 3) | 3 itens | **3 itens** — nenhuma fila nova |
| **Em andamento** (1 volta) | 1 volta | **1 volta**, movida para a frente e passada à sessão nova |

Com isso a integração virou custo sem retorno: 254 linhas, 11 funções e uma armadilha — sair de um
grupo deixava a sessão em `plano: "manual"`, que **nunca mais recebe volta**. Foi dessa máquina que
saiu o defeito das revisões com dois donos, corrigido em `a098e69`.

**O que você perde.** A unificação automática usa o **conjunto de conteúdos** da sessão. Então duas
sessões de `LAI` dividem um plano, mas uma de `[LAI]` e outra de `[LAI, Licitações]` ainda geram dois
itens — LAI é chamado duas vezes. Isso só acontece com **sessões de vários conteúdos que se
sobrepõem em parte**; com um conteúdo por sessão, nunca.

**Backups antigos continuam funcionando.** `migrarGrupos()` desfaz os grupos na abertura: cada card
volta para a sessão mais recente que ele cobria, e a sessão volta ao plano **automático** — nunca a
`manual`, para desfazer a integração não deixar ninguém sem agendamento. O histórico atravessa
inteiro: revisão feita continua feita, com o tempo, as questões e a nota; revisão à mão continua à
mão. Só a pendente automática é recalculada, com a data contada de hoje.

### Mudar a ordem das anotações de um card

As anotações do **mesmo conteúdo e do mesmo dia** ficam num card só, e dentro dele a ordem é sua:
pegue a **alça ⠿** à esquerda da anotação e arraste para cima ou para baixo. A alça só aparece quando
o ponteiro entra no card (no toque, fica sempre visível).

**Também funciona sem arrastar:** com a alça focada, **↑** e **↓** movem a anotação uma posição. Esse
é o caminho de quem usa teclado — e o único que funciona no celular, onde o arrastar do HTML não
existe.

Três regras:

- **Só dentro do card.** Não dá para arrastar uma anotação para outro card: cards diferentes são
  outro dia ou outro conteúdo, e isso seria mudar o dado, não a ordem. Para mover de conteúdo, use o
  *editar*.
- **Arrastou uma, o card inteiro passa a ser seu.** A ordem automática (véspera em cima, mais
  recentes antes) deixa de mexer naquele card — senão o que você arrumou se desfaria sozinho na
  próxima anotação. Marcar ★ deixa de jogar a anotação para o topo; ela continua destacada onde está.
- **Anotação nova entra depois** das que você posicionou.

A ordem fica gravada em cada anotação (`ordem`) e vai no backup, então sobrevive a recarregar o app e
a trocar de dispositivo pela nuvem.

### Editar uma anotação

O **editar** abre a mesma **tela sobreposta** das sessões e das revisões, em vez de transformar a
linha do card em formulário. O motivo é prático: o formulário é alto (caixa de texto grande, origem,
tipo do erro, onde entra, situação) e, inline, o botão **Salvar** caía abaixo da dobra — era preciso
rolar para salvar. Na tela sobreposta ela abre **centralizada**, e o rodapé de ações fica **fixo no
pé da caixa**, então *Salvar*, *Cancelar* e *Excluir* estão sempre à vista, com a rolagem
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

#### Os números da aba não medem desempenho

Havia ali **Taxa de acerto** e **Por desatenção**, e a contagem de pontos vinha com *"N refeitas e
acertadas"* embaixo. Os três medem desempenho em questão — e esta aba é de **conhecimento**: o que se
anota aqui *"vem de questão ou não"*. Desempenho tem a aba **Questões** inteira para ele.

No lugar entraram números que respondem o que se pergunta **aqui**:

| Bloco | O que conta |
|---|---|
| **Pontos anotados** | quantas anotações o recorte tem |
| **★ Para a véspera** | quantas estão marcadas para reler antes da prova, e que fatia do total é |
| **Última anotação** *(num conteúdo)* | a data, com *hoje* / *ontem* / *há N dias* |
| **Conteúdos anotados** *(numa disciplina)* | de quantos conteúdos dela você já anotou algo, com barra |
| **Questões do conteúdo / da disciplina** | ficou, como contexto |

#### Onde a anotação entra: dois campos

*Onde entra* era **um seletor só**, com `Disciplina · Conteúdo` na mesma linha — com muitas matérias
virava uma lista enorme onde se procurava o conteúdo lendo o nome da disciplina repetido dezenas de
vezes. Agora são **dois campos em cascata**: primeiro a **disciplina**, e o campo de **conteúdo**
mostra só os conteúdos dela. Trocar a disciplina refaz a lista na hora, sem redesenhar a tela — o que
você já digitou não se perde.

O conteúdo é **opcional**: em branco, a anotação fica na **disciplina inteira**, que é um destino
legítimo — nem todo ponto importante pertence a um tópico só.

**O destino fica guardado para a próxima.** O compositor continua aberto depois de salvar, e quase
sempre a próxima anotação é do mesmo assunto; escolher tudo de novo a cada ponto era trabalho à toa.
Fechar o compositor esquece o destino, como já esquecia o rascunho.

Os mesmos dois campos estão na **tela de edição**, e é por eles que se **move** uma anotação de
disciplina ou de conteúdo.

#### A caixa de escrever

A caixa **nasce com espaço para umas seis linhas e cresce conforme você escreve**, até um teto (pouco
mais de meia tela) — passando dele, aí sim ela rola. Antes tinha **duas linhas** e `resize:none`:
apertar Enter fazia a linha escrita subir para fora do campo, e dava a impressão de que a quebra não
tinha sido guardada. **Estava sendo guardada** — o que faltava era a caixa mostrar.

A linha de apoio do rodapé (*"Vai entrar em X · Ctrl/⌘ + Enter salva · Esc fecha"*) é apoio, não
conteúdo: ficou miúda e colada na caixa, e o espaço que ela ocupava foi para o texto.

**A quebra de linha vale do começo ao fim.** O que você digita é guardado como digitado, e na tela:

| Na caixa | No card |
|---|---|
| Enter simples | quebra a linha (`<br>`) |
| linha em branco | começa um **parágrafo** novo |
| linha começando com `-` | vira item de **lista** |

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
- **⇅ juntar os dias** (ao lado de *★ só as da véspera*) desfaz a divisão por dia quando você quer ver
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
| `!!não confunda!!` | vermelho |
| `++vale para todos++` | verde |
| `@@art. 11@@` | azul |
| `\==isto\==` | escreve `==isto==` cru, sem virar cor |
| linha começando com `- ` | item de lista |
| `-- ` e `--- ` no começo da linha | subitem (segundo e terceiro nível) |
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

As quatro cores são **fechadas** (`CONFIG.CORES_TEXTO`): grifar, vermelho, verde e azul. Os botões
dizem só a cor — o que cada uma significa é quem anota que decide (antes eram *atenção*, *regra* e
*lei*; os ids internos continuam esses).
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

### O card de revisão

Cada bloco da ***Agenda por assunto*** reúne, num card só, tudo o que fala do mesmo conjunto de
conteúdos — inclusive de sessões diferentes. Havia aqui um **✎ editar card** para dar nome ao card e
ligar outras sessões a ele; saiu com a integração. O card continua existindo: ele se forma sozinho,
pelos conteúdos.

### Lançar questões ligadas a uma sessão

Nem toda bateria de questões acontece no dia do estudo. O botão **+ Lançar questões**, na aba **Questões** logo abaixo dos indicadores (primeiro o
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

### A ordem da aba Questões

1. **os indicadores** — o retrato primeiro;
2. **+ Lançar questões** — a ação;
3. **os filtros** — encostados no primeiro bloco que eles recortam;
4. o **gráfico dia a dia**, o **desempenho por disciplina/conteúdo** e as **questões fora das sessões** (antes, baterias avulsas).

### O mesmo filtro em todas as abas: Disciplina e Conteúdo (25/09)

Sessões, Agenda, Disciplinas, Anotações, Questões e Progresso filtram do mesmo jeito: uma caixa de
**Disciplina** e, ao lado, uma de **Conteúdo**, em cascata — escolhida a disciplina, o conteúdo só mostra os dela;
escolhido um conteúdo, a disciplina acompanha. A exceção é a aba **Questões**, que mantém os botões para
marcar **várias disciplinas ao mesmo tempo** (decisão do Pedro) e ganhou só a caixa de Conteúdo.

### Filtrar as questões por disciplina — várias ao mesmo tempo

A linha de **Filtrar** recorta **tudo** o que vem abaixo dela: o gráfico dia a dia, a tabela de
desempenho e as baterias avulsas — e também os indicadores, acima. Não faria sentido um bloco falar
de *Português* e o vizinho de todas as matérias.

**Dá para escolher mais de uma.** Cada chip é um interruptor: clicar liga, clicar de novo desliga.
Com duas ou mais marcadas, o que aparece é a **soma delas** — as questões entram na mesma conta, no
mesmo gráfico e na mesma taxa de acerto, e a tabela de desempenho lista as duas. Um contador ao lado
diz quantas estão escolhidas (*2 de 5*).

Sem nenhuma marcada, a aba fala de **todas** — é o mesmo que *Todas*, e é o que evita o estado sem
saída de zero escolhidas e tela vazia. Tirar a última devolve a aba inteira, igual ao **limpar ✕**.

Só aqui a escolha é múltipla: os filtros do **Progresso** e da aba **Disciplinas** continuam
escolhendo uma disciplina de cada vez.

**A linha rola para o lado, não quebra.** Com muitas disciplinas ela virava duas ou três linhas e
empurrava a aba inteira para baixo. Agora só os chips deslizam; o rótulo **Filtrar** e o **limpar ✕**
ficam **fixos nas pontas**, que é onde precisam estar sempre à mão. A barra de rolagem é fina e o
gesto de arrastar funciona no toque.

O filtro **continua listando todas as disciplinas** — escolher uma não pode apagar o caminho de volta
para as outras. A escolha é lembrada entre recargas, e acompanha o nome se você renomear a
disciplina. Só aparece quando há mais de uma disciplina com questões registradas.

Com uma disciplina escolhida, a tabela **Desempenho por disciplina** passa a ter uma linha só — é o
botão **Conteúdo** que fica útil ali, mostrando como você vai em cada tópico dela.

### O gráfico das questões, dia a dia

Logo abaixo do botão de lançar, uma barra por dia mostra **quantas questões você resolveu** e
**quantas acertou**. Passando o mouse (ou o dedo) numa coluna, a bolha traz a data, os **acertos**,
os **erros**, o **total** e a **taxa** daquele dia. O período se escolhe em **7 / 30 / 90 dias**, e a
escolha é lembrada.

**Por que empilhado e não duas barras lado a lado.** Acerto é *parte* do total — duas barras
vizinhas pedem ao olho que compare coisas do mesmo nível, e o leitor acaba somando 46 + 50 como se
fossem grandezas independentes. Empilhado, a **altura** responde *"quantas fiz"* e a **divisão**
responde *"quantas acertei"*, sem contar ninguém duas vezes.

**Por que azul e laranja, e não verde e vermelho.** Verde/vermelho é o par óbvio para certo/errado —
e é o pior possível para quem tem daltonismo: medido, o par do app dá **ΔE 4,1** em deuteranopia,
abaixo até do piso aceitável. Azul/laranja (os dois primeiros slots categóricos, `--s1` e `--s2`)
dá **24,7**, e passa em todas as verificações no tema claro e no escuro. A legenda nomeia as duas
séries, então a identidade nunca depende só da cor.

Detalhes do desenho: barra fina, **só a ponta de cima arredondada** (a base encosta reta no eixo),
2px de respiro entre acertos e erros, grade em fio recessivo, e o alvo do hover é a **faixa inteira
do dia** — com 3px de barra ninguém acerta o ponteiro.

### A tabela de Lançamentos saiu

Ela listava **toda** questão já registrada, com a origem (sessão, revisão ou avulsa). As que vêm de
sessões e de revisões se editam na sessão e na revisão; o inventário só repetia o que já estava em
outro lugar, e o gráfico responde melhor a *"como eu venho indo"*.

**As baterias avulsas ficaram**, num bloco próprio no fim: são as únicas que se editam e se apagam, e
a tabela era o único caminho para isso — sem ele, uma bateria digitada errada ficaria errada para
sempre.

### Numeração das revisões

O número mostrado (“revisão 2”) é **contínuo dentro do card**, contado por data. Como um card pode
reunir mais de uma sessão — duas sessões do mesmo conjunto de conteúdos —, a contagem é do card
inteiro, nunca uma sequência por sessão dentro do mesmo card.

> **Dois modelos aposentados.** O primeiro jogava a sessão num plano único da **disciplina inteira**;
> o segundo eram os **grupos de revisão**. Backups de qualquer um dos dois são convertidos na
> abertura (`migrarIntegracoes` e `migrarGrupos`), com um aviso explicando o que houve.

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

### Continuar um conteúdo

Conteúdo grande atravessa vários dias, e nem sempre é a agenda que puxa: às vezes você está olhando a
sessão de terça e quer seguir dali. O botão **▶ continuar**, na última coluna da lista de Sessões (e
como **▶ Continuar hoje** dentro da tela de edição), abre uma sessão **de hoje** já com a mesma
disciplina, os mesmos conteúdos e a dificuldade herdada. Tempo e **descrição** começam vazios — é a
descrição que separa uma sessão da outra.

- **Se já existe sessão daquele conteúdo hoje, é ela que abre**: continuar no mesmo dia é somar horas
  na mesma sessão, não criar outra com o mesmo nome.
- **O agendamento não duplica.** Nenhuma fila nova nasce: a volta em aberto daquele conteúdo apenas
  passa a contar a partir desta sessão.
- **Lembrete atrasado é dado por cumprido** ao salvar, como em qualquer sessão do conteúdo.

O botão **só aparece em sessões de dias anteriores** — na sessão de hoje, continuar é somar horas
nela mesma, e um botão ali só convidaria a criar uma segunda igual.

A **coluna Tipo** mudou de lugar: ficou ao lado de *Revisões*, e a ponta direita da tabela passou a
ser a coluna da ação. A distribuição das larguras também mudou: as colunas de dado curto ficam **do
tamanho do próprio conteúdo** e a de **Conteúdos** absorve o que sobra, com no mínimo 26 caracteres
de largura. A ordem é **Data · Disciplina · Tempo · Conteúdos · Dificuldade · Tipo · ação**: o tempo
foi para a esquerda de propósito, para a dificuldade encostar na coluna larga e caber numa linha só. Antes o espaço era repartido por igual, o que espremia as colunas e deixava um vão grande
antes da última.

**A coluna Revisões saiu; a Dificuldade voltou.** A de revisões contava `feitas/total` **da sessão**,
e o plano deixou de ser da sessão — é do **conteúdo**, e duas sessões do mesmo conteúdo dividem o
mesmo card. Quem responde isso é a aba **Agenda**. Já a dificuldade explica *por que* o plano é
daquele tamanho, cabe num badge curto e ajuda a varrer a lista.

**O que não se perdeu:** os sinais da coluna antiga que não eram contagem e que ninguém adivinha de
fora — **sem revisão**: a sessão não gera cronograma — passou a aparecer como etiqueta discreta
**ao lado do nome do conteúdo**, e só quando é o caso. (A etiqueta do nome do grupo saiu com a
integração.)
Assim uma sessão marcada como *sem revisão* por engano não fica invisível na lista.

**A etiqueta *manual* saiu.** Plano feito à mão é o caso mais comum depois de mexer numa data, então
ela aparecia em quase toda linha sem mudar nada do que se faz ali — ruído, não sinal. O dado não se
perdeu: continua na ficha da sessão, no bloco **Esta sessão**.

Para a coluna de Conteúdos ficar **mais larga ainda** — é nela que mora a descrição, e é lá que a
legibilidade importa —, as colunas curtas que **podem** quebrar linha quebram: disciplina,
e disciplina. **Data, tempo, tipo e revisões
não quebram**, porque quebrar `21/09` ou `1h30` no meio não ajuda ninguém. Com a largura extra, a
descrição da sessão mostra **160 caracteres** em vez de 90.

### Trocar o conteúdo de uma revisão

Dá para pegar uma revisão marcada para hoje e **apontá-la para outro conteúdo** — é o caso de quem
tinha a revisão de X agendada, mas hoje está estudando Y da mesma disciplina e quer que as horas
contem como revisão. Escolhido o conteúdo novo, a revisão passa a apontar para a **sessão daquele
conteúdo** (ou fica avulsa, se ainda não houver sessão dele).

### Adicionar e editar revisões

Além das revisões que o sistema agenda sozinho, o botão **+ adicionar uma revisão** (e o **+ revisão**
de cada assunto) abre um formulário com data, disciplina, assuntos, **atividade da revisão**,
detalhes, tempo, questões, acertos e dificuldade. Cada linha da rotina tem **editar**, que abre o mesmo formulário no lugar
da linha (com **Excluir**).

Se a disciplina e os assuntos coincidirem com uma sessão de estudo já registrada, a revisão é
**ligada a ela** (entra no mesmo card e influencia o replanejamento); senão, fica **avulsa**, com
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
*ainda sem sessão* na aba Anotações. Se você digitar um assunto e salvar sem adicionar, ele
entra do mesmo jeito. A **descrição continua sendo um campo só**, referente à sessão inteira.

Como as métricas por assunto ficam: a sessão é **rateada** entre os assuntos que ela cobriu (tempo,
questões e acertos divididos igualmente), de modo que os totais do painel não são duplicados e a
**taxa de acerto de cada assunto continua sendo a da sessão**. Para o agendamento, a sessão é tratada
pelo seu **assunto mais frágil** (pior taxa de acerto) — então um tópico ruim no meio de uma
sessão boa ainda puxa as revisões para mais cedo. Cada assunto aparece separadamente em
*Aprendizados* e no drill-down do painel.

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

**Passou da meia-noite? Você escolhe.** Se o cronômetro atravessa a meia-noite — você inicia às
**23h30** de quarta e encerra às **0h30** de quinta —, ao encerrar aparece a pergunta *para onde vão
as horas*:

- **Tudo na sessão de quarta** — o dia em que você começou. O bloco guarda os horários de verdade
  (`23:30 → 00:30`) com uma marca de **(+1)** dizendo que o fim caiu no dia seguinte; para uma sessão
  nova, o formulário já abre com a data de **quarta**.
- **Dividir por dia** — até a meia-noite fica na sessão que iniciou o cronômetro (`23:30 → 24:00`), e
  o resto vai para uma **sessão nova de quinta, criada sozinha, igual à original** (disciplina,
  conteúdos, tipo, dificuldade; as questões ficam com a original), com `00:00 → 00:30`. Se o destino
  era *Nova sessão*, o formulário abre com a parte de quarta e a de quinta nasce quando você salva.

Fechar a pergunta sem responder não perde nada: a hora em que você parou fica guardada, o chip do
cronômetro para de contar e mostra **escolher o dia**.

**O seletor de destino só lista o que é de hoje** — sessões registradas hoje, a revisão de hoje e as
atrasadas ainda pendentes. Nada de outros dias entra na lista. Da mesma forma, concluir uma revisão
futura registra o tempo e a atividade **na data atual**.

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

1. **Repetição espaçada** — intervalos crescentes contados do fechamento do conteúdo; o tamanho e o passo da escada saem da **dificuldade** (só dela). Atraso ou revisão extra empurram as seguintes.
2. **Curva do esquecimento (Ebbinghaus)** — a primeira revisão vem cedo, quando o esquecimento é mais rápido.
3. **Recordação ativa** — toda revisão pede questões feitas e acertos; reler não conta como revisão.
4. **Sistema Leitner** — dificuldade alta = mais revisões, mais próximas; fácil = mais espaço entre elas.
5. **Prática intercalada** — o painel sugere alternar disciplinas em vez de blocos longos.

**Ajustes e ajuda são dois botões no topo.** A **engrenagem** (no mesmo estilo do livro da marca) abre
os **Ajustes**: objetivo, datas de prova, revisar até, meta diária, tempo de estudo previsto, dias da
retomada e a chave do agendamento automático. O **?** abre a **Ajuda**, um **tutorial** em seções que
abrem e fecham, com um **sumário lateral** (no celular, uma caixa "Ir para…") e um fio separando cada subtópico: *Comece por aqui*, *As abas, uma a uma*, *Como as abas se ligam*,
*Continuar e revisar*, *Cronômetro*, *Sua própria rotina*, *Ajustes*, *Seus dados* e *Metodologias*. Os
números que dependem dos ajustes (dias da retomada, degraus, horizonte) saem do cálculo de verdade. Um leva ao outro, e o botão da prova também abre os ajustes.

## Parâmetros configuráveis

Estão no objeto `CONFIG`, no topo do `<script>` do `index.html`:

```js
META_DIARIA_MIN: 180               // meta de estudo por dia
RETORNO_POR_DIA: 3                 // depois da prova: primeiras revisões por dia, no máximo
REVISOES_POR_DIFICULDADE: {1:2, 2:3, 3:5}   // fácil, médio, difícil (+ a folga = tamanho da escada)
TAXA_CRITICA: 60                   // só nas telas: cor da taxa de acerto
TAXA_ATENCAO: 75                   // idem
INTERVALOS_LIVRES: [1,3,7,16,35,70,140,240,365]   // a escada: dias após o fechamento
FATOR_DIFICULDADE: {1:1.5, 2:1, 3:0.7}            // fácil estica a escada, difícil encurta
HORIZONTE_LIVRE: 180               // sem teto escolhido: até onde o plano se estica
MAX_REVISOES: 9                    // nenhum assunto passa disso
FOLGA_POR_DIFICULDADE: 4           // quão fundo na escada a dificuldade deixa ir
CATEGORIAS_ERRO: [conteudo, interpretacao, bobo, chute, acertei]  // opcionais, editáveis
```

Data da prova, **revisar até** (o teto, sem limite) e meta diária são mudadas pela interface
(engrenagem no topo); alterar qualquer uma delas **replaneja todas as revisões pendentes** — ver
*Até quando o sistema agenda*.

## Estrutura dos dados

```
{ versao, tema, objetivo, dataProva, revisarAte, posProva, metaDiariaMin, fasesMigradas, conteudosMigrados,
  // objetivo = "livre" | "concurso" | "vestibular" · dataProva = a prova do concurso ("" = a definir)
  vestibular: { dias: [{id, nome, data}],            // quantos dias a prova tiver
                disciplinas: {nome: idDoDia} },      // ligação opcional da disciplina a um dia
  conteudos: [{id, nome, disciplina, fase, concluidoEm, criadoEm,
               diaProva?}],                           // o cadastro; a fase mora aqui
               // diaProva: ausente = segue a disciplina · "-" = nenhum dia · id do dia
  // revisarAte = teto do cronograma ("" = sem teto) · posProva = "" | "continuo" | "encerrei"
  cronometro: null | {inicio, disciplina, assunto, destinoTipo, destinoId},   // em andamento
  lancamentos: [{id, registroId, data, questoes, acertos, criadoEm}],   // questões lançadas à parte
  registros: [{id, data, disciplina, assuntos[], minutos, questoes, acertos, dominio, anotacoes,
               criadoEm, plano?, inicio?, fim?, blocos?}],             // blocos = medições do cronômetro
               //   {data, inicio, fim, minutos, viradas?} — data = o dia em que a medição COMEÇOU;
               //   viradas = quantos dias ela atravessou (ausente quando começou e terminou no mesmo dia)
  revisoes:  [{id, registroId, data, ordem, feita, feitaEm, minutos, questoes, acertos, dominio,
               nota, manual, retomada?, disciplina?, assuntos?}],     // retomada = volta de conteúdo aberto;
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

Revisar é estudar. Por isso **todo tempo mora num lugar só — a aba Sessões** — e a aba **Agenda** virou
agenda: ela diz *o que* revisar e *quando*, não guarda horas.

Cada sessão tem um **tipo**:

- **Estudo — conteúdo novo ou continuação** (padrão): gera o plano do conteúdo (uma volta, se está em
  andamento; a escada, se está concluído) e **pode fechar uma volta** quando você chega nela pela
  agenda.
- **Revisão — conteúdo que já fechei**: cumpre um item agendado. **Não gera cronograma novo**, herda o
  conteúdo da revisão (as etiquetas ficam travadas) e some com a caixa de *sem revisão*, que não
  fazem sentido ali.
- **Estudo/Revisão** — **aposentado**. Ele existia para dizer "revisei e ainda vi conteúdo novo", que
  é justamente o que a **fase do conteúdo** passou a responder. Não aparece mais no formulário nem no
  filtro; sessões antigas marcadas assim continuam legíveis e, ao serem editadas, mostram o tipo como
  *(rótulo antigo)* para não mudarem sozinhas. Funciona **exatamente como Revisão** (cumpre uma revisão agendada, marca a caixa dela,
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

**A descrição do item vai junto.** O que você escreveu no item da agenda (*"refazer as 10 questões que
errei da aula 3"*) é a instrução da sessão que vai cumpri-lo — então a sessão **nasce com aquilo na
descrição**, em vez de você reescrever ou perder o combinado. Se a sessão já existia e já tinha
descrição própria, a dela é preservada.

**Pela aba Agenda:** marcar a caixa abre a tela de sessão. Se **já existe uma sessão daquele conteúdo
hoje**, é ela que abre — com o tempo que você já registrou e a revisão já escolhida —, em vez de
nascer uma segunda sessão com o mesmo nome. Não havendo, abre o formulário de uma sessão nova, com
data de hoje e a revisão travada.

**O vínculo não depende do tipo.** Qualquer sessão pode cumprir um item da agenda — inclusive uma de
**Estudo**. É isso que permite ter **uma sessão só**, do tipo estudo, cujas horas contam como
revisão. Antes, marcar a revisão criava uma sessão de tipo *Revisão* ao lado da de *Estudo* que já
existia, e ficavam duas com o mesmo nome.

### Trocar o tipo

Uma sessão de **estudo registrada hoje pode virar revisão** — erro de tipo acontece, e no mesmo dia dá
para consertar. Sessão de **outro dia não**: o botão fica travado, com a razão à vista.

Converter apaga as revisões que aquela sessão tinha agendado (a plataforma avisa quantas, antes) e a
Se ela já tiver revisão **cumprida**, a conversão é recusada — seriam
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

### A agenda de hoje, também aqui

A aba **Agenda** abre com o card **Agenda de hoje** — o mesmo bloco da aba *Hoje*, com a data no
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

### Atrasados

Abaixo da agenda há o card **Atrasados**, com o que ficou para trás e um botão
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

## O objetivo de estudo: Sem objetivo, Concurso ou Vestibular/ENEM

Na **engrenagem** do cabeçalho (Ajustes), o primeiro campo é o **Objetivo**. São três modos, e dá para
trocar a qualquer momento: trocar muda só o modo — **a data do concurso e os dias do vestibular ficam
guardados**, e voltar a um modo encontra tudo como estava. Trocar de modo reagenda as revisões
pendentes; as feitas e as marcadas à mão ficam como estão.

| | Sem objetivo | Concurso | Vestibular / ENEM |
|---|---|---|---|
| Datas | nenhuma | uma prova (ou "data a definir") | quantos dias a prova tiver, cada um com nome e data (ou "data a definir") |
| Topo da tela | "Estudo contínuo · sem data de prova" | "N dias para a prova" | "N dias para *nome do dia*" — o próximo; passado um, conta para o seguinte |
| Cronograma | escada normal, horizonte móvel de 180 dias | a mesma escada; a prova **não corta** nada, só o dia dela fica bloqueado | igual; os dias de prova ficam bloqueados |

Na **primeira abertura** (sem nenhum dado) o app pergunta *Para que você estuda?*. O modo já nasce
"Sem objetivo", então fechar a caixa também é uma resposta. Dados antigos, sem o campo, são lidos pela
data: com prova marcada, Concurso; sem, Sem objetivo.

A **★ das anotações** se chama **Importante** em todos os modos (antes era "véspera"); o dado é o mesmo.

Concurso ou vestibular **sem data** (o edital ainda não saiu) é aceito: o topo diz "data a definir" e a
agenda segue sem prazo até a data entrar.

### Vestibular com vários dias: ligar um conteúdo ao dia dele (opcional)

Com **dois dias de prova ou mais**, a aba **Disciplinas** mostra um seletor ao lado de cada disciplina
e embaixo de cada conteúdo. **Não é obrigatório**: sem ligação, os cards nascem normalmente.

- **Disciplina ligada a um dia**: todos os conteúdos dela seguem esse dia, inclusive os criados depois.
- **Conteúdo**: *como a disciplina* (padrão), um dia específico ou *nenhum dia* (vale até o último).
- A ligação **não corta** a escada (desde 23/09 a prova não é teto). O que ela faz: do dia de prova
  do conteúdo até o último dia, ele fica **em silêncio** — os itens dele (inclusive atrasados) somem
  da agenda e das contagens, mas ficam guardados, e replanejar não os apaga.
- Um item que fala de vários conteúdos só silencia quando **todos** estão em silêncio.
- Tirar um dia de prova nos ajustes desfaz as ligações a ele.

### Quando o último dia de prova passa

Aparece uma vez a pergunta **E depois da prova?** — enquanto ela não é respondida, o agendamento
segue normalmente; parar é escolher **Encerrei**.

- **Continuo**: o objetivo vira *Sem objetivo* (as datas ficam guardadas). Os itens que o silêncio
  escondeu voltam com **data nova** (a antiga fica registrada, como numa remarcação), e as primeiras
  revisões são **espalhadas** pelos dias seguintes — no máximo `RETORNO_POR_DIA` (3) por dia, as mais
  difíceis primeiro, cada escada andando inteira para os intervalos não mudarem.
- **Tenho outra prova**: no concurso, pede a nova data; no vestibular, abre os ajustes para marcar os
  novos dias.
- **Encerrei**: nada é apagado; o sistema só para de agendar (religa-se nos ajustes).

A **revisão à mão** (*+ Adicionar revisão*) só não pode cair num **dia de prova** que ainda está por
vir. Depois da prova ela vale normalmente, mesmo com o agendamento encerrado.

## Disciplinas e conteúdos são um cadastro

Conteúdo deixou de ser texto digitado em cada sessão e passou a ser uma **ficha**: a sessão aponta
para ela. Era assim que nasciam *"LAI"*, *"LAI "* e *"Lei de acesso"* — três nomes para a mesma
coisa, três cronogramas separados, três cards.

- **Primeiro a disciplina, depois o conteúdo.** O campo de conteúdo mostra **só os conteúdos daquela
  disciplina**; trocar a disciplina troca a lista (o formulário se redesenha preservando o que você
  já preencheu). O que já está na sessão sai da lista, para não entrar duas vezes.
- **Criar continua fácil:** a opção **＋ Criar novo conteúdo** abre um campo de nome ali mesmo, sem
  sair do formulário. A ficha nasce na hora, presa à disciplina escolhida.
- **O que diferencia duas sessões do mesmo conteúdo é a descrição**, não um nome ligeiramente
  diferente. É por isso que a etiqueta deixou de ser **digitável** no formulário — o ✎ dela renomeia
  a ficha inteira, que é outra coisa (ver *Renomear de dentro da sessão*).
- **Renomear é sempre a mesma coisa, de dois lugares:** o ✎ da aba **Disciplinas** e o ✎ da
  **etiqueta do conteúdo**, dentro do formulário da sessão. Os dois chamam a mesma rotina, avisam o
  mesmo alcance e mudam o nome **em todo o sistema** — nas sessões, nas revisões avulsas e nas
  anotações. O que **não** existe é digitar por cima do nome na etiqueta (ver abaixo).

### Renomear de dentro da sessão

O nome errado você percebe **editando a sessão** — e é de lá que dá para consertar. Cada etiqueta de
conteúdo no formulário tem um **✎** que abre o mesmo renomear da aba *Disciplinas*:

```
Conteúdos da sessão *
┌─────────────────────────────────────────┐
│  LAI  ✎  ✕   │  Licitações  ✎  ✕        │
└─────────────────────────────────────────┘

        ↓ clicando no ✎

Novo nome para “LAI”:
Muda em todo o sistema: 2 sessões, 1 item da agenda e 1 anotação.
[ Lei de Acesso à Informação                    ]
```

**O aviso do alcance conta o que a operação realmente toca** (`alcanceDoConteudo`), e a **aba
Disciplinas mostra o mesmo texto** — as duas telas leem o mesmo lugar, para não se descolarem. Um
nome que já existe naquela disciplina é **recusado**, igual nos dois caminhos.

**Por que um ✎ e não um campo de texto.** A etiqueta já foi digitável, e foi assim que nasceram
"LAI", "LAI " e "Lei de acesso" como três fichas da mesma coisa: digitar ali mudava o nome **só
naquela sessão**. Além disso, um texto editável obriga o sistema a adivinhar entre três intenções com
um gesto só — *renomear a ficha*, *esta sessão era de outro conteúdo* ou *criar uma ficha nova*. O ✎
diz uma coisa só, e não há o que adivinhar. (Os cinco listeners daquele campo antigo e o CSS que
ainda dava cursor de texto à etiqueta foram removidos junto.)

**Renomear com a sessão aberta não perde o que você digitou.** Descrição, tempo e questões ainda não
salvos continuam na tela: a operação **não redesenha** o formulário — ele seria remontado a partir do
registro salvo —, e sim acerta no lugar as etiquetas e as opções do seletor. O `data-assunto` da
etiqueta é o primeiro a mudar, porque é dele que o salvamento lê a lista: deixá-lo com o nome velho
recriaria a ficha antiga ao salvar.

O card de revisão não tem nome próprio para acompanhar: ele se chama pelos conteúdos que reúne.

### A aba Disciplinas

O cadastro tem **aba própria**, ao lado de *Sessões* — antes era uma tela escondida dentro de
*Ajustes*. Agrupada por disciplina, mostra cada conteúdo com **em quantas sessões ele aparece** e a
fase, e um resumo no topo (quantas disciplinas, quantos conteúdos, quantos em andamento).

Com mais de uma disciplina, um **filtro** lista todas no topo: escolher uma deixa só ela na tela, e o
resumo passa a falar dela. O filtro **continua mostrando as outras** — senão escolher uma apagaria o
caminho de volta — e um **limpar filtro ✕** devolve a lista inteira. A escolha é lembrada entre
recargas, como os outros filtros da plataforma.

De lá dá
para **renomear**, **concluir**, **reabrir** e **excluir** — e concluir/reabrir valem também pela
**disciplina inteira**, que é o mesmo aplicado a cada ficha aberta dela, de uma vez. Concluir pede confirmação dizendo quantos
conteúdos serão fechados; a aba se redesenha e você segue mexendo.

Em *Ajustes* ficou só o atalho **Ir para a aba Disciplinas**.

#### Criar e renomear disciplinas

O botão **+ Nova disciplina**, no topo da aba, cria só a **disciplina** — os conteúdos dela continuam
nascendo no formulário da sessão, que é onde ganham contexto (data, tempo, dificuldade). Uma
disciplina sem conteúdo nenhum é legítima: é o começo de tudo.

O **✎ renomear** no cabeçalho de cada disciplina muda o nome **em todo o sistema**, e o aviso diz o
alcance antes (*"Muda em todo o sistema: 3 conteúdos, 12 sessões e 5 anotações"*). O nome de uma
disciplina está escrito em **cinco lugares** — a lista própria, as sessões, as revisões avulsas, as
anotações e as fichas de conteúdo —, e renomear em um só partiria o cadastro em duas disciplinas com
os mesmos conteúdos. Os filtros de tela que apontavam para o nome antigo acompanham. Um nome que já
existe é recusado, ignorando maiúsculas.

#### Excluir um conteúdo

**Excluir** (dentro do **✎ editar** do conteúdo, no canto) tira o conteúdo do **cadastro** e da **agenda**. O que ele *não* faz é apagar o
estudo — e é essa a metade que costuma assustar, então a confirmação diz as duas em voz alta:

```
Excluir o conteúdo “LAI” de Legislação?

SAI da agenda: 3 itens marcados (revisões e cards de continuar deste conteúdo).
FICA o estudo: 2 sessões continuam registradas, com as horas e as questões.
              Nada muda na aba Sessões.

O cadastro do conteúdo some. Não dá para desfazer.
```

- **As sessões ficam intactas** — as mesmas horas, as mesmas questões, o mesmo nome do conteúdo
  escrito nelas. Meta diária, sequência, mapa de calor e total de horas **não mudam de valor
  nenhum**. Apagar o cadastro é dizer *"não quero mais ser cobrado disto"*, não *"isto nunca
  aconteceu"*.
- **Da agenda saem só os itens que falam SÓ daquele conteúdo.** Um card que cobre *LAI* e
  *Licitações* continua valendo por *Licitações* depois que *LAI* sai — matá-lo levaria junto o plano
  de um conteúdo que ninguém mandou apagar.
- **E não volta sozinho.** Quem monta o cronograma olha a *sessão*, não o cadastro: sem cuidado, a
  volta seria remarcada no dia seguinte e a exclusão não teria pegado. Por isso **sessão sem ficha
  não agenda nada** (`temCadastro`) — vale para as voltas e para a escada.
  Registrar uma sessão nova com aquele nome cria a ficha de novo, do zero, em andamento.
- As anotações daquele conteúdo **continuam** na aba *Anotações*: elas se prendem à sessão, que não
  foi apagada.

**A migração** transformou em ficha tudo o que já estava em uso (sessões, revisões avulsas e pontos
importantes), uma por disciplina + nome, e roda uma vez só (`db.conteudosMigrados`).

## A aba Agenda e suas três visões

A aba deixou de se chamar *Revisões* porque deixou de ser só isso: para conteúdo **concluído** ela
traz revisões; para conteúdo **em andamento**, lembretes de voltar ao assunto — e quem decide o que
fazer quando o lembrete chega é você. **Agenda** cobre as duas naturezas sem mentir sobre nenhuma.

### Duas sub-abas: o que falta e o que já passou

No topo da Agenda, antes de tudo, **A fazer** (padrão) e **Concluídos**. O corte entre elas **não é
"feita ou não" — é o dia**:

| Sub-aba | O que entra |
|---|---|
| **A fazer** (padrão) | o dia de hoje (inclusive **o que você já concluiu hoje**), o que ficou **atrasado** e os **próximos dias** |
| **Concluídos** | só o que foi marcado em **dias anteriores**, do mais recente para o mais antigo |

A regra que importa: **uma revisão marcada hoje não sai da lista debaixo da sua mão.** Ela continua
ao lado das dos próximos dias pelo resto do dia e só passa para *Concluídos* **a partir de amanhã
(D+1)** — o dia ainda está acontecendo, e ver a lista se reorganizar a cada clique seria o contrário
de um registro. O dia que conta é o em que a revisão foi **concluída**, não o em que estava marcada:
uma de terça cumprida na quinta aparece na quinta.

Em *Concluídos*, a visão **Por dia** vira **Dias anteriores** (`SEG · 21/09 — ontem · 2 itens`); *Por
assunto* e *Mês* mostram as mesmas revisões, filtradas pela sub-aba. O card **Agenda de hoje** e o
de **atrasadas** só existem em *A fazer* — hoje e o atraso são, por definição, o que ainda falta.

### “Revisão” só onde é mesmo uma revisão

> **Vocabulário (24/09):** na tela, o item de conteúdo em andamento se chama **Continuar** (antes,
> *Retomar*); onde é preciso um substantivo, ele é o **card** (*Editar card*, *Data do
> card*). Neste documento e no código, **volta** e **retomada** continuam sendo o nome interno dele — o
> dado salvo é `retomada`, e não foi renomeado.

A aba deixou de se chamar *Revisões* quando passou a carregar duas naturezas — **voltas** (*Continuar*,
de conteúdo em andamento) e **revisões** (de conteúdo concluído). Os rótulos seguiram atrás. A regra
que vale hoje:

> **“Revisão” quando o item é mesmo uma revisão; “agenda” ou “item” quando o rótulo cobre o
> conjunto**, que mistura os dois.

Por isso *Revisões de hoje* virou **Agenda de hoje**, *Revisão por assunto* virou **Agenda por
assunto**, *Revisões atrasadas* virou **Atrasados** (lembrete de conteúdo aberto também atrasa), e os
blocos de número passaram a contar **itens**, não revisões — na aba *Hoje*, no resumo das *Sessões*,
no *Progresso* e no card do dia. Marcar o ✓ diz *“marcar como feito”*, e uma volta cumprida aparece
como *“continuado em 21/09”*, não *“revisada em”*.

O que **continua** dizendo revisão diz porque é verdade: a **escada** da repetição espaçada, o texto
de *Como o cronograma é montado?*, as metodologias em *Ajustes* — e o botão **+ Adicionar revisão**.

**Sobre esse botão:** ele foi revisto e **continua adequado**. O que ele cria é mesmo uma revisão —
avulsa, gravada como `manual` para o replanejamento automático não a reescrever, e numerada na
sequência do card. Voltas não se criam à mão: a agenda marca **uma de cada vez**, sozinha, enquanto o
conteúdo está em andamento. Chamar o botão de “adicionar item” seria menos preciso, não mais. A
pista embaixo dele diz isso: *uma revisão à mão, que eu fiz ou quero fazer*.

### Por que a visão por assunto é alfabética

Esta é a visão de **procurar** — *"cadê Crase?"* — e procurar só funciona quando a ordem é
previsível. A urgência já tem as telas dela: o card **Agenda de hoje**, o card **Revisões
atrasadas** e a visão **Por dia**, que é cronológica. Aqui o atraso não desaparece: continua na
etiqueta vermelha **tem atraso** do card, e o botão de expandir avisa quando sobrou algum escondido
atrás do corte de 4.

### Do card de hoje até o original no cronograma

O card **Agenda de hoje** é um resumo; o item de verdade mora no cronograma, mais abaixo.
**Clicar num item do card** leva até ele: a Agenda troca para a visão **Por assunto** (a única que
mostra o item de hoje junto com o resto da fila dele), **abre a lista se ela estiver encolhida**
atrás do *+ ver todos os N assuntos*, rola até a linha e a **acende por um instante**. Funciona pelo
teclado também (Tab até o item, Enter).

O topo é sempre o mesmo, porque é o que se faz agora: as **sub-abas**, **Agenda de hoje**, o botão
**+ Adicionar revisão** e, quando houver, o card **Atrasados**. Abaixo, a visão escolhida:

| Visão | Para quê | O que mostra |
|---|---|---|
| **Por dia** (padrão) | *"o que eu faço agora?"* | os próximos itens agrupados por dia — `SEG · 22/09 — amanhã · 2 itens` —, 12 por vez, com **+ ver todos**. Cada item traz *ver sessão*, **✎ card** (título e sessões ligadas) e **editar** — dá para mexer sem trocar de visão. Em *Concluídos*, o mesmo vira **Dias anteriores** |
| **Por assunto** | olhar um conteúdo inteiro | os blocos por conteúdo **em ordem alfabética**, com a fase, o botão de fechar o conteúdo, *+ revisão*, *editar card* e *anotações →* |
| **Mês** | a visão de longe | o mês inteiro, cada dia com a contagem e a cor do que há nele; clicar num dia abre a lista dali |

No **Mês**, a cor do dia diz o estado sem precisar abrir: **vermelho** se há atraso, **verde** se tudo
já foi feito, **verde-claro** se há o que fazer. O pontinho embaixo segue a mesma regra.

A visão escolhida — e o dia aberto no mês — **ficam lembrados** entre recarregamentos, junto com os
outros filtros.

## Conteúdo em andamento × conteúdo concluído

Conteúdo grande não acaba numa sentada, e a repetição espaçada só faz sentido **depois da primeira
passada completa** — antes disso, a "revisão" chega para um material que você ainda está vendo. Por
isso cada conteúdo tem uma **fase**:

**A fase é do conteúdo, não da sessão.** Fechar um conteúdo fecha **todas as sessões que falam
dele** — é o que se espera de "terminei a LAI", mesmo tendo estudado em cinco dias diferentes. Uma
sessão que cobre vários conteúdos fica aberta enquanto **algum** deles estiver aberto.

| Fase | O que a agenda faz | Como o item se chama |
|---|---|---|
| **Em andamento** (nasce assim) | marca **uma volta de cada vez**, curta, para você continuar de onde parou | **Continuar** |
| **Concluído** | a **escada** da repetição espaçada, contada do dia em que você fechou | **Revisão 1, 2, 3…** |

A agenda continua sendo o lembrete de sempre: quando ela chamar, **você decide** se revisa o que já
viu ou se continua de onde parou. A diferença é que, enquanto o conteúdo está aberto, o intervalo
**não cresce** — crescer é para material já fechado.

**Uma volta de cada vez.** Não adianta marcar cinco retornos de um assunto que você nem terminou de
ver; o que serve é saber quando voltar da próxima. Feita a volta, a seguinte nasce dali.

**Um conteúdo aberto nunca aparece duas vezes na agenda.** É a invariante da agenda, e vale mesmo
quando as sessões se embaralham:

| Sessões | Antes | Agora |
|---|---|---|
| `[LAI]` e `[LAI]` | 1 item | 1 item |
| `[LAI]` e `[LAI, Licitações]` | **2 itens** — LAI chamado duas vezes | 1 item |
| `[LAI, Licitações]` e `[Licitações, LAI]` | **2 itens** — os mesmos conteúdos em ordem diferente | 1 item |
| `[A, B]` e `[B, C]` | **2 itens** — B chamado duas vezes | 2 itens, nenhum conteúdo repetido |

Duas coisas mudaram para isso:

- **A chave da sessão ordena os conteúdos** antes de juntá-los. Sem isso, `[LAI, Licitações]` e
  `[Licitações, LAI]` eram "assuntos diferentes" e cada um abria a própria fila.
- **A conta passou a ser por conteúdo, não por sessão.** A agenda varre as sessões **da mais recente
  para a mais antiga** — a nova tem o contexto mais fresco — e a volta que nasce leva **só os
  conteúdos que ainda não tinham quem os chamasse de volta**. Por isso a volta guarda a própria
  lista de conteúdos, que pode ser menor que a da sessão dona.

Conta como "já tem quem chame" **qualquer item pendente** daquele conteúdo — uma volta, uma revisão
da escada ou uma que você marcou à mão. O que não pode acontecer é o assunto sair do radar; havendo
o que fazer com ele, nada mais é marcado.

**A tela de edição fala a língua da fase.** Abrir uma volta pelo *editar* dá **Editar card**, com
*Data do card*, *Conteúdos a continuar* e um aviso no topo lembrando que aquele card é
para continuar o conteúdo — ele ainda está em andamento, e a escada só começa quando for fechado. O nome
sugerido é **Continuar**, não *Revisão 1*, porque a volta não ocupa número na sequência. Abrir uma
revisão de conteúdo já concluído continua dizendo **revisão** em todos os rótulos. Apagar uma volta
avisa que outra é marcada no lugar — conteúdo aberto nunca fica sem agendamento.

**Conteúdo aberto nunca fica sem agendamento.** Um conteúdo em andamento sem nenhum item na agenda
some do radar: nada chama de volta e o estudo simplesmente para. Isso acontecia por caminhos que
ninguém percebe — a última volta excluída à mão, um backup antigo com tudo já feito, a fila esvaziada
num replanejamento. A plataforma agora **varre os conteúdos abertos e repõe a volta que falta**, com
a cadência de sempre contada de hoje. A varredura roda no arranque, na virada do dia, ao salvar uma
sessão, ao excluir uma revisão e em cada replanejamento; quando repõe alguma coisa no arranque, avisa.

Uma exceção, de propósito: sessão marcada **"sem revisão"** — você disse que cuida disso, e a
varredura não insiste. (O antigo plano **manual**, herança da versão anterior, prendia a sessão sem
agendamento nenhum e não tinha como ser desfeito; ele é convertido em automático na carga —
`db.planosManuaisMigrados` — e as revisões marcadas à mão ficam intactas.) Conteúdo **concluído**
tem a garantia dele: a escada (ver *A escada é do conteúdo*).

**Continuação.** Conteúdo grande leva várias sessões, e cada sessão é dona do próprio plano — sem
cuidado, duas sessões do mesmo conteúdo marcariam duas voltas idênticas no mesmo dia. Havendo uma
volta em aberto do mesmo conteúdo, ela **anda para a frente** e passa a pertencer à sessão nova, que
é a que tem o contexto mais recente. Conteúdos **diferentes** continuam com voltas próprias.

**De quanto em quanto tempo** (dias até a próxima volta). O padrão sai da **dificuldade** e do **tempo
de estudo previsto** — até quando você pretende estudar. Ele vale **com ou sem objetivo**: nos ajustes,
*Tempo de estudo previsto* recebe uma data (com atalhos **+1 mês, +3 meses, +6 meses, +1 ano**). Em
branco, vale a data da prova, se houver; depois, o *revisar até*; sem nenhum deles, não há prazo.
Preenchido, ele manda até sobre a prova (quem vai continuar estudando depois dela não precisa do ritmo
de reta final).

| Estudo previsto | Difícil | Médio | Fácil |
|---|---|---|---|
| até 30 dias | 1 | 1 | 2 |
| de 31 a 90 dias | 1 | 2 | 3 |
| mais de 90, ou sem prazo | 1 | 2 | 4 |

Nos **ajustes** (engrenagem no topo), *Dias até continuar um conteúdo em andamento* tem um campo
por dificuldade (de 1 a 30 dias). Em branco vale o padrão, que aparece apagado dentro do campo;
preenchido, vale o seu número, em qualquer prazo.

**Fechar o conteúdo** se faz em três lugares: no **card da agenda** (**✓ terminei este conteúdo**, com
aviso de quantas sessões serão afetadas), no **formulário da sessão** (que mostra a fase de cada
conteúdo e tem o atalho para fechar) e na aba **Disciplinas**, por conteúdo ou por
disciplina inteira. Ao fechar, a escada nasce **a partir daquele dia** — ou, se você já tinha revisões
marcadas para ele, **depois da última delas**; as voltas já feitas não somem, elas foram sessões de estudo com tempo e
questões registrados. Dá para **reabrir** também, e aí a fila volta a ser uma volta só.

### A agenda se resolve sozinha

Você não precisa marcar nada: **registrar uma sessão daquele conteúdo dá o lembrete vencido por
cumprido** e faz nascer o próximo, contado daquele dia. A caixa de marcar continua ali para quem
preferir esse caminho — ela é atalho, não obrigação.

Duas regras seguram o comportamento:

- **Só o que já venceu é consumido.** Estudar hoje não apaga uma revisão marcada para daqui a três
  semanas — ela ainda tem função. Vencido é o que estava marcado para hoje ou para trás.
- **Uma sessão fecha um lembrete**, o mais antigo. Estudar duas horas não quita a agenda do mês.

**Atraso vale para os dois.** Lembrete de conteúdo em andamento que passou da data é atrasado do
mesmo jeito que uma revisão: aquele dia era para ter sido usado. Os dois aparecem no card
**Atrasados**, com o botão de remarcar.

**Estudar de novo um conteúdo já fechado não abre outra escada.** A que existe é a que vale — a
sessão cumpre a revisão vencida, se houver, e **empurra as seguintes** a partir daquele dia. Antes,
cada sessão montava a própria fila: oito itens para o mesmo assunto, dois no mesmo dia.

**O lembrete é cumprido por conteúdo.** Vale a sessão que cobre todos os conteúdos do item — inclusive
revisão marcada à mão —, e a ordem em que os conteúdos foram escolhidos não importa (`LAI, LGPD` é o
mesmo que `LGPD, LAI`).

**Marcar uma volta como feita** abre a sessão já no tipo **Estudo** (e não *Revisão*), porque é o que
normalmente está acontecendo — você continuou o conteúdo. Trocar para *Estudo/Revisão* ou *Revisão*
continua a um clique.

**Conteúdo esquecido:** passados 14 dias aberto, o card mostra *"em andamento · há N dias"* e o botão
de fechar ganha destaque. Ninguém é bloqueado; é só um empurrão.

**O que aconteceu com o que já existia:** na primeira abertura, **todo conteúdo passou a "em
andamento"** e a fila automática de cada um foi reduzida à **volta mais próxima**. As revisões já
**feitas** e as criadas **à mão** ficaram intactas. A plataforma avisa uma vez, e a migração roda
uma vez só (`db.fasesMigradas`).

## Falta estudar — o mural da aba Hoje

No lugar do antigo card *Para lembrar*, a aba **Hoje** tem o mural **Falta estudar**. Ele é
**automático** (desde 24/09): todo conteúdo do cadastro que ainda **não tem sessão** aparece nele sozinho —
não há botão de adicionar nem ✕ para tirar. Conteúdo novo (aba **Disciplinas** ou formulário da sessão)
entra no fim da lista; registrada a primeira sessão dele, ele **sai do mural sozinho**.

- **Arraste pela alça ⠿** (ou use ↑ ↓ no teclado) para priorizar. A ordem
  fica gravada; o que nunca foi arrumado vai para o fim, na ordem em que foi cadastrado.
- **▶ estudar** abre a sessão já com a disciplina e o conteúdo (a dificuldade continua para você
  escolher). Registrada a primeira sessão, o conteúdo **sai do mural sozinho**.
- Com muitos conteúdos, aparecem os 8 primeiros e um **+ ver todos**.

## A sua própria rotina

Nos ajustes (engrenagem no topo), **Criar os agendamentos automaticamente (revisões e cards de continuar)** vem
marcado. Quem já tem uma rotina — montada por conta própria ou trazida de fora — desmarca, e a agenda
passa a ser **só o que você marca**: nada é criado, empurrado ou refeito pelo sistema (nem escada,
nem retomada, nem garantia). Ao desmarcar, os ajustes perguntam o que fazer com o que já está lá:

- **Manter** (padrão) — as revisões e os cards de continuar automáticos pendentes passam a ser seus (`manual`);
- **Apagar as automáticas pendentes** — fica só o que você marcou à mão.

O que já foi feito nunca sai. Religar a chave refaz a agenda automática, e as suas continuam onde
estão. Registrar uma sessão continua cumprindo o item vencido daquele conteúdo.

**Várias datas de uma vez.** No **+ Adicionar revisão**, a data virou uma lista: escolha uma data e
**+ adicionar esta data** (quantas quiser), ou gere a partir da data da caixa — **a cada N dias, K
vezes**, ou a **escada D+1, 3, 7, 16, 35**. Cada etiqueta vira um card com o mesmo conteúdo, nome e
detalhes; o ✕ tira uma data. Sem etiqueta nenhuma, a caixa sozinha cria um card, como sempre foi.
Trocar a disciplina nesse formulário atualiza a lista de conteúdos na hora (antes ela ficava vazia
até reabrir o formulário).

## Até quando o sistema agenda

Tudo o que é automático para num dia só: o **horizonte**.

1. **Revisar até** — o teto que você escolhe em *Ajustes*, **sem limite** (o teto de um ano saiu em
   23/09). A escada termina sozinha no último degrau, então nada cresce sem fim.
2. **180 dias** a partir de hoje, quando não há teto. O horizonte anda com o dia: o que não coube
   hoje nasce quando ele chegar.

**A prova não é teto** (decisão do Pedro, 23/09). As revisões seguem depois dela normalmente; só o
**dia** da prova é pulado. Parar é uma escolha: *Encerrei* na pergunta do pós-prova. A antiga
"compressão" do plano para caber até a véspera saiu junto.

## A escada é do conteúdo

Cada conteúdo **concluído** tem uma fila só de revisões: as que o sistema marca e **quantas você
quiser** marcar à mão. Três regras:

1. **Continuar.** A fila vai até o fim da escada da dificuldade dele. Havendo revisões pendentes —
   automáticas ou suas —, as próximas nascem **depois da última**, no degrau seguinte (a revisão à
   mão ocupa o degrau mais perto da data dela). Não havendo nenhuma, a escada nasce do último contato.
   É a **garantia de revisão**: conteúdo concluído nunca fica sem revisão (`garantirEscadas`, que roda
   junto com a garantia das voltas).
2. **Empurrar.** Todo **contato** com o conteúdo vira o novo ponto de partida: revisão feita (em dia,
   atrasada ou adiantada), revisão marcada à mão, sessão fora da agenda. Cada revisão seguinte mantém
   a **distância que tinha da anterior** (`passo`, gravado no item). Exemplo: revisões nos dias 15, 17
   e 22; no dia 20 você marca uma extra → a de 22 vai para **25** (+5), e as de depois andam junto.
   Nada anda para trás — revisar antes da hora não adianta o que vem —, e salvar de novo a mesma
   sessão não empurra outra vez.
3. **Remanejar leva as seguintes junto.** Dia cheio e uma revisão vai para o dia seguinte (pelo *remarcar* ou
   editando a data)? As revisões do mesmo conteúdo que vinham depois dela andam junto, cada uma mantendo a
   distância. Puxar uma revisão para mais cedo não mexe nas outras.
4. **A extra não pula degrau.** A revisão marcada à mão fica no degrau da anterior: revisar cedo não
   prova que o conteúdo fixou.

**Item de vários conteúdos se divide** quando só parte deles teve contato: revisar só Scrum empurra
Scrum, e XP fica onde estava. Itens que nascem juntos (mesma sessão, mesmo dia, mesmo degrau) viram
um card só.

### Revisões até a prova escolhidas por você

Num conteúdo **concluído**, com prova marcada à frente, dá para escolher as revisões até a prova.
A entrada é o atalho **Personalizar revisões até a prova**, na **Agenda**, logo abaixo de *Revisões:
só as 2 próximas / todas as agendadas*. Ele abre uma janela com um seletor de conteúdo (só os
concluídos), que já começa no conteúdo do filtro, se houver um. A janela tem dois modos:

- **Automáticas** — a escada de sempre.
- **Personalizar** — você diz quantas revisões quer até a prova (de 1 até os dias que
  sobram, no máximo 30) e o dia de cada uma. A plataforma só **sugere** datas espaçadas por igual,
  com a última na véspera; dá para trocar qualquer uma. Não aceita duas no mesmo dia, dia de prova
  nem data da prova em diante.

No modo *Personalizar*, até a prova **só as suas revisões aparecem** para aquele conteúdo: a escada
automática dele fica **pausada** (as automáticas pendentes saem, e nenhuma nasce antes da prova).
As datas escolhidas **não são empurradas** por contato nem por remanejar outra revisão — são suas.
A escolha é **por conteúdo**: os outros conteúdos da disciplina seguem no automático.

No **dia seguinte à prova**, o automático volta sozinho, do degrau em que a escada estava (as
revisões escolhidas não sobem degrau, para a escada voltar inteira). A data da prova fica guardada
no conteúdo (`revisoesProva`): marcar outra prova depois não estende a pausa. **Reabrir** o conteúdo
desfaz o modo, e voltar a *Automáticas* na janela também.

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
ela não for respondida, o agendamento **segue normalmente** — só *Encerrei* para. Quem encerrou pode
**religar** a qualquer momento em *Ajustes*.

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
| o detalhe ao lado do calendário | — |

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
tipo, ordenação e a **busca digitada**), os das **Anotações** (disciplina, conteúdo, *só as
da véspera*, *juntar os dias*), a visão das **Questões**, a **disciplina e o dia** escolhidos no Progresso,
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

1. Crie um projeto no [Supabase](https://supabase.com) (plano gratuito basta; região **São Paulo**).
2. **SQL Editor → New query**: cole o arquivo **`supabase/estrutura.sql`** inteiro e clique em **Run**. Ele cria a
   tabela `dados` (uma linha por conta), as regras de acesso (cada conta só lê e grava a própria linha; quem não
   entrou não toca em nada) e o **histórico de versões** (a versão anterior é guardada no máximo a cada 6 horas,
   por 30 dias — a rede de segurança para quando um aparelho com dados velhos grava por cima). Pode rodar de
   novo sem estragar nada. No fim do arquivo está a receita para recuperar uma versão antiga.
3. **Authentication → Emails → SMTP Settings**: ligue um **SMTP próprio** (Resend, Brevo, ou o Gmail com senha de
   app). Sem isso, o Supabase **só manda e-mail para os membros da equipe do projeto** — o código de entrada não
   chegaria para quem vai usar a plataforma — e ainda limita a poucos e-mails por hora.
4. **Authentication → Emails → Templates**: nos modelos **Confirm signup**, **Magic Link** *e* **Reset Password**,
   ponha `{{ .Token }}` no corpo (ex.: `Seu código: <b>{{ .Token }}</b>`). É esse código de 6 dígitos que a
   plataforma pede — sem link e sem redirecionamento. O *Confirm signup* vai no **primeiro acesso** de cada e-mail;
   o *Reset Password*, no **esqueci a senha**.
5. **Authentication → Sign In / Providers → Email**: deixe **ligado**. Tamanho do código: **6**. Tamanho mínimo da
   senha: **8** (o app também exige 8).
6. Entre na plataforma uma vez com cada e-mail que vai usar (isso cria a conta) — o ideal é cada pessoa no
   próprio aparelho. Se for no mesmo navegador, tudo bem: a plataforma sabe de que conta são os dados que estão
   nele e, ao entrar com outra, **pergunta** antes de trocar — nunca sobe os dados de uma conta para a outra
   (os da primeira continuam na nuvem, na conta dela). Depois, se quiser que **mais ninguém** crie conta no seu
   projeto, desligue **Allow new users to sign up** — quem já tem conta continua entrando normalmente.
7. **Project Settings → API Keys**: copie a *Project URL* e a chave pública (**publishable**, `sb_publishable_…`,
   ou a **anon** antiga) para o topo do `<script>`. **Nunca** a *secret* / *service_role*.

```js
const NUVEM = {
  url:   "https://seuprojeto.supabase.co",
  chave: "sb_publishable_..."   // pública por natureza, pode ficar no código
};
```

Enquanto essas duas linhas estiverem vazias, **nada muda**: o chip da nuvem nem aparece e nenhuma
chamada de rede é feita.

### Manter o projeto acordado

No plano gratuito o Supabase **pausa** o projeto depois de **7 dias sem uso** (férias, uma semana sem estudar).
Pausado, a plataforma mostra "Sem conexão" e continua gravando no navegador; para voltar, é entrar no painel do
Supabase e clicar em **Restore project**. Para não depender disso, o Mac chama o projeto uma vez por semana — uma chamada leve
que só pergunta a hora ao banco (`ping()`) e não toca em dado nenhum.

1. **No Supabase** (uma vez): **SQL Editor → New query**, cole **`supabase/alteracao-02-manter-acordado.sql`** e
   clique em **Run**. (Projeto novo não precisa: o `estrutura.sql` já traz a função.)
2. **No Mac** (uma vez), no Terminal, dentro da pasta do projeto:

   ```sh
   cp supabase/manter-acordado.plist ~/Library/LaunchAgents/com.revisor.supabase-acordado.plist
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.revisor.supabase-acordado.plist
   ```

   Ele roda **toda segunda às 12h** (escolha do Pedro, 26/09), e também ao ligar o Mac e ao entrar na conta; se o
   Mac estiver dormindo na hora, roda quando acordar. **Margem curta:** de uma segunda à outra são exatamente 7
   dias, o mesmo prazo da pausa — se numa segunda a chamada só sair à noite (Mac fechado até lá), passa do prazo
   por algumas horas. O uso normal da plataforma também conta como atividade, e ajuda a cobrir essa folga.
3. **Conferir:** `cat ~/Library/Logs/supabase-acordado.log` — uma linha por chamada, com data, hora e o código:
   **200** ok · **404** falta o passo 1 · **401** chave errada · **000** sem internet naquela hora.

Para desligar: `launchctl bootout gui/$(id -u)/com.revisor.supabase-acordado` e apagar o arquivo de
`~/Library/LaunchAgents/`. Mudou a chave publishable? Troque também no `.plist`, copie de novo e rode o
`bootout` e o `bootstrap`.

### Como fica para quem usa

**A plataforma exige a conta** (desde 25/09): sem ninguém logado, só aparece a **tela de acesso**.

- **Entrar:** e-mail e senha.
- **Primeiro acesso:** e-mail → chega um código de 6 dígitos → a pessoa **cria a senha** → entra.
- **Esqueci minha senha:** e-mail → código → **senha nova** → entra.
- Conta criada antes das senhas: ao abrir, a plataforma pede para **criar uma senha**, uma vez.
- O "primeiro acesso" num e-mail que **já tem senha** é recusado — entrar só com o código não vale; para isso
  existe o "esqueci a senha".
- Depois de entrar, a sessão fica no aparelho: **sem internet a plataforma continua abrindo**. Só volta para a
  tela de acesso quem sai da conta, ou se o Supabase recusar a sessão.

O chip no cabeçalho mostra a conta: **☁ nome**.
Daí em diante cada alteração sobe sozinha (um segundo depois da última mexida) e também ao fechar a
aba. Abrindo em outro aparelho com o mesmo e-mail, os dados vêm junto.

- **Sem conexão** o chip avisa e a plataforma continua inteira, gravando no navegador; o que ficou
  pendente sobe quando a conexão volta.
- **Quem está mais novo ganha**: ao abrir, a plataforma compara a data da nuvem com a local e traz o
  mais recente. O painel tem **Sincronizar agora** e **Trazer da nuvem** para resolver na mão.
- A regra de segurança (RLS) garante que **cada conta só enxerga a própria linha**.
- Se uma gravação estragar os dados, o **histórico** do Supabase guarda as versões dos últimos 30 dias
  (recuperação pelo SQL Editor — receita no fim de `supabase/estrutura.sql`).
- **O perfil** (o círculo com a inicial do nome, no canto do topo) reúne a conta: a situação da sincronização,
  **Editar perfil** (nome e senha), **Baixar cópia dos dados**, **Restaurar uma cópia** e **Sair da conta**. Quem usa pode sair
  com os dados quando quiser (Baixar cópia dos dados). Configurações, ajuda e modo noturno ficam ao lado, soltos.

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
**Baixar cópia dos dados** exporta o `.json`, **Restaurar uma cópia** importa de volta (os dois no menu do perfil). O painel explica isso quando não há suporte.

## Os testes

As suítes vivem em **`testes/`**, dentro do repositório — e é de propósito: elas moravam numa pasta
temporária e o sistema apagou três delas numa limpeza do `/tmp`. Agora o git protege.

```
cd testes && ./rodar.sh          # todas
cd testes && ./rodar.sh fases    # só as que casam com "fases"
```

São **64 suítes** que abrem o `index.html` **de verdade** num DOM (jsdom), clicam nos botões e
conferem o resultado — nada de testar funções isoladas. Cada uma imprime `ok` por asserção e sai com
código diferente de zero se alguma falhar. O `rodar.sh` instala o jsdom na primeira execução.

**Uma lição registrada aqui:** as suítes calculavam "hoje" com `toISOString()`, que devolve a data em
**UTC**, enquanto o app usa data **local**. Depois das 21h em UTC−3 as duas divergiam e **34 suítes
quebravam sozinhas**, sem nenhuma mudança no código. Todas passaram a calcular a data local, do mesmo
jeito que o `D.iso` do app.

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
- **Os filtros de Sessões e de Anotações** são um painel com os campos numa **grade** que se
  redistribui sozinha (nada de campos de larguras aleatórias ao quebrar linha), rótulos em caixa alta
  miúda, a **busca com lupa ocupando a linha inteira**, e uma barra de ações embaixo, separada por um
  fio: ali ficam o **★ só as da véspera** (que agora diz se está ligado) e o **limpar filtros**, que
  só aparece quando há filtro ativo — junto com a etiqueta *filtro ativo*, para você não estranhar uma
  lista curta. Saiu o rótulo em branco (`&nbsp;`) que era usado para alinhar o botão à altura dos
  campos.
- **Filtros** viraram um painel próprio, separado do conteúdo; títulos de card e do modal ganharam uma
  marca vertical verde.
- **"Próximos 7 dias" abre com 3 revisões**, e o botão **+ ver todas as N** mostra o resto — a
  amostra é menor que a da aba Agenda porque aqui o card divide espaço com o resto do dia.
- **Em "Próximos 7 dias", as revisões são agrupadas por dia**: cada dia tem um rótulo próprio
  (`QUI · 18/09 — amanhã · 2 revisões`) e uma linha separando do dia seguinte, em vez de uma fila
  corrida de cards iguais. Como o dia já está no rótulo, o card não repete a data.
- **Cada card de revisão tem relevo**: borda esquerda visível e uma sombra leve; os de **hoje** e os
  **atrasados** ganham sombra colorida (verde e vermelha) e sobem da lista; os já feitos ficam rentes.
- **Só 4 assuntos abertos de cada vez**, com **+ ver todos os N assuntos** no rodapé do card. Como a
  ordem é **alfabética**, o corte é cego à urgência — então o botão diz quantos assuntos **com
  atraso** ficaram escondidos, e ganha destaque quando há algum.
- **Na visão por assunto, cada conteúdo é um bloco fechado** — painel com fundo próprio, borda e uma barra
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


### Revisão de UX (26/09/2026)

Uma análise de telas em celular, tablet e computador (relatório publicado à parte) levou a estas mudanças:

- **O ✓ de um item da agenda** abre o registro **por cima da aba** em que você está (antes ia para Sessões) e sem a
  faixa "Sessão cronometrada: 0min" que aparecia sem cronômetro. O ✓ de um item **de outro dia** agora salva: a
  revisão tocada entra na lista (adiantar é contato como outro qualquer).
- **Cronômetro já no conteúdo**: a lista "O tempo vai para" ganhou o grupo **Estudar hoje** (o que a agenda pede
  hoje e o Falta estudar); o **▶ estudar** do mural pergunta *Cronometrar agora* ou *Registrar sessão*.
- **Confirmações do próprio app** no lugar do `confirm()`/`alert()` do navegador, com o verbo no botão
  ("Excluir", "Descartar") e o destrutivo em vermelho.
- **Disciplinas**: cada linha tem só *✎ editar* e *✓ concluir*; o **Excluir** mora na janela de editar, no canto.
  **+ Novo conteúdo** funciona com o filtro em "Todas" — a janela pergunta a disciplina.
- **Lançar questões** escolhe o **conteúdo** (liga à sessão mais recente dele), não uma sessão numa lista longa.
- Nomes para quem não é técnico: **Baixar cópia dos dados**, **Restaurar uma cópia**, **Questões fora das sessões**.
- Contagens: o rótulo do dia conta o dia inteiro; o card Agenda do Progresso fala de um escopo só; a ordem das
  Sessões não conta como filtro; vermelho só para atraso.
- Toque e leitura: áreas de toque maiores (o ✓ tinha 19 px), cinza secundário com contraste ≥ 4,5:1, cronômetro e
  Excluir legíveis no tema escuro, foco do teclado preso na janela aberta, nomes para leitor de tela no ✓ e na ★.
- Frases explicativas que sobravam na tela foram para a Ajuda. Suíte `testes/revisaoux.js`.
