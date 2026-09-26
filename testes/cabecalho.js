const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=new Date();
const mais=n=>iso(new Date(Date.now()+n*864e5));
const base=p=>({versao:1,tema:"claro",dataProva:p,metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[],revisoes:[],erros:[],cronometro:null});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
function abrir(prova){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(base(prova)));}});
  return dom.window;
}
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{
  /* ---- a contagem sem os fogos (25/09): número e rótulo, letra maior; urgência na cor ---- */
  let w=abrir(mais(40)); await espera(300);
  let reg=w.document.querySelector("#regressiva");
  ok("com prova distante: só o número e o rótulo, sem fogo", /^40\s*dias para a prova$/.test(reg.textContent.trim()) &&
     !reg.querySelector(".fogo") && !/🔥/.test(reg.textContent), reg.textContent.trim());
  ok("a letra cresceu no espaço dos fogos (número 32px, rótulo 15px)",
     /\.regressiva b\{font-size:32px/.test(html) && /\.regressiva span\{font-size:15px/.test(html));
  w=abrir(mais(12)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("na última quinzena, ainda sem fogo", !/🔥/.test(reg.textContent) && !reg.className.includes("urgente"), reg.textContent);
  w=abrir(mais(5)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("na última semana, sem fogo e vermelha de urgente", !/🔥/.test(reg.textContent) && reg.className.includes("urgente"), reg.className);
  w=abrir(iso(hoje)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("no dia da prova, 'hoje', sem fogo", /hoje/.test(reg.textContent) && !/🔥/.test(reg.textContent), reg.textContent);
  w=abrir(mais(-3)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("depois da prova, os dias desde ela", /desde a prova/.test(reg.textContent), reg.textContent);
  w=abrir(""); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("sem data de prova, a contagem nem aparece", reg.hidden, reg.textContent);

  /* ---- nome e abas maiores ---- */
  ok("o nome da plataforma cresceu (29px desde 25/09)", /\.brand h1\{font-size:29px/.test(html));
  ok("as abas ganharam caixa maior", /\.aba\{[^}]*?padding:10px 19px[^}]*?font-size:14\.5px/s.test(html));
  ok("e o texto da aba não selecionada saiu do cinza de desabilitado",
     /\.aba\{[^}]*?color:var\(--text-2\)/s.test(html));
  const abas=[...w.document.querySelectorAll(".aba")];
  ok("as 7 abas continuam lá", abas.length===7, abas.map(a=>a.textContent));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncabeçalho ajustado");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
