/* O tipo Estudo/Revisão foi aposentado: com a fase do conteúdo respondendo
   "isto ainda está aberto?", ele virou rótulo sem função. O que já estava
   marcado assim continua legível e editável, sem mudar de tipo sozinho. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
async function abrirSessao(w,id){
  const doc=w.document;
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
  linha.querySelector("td").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(350);
}

(async()=>{try{
  /* ---- 1. sessão nova não oferece mais o tipo ---- */
  let w=abrir(base({registros:[sess("r1")]})); await espera(400);
  await abrirSessao(w,"r1");
  let tipos=[...w.document.querySelectorAll('#modalCaixa [name="tipo"]')].map(i=>i.value);
  ok("sobraram dois tipos: estudo e revisão", tipos.join()==="estudo,revisao", tipos);
  ok("e nenhum rótulo fala em Estudo/Revisão",
     !/Estudo\/Revis/.test(w.document.querySelector("#modalCorpo").textContent),
     w.document.querySelector("#modalCorpo").textContent.slice(0,150));

  /* ---- 2. o filtro também deixa de oferecer ---- */
  w.document.querySelector('[data-acao="cancelar-edicao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  const fTipo=w.document.querySelector("#fTipo");
  ok("o filtro de tipos encolheu", [...fTipo.options].map(o=>o.value).join()==="todos,estudo,revisao",
     [...fTipo.options].map(o=>o.value));

  /* ---- 3. dado antigo continua legível e não muda sozinho ---- */
  w=abrir(base({registros:[sess("r1",{tipo:"misto",revisaoId:"v1"})],
    revisoes:[{id:"v1",registroId:"r1",data:hoje,ordem:1,feita:true,feitaEm:hoje,sessaoId:"r1",manual:false,
      minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(400);
  ok("a sessão antiga ainda mostra o rótulo na lista",
     /estudo\/revisão/.test(w.document.querySelector("#view").textContent),
     w.document.querySelector("#view").textContent.slice(0,200));
  await abrirSessao(w,"r1");
  tipos=[...w.document.querySelectorAll('#modalCaixa [name="tipo"]')].map(i=>i.value);
  ok("editando ela, o tipo antigo aparece para não se perder", tipos.includes("misto"), tipos);
  ok("marcado como rótulo antigo",
     /rótulo antigo/.test(w.document.querySelector("#modalCorpo").textContent));
  ok("e vem selecionado", w.document.querySelector('#modalCaixa [name="tipo"]:checked').value==="misto");
  w.document.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  ok("salvar sem mexer no tipo mantém o que era", db(w).registros[0].tipo==="misto", db(w).registros[0].tipo);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntipo estudo/revisão aposentado");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
