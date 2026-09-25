/* Reordenar as anotações dentro de um card (mesmo dia + mesmo conteúdo),
   arrastando ou pelas setas. A ordem escolhida à mão manda a partir daí. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), agora=Date.now(), ha3=agora-3*864e5;
const an=(id,ass,txt,criadoEm,extra)=>Object.assign({id,disciplina:"Legislação",assunto:ass,fonte:"",
  oQueErrei:"",ensinamento:txt,categoria:"",refeita:false,importante:false,criadoEm},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
   questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],
 revisoes:[],
 erros:[an("e1","LAI","primeira",agora-3000), an("e2","LAI","segunda",agora-2000),
        an("e3","LAI","terceira",agora-1000),
        an("e9","LAI","de outro dia",ha3)],   // card separado: não pode se misturar
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje})); }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const cardDe=txt=>[...doc.querySelectorAll("article.apr")]
  .find(c=>c.textContent.includes(txt));
const ordemNaTela=card=>[...card.querySelectorAll("[data-anotacao]")].map(x=>x.dataset.anotacao);
const alcaDe=id=>doc.querySelector('[data-acao="mover-anotacao"][data-id="'+id+'"]');
const tecla=(el,k)=>el.dispatchEvent(new w.KeyboardEvent("keydown",{key:k,bubbles:true}));

/* jsdom não faz arrasto de verdade: os eventos são disparados à mão, como o
   navegador faria — é justamente por isso que a implementação não depende do
   dataTransfer, que o jsdom não preenche. */
function arrastar(origem, destino, paraBaixo){
  const item=origem.closest("[data-anotacao]");
  origem.dispatchEvent(new w.MouseEvent("mousedown",{bubbles:true}));
  item.dispatchEvent(new w.Event("dragstart",{bubbles:true}));
  const r=destino.getBoundingClientRect();
  const ev=new w.Event("dragover",{bubbles:true,cancelable:true});
  ev.clientY = (r.top||0) + (paraBaixo ? 999 : -999);
  destino.dispatchEvent(ev);
  item.dispatchEvent(new w.Event("dragend",{bubbles:true}));
}

(async()=>{try{
  await espera(500);
  const card=cardDe("primeira");
  ok("as três anotações de hoje estão num card só", ordemNaTela(card).length===3, ordemNaTela(card));
  ok("a de outro dia fica em card separado",
     [...doc.querySelectorAll("article.apr")].length===2,
     [...doc.querySelectorAll("article.apr")].length);
  ok("a ordem começa automática: a mais recente primeiro",
     ordemNaTela(card).join()==="e3,e2,e1", ordemNaTela(card));
  ok("cada anotação tem uma alça de arrastar",
     [...card.querySelectorAll('[data-acao="mover-anotacao"]')].length===3);
  ok("e nada tem ordem gravada ainda", !db().erros.some(e=>Number.isFinite(e.ordem)),
     db().erros.map(e=>[e.id,e.ordem]));

  /* ---- 1. setas: o caminho do teclado e do celular ---- */
  tecla(alcaDe("e3"),"ArrowDown"); await espera(250);
  ok("a seta ↓ desce a anotação uma posição", ordemNaTela(card).join()==="e2,e3,e1", ordemNaTela(card));
  ok("e a ordem do card inteiro é gravada",
     db().erros.filter(e=>e.assunto==="LAI"&&Number.isFinite(e.ordem)).length===3,
     db().erros.map(e=>[e.id,e.ordem]));
  ok("com os números na ordem da tela",
     ["e2","e3","e1"].every((id,i)=>db().erros.find(e=>e.id===id).ordem===i),
     db().erros.map(e=>[e.id,e.ordem]));
  ok("a anotação do outro card não foi tocada",
     !Number.isFinite(db().erros.find(e=>e.id==="e9").ordem), db().erros.find(e=>e.id==="e9"));

  tecla(alcaDe("e3"),"ArrowUp"); await espera(250);
  ok("a seta ↑ sobe de volta", ordemNaTela(card).join()==="e3,e2,e1", ordemNaTela(card));
  tecla(alcaDe("e3"),"ArrowUp"); await espera(200);
  ok("no topo, ↑ não faz nada (nem quebra)", ordemNaTela(card).join()==="e3,e2,e1", ordemNaTela(card));

  /* ---- 2. arrastar ---- */
  arrastar(alcaDe("e3"), doc.querySelector('[data-anotacao="e1"]'), true);
  await espera(250);
  ok("arrastar para baixo do último leva para o fim",
     ordemNaTela(card).join()==="e2,e1,e3", ordemNaTela(card));
  ok("e a nova ordem foi gravada",
     ["e2","e1","e3"].every((id,i)=>db().erros.find(e=>e.id===id).ordem===i),
     db().erros.map(e=>[e.id,e.ordem]));

  /* ---- 3. a ordem sobrevive ao redesenho e à recarga ---- */
  doc.querySelector('[data-aba="hoje"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  doc.querySelector('[data-aba="erros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  ok("trocar de aba e voltar mantém a ordem",
     ordemNaTela(cardDe("primeira")).join()==="e2,e1,e3", ordemNaTela(cardDe("primeira")));

  const guardado=w.localStorage.getItem("plataforma-estudos:v1");
  const dom2=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",guardado);
     x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje})); }});
  await espera(500);
  const d2=dom2.window.document;
  const card2=[...d2.querySelectorAll("article.apr")].find(c=>c.textContent.includes("primeira"));
  ok("e recarregando o app também",
     [...card2.querySelectorAll("[data-anotacao]")].map(x=>x.dataset.anotacao).join()==="e2,e1,e3",
     [...card2.querySelectorAll("[data-anotacao]")].map(x=>x.dataset.anotacao));

  /* ---- 4. a estrela não desmancha a ordem escolhida ---- */
  doc.querySelector('[data-acao="erro-estrela"][data-id="e3"]')
     .dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  ok("marcar a véspera não joga a anotação para o topo do card",
     ordemNaTela(cardDe("primeira")).join()==="e2,e1,e3", ordemNaTela(cardDe("primeira")));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nordem das anotações: arrastar e setas funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
