/* As duas sub-abas da Agenda (A fazer / Concluídos), o salto do card de hoje
   para o original no cronograma, e o filtro por disciplina da aba Disciplinas. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,ass)=>({id,data:dia(-8),disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,
  questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",fase:"concluido",criadoEm:Number(id.slice(1))});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
function base(revisoes){
  /* revisarAte curto: a escada é completada na carga; a suíte é sobre as sub-abas. */
  return {versao:1,tema:"claro",dataProva:dia(60),revisarAte:dia(3),metaDiariaMin:120,
   disciplinas:["Legislação","Português","Matemática"],grupos:[],lancamentos:[],
   conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:dia(-8)},
              {disciplina:"Português",nome:"Crase",fase:"andamento"},
              {disciplina:"Matemática",nome:"Conjuntos",fase:"andamento"}],
   conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
   registros:[sess("r1","Legislação","LAI"),sess("r2","Português","Crase"),sess("r3","Matemática","Conjuntos")],
   revisoes,erros:[],cronometro:null};
}
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba:"revisoes",gravadoEm:hoje},tela||{})));
     w.confirm=()=>true; }});
  return dom.window;
}
const cardDe=(doc,t)=>[...doc.querySelectorAll("#view .card")]
  .find(c=>c.querySelector("h2")&&new RegExp(t).test(c.querySelector("h2").textContent));
const lim=s=>s.replace(/\s+/g," ").trim();

(async()=>{try{
  /* v1 feita HOJE (fica em "A fazer"), v2 feita ONTEM (vai para "Concluídos"),
     v3 aberta atrasada, v4 aberta no futuro. */
  const seed=base([
    rev("v1","r1",hoje,{feita:true,feitaEm:hoje}),
    rev("v2","r2",dia(-2),{feita:true,feitaEm:dia(-1)}),
    rev("v3","r3",dia(-1)),
    rev("v4","r2",dia(3))]);
  let w=abrir(seed); await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);

  /* ---- 1. as sub-abas existem e a default é "A fazer" ---- */
  const subs=[...doc.querySelectorAll('[data-acao="fase-agenda"]')];
  ok("a Agenda tem duas sub-abas", subs.length===2, subs.map(b=>lim(b.textContent)));
  ok("a default é 'A fazer'", subs[0].getAttribute("aria-selected")==="true" &&
     subs[1].getAttribute("aria-selected")==="false", subs.map(b=>b.getAttribute("aria-selected")));
  ok("e elas se contam: 3 a fazer (inclui a concluída hoje), 1 concluída antes",
     /3/.test(subs[0].querySelector(".pin").textContent) && subs[1].querySelector(".pin").textContent==="1",
     subs.map(b=>lim(b.textContent)));

  /* ---- 2. a regra do D+1: a concluída HOJE fica com as de hoje ---- */
  const hojeCard=cardDe(doc,"Agenda de hoje");
  ok("o card de hoje existe na sub-aba padrão", !!hojeCard);
  ok("a concluída hoje continua ali", /Concluída hoje/.test(hojeCard.textContent), lim(hojeCard.textContent));

  /* ---- 3. "A fazer" mostra os próximos dias, e não o que passou ---- */
  const prox=cardDe(doc,"Próximos dias");
  ok("'A fazer' traz os próximos dias", !!prox && /Crase/.test(prox.textContent),
     prox && lim(prox.textContent).slice(0,120));
  ok("e o card de atrasadas continua lá", !!$("#revisoes-atrasadas"));

  /* ---- 3b. e dá para editar dali mesmo, sem trocar de visão ---- */
  const itemProx=prox.querySelector(".item.rev-linha");
  ok("cada item da visão Por dia traz o editor da revisão",
     !!itemProx.querySelector('[data-acao="editar-revisao"]'), lim(itemProx.textContent));
  itemProx.querySelector('[data-acao="editar-revisao"]')
    .dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  ok("clicar em 'editar' abre o formulário da revisão",
     !$("#overlay").hidden && /Editar revis/i.test($("#modalTitulo").textContent),
     $("#modalTitulo") && $("#modalTitulo").textContent);
  $('[data-acao="fechar-modal"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);

  /* ---- 4. trocar para "Concluídos" ---- */
  // o DOM foi redesenhado pelos passos acima: as sub-abas precisam ser reconsultadas
  doc.querySelector('[data-acao="fase-agenda"][data-fase="concluidos"]')
     .dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const anteriores=cardDe(doc,"Dias anteriores");
  ok("'Concluídos' troca a lista por 'Dias anteriores'", !!anteriores,
     [...doc.querySelectorAll("#view .card h2")].map(h=>lim(h.textContent)));
  ok("com a revisão feita ontem", /Crase/.test(anteriores.textContent) && /ontem/.test(anteriores.textContent),
     lim(anteriores.textContent).slice(0,160));
  ok("a concluída HOJE não aparece aqui — só a partir de amanhã",
     !/LAI/.test(anteriores.textContent), lim(anteriores.textContent).slice(0,160));
  ok("o card de hoje fica: ele não obedece aos filtros", !!cardDe(doc,"Agenda de hoje"),
     [...doc.querySelectorAll("#view .card h2")].map(h=>lim(h.textContent)));
  ok("o card de atrasadas também sai (atrasado é coisa a fazer)", !$("#revisoes-atrasadas"));

  /* ---- 5. a escolha é lembrada entre recargas ---- */
  ok("a sub-aba escolhida é guardada",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).faseAgenda==="concluidos",
     w.localStorage.getItem("plataforma-estudos:tela"));

  /* ---- 6. o salto do card de hoje para o original ---- */
  w=abrir(seed,{visaoAgenda:"dia",verTodosAssuntos:false}); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  const c=cardDe(doc,"Agenda de hoje");
  const salto=c.querySelector('[data-acao="ir-para-card"]');
  ok("o item do card de hoje leva ao cronograma", !!salto, lim(c.textContent).slice(0,120));
  ok("e diz isso para quem lê", /ver no cronograma/.test(c.textContent));
  salto.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  ok("o salto troca a visão para 'Por assunto'",
     $('[data-acao="visao-agenda"][data-visao="assunto"]').getAttribute("aria-selected")==="true",
     [...doc.querySelectorAll('[data-acao="visao-agenda"]')].map(b=>b.getAttribute("aria-selected")));
  const alvo=doc.getElementById("rev-"+salto.dataset.id);
  ok("e o item original está na tela, com âncora própria", !!alvo, salto.dataset.id);
  ok("a lista foi maximizada para caber o original",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).verTodosAssuntos===true,
     w.localStorage.getItem("plataforma-estudos:tela"));

  /* ---- 7. o filtro da aba Disciplinas ---- */
  w=abrir(seed,{aba:"conteudos"}); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  const botoes=[...doc.querySelectorAll('[data-acao="filtrar-conteudos"]')];
  ok("a aba Disciplinas lista as disciplinas para filtrar", botoes.length===4,
     botoes.map(b=>lim(b.textContent)));
  ok("abre em 'Todas'", botoes[0].getAttribute("aria-selected")==="true");
  ok("e mostra as três disciplinas",
     [...doc.querySelectorAll("#view .grupo-rev .cab strong")].length===3,
     [...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent));
  const alvoDisc=botoes.find(b=>b.dataset.disc==="Português");
  alvoDisc.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const grupos=[...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent);
  ok("escolher uma deixa só ela na lista", grupos.join()==="Português", grupos);
  ok("mas o filtro continua listando todas, para dar o caminho de volta",
     [...doc.querySelectorAll('[data-acao="filtrar-conteudos"]')].some(b=>b.dataset.disc==="Legislação"));
  ok("e o resumo do topo fala do filtrado (1 disciplina)",
     /1 disciplina/.test($("#view").textContent), lim($("#view").textContent).slice(0,220));
  const limpar=[...doc.querySelectorAll('[data-acao="filtrar-conteudos"]')]
    .find(b=>/limpar/.test(b.textContent));
  ok("há um jeito de limpar o filtro", !!limpar);
  limpar.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  ok("limpar devolve as três", [...doc.querySelectorAll("#view .grupo-rev .cab strong")].length===3,
     [...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nsub-abas da agenda, salto e filtro de disciplinas ok");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
