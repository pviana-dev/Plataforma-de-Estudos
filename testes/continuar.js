/* Continuar um conteúdo a partir de uma sessão anterior: um clique abre a
   sessão de hoje já com disciplina e conteúdos, sem mexer no agendamento. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:dia(-3),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:90,questoes:10,acertos:7,dificuldade:3,anotacoes:"parei no art. 12",tipo:"estudo",
  criadoEm:Number(id.slice(1))},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  /* ---- a coluna Tipo mudou de lugar e a ação ficou na ponta ---- */
  let w=abrir(base({registros:[sess("r1")]})); await espera(450);
  let doc=w.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const cabecalhos=[...doc.querySelectorAll("#view thead th")].map(t=>t.textContent.trim());
  ok("as colunas são data, disciplina, tempo, conteúdos, dificuldade, tipo e ação",
     cabecalhos.join("|")==="Data|Disciplina|Tempo|Conteúdos|Dificuldade|Tipo|", cabecalhos);
  ok("a coluna de revisões saiu da lista", !cabecalhos.includes("Revisões"), cabecalhos);
  ok("e a última coluna é a da ação", cabecalhos[cabecalhos.length-1]==="", cabecalhos);
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1");
  ok("sessão de outro dia tem o botão de continuar",
     !!linha.querySelector('[data-acao="continuar-sessao"]'),
     [...linha.querySelectorAll("td")].map(td=>td.className));
  ok("o botão fica na última célula",
     [...linha.querySelectorAll("td")].pop().querySelector('[data-acao="continuar-sessao"]') !== null);
  ok("a coluna de conteúdos absorve o espaço e tem largura mínima",
     /\.tab-sessoes \.col-larga\{width:100%;min-width:26ch\}/.test(html) &&
     /\.tab-sessoes \.col-curta\{width:1%\}/.test(html));
  ok("as colunas curtas que podem quebram linha, para sobrar largura",
     /\.tab-sessoes \.col-curta \.badge\{white-space:normal\}/.test(html) &&
     /\.tab-sessoes \.col-nowrap\{white-space:nowrap\}/.test(html));
  const cel=[...linha.querySelectorAll("td")];
  ok("sobraram sete colunas", cel.length===7, cel.map(c=>c.className));
  ok("data, tempo, dificuldade e tipo não quebram",
     [0,2,4,5].every(i=>cel[i].className.includes("col-nowrap")), cel.map(c=>c.className));
  ok("só disciplina e conteúdos podem quebrar",
     !cel[1].className.includes("col-nowrap") && cel[3].className.includes("col-larga"),
     [cel[1].className, cel[3].className]);

  /* ---- os sinais de plano acompanham o nome do conteúdo ---- */
  const wSem=abrir(base({registros:[sess("r1",{plano:"sem"})]}));
  await espera(450);
  // a linha do separador de dia vem antes: pegar a célula da sessão, não dela
  const linhaSem=[...wSem.document.querySelectorAll("tbody tr[data-id]")][0];
  const celConteudo=[...linhaSem.querySelectorAll("td")][3];
  ok("sessão sem cronograma avisa junto do conteúdo",
     /sem revisão/.test(celConteudo.textContent), celConteudo.textContent.replace(/\s+/g," "));
  /* plano feito à mão já teve etiqueta "manual" aqui; ela saiu por aparecer em
     quase toda linha sem mudar nada do que se faz na lista */
  const wMan=abrir(base({registros:[sess("r5",{plano:"manual"})]}));
  await espera(450);
  const linhaMan=[...wMan.document.querySelectorAll("tbody tr[data-id]")][0];
  const celMan=[...linhaMan.querySelectorAll("td")][3];
  ok("plano manual não ganha mais etiqueta na lista",
     !/manual/i.test(celMan.textContent), celMan.textContent.replace(/\s+/g," "));

  const wNormal=abrir(base({registros:[sess("r9")]}));
  await espera(450);
  const linhaOk=[...wNormal.document.querySelectorAll("tbody tr[data-id]")][0];
  ok("e a sessão comum não ganha etiqueta nenhuma ali",
     ![...linhaOk.querySelectorAll("td")][3].querySelector(".badge"),
     [...linhaOk.querySelectorAll("td")][3].innerHTML);

  /* ---- continuar abre a sessão de hoje já preenchida ---- */
  click(linha.querySelector('[data-acao="continuar-sessao"]')); await espera(450);
  ok("abre o formulário de uma sessão nova", $("#modalTitulo").textContent==="Registrar sessão",
     $("#modalTitulo").textContent);
  ok("com a data de hoje", $('#modalCaixa [name="data"]').value===hoje, $('#modalCaixa [name="data"]').value);
  ok("a disciplina vem preenchida", $("#modalCaixa select.sel-disciplina").value==="Legislação",
     $("#modalCaixa select.sel-disciplina").value);
  ok("e o conteúdo também",
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto).join()==="LAI",
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto));
  // continuar também pede a dificuldade de HOJE: ela é obrigatória e sem padrão (decisão do Pedro, 23/09)
  ok("a dificuldade não vem preenchida: você escolhe a de hoje", $('#modalCaixa [name="dificuldade"]').value==="",
     $('#modalCaixa [name="dificuldade"]').value);
  $('#modalCaixa [name="dificuldade"]').value="3";
  ok("o tempo começa vazio, é sessão nova", !$('#modalCaixa [name="minutos"]').value,
     $('#modalCaixa [name="minutos"]').value);
  ok("e a descrição também, que é o que separa uma sessão da outra",
     !$('#modalCaixa [name="anotacoes"]').value, $('#modalCaixa [name="anotacoes"]').value);

  $('#modalCaixa [name="minutos"]').value="45";
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(500);
  let d=db(w);
  ok("a sessão nova é gravada, sem mexer na antiga",
     d.registros.length===2 && d.registros.find(r=>r.id==="r1").minutos===90,
     d.registros.map(r=>[r.data,r.minutos]));
  ok("e o agendamento não duplica: uma volta só",
     d.revisoes.filter(r=>!r.feita).length===1, d.revisoes.map(r=>[r.registroId,r.data]));

  /* ---- sessão de HOJE não tem o botão: continuar nela é somar horas ali ---- */
  w=abrir(base({registros:[sess("r1"), sess("r2",{data:hoje,minutos:30})]})); await espera(450);
  doc=w.document; $=s=>doc.querySelector(s);
  const deHoje=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r2");
  const deOntem=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1");
  ok("a sessão de hoje NÃO traz o botão", !deHoje.querySelector('[data-acao="continuar-sessao"]'),
     [...deHoje.querySelectorAll("td")].pop().innerHTML);
  ok("e a de outro dia continua trazendo", !!deOntem.querySelector('[data-acao="continuar-sessao"]'));

  /* ---- continuar a partir de uma sessão antiga, havendo uma de hoje ---- */
  const l1=deOntem;
  l1.querySelector('[data-acao="continuar-sessao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  ok("havendo sessão de hoje do mesmo conteúdo, ela é que abre",
     $("#modalTitulo").textContent==="Editar sessão" && $('#modalCaixa [name="minutos"]').value==="30",
     [$("#modalTitulo").textContent, $('#modalCaixa [name="minutos"]').value]);
  ok("e a plataforma explica", /o tempo entra nela/.test($("#toast").textContent), $("#toast").textContent);

  /* ---- a sessão nova cumpre o lembrete atrasado daquele conteúdo ---- */
  w=abrir(base({registros:[sess("r1")],
    revisoes:[{id:"v1",registroId:"r1",data:dia(-1),ordem:1,retomada:true,feita:false,manual:false,
      minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(450);
  doc=w.document; $=s=>doc.querySelector(s);
  [...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1")
    .querySelector('[data-acao="continuar-sessao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  $('#modalCaixa [name="minutos"]').value="60";
  $('#modalCaixa [name="dificuldade"]').value="3";
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(500);
  d=db(w);
  ok("continuar dá por cumprido o lembrete que estava atrasado",
     d.revisoes.find(r=>r.id==="v1").feita===true, d.revisoes.map(r=>[r.id,r.data,r.feita]));
  ok("e o próximo nasce a partir de hoje",
     d.revisoes.filter(r=>!r.feita).length===1 && d.revisoes.find(r=>!r.feita).data > hoje,
     d.revisoes.filter(r=>!r.feita).map(r=>r.data));

  /* ---- o botão também está na tela de edição da sessão antiga ---- */
  w=abrir(base({registros:[sess("r1")]})); await espera(450);
  doc=w.document; $=s=>doc.querySelector(s);
  [...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1").querySelector("td")
    .dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("a tela de edição de uma sessão antiga oferece continuar hoje",
     !!doc.querySelector('#modalCaixa [data-acao="continuar-sessao"]'),
     doc.querySelector("#modalCaixa > .acoes-form").textContent);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncontinuar conteúdo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
