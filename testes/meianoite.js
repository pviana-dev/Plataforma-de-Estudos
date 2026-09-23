/* Sessão que atravessa a meia-noite: começa 23h30 do dia X e termina 0h30 do
   dia X+1. A hora inteira é do dia X — foi quando a sessão começou. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};

/* O relógio do teste: "agora" são 0h30 de hoje; o cronômetro começou 23h30 de
   ontem. Uma hora cravada, atravessando a virada. */
const agora=new Date(); agora.setHours(0,30,0,0);
const fimTs=agora.getTime(), inicioTs=fimTs-60*60*1000;
const hoje=iso(new Date(fimTs)), ontem=iso(new Date(inicioTs));

const sess=(id,data)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",fase:"concluido",criadoEm:1});
function seed(destino){
  return {versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação"],
    conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:ontem}],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    grupos:[],lancamentos:[],registros:[sess("r1",ontem)],revisoes:[],erros:[],
    cronometro:{inicio:inicioTs,disciplina:"",assunto:"",
      destinoTipo:destino?"registro":null, destinoId:destino||null}};
}
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(s){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){
     w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"hoje",gravadoEm:hoje}));
     // o relógio congela às 0h30 de hoje, para a virada ser a do enunciado
     const R=w.Date, alvo=fimTs;
     const D2=function(...a){ return a.length ? new R(...a) : new R(alvo); };
     D2.now=()=>alvo; D2.parse=R.parse; D2.UTC=R.UTC; D2.prototype=R.prototype;
     w.Date=D2;
   }});
  return dom.window;
}
const dados=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  console.log("  (começou "+ontem+" 23:30, encerrou "+hoje+" 00:30)");

  /* ---- 1. somando numa sessão que já existe ---- */
  let w=abrir(seed("r1")); await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);
  const encerrar=$('[data-acao="crono-encerrar"]');
  ok("o cronômetro está rodando e dá para encerrar", !!encerrar);
  encerrar.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  let reg=dados(w).registros.find(r=>r.id==="r1");
  ok("a hora foi somada à sessão", reg.minutos===90, reg.minutos);
  ok("o bloco ficou no dia em que COMEÇOU, não no dia em que terminou",
     reg.blocos[0].data===ontem, {bloco:reg.blocos[0].data, ontem, hoje});
  ok("as horas do intervalo continuam as de verdade (23:30 → 00:30)",
     reg.blocos[0].inicio==="23:30" && reg.blocos[0].fim==="00:30", reg.blocos[0]);
  ok("e fica registrado que a medição virou o dia", reg.blocos[0].viradas===1, reg.blocos[0]);

  /* ---- 2. a hora conta no dia de ontem, não no de hoje ---- */
  doc.querySelector('[data-aba="painel"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  const celula=d=>doc.querySelector('.cal-dia[data-dia="'+d+'"]');
  celula(ontem).dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const tileDia=[...doc.querySelectorAll("#view .tiles .tile")][0].textContent.replace(/\s+/g," ");
  ok("o painel mostra 1h30 no dia de ontem (30min da sessão + 1h cronometrada)",
     /1h ?e? ?30/.test(tileDia), tileDia);
  celula(hoje).dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const tileHoje=[...doc.querySelectorAll("#view .tiles .tile")][0].textContent.replace(/\s+/g," ");
  ok("e nada em hoje — a madrugada não abriu um dia novo de estudo",
     /0min|00min/.test(tileHoje) && !/1h/.test(tileHoje), tileHoje);

  /* ---- 3. sessão nova: o formulário nasce com a data de ontem ---- */
  w=abrir(seed(null)); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  $('[data-acao="crono-encerrar"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  const campoData=$('#modalCorpo input[name="data"]') || $('input[name="data"]');
  ok("o registro pré-preenchido abre na data em que a sessão começou",
     campoData && campoData.value===ontem, campoData && campoData.value);
  const nota=$('[name="anotacoes"]');
  ok("e a anotação avisa que o fim foi no dia seguinte",
     nota && /23:30 → 00:30 do dia seguinte/.test(nota.value), nota && nota.value);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntempo da madrugada fica no dia em que começou");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
