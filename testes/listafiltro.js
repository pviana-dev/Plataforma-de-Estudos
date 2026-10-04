/* OS FILTROS ABREM A LISTA DO APP (04/10). Todo filtro é como o de Disciplinas da
   aba Questões: a caixa abre uma lista logo abaixo, e não a lista do sistema. O
   <select> fica escondido guardando o valor; os campos de formulário não mudam. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,disc,ass)=>({id,data:dia(-1),disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",plano:"individual",criadoEm:Number(id.slice(1))});
const seed={versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas:["Direito","Português"],lancamentos:[],grupos:[],
  conteudos:[{id:"c1",disciplina:"Direito",nome:"LAI",fase:"andamento",criadoEm:1},{id:"c2",disciplina:"Português",nome:"Crase",fase:"andamento",criadoEm:2}],
  conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
  registros:[sess("r1","Direito","LAI"),sess("r2","Português","Crase")],revisoes:[],erros:[],cronometro:null};
function abrir(aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje})); }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));

(async()=>{try{
  let w=abrir("conteudos"); await espera(500); let doc=w.document;
  const caixa=()=>doc.querySelector('#cDisciplina + .lista-unica');
  ok("o filtro de disciplina vira a lista do app", !!caixa() && doc.querySelector("#cDisciplina").hidden);
  ok("a caixa mostra o escolhido", caixa().querySelector(".multi-caixa").textContent.includes("Todas as disciplinas"));
  click(w,caixa().querySelector(".multi-caixa")); await espera(50);
  ok("clicar abre a lista", caixa().classList.contains("aberto"));
  click(w,doc.querySelector("h2")); await espera(50);
  ok("clicar fora fecha", !caixa().classList.contains("aberto"));
  click(w,caixa().querySelector(".multi-caixa")); await espera(50);
  doc.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Escape",bubbles:true})); await espera(50);
  ok("Esc fecha", !caixa().classList.contains("aberto"));
  click(w,caixa().querySelector(".multi-caixa"));
  click(w,[...caixa().querySelectorAll(".op-unica")].find(b=>b.textContent==="Português")); await espera(300);
  const blocos=[...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(s=>s.textContent);
  ok("escolher filtra de verdade", JSON.stringify(blocos)==='["Português"]', blocos);
  ok("e a escolhida vem marcada", caixa().querySelector('[aria-selected="true"]').textContent==="Português");
  ok("a dificuldade do conteúdo (não é filtro) continua caixa do navegador",
     !doc.querySelector(".sel-dif-cont").hidden && !doc.querySelector(".sel-dif-cont + .lista-unica"));

  w=abrir("registros"); await espera(500); doc=w.document;
  ok("Sessões: período, tipo e ordem também", ["fPeriodo","fTipo","fOrdem"].every(id=>doc.querySelector("#"+id+" + .lista-unica")));
  const per=doc.querySelector("#fPeriodo + .lista-unica");
  click(w,per.querySelector(".multi-caixa"));
  click(w,[...per.querySelectorAll(".op-unica")].find(b=>b.textContent==="A partir de hoje")); await espera(300);
  ok("e escolher o período filtra", /Nenhuma|nenhuma/.test(doc.getElementById("view").textContent) ||
     doc.querySelector("#fPeriodo").value==="futuro", doc.querySelector("#fPeriodo").value);

  w=abrir("erros"); await espera(500); doc=w.document;
  ok("Anotações: disciplina e conteúdo também", !!doc.querySelector("#eDisciplina + .lista-unica") && !!doc.querySelector("#eAssunto + .lista-unica"));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nlista dos filtros: abre abaixo da caixa, nas cores do app");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
