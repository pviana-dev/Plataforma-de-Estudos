# Prompt para o Claude Code — Plataforma de Organização de Estudos

> Cole o conteúdo abaixo (a partir de "=== INÍCIO DO PROMPT ===") direto na CLI do Claude Code,
> ou salve este arquivo na pasta do projeto e diga:
> "Leia o arquivo prompt-plataforma-estudos.md e execute o que está descrito nele."

---

=== INÍCIO DO PROMPT ===

Crie uma plataforma web para organização de estudos. Quero uma aplicação **single-page em um único arquivo `index.html`** (HTML + CSS + JavaScript embutidos, sem backend e sem dependências externas obrigatórias), que funcione abrindo o arquivo direto no navegador. Toda a persistência deve ser feita com **`localStorage`**, e a interface deve estar **em português (pt-BR)**.

## Contexto importante (leia primeiro)

- **Já existe um protótipo** de parte desse sistema na pasta do projeto (principalmente a parte de análise de questões/erros descrita na seção 7). **Antes de começar, localize e leia os arquivos existentes** (procure por arquivos `.html`, `.js`, `.css`, `.json` ou uma pasta de protótipo). Se o que já existe for aproveitável, **reutilize e evolua o código, o layout e as ideias do protótipo** em vez de recriar do zero. Me diga o que encontrou e o que decidiu aproveitar antes de reescrever.
- **Estou estudando para um concurso e a prova é dia 11/10 (11 de outubro).** Hoje é 15/09. Portanto **todas as datas de revisão precisam cair até no máximo 10/10** — não faz sentido agendar revisão depois da prova. A data da prova deve ser uma constante configurável no topo do código (`DATA_DA_PROVA = "2026-10-11"`), e toda a lógica de agendamento deve respeitá-la (detalhes na seção 2).

## Objetivo

Uma ferramenta pessoal para eu registrar o que estudei, controlar as revisões pelo método de repetição espaçada, **analisar minhas questões e erros** e acompanhar meu desempenho — tudo com foco em chegar bem preparado até a prova de 11/10. Priorize metodologias de estudo cientificamente validadas (descritas mais abaixo).

## Funcionalidades obrigatórias

### 1. Registro de sessão de estudo
Um formulário para adicionar um novo registro de estudo com os campos:
- **Data do estudo** (seletor de data; padrão = hoje).
- **Disciplina/Matéria** (texto com autocomplete das disciplinas já usadas).
- **Assunto/Tópico** (texto livre).
- **Tempo estudado** (em minutos, opcional).
- **Quantidade de questões feitas** sobre o assunto (número).
- **Quantidade de acertos** (número; calcular e exibir o % de acerto).
- **Nível de confiança/domínio** no assunto (escala de 1 a 5) — usado para ajustar os intervalos de revisão.
- **Descrição** (campo de texto livre, opcional).

### 2. Sistema de revisão intensiva (reta final até a prova)
Como faltam poucas semanas para a prova (hoje 15/09, prova 11/10, ~26 dias), **não use o esquema genérico D+1/D+7/D+30** — ele não cabe nesse prazo. Em vez disso, monte um **cronograma de revisão intensiva** desenhado para caber inteiramente até **10/10**:

- Ao registrar um estudo, o sistema deve gerar automaticamente um **plano de revisões distribuído entre a data do estudo e 10/10**, buscando **2 a 3 revisões por assunto**, espaçadas o máximo possível dentro do tempo restante (repetição espaçada "comprimida"). Exemplos:
  - Muito tempo até a prova → 3 revisões bem distribuídas (ex.: ~D+2, ~D+7, ~D+14, sem passar de 10/10).
  - Pouco tempo → 2 revisões próximas (ex.: ~D+1 e ~D+4).
  - Faltando poucos dias → 1 revisão logo em seguida.
- **Trava obrigatória:** nenhuma revisão pode ser agendada para a data da prova ou depois. Sempre `data_revisao <= 10/10`.
- **Priorização por desempenho (o mais importante):** assuntos com **pior taxa de acerto** ou mais **"erros bobos"** (ver seção 7) devem receber **mais revisões e mais cedo**; assuntos já dominados recebem menos. Use o nível de confiança (1–5) e a taxa de acerto para decidir:
  - Domínio baixo (1–2) ou taxa de acerto baixa → 3 revisões, começando cedo.
  - Domínio médio (3) → 2–3 revisões.
  - Domínio alto (4–5) e boa taxa → 1–2 revisões, mais espaçadas.
- Deixe os parâmetros (nº de revisões por faixa de domínio, espaçamento mínimo entre revisões, `DATA_DA_PROVA`) **configuráveis num objeto no topo do código**, comentados.
- Cada revisão agendada pode ser marcada como **feita** ou **pendente/atrasada**; ao marcar como feita eu registro quantas questões fiz e o novo nível de confiança, e o sistema pode **reagendar/recalcular** as revisões seguintes conforme meu desempenho (sempre respeitando o limite de 10/10).
- Metodologia por trás disso: repetição espaçada e curva do esquecimento adaptadas a prazo curto, com priorização estilo Sistema Leitner (erro/insegurança → revisa antes e mais vezes).

### 2b. Aba "Rotina de Revisões" (confirmação por assunto e por dia)
- Uma **aba/seção dedicada** onde eu vejo, **organizado por assunto**, o cronograma de revisões que o sistema recomendou.
- Para cada assunto, mostrar cada dia recomendado (D+1, D+7, D+30 já ajustados à data da prova) com uma **caixa de seleção (checkbox)** individual para eu **confirmar que revisei naquele dia**.
- Sinalização visual clara: revisão **feita** (verde/checada), **pendente para hoje** (destaque), **atrasada** (vermelho) e **futura** (neutra).
- Um resumo no topo da aba: quantas revisões faltam até a prova, quantas estão atrasadas e quantos dias restam para 11/10 (contagem regressiva).

### 3. Painel "Revisões de hoje / atrasadas"
- Uma visão em destaque na tela inicial mostrando: revisões **para hoje**, **atrasadas** (em vermelho) e **próximas** (próximos 7 dias).
- Botão rápido para marcar revisão como concluída direto dessa lista.

### 4. Dashboard / estatísticas
Uma seção com indicadores e visualizações simples (pode usar `<canvas>` puro ou SVG, sem bibliotecas pesadas; se usar biblioteca de gráfico, que seja via CDN e com degradação elegante caso offline):
- **Horas estudadas por dia** — um marcador/indicador do total de horas de hoje e uma **meta diária configurável** (ex.: 3h/dia), mostrando o quanto já cumpri da meta no dia. Além do acumulado por semana e total geral.
- **Gráfico de calor (heatmap tipo calendário, estilo GitHub)** mostrando o **histórico de horas estudadas por dia**: cada quadradinho é um dia, a intensidade da cor representa quantas horas estudei naquele dia. Deve cobrir pelo menos o período do início dos estudos até 11/10, com tooltip ao passar o mouse mostrando a data e as horas. Implemente em SVG ou `<canvas>` puro (sem depender de biblioteca externa).
- Total de questões feitas e **% de acerto geral** e por disciplina.
- Distribuição de estudo por disciplina.
- Sequência de dias estudados (streak) para incentivar consistência.
- Evolução do % de acerto ao longo do tempo.
- Quantidade de revisões concluídas x pendentes.

### 5. Lista/histórico de registros
- Tabela com todos os registros, com **filtros** por disciplina, período e status de revisão, e **ordenação**.
- Ações de **editar** e **excluir** cada registro (com confirmação antes de excluir).

### 6. Import/Export de dados
- Botão para **exportar** todos os dados em JSON (backup).
- Botão para **importar** JSON (restaurar backup), com validação.
- Isso é importante porque `localStorage` pode ser perdido ao limpar o navegador.

### 7. Análise de questões e erros por assunto (caderno de erros)
Dentro de cada assunto, quero um espaço para registrar e analisar as questões resolvidas em profundidade. **Já tenho um protótipo dessa parte — reutilize e evolua o que já existe (veja o "Contexto importante" no topo).** A funcionalidade deve permitir:
- Abrir um assunto e ver/adicionar **registros de erros**, cada um com:
  - Descrição/enunciado curto da questão (ou fonte: banca, prova, número).
  - **O que eu errei** (qual foi o erro).
  - **Qual ensinamento tirei do erro** (a lição/correção para não repetir).
  - **Classificação do erro**: pelo menos "erro de conteúdo/conhecimento", "erro de interpretação", "erro bobo/desatenção" e "chute". Deixe as categorias configuráveis.
  - Marcar se a questão foi **refeita depois e acertada**.
- Um **contador e taxa de acerto por assunto** calculados a partir das questões resolvidas (total de questões, acertos, % de acerto), e destaque de quantos foram **"erros bobos"** — porque quero enxergar quanto do meu erro é desatenção e não falta de conteúdo.
- Uma visão de **"revisar antes da prova"**: lista dos erros/ensinamentos marcados como mais importantes, para eu bater o olho nos dias finais antes de 11/10.
- Filtro/busca dentro do caderno de erros por assunto e por categoria de erro.

Integre esta seção com o resto: a taxa de acerto por assunto daqui deve alimentar o dashboard (seção 4) e ajudar a sugerir prioridade de revisão (assuntos com mais erros ou mais "erros bobos" aparecem em destaque).

## Metodologias validadas que devem embasar o design

Use e cite (em comentários no código e/ou em um pequeno texto de ajuda na própria interface) as seguintes metodologias, aplicando-as de forma prática:

1. **Repetição espaçada (Spaced Repetition)** — base do agendamento D+1/D+7/D+30; combate a curva do esquecimento de Ebbinghaus.
2. **Curva do esquecimento de Ebbinghaus** — justifica por que revisar em intervalos crescentes.
3. **Recordação ativa (Active Recall)** — por isso o registro de **questões feitas** e acertos é central; inclua um lembrete/dica de que revisar deve ser feito resolvendo questões e não apenas relendo.
4. **Sistema Leitner** — o ajuste dos intervalos conforme o nível de domínio (acertou/dominou → espaça mais; errou/inseguro → revisa antes).
5. **Prática intercalada (Interleaving)** — no dashboard, sugerir alternar entre disciplinas em vez de blocos longos de um só assunto.
6. (Opcional) **Técnica Pomodoro** — um cronômetro simples de 25/5 min como recurso auxiliar na tela, se não complicar demais.

Não precisa transformar tudo isso em texto pesado na tela: aplique as ideias no comportamento do sistema e ofereça explicações curtas e opcionais (ex.: um ícone de "?" que abre uma dica).

## Requisitos técnicos e de qualidade

- **Um único arquivo `index.html`** autossuficiente. Se precisar de gráfico e optar por CDN, garanta que o restante funcione mesmo sem internet.
- **Persistência em `localStorage`** com uma camada de acesso a dados isolada (funções tipo `getRegistros`, `salvarRegistro`, etc.) para facilitar manutenção.
- **Design responsivo** (funciona bem no celular e no desktop), limpo e moderno, com **modo claro e escuro**.
- Código **organizado e comentado em português**, com um objeto de **configuração no topo** (intervalos de revisão, nomes, cores).
- Acessível: bom contraste, navegação por teclado nos formulários, labels associadas aos inputs.
- Tratar casos de erro: JSON inválido na importação, campos obrigatórios vazios, divisão por zero no % de acerto.
- Ao final, gere também um **`README.md`** curto explicando como usar, como fazer backup (export/import) e quais metodologias a ferramenta aplica.

## Como quero que você trabalhe

- **Antes de tudo, inspecione a pasta do projeto e leia o protótipo existente** (seção "Contexto importante"). Me diga o que encontrou e o que pretende aproveitar.
- Depois, apresente um **plano curto** (estrutura de dados, telas e a lógica de agendamento de revisões com a trava da data da prova) antes de escrever o código.
- Depois implemente tudo, reaproveitando o protótipo quando fizer sentido.
- No final, faça uma **auto-revisão**, testando mentalmente estes fluxos e confirmando que estão corretos:
  - Criar um estudo → gerar revisões → **nenhuma revisão passa de 10/10** → marcar revisão como feita na aba "Rotina de Revisões" → ver refletido no dashboard.
  - Registrar questões e erros num assunto → a taxa de acerto e a contagem de "erros bobos" batem → aparecem no dashboard e na visão "revisar antes da prova".
  - Verifique os cálculos de datas (D+1/D+7/D+30 e a compressão perto da prova) e de porcentagem (sem divisão por zero).

=== FIM DO PROMPT ===
