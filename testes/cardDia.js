const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  {id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:90,questoes:10,acertos:4,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"},
  {id:"r2",data:hoje,disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2,tipo:"revisao"}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join("");

(async()=>{try{
  click(doc.querySelector('[data-aba="painel"]')); await espera(350);
  click(doc.querySelector('.cal-dia[data-dia="'+hoje+'"]')); await espera(250);   // o Progresso abre no panorama (R5): escolhe hoje
  const c=$(".dia-info");
  console.log("  card do dia: "+c.textContent.replace(/\s+/g," ").slice(0,150));

  /* ---- cores do calendário ---- */
  ok("a rampa do calendário deixou de ser azul escura", !/--seq4:#1c5cab/.test(css));
  ok("e virou a rampa verde da identidade", /--seq4:#93bdb1/.test(css));
  ok("no escuro também", /--seq4:#466d61/.test(css));

  /* ---- card do dia ---- */
  ok("o cabeçalho traz dia da semana e data", !!c.querySelector(".dia-cab b") &&
     /\d\d\/\d\d\/\d{4}/.test(c.querySelector(".dia-cab b").textContent), c.querySelector(".dia-cab b").textContent);
  ok("marca quando o dia é hoje", /hoje/.test(c.querySelector(".dia-rot").textContent),
     c.querySelector(".dia-rot").textContent);
  const nums=[...c.querySelectorAll(".dia-numeros div")].map(d=>d.textContent.replace(/\s+/g," "));
  console.log("  números: "+nums.join(" | "));
  ok("três números em colunas: tempo, questões, acerto", nums.length===3, nums);
  ok("o tempo soma o dia (1h30 + 30min = 2h)", /2h/.test(nums[0]), nums[0]);
  ok("a taxa de 40% sai pintada de crítico", !!c.querySelector(".dia-numeros b.t-critico"),
     c.querySelector(".dia-numeros b").className);
  ok("a barra da meta mostra a porcentagem", /% da meta/.test(c.querySelector(".dia-meta").textContent),
     c.querySelector(".dia-meta").textContent);
  const itens=[...c.querySelectorAll(".dia-lista li")];
  ok("cada registro do dia vira uma linha", itens.length===2, itens.length);
  ok("com etiqueta de tipo", itens.every(i=>!!i.querySelector(".badge")),
     itens.map(i=>i.textContent.replace(/\s+/g," ")));
  ok("e a revisão se distingue", itens.some(i=>i.classList.contains("rev")));
  ok("o tempo de cada um fica alinhado à direita", itens.every(i=>!!i.querySelector(".dia-tempo")),
     itens.map(i=>i.querySelector(".dia-tempo") && i.querySelector(".dia-tempo").textContent));
  ok("o cabeçalho da lista conta os registros e as revisões", /2 registros · 1 item da agenda/.test(c.textContent.replace(/\s+/g," ")),
     c.textContent.replace(/\s+/g," ").match(/\d+ registros[^N]{0,20}/));

  /* ---- sem dia escolhido ---- */
  click(doc.querySelector('.dia-cab [data-acao="sel-dia"]')); await espera(300);
  const vazio=$(".dia-info");
  ok("sem dia, o card explica o que fazer", vazio.classList.contains("vazia") &&
     /Clique num dia/.test(vazio.textContent), vazio.textContent.replace(/\s+/g," ").slice(0,90));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncalendário e card do dia ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
