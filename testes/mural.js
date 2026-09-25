/* MURAL "FALTA ESTUDAR" — no lugar do card "Para lembrar", na aba Hoje.
   AUTOMÁTICO desde 24/09 (pedido do Pedro): todo conteúdo cadastrado sem
   sessão está nele, sem botão de adicionar nem ✕; a primeira sessão o tira
   daqui. Arrastar (ou ↑ ↓) define a prioridade; conteúdo novo entra no fim. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const ficha=(disc,nome,criadoEm,extra)=>Object.assign({id:"c-"+nome,disciplina:disc,nome,fase:"andamento",concluidoEm:null,criadoEm},extra||{});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
  // LAI já tem sessão; Tributário foi concluído sem sessão; o resto não tem sessão nenhuma.
  // `mural` (a marca da versão antiga, montada à mão) não decide mais nada.
  conteudos:[ficha("Legislação","LAI",1,{mural:true}), ficha("Legislação","LGPD",2,{mural:true}),
             ficha("Português","Crase",3), ficha("Português","Regência",4,{mural:false}),
             ficha("Legislação","Tributário",5,{fase:"concluido",concluidoEm:dia(-1)})],
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
  ok("entra sozinho todo conteúdo sem sessão, na ordem do cadastro (LAI já foi estudada; concluído não entra)",
     naTela().join()==="LGPD,Crase,Regência", naTela());
  ok("não há botão de adicionar nem ✕ para tirar",
     !doc.querySelector('[data-acao="novo-afazer"]') && !doc.querySelector('[data-acao="tirar-afazer"]'));

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
  ok("a seta ↓ do teclado desce o conteúdo", naTela().join()==="LGPD,Regência,Crase", naTela());

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

  /* ---- conteúdo novo no cadastro aparece sozinho, no fim ---- */
  doc.querySelector('[data-aba="conteudos"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  { const _s=doc.querySelector("#cDisciplina"); _s.value="Legislação"; _s.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250); }   // a disciplina se escolhe na caixa (filtro igual ao das Anotações)
  doc.querySelector('[data-acao="novo-conteudo"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  doc.querySelector("#formNovosConteudos textarea").value="Licitações";
  doc.querySelector("#formNovosConteudos").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  doc.querySelector('[data-aba="hoje"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  ok("conteúdo recém-cadastrado aparece sozinho, no fim da fila", naTela().join()==="LGPD,Regência,Licitações", naTela());

  /* ---- sem nada a estudar, o card explica ---- */
  const tudo=JSON.parse(JSON.stringify(seed)); tudo.conteudos=[ficha("Legislação","LAI",1)];
  w=abrir(tudo); await espera(400); doc=w.document;
  ok("sem conteúdo sem sessão, o card diz que nada falta e de onde vêm os próximos",
     !naTela().length && /Nada falta estudar/.test(doc.querySelector("#view").textContent));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nmural Falta estudar funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
