/* DECISÕES DO PEDRO SOBRE A REVISÃO DE UX (27/09):
   R1 exemplo que não parece valor ("ex.: 60"; o padrão, "padrão: …");
   R2 sem o número "Na agenda" no topo da Agenda;
   R4 o aviso do card da prova com o atalho "Abrir Ajustes";
   R5 (Progresso no panorama) está em painel, paineldia, calendario e virada. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const seed=()=>({versao:1,tema:"claro",objetivo:"concurso",dataProva:dia(40),revisarAte:"",metaDiariaMin:120,
  disciplinas:["Legislação"],grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,
  planosManuaisMigrados:true,conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
  registros:[{id:"r1",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,acertos:0,
    dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1}],revisoes:[],erros:[],cronometro:null});
function abrir(aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed()));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));

(async()=>{try{
  /* ---- R1 ---- */
  let w=abrir("registros"); await espera(500);
  click(w,w.document.querySelector('tbody tr[data-id="r1"]')); await espera(450);
  const ph=n=>(w.document.querySelector('#modalCaixa [name="'+n+'"]')||{}).placeholder;
  ok("R1: tempo, questões e acertos com 'ex.:'", ph("minutos")==="ex.: 60" && ph("questoes")==="ex.: 20" && ph("acertos")==="ex.: 14",
     [ph("minutos"),ph("questoes"),ph("acertos")]);
  const soNumero=[...html.matchAll(/placeholder="(\d+)"/g)].map(m=>m[1]);
  ok("R1: nenhum exemplo só com número no app", !soNumero.length, soNumero);

  /* ---- R2 ---- */
  w=abrir("revisoes"); await espera(500);
  const rotulos=[...w.document.querySelectorAll("#view .tiles .rot")].map(e=>e.textContent);
  ok("R2: o topo da Agenda não tem mais o 'Na agenda'", !rotulos.includes("Na agenda") && rotulos.includes("Atrasados"), rotulos);

  /* ---- R4 ---- */
  w=abrir("hoje"); await espera(500);
  const doc=w.document, toast=doc.getElementById("toast");
  click(w,doc.querySelector('[data-acao="info-datas"]')); await espera(100);
  const botao=toast.querySelector("button");
  ok("R4: tocar no card da prova avisa e oferece 'Abrir Ajustes'",
     toast.classList.contains("show") && /alterada nos Ajustes/.test(toast.textContent) && !!botao && botao.textContent==="Abrir Ajustes",
     toast.textContent);
  ok("R4: o botão usa o atalho do app", botao && botao.classList.contains("act") && botao.classList.contains("atalho"));
  ok("R4: o toque por engano não abriu nada", !doc.getElementById("formAjustes"));
  click(w,botao); await espera(250);
  ok("R4: o botão abre os Ajustes e fecha o aviso", !!doc.getElementById("formAjustes") && !toast.classList.contains("show"));
  ok("R4: o aviso só recebe toque quando tem botão e está visível",
     /\.toast\.com-acao\.show\{pointer-events:auto\}/.test(html) && !/\.toast\.com-acao\{[^}]*pointer-events:auto/.test(html));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndecisões de UX de 27/09 no lugar");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
