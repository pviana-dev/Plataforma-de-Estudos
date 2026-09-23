/* MINIMIZAR UM CARD DA AGENDA POR ASSUNTO. Só aquele card fecha; o estado
   sobrevive ao F5 (sessionStorage, mesma aba) e some ao fechar e abrir de novo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,disc,ass)=>({id,data:dia(-5),disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const item=(id,reg,data,feita)=>({id,registroId:reg,data,ordem:1,feita:!!feita,feitaEm:feita?data:null,minutos:null,
  questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",manual:false});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",metaDiariaMin:120,disciplinas:["TI","Português"],lancamentos:[],
  conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
  conteudos:[{id:"c1",disciplina:"TI",nome:"DevOps",fase:"concluido",concluidoEm:dia(-5)},
             {id:"c2",disciplina:"Português",nome:"Crase",fase:"concluido",concluidoEm:dia(-5)}],
  registros:[sess("r1","TI","DevOps"), sess("r2","Português","Crase")],
  revisoes:[item("a1","r1",dia(2)),item("a2","r1",dia(9)),item("b1","r2",dia(3)),item("b2","r2",dia(10))],
  erros:[],cronometro:null};
/* sessao = o sessionStorage que a aba carrega: o mesmo no F5, vazio ao reabrir */
function abrir(sessao){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje,visaoAgenda:"assunto"}));
     Object.entries(sessao||{}).forEach(([k,v])=>w.sessionStorage.setItem(k,v));
     w.confirm=()=>true; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const card=(w,nome)=>[...w.document.querySelectorAll(".grupo-rev")].find(g=>g.querySelector(".cab strong").textContent===nome);
const itens=(w,nome)=>card(w,nome).querySelectorAll(".item").length;
const copiaSessao=w=>{ const o={}; for(let i=0;i<w.sessionStorage.length;i++){const k=w.sessionStorage.key(i);o[k]=w.sessionStorage.getItem(k);} return o; };

(async()=>{try{
  let w=abrir(); await espera(300);
  const v=w.document.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (v && v.getAttribute("aria-selected")!=="true"){ click(w,v); await espera(200); }
  ok("a visão por assunto mostra os dois cards abertos", itens(w,"DevOps")===2 && itens(w,"Crase")===2,
     [itens(w,"DevOps"), itens(w,"Crase")]);
  const bt=card(w,"DevOps").querySelector('[data-acao="minimizar-assunto"]');
  ok("cada card tem o botão de minimizar", !!bt && bt.getAttribute("aria-expanded")==="true");
  click(w,bt); await espera(200);
  ok("minimizar esconde só os itens de DevOps", itens(w,"DevOps")===0 && itens(w,"Crase")===2,
     [itens(w,"DevOps"), itens(w,"Crase")]);
  ok("o cabeçalho continua, dizendo quanto guarda e o próximo",
     /2 itens · próximo/.test(card(w,"DevOps").textContent), card(w,"DevOps").textContent.slice(0,120));
  ok("o botão avisa que está fechado", card(w,"DevOps").querySelector('[data-acao="minimizar-assunto"]').getAttribute("aria-expanded")==="false");
  ok("nada disso vai para os dados (backup e nuvem)", !/minimiz/i.test(w.localStorage.getItem("plataforma-estudos:v1")));

  /* F5: a mesma aba, o mesmo sessionStorage */
  const guardado=copiaSessao(w);
  w=abrir(guardado); await espera(300);
  ok("depois do F5, DevOps continua minimizado", itens(w,"DevOps")===0 && itens(w,"Crase")===2,
     [itens(w,"DevOps"), itens(w,"Crase")]);
  click(w, card(w,"DevOps").querySelector('[data-acao="minimizar-assunto"]')); await espera(200);
  ok("e expandir traz os itens de volta", itens(w,"DevOps")===2, itens(w,"DevOps"));
  click(w, card(w,"DevOps").querySelector('[data-acao="minimizar-assunto"]')); await espera(200);

  /* fechar e abrir de novo: sessionStorage vazio */
  w=abrir(); await espera(300);
  ok("fechar e abrir de novo volta tudo ao original", itens(w,"DevOps")===2 && itens(w,"Crase")===2,
     [itens(w,"DevOps"), itens(w,"Crase")]);

  /* sessionStorage com lixo não derruba a tela */
  w=abrir({"plataforma-estudos:minimizados":"{quebrado"}); await espera(300);
  ok("dado estragado no sessionStorage é ignorado", itens(w,"DevOps")===2, itens(w,"DevOps"));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nminimizar card da agenda por assunto funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
