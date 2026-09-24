/* MURAL "FALTA ESTUDAR" (pedido do Pedro, 23/09) — no lugar do card "Para
   lembrar", na aba Hoje. Uma lista que a pessoa MONTA escolhendo entre os
   conteúdos do cadastro (nada se digita); só entra conteúdo sem sessão, e a
   primeira sessão o tira daqui. Arrastar (ou ↑ ↓) define a prioridade. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const ficha=(disc,nome,criadoEm,extra)=>Object.assign({id:"c-"+nome,disciplina:disc,nome,fase:"andamento",concluidoEm:null,criadoEm},extra||{});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
  // no mural: LAI (mas já tem sessão), LGPD, Crase e Regência; Improbidade e Licitações só no cadastro
  conteudos:[ficha("Legislação","LAI",1,{mural:true}), ficha("Legislação","LGPD",2,{mural:true}),
             ficha("Português","Crase",3,{mural:true}), ficha("Português","Regência",4,{mural:true}),
             ficha("Legislação","Improbidade",5), ficha("Legislação","Licitações",6)],
  registros:[{id:"r1",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,
    dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1}],revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(s){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"hoje",gravadoEm:hoje})); w.confirm=()=>true; }});
  return dom.window;
}
(async()=>{try{
  let w=abrir(seed); await espera(400);
  let doc=w.document; const $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
  const naTela=()=>[...doc.querySelectorAll(".mural-item .mural-nome b")].map(b=>b.textContent);
  const cards=[...doc.querySelectorAll("#view .card h2")].map(h=>h.textContent);
  ok("o card 'Para lembrar' saiu", !cards.some(t=>/Para lembrar/.test(t)), cards);
  ok("no lugar dele, 'Falta estudar'", cards.some(t=>/Falta estudar/.test(t)), cards);
  ok("só o que foi escolhido e não tem sessão (LAI já foi estudada), na ordem em que foi cadastrado",
     naTela().join()==="LGPD,Crase,Regência", naTela());
  ok("o que está só no cadastro não entra sozinho", !naTela().includes("Improbidade"), naTela());

  /* ---- arrastar para priorizar ---- */
  const item=nome=>[...doc.querySelectorAll(".mural-item")].find(i=>i.querySelector("b").textContent===nome);
  const alca=item("Regência").querySelector('[data-acao="mover-afazer"]');
  alca.dispatchEvent(new w.MouseEvent("mousedown",{bubbles:true}));
  item("Regência").dispatchEvent(new w.Event("dragstart",{bubbles:true}));
  const ev=new w.Event("dragover",{bubbles:true,cancelable:true}); ev.clientY=-999;
  item("LGPD").dispatchEvent(ev);
  item("Regência").dispatchEvent(new w.Event("dragend",{bubbles:true}));
  await espera(200);
  ok("arrastar Regência para o topo muda a ordem na tela", naTela().join()==="Regência,LGPD,Crase", naTela());
  const pri=db().conteudos.filter(c=>c.prioridade!==undefined).sort((a,b)=>a.prioridade-b.prioridade).map(c=>c.nome);
  ok("e a prioridade fica gravada", pri.join()==="Regência,LGPD,Crase", pri);
  w=abrir(db()); await espera(400); doc=w.document;
  ok("reabrindo, a ordem continua", naTela().join()==="Regência,LGPD,Crase", naTela());

  /* ---- teclado: ↓ desce um ---- */
  const a2=[...doc.querySelectorAll(".mural-item")][0].querySelector('[data-acao="mover-afazer"]');
  a2.dispatchEvent(new w.KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true}));
  await espera(100);
  ok("a seta ↓ desce o conteúdo (é o caminho do celular)", naTela().join()==="LGPD,Regência,Crase", naTela());

  /* ---- ▶ estudar abre a sessão com o conteúdo, e a sessão tira ele do mural ---- */
  const bt=[...doc.querySelectorAll('[data-acao="estudar-afazer"]')].find(b=>b.closest(".mural-item").querySelector("b").textContent==="Crase");
  bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  const f=doc.querySelector("#formRegistro");
  ok("▶ estudar abre a sessão com disciplina e conteúdo preenchidos",
     !!f && f.querySelector("select.sel-disciplina").value==="Português" &&
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto).join()==="Crase",
     f && [f.querySelector("select.sel-disciplina").value]);
  ok("e a dificuldade continua para você escolher", f.querySelector('[name="dificuldade"]').value==="");
  f.querySelector('[name="minutos"]').value="40"; f.querySelector('[name="dificuldade"]').value="2";
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(400);
  doc.querySelector('[data-aba="hoje"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  ok("registrada a sessão, Crase sai do mural", naTela().join()==="LGPD,Regência", naTela());

  /* ---- adicionar: escolher entre os cadastrados, nada se digita ---- */
  doc.querySelector('.card [data-acao="novo-afazer"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  const fm=doc.querySelector("#formMural");
  ok("+ adicionar abre a escolha entre os conteúdos cadastrados", !!fm);
  ok("sem campo de digitar", !fm.querySelector("textarea, input[type=text]"));
  const opcoes=[...fm.querySelectorAll('[name="mural"]')].map(i=>i.closest("label").textContent);
  ok("só oferece o que não tem sessão e ainda não está no mural", opcoes.join()==="Improbidade,Licitações", opcoes);
  fm.querySelector('[name="mural"][value="legislação|licitações"]').checked=true;
  fm.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("o escolhido entra no fim da fila", naTela().join()==="LGPD,Regência,Licitações", naTela());

  /* ---- ✕ tira do mural sem apagar o conteúdo ---- */
  const x=[...doc.querySelectorAll('[data-acao="tirar-afazer"]')].find(b=>b.closest(".mural-item").querySelector("b").textContent==="LGPD");
  x.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("✕ tira do mural", naTela().join()==="Regência,Licitações", naTela());
  ok("e o conteúdo continua cadastrado", db().conteudos.some(c=>c.nome==="LGPD" && !c.mural), db().conteudos.map(c=>c.nome+":"+!!c.mural));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nmural Falta estudar funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
