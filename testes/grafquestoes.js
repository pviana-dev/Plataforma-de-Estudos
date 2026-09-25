/* O gráfico de questões dia a dia, no lugar da tabela de Lançamentos.
   Forma: barra EMPILHADA (acertos + erros = total do dia). Acerto é PARTE do
   total; duas barras lado a lado pediriam ao olho que comparasse coisas de
   níveis diferentes. Cor: azul/laranja, os dois primeiros slots categóricos —
   verde/vermelho reprova em daltonismo (ΔE 4,1 em deuteranopia). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const regs=[]; let i=0;
[[0,50,46],[1,9,6],[3,41,31],[5,75,56],[20,20,12],[40,33,30]].forEach(([d,q,a])=>{
  regs.push({id:"r"+(++i),data:dia(-d),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
    minutos:60,questoes:q,acertos:a,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:i});
});
regs.push({id:"rp",data:dia(-1),disciplina:"Português",assuntos:["Crase"],assunto:"Crase",
  minutos:40,questoes:10,acertos:4,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:99});
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação","Português"],
 lancamentos:[{id:"l1",registroId:"r1",data:dia(-1),questoes:12,acertos:9,criadoEm:1}],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Português",nome:"Crase",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:regs,revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"questoes",qPeriodo:7,gravadoEm:hoje}));
   w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const titulos=()=>[...doc.querySelectorAll("#view .card > h2, #view .btn-add")]
  .map(e=>e.textContent.replace(/\s+/g," ").trim());

(async()=>{try{
  await espera(700);

  /* ---- 1. a tabela de Lançamentos saiu ---- */
  ok("a tabela de Lançamentos não existe mais",
     !titulos().some(t=>/^Lançamentos/.test(t)), titulos());
  ok("e nenhuma tabela sobrou com a coluna Origem",
     ![...doc.querySelectorAll("#view th")].some(t=>t.textContent==="Origem"),
     [...doc.querySelectorAll("#view th")].map(t=>t.textContent));

  /* ---- 2. a ordem pedida: métricas, botão, filtros, resto ---- */
  const blocos=[...doc.querySelectorAll("#view > *")];
  ok("os indicadores vêm primeiro", blocos[0].classList.contains("tiles"), blocos[0].className);
  ok("depois o botão de lançar", blocos[1].classList.contains("btn-add"),
     blocos[1].className + " / " + blocos[1].textContent.slice(0,30));
  ok("depois a linha de filtros", !!blocos[2].querySelector('[data-acao="filtrar-questoes"]'),
     blocos[2].textContent.replace(/\s+/g," ").slice(0,50));
  const t=titulos();
  ok("o gráfico vem em seguida", /^Questões dia a dia/.test(t[1]), t);
  ok("e o desempenho por disciplina foi para o fim",
     /^Desempenho por/.test(t[t.length-1]), t);

  /* ---- 2b. as disciplinas numa CAIXA, como nas outras abas (25/09), que deixa marcar várias ---- */
  const caixa=blocos[2].querySelector('.multi-caixa[data-acao="abrir-qdiscs"]');
  ok("as disciplinas se escolhem numa caixa, no quadro de filtros (sem a fileira de botões)",
     !!caixa && blocos[2].classList.contains("filtros") && !doc.querySelector(".chips-rolagem"), blocos[2].innerHTML.slice(0,120));
  ok("a caixa vem fechada e diz 'Todas as disciplinas'", /Todas as disciplinas/.test(caixa.textContent) &&
     caixa.getAttribute("aria-expanded")==="false");
  click(caixa); await espera(250);
  ok("tocar nela abre a lista de caixinhas de marcar",
     doc.querySelector(".multi-disc").classList.contains("aberto") && doc.querySelectorAll(".multi-op").length>=3);
  click(doc.querySelector(".grafico-q")); await espera(250);
  ok("e clicar fora fecha a lista", !doc.querySelector(".multi-disc").classList.contains("aberto"));

  /* ---- 3. o gráfico ---- */
  const svg=$(".grafico-q svg");
  ok("o gráfico é SVG no próprio arquivo", !!svg && svg.getAttribute("viewBox")==="0 0 720 210");
  ok("tem descrição para leitor de tela", /Questões resolvidas por dia/.test(svg.getAttribute("aria-label")),
     svg.getAttribute("aria-label"));
  ok("um alvo de hover por dia da janela (7)",
     doc.querySelectorAll(".grafico-q [data-dia]").length===7,
     doc.querySelectorAll(".grafico-q [data-dia]").length);
  ok("as barras usam os slots categóricos do app, não verde/vermelho",
     [...doc.querySelectorAll(".grafico-q path")].every(p=>/var\(--s[12]\)/.test(p.getAttribute("fill"))) &&
     !/var\(--bom\)|var\(--critico\)/.test($(".grafico-q").innerHTML),
     [...doc.querySelectorAll(".grafico-q path")].map(p=>p.getAttribute("fill")));
  ok("a base da barra é reta (só o topo arredonda)",
     [...doc.querySelectorAll(".grafico-q path")].every(p=>/ Z$/.test(p.getAttribute("d")) &&
       !/^<rect/.test(p.outerHTML)),
     [...doc.querySelectorAll(".grafico-q path")][0].getAttribute("d").slice(0,60));
  ok("a legenda nomeia as duas séries",
     /Acertos/.test($(".legenda-q").textContent) && /Erros/.test($(".legenda-q").textContent),
     $(".legenda-q").textContent.replace(/\s+/g," "));

  /* ---- 4. o hover mostra total e acertos ---- */
  const alvo=[...doc.querySelectorAll(".grafico-q [data-dia]")].find(x=>x.dataset.dia===hoje);
  alvo.dispatchEvent(new w.MouseEvent("mouseover",{bubbles:true})); await espera(150);
  const bolha=$(".dica-grafico");
  ok("passar o mouse abre a bolha", !bolha.hidden);
  ok("com a data do dia", /22\/|\d\d\/\d\d\/\d{4}/.test(bolha.textContent), bolha.textContent);
  ok("os acertos do dia", /Acertos: 46/.test(bolha.textContent.replace(/\s+/g," ")), bolha.textContent);
  ok("os erros", /Erros: 4/.test(bolha.textContent.replace(/\s+/g," ")), bolha.textContent);
  ok("e o total com a taxa", /Total: 50/.test(bolha.textContent.replace(/\s+/g," ")) &&
     /92%/.test(bolha.textContent), bolha.textContent.replace(/\s+/g," "));
  alvo.dispatchEvent(new w.MouseEvent("mouseout",{bubbles:true})); await espera(120);
  ok("e some ao sair", $(".dica-grafico").hidden);

  /* ---- 5. a janela de tempo ---- */
  ok("há seletor de período", doc.querySelectorAll('[data-acao="q-periodo"]').length===3);
  click([...doc.querySelectorAll('[data-acao="q-periodo"]')].find(b=>b.dataset.dias==="30"));
  await espera(400);
  ok("trocar para 30 dias muda a janela",
     doc.querySelectorAll(".grafico-q [data-dia]").length===30,
     doc.querySelectorAll(".grafico-q [data-dia]").length);
  ok("e o cabeçalho acompanha", /nos últimos 30 dias/.test($(".grafico-q").closest(".card").querySelector("h2").textContent));
  ok("a escolha é lembrada entre recargas",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).qPeriodo===30);

  /* ---- 6. as baterias avulsas continuam editáveis ---- */
  ok("as baterias avulsas ganharam lugar próprio",
     titulos().some(t=>/^Baterias avulsas/.test(t)), titulos());
  ok("com editar e excluir, que só existiam na tabela removida",
     !!doc.querySelector('[data-acao="editar-lancamento"]') &&
     !!doc.querySelector('[data-acao="excluir-lancamento"]'));
  click(doc.querySelector('[data-acao="editar-lancamento"]')); await espera(400);
  ok("e o editor abre", !!doc.querySelector("#formLancamento") || !$("#overlay").hidden);

  /* ---- 7. filtrar as questões por disciplina ---- */
  click(doc.querySelector('[data-acao="fechar-modal"]')); await espera(300);
  const filtros=[...doc.querySelectorAll('[data-acao="filtrar-questoes"]')];
  ok("a aba tem filtro por disciplina", filtros.length>=3, filtros.map(b=>b.textContent));
  // o chip é interruptor (liga/desliga), então aria-pressed, não aria-selected
  ok("e abre em 'Todas'", filtros[0].getAttribute("aria-pressed")==="true",
     filtros[0].outerHTML.slice(0,90));
  const totalAntes=$("#view .tiles .tile").textContent.replace(/\s+/g," ");
  click(filtros.find(b=>b.dataset.disc==="Português")); await espera(450);

  const tiles=()=>[...doc.querySelectorAll("#view .tiles .tile")].map(t=>t.textContent.replace(/\s+/g," "));
  ok("os indicadores passam a contar só a disciplina escolhida",
     /Questões feitas10/.test(tiles()[0]), {antes:totalAntes, depois:tiles()[0]});
  ok("a taxa acompanha (4 de 10 = 40%)", /40%/.test(tiles()[1]), tiles()[1]);
  ok("o gráfico também", /10 questões/.test($(".grafico-q").closest(".card").querySelector("h2").textContent),
     $(".grafico-q").closest(".card").querySelector("h2").textContent.replace(/\s+/g," "));
  const corpo=[...doc.querySelectorAll("#view table tbody tr td:first-child")].map(t=>t.textContent);
  ok("a tabela de desempenho mostra só ela", corpo.length===1 && /Português/.test(corpo[0]), corpo);
  ok("a bateria avulsa de outra disciplina sai da lista",
     !titulos().some(t=>/^Baterias avulsas/.test(t)), titulos());
  ok("mas o filtro continua listando todas, para dar o caminho de volta",
     [...doc.querySelectorAll('[data-acao="filtrar-questoes"]')].some(b=>b.dataset.disc==="Legislação"));
  ok("a escolha é lembrada entre recargas",
     (JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).qDiscs||[]).join()==="Português",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).qDiscs);
  const limpar=[...doc.querySelectorAll('[data-acao="filtrar-questoes"]')].find(b=>/limpar/.test(b.textContent));
  ok("há como limpar o filtro", !!limpar);
  ok("e o limpar fica fora da lista, sempre à mão", !limpar.closest(".multi-lista"), limpar.className);
  click(limpar); await espera(400);
  ok("limpar devolve tudo", /Questões feitas/.test(tiles()[0]) && !/Questões feitas10\b/.test(tiles()[0]),
     tiles()[0]);

  /* ---- 8. escolher VÁRIAS disciplinas soma as questões das duas ---- */
  const chip=d=>[...doc.querySelectorAll('[data-acao="filtrar-questoes"]')].find(b=>b.dataset.disc===d);
  click(chip("Português")); await espera(400);
  const soPt=tiles()[0];
  click(chip("Legislação")); await espera(450);
  const duas=tiles()[0];
  ok("as duas ficam marcadas ao mesmo tempo",
     chip("Português").getAttribute("aria-pressed")==="true" &&
     chip("Legislação").getAttribute("aria-pressed")==="true",
     [chip("Português").outerHTML.slice(0,70), chip("Legislação").outerHTML.slice(0,70)]);
  ok("'Todas' deixa de estar marcada", chip("").getAttribute("aria-pressed")==="false");
  // 228 de Legislação + 10 de Português + 12 da bateria avulsa = 250
  ok("o resultado é a SOMA das duas, não a última clicada",
     /Questões feitas250/.test(duas), {soPortugues:soPt, asDuas:duas});
  ok("a taxa é a das duas juntas (194 de 250 = 78%)", /78%/.test(tiles()[1]), tiles()[1]);
  // o gráfico olha 30 dias: fica de fora o registro de 40 dias atrás (33)
  ok("o gráfico soma as duas também, dentro da janela dele",
     /217 questões/.test($(".grafico-q").closest(".card").querySelector("h2").textContent),
     $(".grafico-q").closest(".card").querySelector("h2").textContent.replace(/\s+/g," "));
  const linhas2=[...doc.querySelectorAll("#view table tbody tr td:first-child")].map(t=>t.textContent);
  ok("a tabela mostra as duas disciplinas", linhas2.length===2, linhas2);
  ok("o filtro diz quantas estão escolhidas (na caixa e embaixo)",
     /2 disciplinas/.test(doc.querySelector(".multi-caixa").textContent) &&
     /2 de 2 disciplinas/.test(doc.querySelector(".filtros").textContent),
     doc.querySelector(".filtros").textContent.replace(/\s+/g," "));
  ok("as duas ficam guardadas",
     (JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).qDiscs||[]).sort().join()==="Legislação,Português",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).qDiscs);

  /* ---- 9. clicar de novo TIRA aquela disciplina da seleção ---- */
  click(chip("Legislação")); await espera(450);
  ok("clicar numa já marcada a tira da seleção",
     chip("Legislação").getAttribute("aria-pressed")==="false" &&
     chip("Português").getAttribute("aria-pressed")==="true");
  ok("e a conta volta a ser só da que sobrou", /Questões feitas10/.test(tiles()[0]), tiles()[0]);
  click(chip("Português")); await espera(450);
  ok("tirando a última, a aba volta a falar de todas",
     chip("").getAttribute("aria-pressed")==="true" && /Questões feitas250/.test(tiles()[0]),
     tiles()[0]);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ngráfico de questões dia a dia funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
