/* SEPARAR UM CARD (04/10). Cards "A · B" juntados antes da correção de 02/10
   se refaziam juntos para sempre: a sessão dona punha os dois no mesmo grupo.
   O botão "Separar" da janela do card divide o card (e os outros pendentes com
   os mesmos conteúdos) em um por conteúdo, e a separação fica gravada na
   sessão: recarregar ou a escada andar não junta de novo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,ass,d)=>({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",plano:"individual",criadoEm:Number(id.slice(1))});
function seed(fase, registros, revisoes){
  const c=(id,nome,n)=>Object.assign({id,disciplina:"Legislação",nome,fase,criadoEm:n}, fase==="concluido"?{concluidoEm:dia(-1)}:{});
  return {versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],grupos:[],
    conteudos:[c("cA","A",1),c("cB","B",2)],conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    registros, revisoes, erros:[], cronometro:null};
}
function abrir(s, aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
      w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const nomes=r=>(r.assuntos||[]).join("+");
const pendentes=(w,f)=>db(w).revisoes.filter(r=>!r.feita && f(r)).map(r=>[r.data,nomes(r)]).sort((a,b)=>(a[0]+a[1]).localeCompare(b[0]+b[1]));
async function separar(w, id){
  const doc=w.document;
  const ed=doc.querySelector('[data-acao="editar-revisao"][data-id="'+id+'"]');
  if (!ed) return "sem card";
  click(w,ed); await espera(300);
  const bt=doc.querySelector('[data-acao="separar-revisao"]');
  if (bt){ click(w,bt); await espera(400); }
  return !!bt;
}

(async()=>{try{
  /* ---- 1. controle: sessão antiga com A e B que fechou os dois dá a escada "A + B" ---- */
  const reg1=[sess("r3",["A","B"],dia(-1))];
  let w=abrir(seed("concluido",reg1,[]),"revisoes"); await espera(500);
  const esc1=pendentes(w,r=>!r.retomada);
  ok("sem separar, a escada nasce junta (o caso antigo)", esc1.length>0 && esc1.every(x=>x[1]==="A+B"), esc1);

  /* ---- 2. separar: todos os cards pendentes viram um por conteúdo ---- */
  const primeiro=w.document.querySelector('[data-acao="editar-revisao"]').dataset.id;
  ok("a janela do card mostra Separar", await separar(w, primeiro)===true);
  const esc2=pendentes(w,r=>!r.retomada);
  ok("cada card fala de um conteúdo só", esc2.every(x=>x[1]==="A"||x[1]==="B"), esc2);
  ok("A e B ficam nas mesmas datas de antes", JSON.stringify(esc2.filter(x=>x[1]==="A").map(x=>x[0]))===JSON.stringify(esc1.map(x=>x[0])) &&
     JSON.stringify(esc2.filter(x=>x[1]==="B").map(x=>x[0]))===JSON.stringify(esc1.map(x=>x[0])), [esc1,esc2]);
  ok("a sessão guarda a separação", JSON.stringify(db(w).registros.find(r=>r.id==="r3").separados)==='["a","b"]', db(w).registros);

  /* ---- 3. recarregar não junta de novo ---- */
  let salvo=db(w);
  w=abrir(salvo,"revisoes"); await espera(500);
  ok("recarregado, continua separado", JSON.stringify(pendentes(w,r=>!r.retomada))===JSON.stringify(esc2), pendentes(w,r=>!r.retomada));

  /* ---- 4. a escada andando (os últimos degraus renascem) também nasce separada ---- */
  const ultimo=esc2[esc2.length-1][0];
  salvo.revisoes=salvo.revisoes.filter(r=>r.data!==ultimo);
  w=abrir(salvo,"revisoes"); await espera(500);
  const esc4=pendentes(w,r=>!r.retomada);
  ok("o degrau que renasce vem um card por conteúdo", esc4.length===esc2.length && esc4.every(x=>x[1]==="A"||x[1]==="B"), esc4);

  /* ---- 5. o card de continuar "A · B" (conteúdo em andamento) ---- */
  const v={id:"vAB",registroId:"r3",data:dia(2),retomada:true,feita:false,assuntos:["A","B"],
           feitaEm:null,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",manual:false};
  w=abrir(seed("andamento",[sess("r3",["A","B"],dia(-1))],[v]),"revisoes"); await espera(500);
  ok("antes: um card de continuar A + B", JSON.stringify(pendentes(w,r=>r.retomada))==='[["'+dia(2)+'","A+B"]]', pendentes(w,r=>r.retomada));
  ok("a janela mostra Separar", await separar(w,"vAB")===true);
  const ab=JSON.stringify([[dia(2),"A"],[dia(2),"B"]]);
  ok("depois: um de A e um de B, no mesmo dia", JSON.stringify(pendentes(w,r=>r.retomada))===ab, pendentes(w,r=>r.retomada));
  w=abrir(db(w),"revisoes"); await espera(500);
  ok("recarregado, sem card a mais nem junção", JSON.stringify(pendentes(w,r=>r.retomada))===ab, pendentes(w,r=>r.retomada));

  /* ---- 6. card de um conteúdo só não oferece Separar ---- */
  const idA=w.document.querySelector('[data-acao="editar-revisao"]').dataset.id;
  ok("card de um conteúdo só não mostra Separar", (await separar(w,idA))===false);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nseparar: card juntado vira um por conteúdo e não se junta de novo");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
