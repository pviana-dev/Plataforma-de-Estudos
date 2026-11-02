# Plataforma de Estudos

**Acesse:** https://plataforma-de-estudos.pages.dev

Um organizador de estudos feito para ajudar estudantes a **controlar e acompanhar o tempo de estudo**,
planejar as revisões e ver a própria evolução: tudo num só lugar, no computador ou no celular.

## Para quem é

Para quem estuda por conta própria e quer saber **o que estudou, quanto estudou e o que precisa
revisar**, sem montar planilhas. Na primeira vez, você escolhe um objetivo:

- **Estudo contínuo**: revisões em intervalos crescentes, sem data de prova.
- **Concurso**: uma prova; o cronograma se ajusta até a véspera.
- **Vestibular / ENEM**: um ou mais dias de prova, cada um com nome e data.

## O que dá para fazer

- **Cronometrar o estudo.** O cronômetro fica no topo da tela inicial, e o tempo medido entra na
  sessão de estudo, junto com a disciplina, os assuntos e a dificuldade do conteúdo.
- **Organizar disciplinas e conteúdos.** Cadastre o que você estuda e marque cada conteúdo como
  *em andamento* ou *concluído*.
- **Revisar na hora certa.** Ao concluir um conteúdo, a plataforma agenda as revisões sozinha, com
  intervalos que crescem conforme a dificuldade. Se preferir, você monta a sua própria rotina ou
  desliga o agendamento automático.
- **Ver a agenda do dia.** O que está para hoje, o que atrasou e o que vem nos próximos dias, por dia,
  por assunto ou no calendário do mês.
- **Registrar questões.** Quantas fez e quantas acertou, com a taxa de acerto por disciplina e por
  conteúdo e um gráfico dia a dia.
- **Fazer anotações** por disciplina ou por conteúdo, com formatação simples e cores.
- **Acompanhar o progresso.** Meta diária, sequência de dias, horas por dia num calendário, tempo por
  disciplina e situação das revisões.

## Como começar

1. Abra **https://plataforma-de-estudos.pages.dev**.
2. Clique em **Primeiro acesso**, informe seu e-mail e digite o código de 6 dígitos que chegar.
3. Crie sua senha e escolha seu objetivo de estudo.
4. Cadastre suas disciplinas e comece o cronômetro.

O botão **?**, no topo da tela, abre um tutorial completo com todas as funções.

### No celular

O site pode ser instalado como um aplicativo:

- **iPhone (Safari):** botão de compartilhar → **Adicionar à Tela de Início**.
- **Android (Chrome):** menu ⋮ → **Instalar app** (ou **Adicionar à tela inicial**).

Ele abre em janela própria, com o ícone "Estudos", e funciona mesmo sem internet. Quando a conexão
volta, sincroniza.

## Seus dados

- Cada conta só vê os próprios dados. A proteção é feita no banco de dados, não apenas na tela.
- Os dados ficam salvos na nuvem e sincronizam entre computador e celular.
- Pelo menu do perfil, dá para **baixar um backup** com tudo o que você registrou e **enviá-lo de volta**
  quando quiser.

## Métodos de estudo por trás

- **Repetição espaçada:** revisões em intervalos cada vez maiores.
- **Curva do esquecimento:** a primeira revisão vem cedo, quando se esquece mais rápido.
- **Recordação ativa:** a revisão pede questões feitas e acertos; só reler não conta.
- **Sistema Leitner:** conteúdo difícil recebe mais revisões, mais próximas umas das outras.
- **Prática intercalada:** alternar disciplinas em vez de blocos longos de uma só.

## Tecnologia

Uma página só (`index.html`), sem frameworks. A conta e a sincronização usam o
[Supabase](https://supabase.com) e o site fica hospedado no Cloudflare Pages. A estrutura do banco
está em `supabase/` e os testes automáticos, em `testes/`.
