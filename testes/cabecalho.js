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
  /* ---- fogo cresce com a urgência ---- */
  let w=abrir(mais(40)); await espera(300);
  let reg=w.document.querySelector("#regressiva");
  const fogos=r=>[...r.querySelectorAll(".fogo")];
  ok("com prova distante, um fogo de cada lado",
     fogos(reg).length===2 && fogos(reg).every(f=>f.textContent==="🔥"),
     fogos(reg).map(f=>f.textContent));
  ok("o fogo ladeia a contagem, nas duas pontas da caixa",
     reg.firstElementChild.classList.contains("fogo") &&
     reg.lastElementChild.classList.contains("fogo"),
     [reg.firstElementChild.className, reg.lastElementChild.className]);
  ok("com o número e o rótulo no meio",
     /^🔥\d+\s*dias para a prova🔥$/.test(reg.textContent.trim()), reg.textContent.trim());
  ok("e não é lido pelo leitor de tela",
     fogos(reg).every(f=>f.getAttribute("aria-hidden")==="true"));

  w=abrir(mais(12)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("na última quinzena, dois fogos de cada lado", (reg.textContent.match(/🔥/g)||[]).length===4, reg.textContent);

  w=abrir(mais(5)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("na última semana, três de cada lado", (reg.textContent.match(/🔥/g)||[]).length===6, reg.textContent);
  ok("e a contagem segue vermelha de urgente", reg.className.includes("urgente"), reg.className);

  w=abrir(iso(hoje)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("no dia da prova ainda pega fogo", /hoje/.test(reg.textContent) && /🔥/.test(reg.textContent), reg.textContent);

  w=abrir(mais(-3)); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("depois da prova, sem fogo", !/🔥/.test(reg.textContent), reg.textContent);

  w=abrir(""); await espera(300);
  reg=w.document.querySelector("#regressiva");
  ok("no estudo contínuo, sem fogo", !/🔥/.test(reg.textContent), reg.textContent);

  /* ---- nome e abas maiores ---- */
  ok("o nome da plataforma cresceu", /\.brand h1\{font-size:25px/.test(html));
  ok("as abas ganharam caixa maior", /\.aba\{[^}]*?padding:10px 19px[^}]*?font-size:14\.5px/s.test(html));
  ok("e o texto da aba não selecionada saiu do cinza de desabilitado",
     /\.aba\{[^}]*?color:var\(--text-2\)/s.test(html));
  const abas=[...w.document.querySelectorAll(".aba")];
  ok("as 7 abas continuam lá", abas.length===7, abas.map(a=>a.textContent));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncabeçalho ajustado");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
