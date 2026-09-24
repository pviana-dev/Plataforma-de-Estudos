/* Sessão que atravessa a meia-noite: começa 23h30 do dia X e termina 0h30 do
   dia X+1. Ao parar, a pessoa escolhe (decisão do Pedro, 23/09):
   - tudo no dia X, o dia em que a sessão começou (seções 1 a 3);
   - dividir: 30min ficam na sessão do dia X e 30min vão para uma sessão nova
     do dia X+1, criada sozinha, igual à original (seções 4 a 6). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};

/* O relógio do teste: "agora" são 0h30 de hoje; o cronômetro começou 23h30 de
   ontem. Uma hora cravada, atravessando a virada. */
const agora=new Date(); agora.setHours(0,30,0,0);
const fimTs=agora.getTime(), inicioTs=fimTs-60*60*1000;
const hoje=iso(new Date(fimTs)), ontem=iso(new Date(inicioTs));

const sess=(id,data)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",fase:"concluido",criadoEm:1});
function seed(destino){
  return {versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação"],
    conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:ontem}],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    grupos:[],lancamentos:[],registros:[sess("r1",ontem)],revisoes:[],erros:[],
    cronometro:{inicio:inicioTs,disciplina:"",assunto:"",
      destinoTipo:destino?"registro":null, destinoId:destino||null}};
}
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(s){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){
     w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"hoje",gravadoEm:hoje}));
     // o relógio congela às 0h30 de hoje, para a virada ser a do enunciado
     const R=w.Date, alvo=fimTs;
     const D2=function(...a){ return a.length ? new R(...a) : new R(alvo); };
     D2.now=()=>alvo; D2.parse=R.parse; D2.UTC=R.UTC; D2.prototype=R.prototype;
     w.Date=D2;
   }});
  return dom.window;
}
const dados=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  console.log("  (começou "+ontem+" 23:30, encerrou "+hoje+" 00:30)");

  /* ---- 1. somando numa sessão que já existe ---- */
  let w=abrir(seed("r1")); await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);
  const encerrar=$('[data-acao="crono-encerrar"]');
  ok("o cronômetro está rodando e dá para encerrar", !!encerrar);
  encerrar.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  const escolhas=[...doc.querySelectorAll('#modalCorpo [data-acao="crono-virada"]')];
  ok("parar depois da meia-noite pergunta para onde vão as horas", escolhas.length===2,
     $("#modalCorpo") && $("#modalCorpo").textContent.slice(0,160));
  ok("e a pergunta mostra a divisão por dia", /30min em .*30min em /.test($("#modalCorpo").textContent),
     $("#modalCorpo").textContent);
  escolhas.find(b=>b.dataset.dividir==="0").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  let reg=dados(w).registros.find(r=>r.id==="r1");
  ok("a hora foi somada à sessão", reg.minutos===90, reg.minutos);
  ok("o bloco ficou no dia em que COMEÇOU, não no dia em que terminou",
     reg.blocos[0].data===ontem, {bloco:reg.blocos[0].data, ontem, hoje});
  ok("as horas do intervalo continuam as de verdade (23:30 → 00:30)",
     reg.blocos[0].inicio==="23:30" && reg.blocos[0].fim==="00:30", reg.blocos[0]);
  ok("e fica registrado que a medição virou o dia", reg.blocos[0].viradas===1, reg.blocos[0]);

  /* ---- 2. a hora conta no dia de ontem, não no de hoje ---- */
  doc.querySelector('[data-aba="painel"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  const celula=d=>doc.querySelector('.cal-dia[data-dia="'+d+'"]');
  celula(ontem).dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const tileDia=[...doc.querySelectorAll("#view .tiles .tile")][0].textContent.replace(/\s+/g," ");
  ok("o painel mostra 1h30 no dia de ontem (30min da sessão + 1h cronometrada)",
     /1h ?e? ?30/.test(tileDia), tileDia);
  celula(hoje).dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  const tileHoje=[...doc.querySelectorAll("#view .tiles .tile")][0].textContent.replace(/\s+/g," ");
  ok("e nada em hoje — a madrugada não abriu um dia novo de estudo",
     /0min|00min/.test(tileHoje) && !/1h/.test(tileHoje), tileHoje);

  /* ---- 3. sessão nova: o formulário nasce com a data de ontem ---- */
  w=abrir(seed(null)); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  $('[data-acao="crono-encerrar"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  $('#modalCorpo [data-acao="crono-virada"][data-dividir="0"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  const campoData=$('#modalCorpo input[name="data"]') || $('input[name="data"]');
  ok("o registro pré-preenchido abre na data em que a sessão começou",
     campoData && campoData.value===ontem, campoData && campoData.value);
  const nota=$('[name="anotacoes"]');
  ok("e a anotação avisa que o fim foi no dia seguinte",
     nota && /23:30 → 00:30 do dia seguinte/.test(nota.value), nota && nota.value);


  /* ---- 4. fechar a pergunta sem responder não perde a medição ---- */
  w=abrir(seed("r1")); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  $('[data-acao="crono-encerrar"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  $('#overlay [data-acao="fechar-modal"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("fechando sem escolher, o cronômetro continua guardado, com a hora em que parou",
     !!dados(w).cronometro && dados(w).cronometro.parado===fimTs, dados(w).cronometro);

  /* ---- 5. DIVIDIR, somando numa sessão que já existe ---- */
  $('[data-acao="crono-encerrar"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  $('#modalCorpo [data-acao="crono-virada"][data-dividir="1"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  let d5=dados(w);
  const orig=d5.registros.find(r=>r.id==="r1"), nova=d5.registros.find(r=>r.id!=="r1");
  ok("dividindo, a sessão de ontem fica com o que foi até a meia-noite (30 + 30)", orig.minutos===60, orig.minutos);
  ok("e o bloco dela termina à meia-noite", orig.blocos.slice(-1)[0].fim==="24:00" && !orig.blocos.slice(-1)[0].viradas,
     orig.blocos.slice(-1)[0]);
  ok("nasce uma sessão de hoje com o resto (30min)", !!nova && nova.data===hoje && nova.minutos===30, nova);
  ok("igual à que iniciou o cronômetro (disciplina, conteúdo, tipo, dificuldade)",
     nova && nova.disciplina===orig.disciplina && nova.assuntos.join()===orig.assuntos.join() &&
     nova.tipo===orig.tipo && nova.dificuldade===orig.dificuldade, nova);
  ok("com o intervalo de hoje (00:00 → 00:30)", nova && nova.inicio==="00:00" && nova.fim==="00:30", nova);
  ok("e o cronômetro foi encerrado", !d5.cronometro, d5.cronometro);

  /* ---- 6. DIVIDIR numa sessão nova: ao salvar o formulário, nasce a de hoje ---- */
  w=abrir(seed(null)); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  $('[data-acao="crono-encerrar"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  $('#modalCorpo [data-acao="crono-virada"][data-dividir="1"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  const f6=$("#formRegistro");
  ok("o formulário abre com a parte de ontem (30min)", f6 && f6.querySelector('[name="minutos"]').value==="30" &&
     f6.querySelector('[name="data"]').value===ontem, f6 && [f6.querySelector('[name="minutos"]').value, f6.querySelector('[name="data"]').value]);
  const sd=f6.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(50);
  const sel=doc.querySelector("#campoAssunto");
  sel.value=[...sel.options].find(o=>o.value==="LAI").value;
  doc.querySelector('[data-acao="add-assunto"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  { const _d=$("#formRegistro [name=dificuldade]"); if (_d && !_d.value) _d.value="2"; }   // obrigatória, sem padrão
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(450);
  const d6=dados(w), novas=d6.registros.filter(r=>r.id!=="r1").sort((a,b)=>a.data.localeCompare(b.data));
  ok("salvando, ficam duas sessões: a de ontem e a de hoje", novas.length===2 &&
     novas[0].data===ontem && novas[1].data===hoje, novas.map(r=>r.data+":"+r.minutos));
  ok("cada uma com o seu tempo (30 + 30)", novas.length===2 && novas[0].minutos===30 && novas[1].minutos===30,
     novas.map(r=>r.minutos));
  ok("e a de hoje é igual à de ontem", novas.length===2 && novas[1].assuntos.join()===novas[0].assuntos.join() &&
     novas[1].dificuldade===novas[0].dificuldade, novas);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntempo da madrugada: tudo no dia em que começou, ou dividido por dia");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
