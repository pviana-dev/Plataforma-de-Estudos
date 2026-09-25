# Levantamento: o app no celular, no tablet e no computador — 24/09/2026

Pedido do Pedro: "o sistema está preparado para multiplataformas?". Foi só **levantamento** — nada foi alterado.
**Ordem combinada:** primeiro preparar para o celular (este arquivo); depois o PWA, que depende de hospedar.

## Como foi medido

O app foi aberto no Chrome com **emulação de aparelho** (protocolo de depuração, `Emulation.setDeviceMetricsOverride`,
com toque e user agent de iPhone), com dados de exemplo, em três larguras: **celular 390px**, **tablet 820px** e
**computador 1280px**. As 7 abas e as telas sobrepostas foram fotografadas e medidas (largura da página,
elementos que passam da borda, posição das caixas). O código foi lido atrás do que depende de mouse/teclado.

> Atenção para quem repetir: o Chrome **headless puro** (`--window-size=390,…`) tem largura mínima de 500px — a
> foto sai "cortada à direita" e parece defeito, mas é artefato. Só a emulação dá a medida certa. E **nada de
> escrever o diagnóstico dentro da página**: um `<pre>` com linhas compridas alarga a página no celular (a tela
> "cresce" para caber) e produziu o falso item 1. Meça pelo protocolo e devolva o resultado para fora.

## Veredito

- **Computador: pronto.** Tudo bem distribuído.
- **Celular: funciona, mas não foi pensado para ele.** A página cabe na tela (nenhuma aba estoura a largura),
  porém há gestos que não existem no toque, a aba Disciplinas espremida e os dados não passam de um aparelho
  para outro. (As "duas telas quebradas" do primeiro levantamento eram falso alarme — ver item 1.)

### O que já funciona bem no celular
- Hoje, Agenda, Anotações, Questões e Progresso cabem na tela: cards em coluna, números dois por linha,
  calendário do Progresso ajustado (`@media (max-width:820px)`).
- Ajustes, Ajuda (com o "Ir para…" no lugar do sumário) e Nova revisão cabem na tela.
- Cronômetro guarda o instante de início: segue contando com o celular bloqueado; a virada do dia é conferida
  ao voltar à aba (`visibilitychange`).
- Exportar/importar backup funcionam.

## Problemas, por prioridade

| # | Problema | Onde | Tipo de correção |
|---|---|---|---|
| 1 | ~~Registrar/Editar sessão e Lançar questões abrem fora da tela~~ — **FALSO ALARME** (conferido em 24/09): quem alargava a página era a própria ferramenta de medição (um relatório em texto comprido, anexado à página). Medido sem ela, na versão anterior, as duas telas já cabiam (354px de 390). Ficou só uma precaução no CSS (a caixa e os campos podem encolher). | — | — |
| 2 | **Dados não passam entre aparelhos**: cada navegador tem os seus (localStorage). Usar no computador e no celular = duas bases separadas. O arquivo .json automático só existe no Chrome/Edge de computador. | arquitetura | o banco de dados (Supabase, próximo passo) |
| 3 | **Reordenar não funciona no toque**: anotações e mural "Falta estudar" usam arrastar do HTML (não existe no celular) e setas ↑↓ do teclado (o celular não tem). O comentário no código que diz que as setas "são o caminho que funciona no celular" está errado. | `ARRASTAVEIS`, `moverItem` | botões ↑ ↓ visíveis em telas de toque (`@media (hover:none)`) |
| 4 | **Aba Disciplinas esmagada**: cada conteúdo com uma palavra por linha e o "✎ renomear" por cima do nome. | `telaConteudos` (linha do conteúdo) | empilhar os botões embaixo do nome em tela estreita |
| 5 | **Aba Sessões é uma tabela que rola para o lado**: a coluna do conteúdo fica estreita; dificuldade, tipo e "▶ continuar" ficam escondidos à direita. | `telaHistorico` | no celular, a lista em cartões |
| 6 | **O iPhone dá zoom ao tocar num campo**: os campos têm 12,5–15px, e o Safari do iPhone amplia a página quando é menos de 16px. | CSS dos campos | `font-size:16px` nos campos em tela de toque |
| 7 | **Cabeçalho ocupa quase meia tela**: nome, contagem, datas, 5 botões e as 7 abas em 3 linhas — o conteúdo começa lá pelos 350px. | `header.top`, `nav.abas` | cabeçalho compacto + barra de abas fixa embaixo |
| 8 | Gráfico de questões com datas e números minúsculos (SVG de 720 de largura reduzido a ~290). | `graficoQuestoes` | menos rótulos / fonte maior no celular |
| 9 | Explicações em `title` (passar o mouse) não aparecem no toque; o "ver no cronograma ↓" da agenda só aparece com o mouse (`.leva-a`). | vários | deixar visível em `@media (hover:none)` |
| 10 | Tablet (~820px): a contagem regressiva fica por cima do nome "Plataforma de Estudos". | `header.top` entre ~780 e ~900px | ajustar o ponto de quebra do cabeçalho |

## Depois do celular: PWA (depende de hospedar)

Não há `manifest.json` nem service worker: não dá para "Adicionar à Tela de Início" com cara de app, abrir sem
internet ou em tela cheia. Service worker não roda em `file://` — precisa do app **hospedado em HTTPS**.
No mesmo pacote: o **ícone no Safari** (item 51 do ESTADO.md; tentar arquivo de imagem em vez de data URI) e as
margens do iPhone com entalhe (`env(safe-area-inset-*)`), que só importam no modo tela cheia do PWA.

## Ordem sugerida

1. **Primeiro:** 1, 4 e 6 — CSS, pequeno. **FEITO em 24/09** (item 55 do ESTADO.md): 1 era falso alarme; 4 e 6
   corrigidos; de brinde, o aviso do rodapé (toast), que no celular virava uma coluna estreita, usa a tela toda.
2. **Depois:** 3, 5 e 7 — adaptar ao toque (↑↓ visíveis, sessões em cartões, abas embaixo); 8, 9 e 10 junto.
   **FEITO em 24/09** (item 56 do ESTADO.md). Das explicações em `title` (9), só a pista da agenda foi tratada.
   As abas foram primeiro para o pé da tela; em 25/09 o Pedro as quis **no alto**, numa faixa presa ao topo.
3. **Com a hospedagem e o banco de dados:** 2, o PWA e o ícone no Safari.
