const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* O conteúdo agora se escolhe numa lista. Este atalho faz o que a pessoa faz:
   escolhe "criar novo", digita o nome e clica em adicionar. */
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const existe=[...sel.options].some(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (existe){ sel.value=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase()).value; }
  else {
    sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
    const campo=doc.querySelector("#novoConteudoNome"); if (!campo) return false;
    campo.value=nome;
  }
  const bt=doc.querySelector('[data-acao="add-assunto"]');
  bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return true;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const base=(prova)=>({versao:1,tema:"claro",dataProva:prova,metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null});
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const abrir=seed=>new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
  beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  /* ---- 1. prova que já passou ---- */
  const passada=abrir(base(dia(-10)));
  await espera(300);
  const wp=passada.window, dp=wp.document;
  ok("prova passada: o topo diz há quantos dias foi", /desde a prova/.test(dp.getElementById("regressiva").textContent),
     dp.getElementById("regressiva").textContent);
  dp.querySelector('[data-aba="registros"]').dispatchEvent(new wp.MouseEvent("click",{bubbles:true}));
  await espera(200);
  dp.querySelector('[data-acao="editar-registro"]').dispatchEvent(new wp.MouseEvent("click",{bubbles:true}));
  await espera(200);
  dp.querySelector("#modalCorpo #formRegistro").dispatchEvent(new wp.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
  const revsPassada=JSON.parse(wp.localStorage.getItem("plataforma-estudos:v1")).revisoes;
  // a prova passada não para nada sozinha: parar é escolher "encerrei" (decisão do Pedro, 23/09)
  ok("com a prova no passado, o agendamento segue", revsPassada.length>0, revsPassada.length);

  /* ---- 2. sem data de prova ---- */
  const livre=abrir(base(""));
  await espera(300);
  const w=livre.window, doc=livre.window.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  ok("sem data, a contagem de dias até a prova some", $("#regressiva").hidden && !$("#regressiva").textContent.trim(),
     $("#regressiva").textContent);
  ok("e o card das datas mostra só hoje", /Hoje/.test($("#chipData").textContent) && !/Prova|Sem objetivo/.test($("#chipData").textContent),
     $("#chipData").textContent);
  click(doc.querySelector('[data-aba="registros"]')); await espera(200);
  click(doc.querySelector('[data-acao="editar-registro"]')); await espera(200);
  ok("o formulário fala em ritmo, não em data", /no seu ritmo/.test($("#modalCorpo").textContent) ||
     !/agenda automaticamente as revisões até/.test($("#modalCorpo").textContent), $("#modalCorpo").textContent.slice(0,120));
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
  const revs=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).revisoes;
  ok("sem data, as revisões SÃO agendadas", revs.length>0, revs.length);
  const offsets=revs.map(r=>Math.round((new Date(r.data)-new Date(hoje))/864e5)).sort((a,b)=>a-b);
  console.log("      intervalos gerados: D+"+offsets.join(", D+"));
  ok("seguem os intervalos clássicos crescentes",
     offsets[0]<=3 && offsets.every((d,i)=>i===0||d>offsets[i-1]), offsets);
  // a escada agora vai até onde o horizonte deixa (180 dias, sem prova nem teto)
  ok("crescem até o horizonte, sem passar dele", offsets[offsets.length-1]<=180, offsets);
  ok("e os saltos ficam cada vez maiores",
     offsets.every((d,i)=>i<2||(d-offsets[i-1])>=(offsets[i-1]-offsets[i-2])), offsets);

  /* ---- 3. a revisão manual deixa de ser recusada ---- */
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(200);
  click(doc.querySelector('[data-acao="nova-revisao"]')); await espera(250);
  const f=$("#modalCorpo #formRevisao");
  f.querySelector("[name=data]").value=dia(20);
  f.querySelector("select.sel-disciplina").value="Legislação";
  porConteudo(doc, w, "LAI");
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
  ok("dá para lançar revisão em qualquer data futura",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).revisoes.some(r=>r.data===dia(20)),
     $("#erroRevisao") && $("#erroRevisao").textContent);

  /* ---- 4. alternar entre os dois modos pelos ajustes ---- */
  doc.getElementById("btnAjustes").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(200);
  const radio=v=>$('#formAjustes [name=objetivo][value="'+v+'"]');
  ok("os ajustes trazem o seletor de objetivo", !!radio("livre") && !!radio("concurso") && !!radio("vestibular"));
  ok("e ele vem em Sem objetivo", radio("livre").checked);
  ok("o painel da data começa fechado", !$("#painelConcurso").classList.contains("aberto"));
  radio("concurso").checked=true; radio("concurso").dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("escolher Concurso abre o campo de data", $("#painelConcurso").classList.contains("aberto"));
  $("#campoDataProva").value=dia(40);
  $("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
  ok("marcar uma prova volta a contagem regressiva", /para a prova/.test($("#regressiva").textContent),
     $("#regressiva").textContent);
  const db4=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
  // a prova não é mais teto: o que se pede é só que nada caia no dia dela
  ok("e o cronograma foi refeito sem nada no dia da prova",
     !db4.revisoes.some(r=>!r.manual && r.data===dia(40)),
     db4.revisoes.map(r=>r.data));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nmodo sem data de prova funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
