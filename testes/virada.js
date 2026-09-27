const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()), ontem=iso(new Date(Date.now()-864e5)), anteontem=iso(new Date(Date.now()-2*864e5));
const sess=(id,data)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 lancamentos:[],registros:[sess("r1",hoje),sess("r2",ontem)],revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     if (tela) w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(tela)); }});
  return dom.window;
}
(async()=>{try{
  /* ---- o caso relatado: estado guardado ONTEM, aberto hoje ---- */
  let w=abrir({ aba:"painel", diaSel:ontem, mesCal:ontem.slice(0,7), gravadoEm:ontem });
  await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);
  /* desde 27/09 (R5) o Progresso abre no panorama: o "hoje" de ontem não pula para o hoje novo */
  ok("guardado ontem no 'hoje', abre no panorama", /Nenhum dia escolhido/.test($(".dia-info").textContent),
     $(".dia-info").textContent.slice(0,60));
  ok("e nenhum dia aparece selecionado no calendário", !doc.querySelector(".cal-dia.sel"));
  ok("o estado regravado já vem com a data de hoje",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).gravadoEm===hoje,
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).gravadoEm);

  /* ---- um dia escolhido de propósito continua escolhido ---- */
  w=abrir({ aba:"painel", diaSel:anteontem, mesCal:anteontem.slice(0,7), gravadoEm:ontem });
  await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  ok("dia escolhido de propósito não é mexido",
     $(".dia-info .dia-cab b").textContent.includes(anteontem.split("-").reverse().join("/")),
     $(".dia-info .dia-cab b").textContent);

  /* ---- sem estado nenhum: abre no dia de hoje ---- */
  w=abrir(null); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  doc.querySelector('[data-aba="painel"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  ok("primeira visita abre no panorama", /Nenhum dia escolhido/.test($(".dia-info").textContent));
  // escolhido o dia de hoje, ele acompanha a virada do relógio
  doc.querySelector('.cal-dia[data-dia="'+hoje+'"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  ok("tocando em hoje, o dia aparece", $(".dia-info .dia-cab b").textContent.includes(hoje.split("-").reverse().join("/")),
     $(".dia-info .dia-cab b").textContent);

  /* ---- a virada do dia com a aba aberta ---- */
  ok("existe um relógio que confere a virada", /function verificarVirada\(\)/.test(html));
  ok("ele roda de minuto em minuto", /setInterval\(verificarVirada, 60000\)/.test(html));
  ok("e também quando a aba volta a aparecer",
     /visibilitychange[\s\S]{0,80}verificarVirada/.test(html) && /"focus", verificarVirada/.test(html));
  // simula a virada: o relógio do documento avança um dia
  const real=w.Date;
  const amanha=new Date(Date.now()+864e5);
  w.eval('(function(){ const R=Date; const alvo=new R('+amanha.getTime()+').getTime();' +
         ' const D2=function(...a){ return a.length? new R(...a) : new R(alvo); };' +
         ' D2.now=()=>alvo; D2.parse=R.parse; D2.UTC=R.UTC; D2.prototype=R.prototype; window.Date=D2; })()');
  // o código vive dentro de uma IIFE: a virada é disparada pelos eventos públicos
  w.dispatchEvent(new w.Event("focus")); await espera(300);
  doc=w.document; $=s=>doc.querySelector(s);
  const amanhaIso=iso(amanha);
  ok("virando o dia, a tela acompanha sozinha",
     $(".dia-info .dia-cab b").textContent.includes(amanhaIso.split("-").reverse().join("/")),
     $(".dia-info .dia-cab b").textContent);
  ok("e avisa que virou", /Virou o dia/.test($("#toast").textContent), $("#toast").textContent);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nvirada do dia funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
