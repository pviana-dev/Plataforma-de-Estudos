const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));

(async()=>{try{
  // gera o plano da sessão
  await passo(()=>{ click(doc.querySelector('[data-aba="registros"]')); });
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-registro"]')); });
  await passo(()=>{ $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); });
  let antes;
  await passo(()=>{
    antes=lerDb().revisoes.map(r=>r.data).sort().join(",");
    ok("a sessão tem um plano de revisões", antes.length>0, antes);
    ok("o compositor não fala mais em questão",
       !/questão te ensinou/.test(doc.documentElement.innerHTML));
  });

  // 3 anotações de desatenção no mesmo conteúdo — antes isso somava +1 revisão
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>/LAI$/.test(o.textContent)).value; change(s); });
  for (const txt of ["li rápido demais","troquei os incisos","não vi o 'exceto'"]){
    await passo(()=>{ if(!$("#txtNovo")) click(doc.querySelector('[data-acao="abrir-composer"]')); });
    await passo(()=>{ $("#txtNovo").value=txt; click(doc.querySelector('[data-acao="salvar-aprendizado"]')); });
  }
  // classifica as três como desatenção
  for (let i=0;i<3;i++){
    await passo(()=>{ click(doc.querySelectorAll('[data-acao="editar-erro"]')[i]); });
    // o tipo do erro só vale quando a anotação veio de uma questão
    await passo(()=>{ const f=$("#formEdicaoErro");
      const sim=f.querySelector('[name="daQuestao"][value="sim"]');
      sim.checked=true; sim.dispatchEvent(new w.Event("change",{bubbles:true}));
      f.querySelector("[name=categoria]").value="bobo";
      f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); });
  }
  await passo(()=>{
    const d=lerDb();
    ok("as 3 anotações de desatenção foram gravadas",
       d.erros.filter(e=>e.categoria==="bobo").length===3, d.erros.map(e=>e.categoria));
    ok("o cronograma NÃO mudou por causa delas", d.revisoes.map(r=>r.data).sort().join(",")===antes,
       {antes, depois:d.revisoes.map(r=>r.data).sort().join(",")});
  });

  // as telas de revisão não mencionam mais desatenção
  await passo(()=>{ click(doc.querySelector('[data-aba="revisoes"]')); });
  await passo(()=>{
    ok("a Rotina não mostra selo de desatenção", !/desatenção/i.test($("#view").textContent), 
       ($("#view").textContent.match(/desatenção[^.]*/)||[""])[0]);
    ok("nem o texto de como o cronograma é montado", !/desatenção/i.test($("#view").innerHTML));
  });
  await passo(()=>{ click(doc.querySelector('[data-aba="hoje"]')); });
  await passo(()=>{
    // a dica rotativa de estudo pode citar desatenção; o que importa são os cards de revisão
    const cards=[...doc.querySelectorAll("#view .item")].map(e=>e.textContent).join(" ");
    ok("os cards de revisão da aba Hoje não mencionam", !/desatenção/i.test(cards),
       (cards.match(/.{0,50}desatenção.{0,50}/i)||[""])[0]); });
  await passo(()=>{ click(doc.querySelector('[data-aba="painel"]')); });
  await passo(()=>{ ok("o Painel também não", !/desatenção/i.test($("#view").textContent)); });

  /* A aba de Anotações também deixou de medir DESEMPENHO: taxa de acerto e
     "por desatenção" saíram dos blocos dela. O que se anota ali vem de questão
     ou não — desempenho tem a aba Questões inteira. A contagem de questões
     ficou, como contexto. */
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });
  await passo(()=>{
    const t=$("#view").textContent;
    ok("a aba de anotações não mede mais desatenção", !/Por desatenção/.test(t),
       (t.match(/.{0,40}desatenção.{0,30}/i)||[""])[0]);
    ok("nem taxa de acerto", !/Taxa de acerto/.test(t),
       (t.match(/.{0,40}Taxa de acerto.{0,20}/)||[""])[0]);
    ok("mantém a quantidade de questões como contexto",
       /Questões do conteúdo|Questões da disciplina/.test(t));
    ok("e a contagem de pontos anotados", /Pontos anotados/.test(t));
    ok("sem o 'N refeitas e acertadas' embaixo dela", !/refeitas e acertadas/.test(t),
       (t.match(/.{0,40}refeitas.{0,20}/)||[""])[0]);
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nanotações e revisões estão separadas");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
