/* MINIMIZAR UM BLOCO DE ANOTAÇÕES (pedido do Pedro, 24/09), como os cards da
   Agenda por assunto: só aquele bloco fecha, o cabeçalho continua dizendo
   quantas anotações guarda, e o estado sobrevive ao F5 (sessionStorage).
   E, na aba Hoje, os Próximos 7 dias ficam só informativos: sem caixa de marcar. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const agora=Date.now();
const e=(id,disc,ass,txt,criadoEm)=>({id,disciplina:disc,assunto:ass,fonte:"",oQueErrei:"",ensinamento:txt,
  categoria:"",refeita:false,importante:false,criadoEm});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,disciplinas:["Legislação","Português"],
 grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,
 conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"},{id:"c2",disciplina:"Português",nome:"Crase",fase:"andamento"}],
 registros:[
  {id:"rA",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},
  {id:"rB",data:dia(-1),disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2}],
 revisoes:[{id:"v1",registroId:"rA",data:dia(2),ordem:1,feita:false,manual:false,retomada:true,assuntos:["LAI"],minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[e("e1","Legislação","LAI","prazo de 20 dias",agora), e("e2","Legislação","LAI","vale para órgão",agora-1000),
        e("e3","Português","Crase","antes de masculino não",agora-2000)],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(aba, sessao){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
     Object.entries(sessao||{}).forEach(([k,v])=>w.sessionStorage.setItem(k,v)); w.confirm=()=>true; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const bloco=(w,nome)=>[...w.document.querySelectorAll("article.apr")].find(a=>a.querySelector(".apr-origem b").textContent===nome);
const nItens=(w,nome)=>bloco(w,nome).querySelectorAll(".apr-item").length;
const copiaSessao=w=>{const o={};for(let i=0;i<w.sessionStorage.length;i++){const k=w.sessionStorage.key(i);o[k]=w.sessionStorage.getItem(k);}return o;};

(async()=>{try{
  /* ---- Próximos 7 dias: só informativo ---- */
  let w=abrir("hoje"); await espera(400);
  const prox=[...w.document.querySelectorAll("#view .card")].find(c=>/Próximos 7 dias/.test(c.querySelector("h2").textContent));
  ok("os Próximos 7 dias mostram os itens", !!prox && prox.querySelectorAll(".item").length>=1);
  ok("sem caixa de marcar", !prox.querySelector('.check,[data-acao="concluir"]'));

  /* ---- minimizar um bloco de anotações ---- */
  w=abrir("erros"); await espera(400);
  ok("os dois blocos abertos", nItens(w,"LAI")===2 && nItens(w,"Crase")===1, [nItens(w,"LAI"), nItens(w,"Crase")]);
  const bt=bloco(w,"LAI").querySelector('[data-acao="minimizar-anot"]');
  ok("cada bloco tem o botão de minimizar (o nome é o botão)", !!bt && bt.getAttribute("aria-expanded")==="true" &&
     bt.contains(bloco(w,"LAI").querySelector(".apr-origem")));
  click(w,bt); await espera(200);
  ok("minimizar esconde só as anotações de LAI", nItens(w,"LAI")===0 && nItens(w,"Crase")===1, [nItens(w,"LAI"), nItens(w,"Crase")]);
  ok("o cabeçalho continua, dizendo quantas guarda", /2 anotações/.test(bloco(w,"LAI").textContent));
  ok("e o botão avisa que está fechado", bloco(w,"LAI").querySelector('[data-acao="minimizar-anot"]').getAttribute("aria-expanded")==="false");
  ok("nada disso vai para os dados", !/minimiz|anot\|/.test(w.localStorage.getItem("plataforma-estudos:v1")));
  const guardado=copiaSessao(w);
  w=abrir("erros", guardado); await espera(400);
  ok("depois do F5, LAI continua minimizado", nItens(w,"LAI")===0 && nItens(w,"Crase")===1);
  click(w, bloco(w,"LAI").querySelector('[data-acao="minimizar-anot"]')); await espera(200);
  ok("e expandir traz as anotações de volta", nItens(w,"LAI")===2);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nminimizar anotações e próximos só informativos funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
