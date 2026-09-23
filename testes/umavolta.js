/* UM CONTEÚDO ABERTO, UMA VOLTA SÓ. Feita a primeira, a seguinte nasce dali —
   então nunca pode haver duas chamando o mesmo assunto ao mesmo tempo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass,d)=>({id,data:d||dia(-3),disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,
  questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const conts=["A","B","C"].map(n=>({disciplina:"Legislação",nome:n,fase:"andamento"}));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(registros, extra){
  const seed=Object.assign({versao:1,tema:"claro",dataProva:dia(90),metaDiariaMin:120,
   disciplinas:["Legislação"],lancamentos:[],conteudos:conts,
   conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
   registros,revisoes:[],erros:[],cronometro:null},extra||{});
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
/** quantas voltas ABERTAS cobrem cada conteúdo */
function cobertura(w){
  const d=db(w), por={};
  d.revisoes.filter(x=>!x.feita && x.retomada).forEach(x=>{
    const reg=d.registros.find(r=>r.id===x.registroId);
    const lista=(x.assuntos&&x.assuntos.length)?x.assuntos:(reg?reg.assuntos:[]);
    lista.forEach(a=>{ por[a]=(por[a]||0)+1; });
  });
  return por;
}
const semDuplicata=por=>Object.values(por).every(n=>n<=1);

(async()=>{try{
  /* ---- 1. os formatos que duplicavam ---- */
  const casos=[
    ["mesmo conteúdo, duas sessões",            [sess("r1",["A"]), sess("r2",["A"])],            ["A"]],
    ["um contém o outro: [A] e [A,B]",          [sess("r1",["A"]), sess("r2",["A","B"])],        ["A","B"]],
    ["mesmos conteúdos em ORDEM trocada",       [sess("r1",["A","B"]), sess("r2",["B","A"])],    ["A","B"]],
    ["cadeia: [A,B] e [B,C]",                   [sess("r1",["A","B"]), sess("r2",["B","C"])],    ["A","B","C"]],
    ["o maior é o mais NOVO",                   [sess("r1",["A"],dia(-9)), sess("r2",["A","B"],hoje)], ["A","B"]],
    ["o maior é o mais VELHO",                  [sess("r1",["A","B"],dia(-9)), sess("r2",["A"],hoje)], ["A","B"]]
  ];
  for (const [nome, registros, esperados] of casos){
    const w=abrir(registros); await espera(650);
    const por=cobertura(w);
    ok(nome+": nenhum conteúdo chamado duas vezes", semDuplicata(por), por);
    ok(nome+": e todos são chamados", esperados.every(a=>por[a]===1), {por, esperados});
  }

  /* ---- 2. a ordem dos conteúdos não cria assunto novo ---- */
  let w=abrir([sess("r1",["A","B"]), sess("r2",["B","A"])]); await espera(650);
  ok("duas sessões com os mesmos conteúdos em ordem trocada são a MESMA coisa",
     db(w).revisoes.filter(r=>!r.feita).length===1, db(w).revisoes.map(r=>[r.registroId,r.assuntos]));

  /* ---- 3. feita a volta, a seguinte nasce — e continua sendo uma só ---- */
  w=abrir([sess("r1",["A"]), sess("r2",["A","B"])]); await espera(650);
  ok("começa com o mínimo de voltas", db(w).revisoes.filter(r=>!r.feita&&r.retomada).length>=1);
  const antes=cobertura(w);
  ok("sem duplicata no começo", semDuplicata(antes), antes);
  // marca a primeira volta como feita, pela caixa da agenda
  const doc=w.document;
  const check=doc.querySelector('.rev-linha [data-acao="concluir"], [data-acao="concluir"]');
  if (check){ check.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(500); }
  const dep=cobertura(w);
  ok("depois de cumprir uma, ainda não há conteúdo chamado duas vezes", semDuplicata(dep), dep);

  /* ---- 4. conteúdo concluído não ganha volta ---- */
  w=abrir([sess("r1",["A"]), sess("r2",["B"])],
    {conteudos:[{disciplina:"Legislação",nome:"A",fase:"concluido",concluidoEm:dia(-3)},
                {disciplina:"Legislação",nome:"B",fase:"andamento"},
                {disciplina:"Legislação",nome:"C",fase:"andamento"}]});
  await espera(650);
  const por4=cobertura(w);
  ok("conteúdo concluído fica fora das voltas", !por4["A"], por4);
  ok("e o que está em andamento continua coberto", por4["B"]===1, por4);

  /* ---- 5. a volta diz de que conteúdos ela fala ---- */
  w=abrir([sess("r1",["A"]), sess("r2",["A","B"])]); await espera(650);
  const volta=db(w).revisoes.find(r=>r.retomada && !r.feita);
  ok("a volta guarda os conteúdos que cobre", Array.isArray(volta.assuntos) && volta.assuntos.length>0,
     volta);
  ok("mas não guarda disciplina — ela vem da sessão dona", !volta.disciplina, volta);
  ok("e a tela mostra esses conteúdos", volta.assuntos.every(a=>w.document.querySelector("#view").textContent.includes(a)),
     w.document.querySelector("#view").textContent.replace(/\s+/g," ").slice(0,160));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\num conteúdo aberto, uma volta só");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
