/* O MESMO FILTRO EM TODAS AS ABAS (pedido do Pedro, 25/09): caixa de Disciplina
   e caixa de Conteúdo, como nas Anotações. Aqui: Sessões, Questões (que mantém
   as várias disciplinas marcadas, em botões) e Progresso ganharam o Conteúdo;
   escolher um conteúdo escolhe a disciplina dele; trocar a disciplina solta o
   conteúdo que não é dela; renomear o conteúdo leva a escolha junto. */
const responderDialogos=require("./_dialogo.cjs"), fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const reg=(id,d,disc,ass,q,a)=>({id,data:dia(d),disciplina:disc,assuntos:[ass],assunto:ass,minutos:30,questoes:q,acertos:a,
  dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:id.charCodeAt(1)});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"},{id:"c2",disciplina:"Legislação",nome:"LGPD",fase:"andamento"},
             {id:"c3",disciplina:"Português",nome:"Crase",fase:"andamento"}],
  registros:[reg("r1",-1,"Legislação","LAI",10,8),reg("r2",-2,"Legislação","LGPD",10,2),reg("r3",-3,"Português","Crase",20,10)],
  revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje,diaSel:null}));
     w.__confirmarNativo=true; w.confirm=()=>true; responderDialogos(w, ()=>"Acesso à informação"); }});
  return dom.window;
}
(async()=>{try{
  /* ---- Sessões ---- */
  let w=abrir("registros"); await espera(400); let $=s=>w.document.querySelector(s);
  const muda=(id,v)=>{ const s=$(id); s.value=v; s.dispatchEvent(new w.Event("change",{bubbles:true})); };
  const linhas=()=>[...w.document.querySelectorAll("tbody tr.linha-clicavel")].map(t=>t.dataset.id).sort().join();
  const ops=id=>[...w.document.querySelectorAll(id+" option")].map(o=>o.textContent);
  ok("Sessões: caixas de Disciplina e Conteúdo, nessa ordem, no quadro de filtros",
     [...w.document.querySelectorAll(".filtros-campos select")].map(s=>s.id).slice(0,2).join()==="fDisciplina,fAssunto");
  ok("sem disciplina, o conteúdo lista todos, com a disciplina ao lado",
     ops("#fAssunto").join("|")==="Todos os conteúdos|Crase · Português|LAI · Legislação|LGPD · Legislação", ops("#fAssunto"));
  muda("#fAssunto","legislação|lai"); await espera(250);
  ok("escolher LAI filtra a lista e escolhe a disciplina dela",
     linhas()==="r1" && $("#fDisciplina").value==="Legislação", [linhas(), $("#fDisciplina").value]);
  ok("com a disciplina escolhida, o conteúdo só lista os dela", ops("#fAssunto").join("|")==="Todos os conteúdos|LAI|LGPD", ops("#fAssunto"));
  muda("#fDisciplina","Português"); await espera(250);
  ok("trocar a disciplina solta o conteúdo que não é dela", !$("#fAssunto").value && linhas()==="r3", [$("#fAssunto").value, linhas()]);
  muda("#fAssunto","português|crase"); await espera(250);
  $('[data-acao="limpar-filtros-reg"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("limpar filtros solta disciplina e conteúdo", !$("#fDisciplina").value && !$("#fAssunto").value && linhas()==="r1,r2,r3");

  /* ---- Questões: várias disciplinas (botões) + conteúdo (caixa) ---- */
  w=abrir("questoes"); await espera(400); $=s=>w.document.querySelector(s);
  const tile=nome=>[...w.document.querySelectorAll(".tile")].find(t=>t.querySelector(".rot").textContent===nome).querySelector(".val").textContent;
  ok("Questões: os botões de disciplina continuam (várias ao mesmo tempo)", w.document.querySelectorAll('[data-acao="filtrar-questoes"]').length>=3);
  ok("e há a caixa de Conteúdo", !!$("#qAssunto"));
  muda("#qAssunto","legislação|lgpd"); await espera(250);
  ok("escolher LGPD recorta os números (10 questões, 20%)", tile("Questões feitas")==="10" && tile("Taxa de acerto")==="20%",
     [tile("Questões feitas"), tile("Taxa de acerto")]);
  $('[data-acao="filtrar-questoes"][data-disc="Português"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("marcar só Português solta o conteúdo de Legislação", !$("#qAssunto").value && tile("Questões feitas")==="20",
     [$("#qAssunto").value, tile("Questões feitas")]);

  /* ---- Progresso ---- */
  w=abrir("painel"); await espera(400); $=s=>w.document.querySelector(s);
  ok("Progresso: os botões de disciplina viraram caixas", !!$("#pDisciplina") && !!$("#pAssunto") &&
     !w.document.querySelector('.barra-filtro [data-acao="filtrar-disc"]'));
  muda("#pAssunto","legislação|lai"); await espera(250);
  const geral=[...w.document.querySelectorAll(".tile")].find(t=>/acerto geral/.test(t.textContent));
  ok("escolher LAI recorta o Progresso (80% de acerto) e diz o escopo", /80%/.test(geral.textContent) &&
     /apenas LAI \(Legislação\)/.test(geral.textContent), geral.textContent);
  // renomear o conteúdo leva a escolha junto
  $('[data-aba="conteudos"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  const ren=[...w.document.querySelectorAll('[data-acao="renomear-conteudo"]')].find(b=>b.dataset.cont==="LAI");
  ren.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  $('[data-aba="painel"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  ok("renomeado LAI, o Progresso continua filtrado nele, com o nome novo",
     $("#pAssunto").value==="legislação|acesso à informação", $("#pAssunto").value);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nfiltro de disciplina e conteúdo igual em todas as abas");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
