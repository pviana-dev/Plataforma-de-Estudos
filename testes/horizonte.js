const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const dia=n=>iso(new Date(Date.now()+n*864e5));
const sessao=(id,data)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",fase:"concluido",criadoEm:1});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  disciplinas:["Legislação"],grupos:[],lancamentos:[],registros:[sessao("r1",hoje)],revisoes:[],erros:[],
  cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const offsets=w=>db(w).revisoes.map(r=>Math.round((new Date(r.data)-new Date(hoje))/864e5)).sort((a,b)=>a-b);
async function salvarSessao(w){                 // regrava a sessão para disparar o replanejamento
  const doc=w.document;
  doc.querySelector('[data-aba="registros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  doc.querySelector('[data-acao="editar-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  doc.querySelector("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
}
async function ajustes(w, fn){
  const doc=w.document;
  doc.getElementById("btnAjustes").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  fn(doc);
  doc.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(350);
}

(async()=>{try{
  /* ---- 1. sem prova e sem teto: horizonte livre de 180 dias ---- */
  let w=abrir(base()); await espera(350);
  await salvarSessao(w);
  let o=offsets(w);
  console.log("  sem teto:", "D+"+o.join(", D+"));
  ok("a escada cresce e para dentro do horizonte livre", o.length>=6 && o[o.length-1]<=180, o);
  ok("começa cedo, como manda a curva do esquecimento", o[0]<=3, o);

  /* ---- 2. teto de um ano: mais revisões, até um ano ---- */
  w=abrir(base({revisarAte:dia(365)})); await espera(350);
  await salvarSessao(w);
  o=offsets(w);
  console.log("  teto de 1 ano:", "D+"+o.join(", D+"));
  ok("com um ano de teto, cabem mais revisões", o.length>=7, o);
  ok("e nenhuma passa do teto", o[o.length-1]<=365, o);
  ok("os saltos continuam crescendo", o.every((d,i)=>i<2||(d-o[i-1])>=(o[i-1]-o[i-2])), o);

  /* ---- 3. teto curto: o plano encolhe e respeita o teto ---- */
  w=abrir(base({revisarAte:dia(20)})); await espera(350);
  await salvarSessao(w);
  o=offsets(w);
  console.log("  teto de 20 dias:", "D+"+o.join(", D+"));
  ok("com teto curto, nada é agendado depois dele", o.every(d=>d<=20), o);
  ok("e ainda assim há revisões", o.length>=3, o);

  /* ---- 4. mudar o teto pela tela de ajustes replaneja ---- */
  await ajustes(w, doc=>{ doc.querySelector('[name="revisarAte"]').value=dia(120); });
  o=offsets(w);
  console.log("  teto movido para 120 dias:", "D+"+o.join(", D+"));
  ok("esticar o teto cria as revisões que faltavam", o.length>=5, o);
  ok("o teto novo é respeitado", o[o.length-1]<=120, o);
  ok("e fica guardado", db(w).revisarAte===dia(120), db(w).revisarAte);

  /* ---- 5. encolher o teto tira as automáticas, mas não as manuais/feitas ---- */
  let seed=base({revisarAte:dia(300)});
  seed.revisoes=[{id:"m1",registroId:"r1",data:dia(200),ordem:1,feita:false,manual:true,minutos:null,questoes:null,
    acertos:null,dificuldade:null,atividade:"",nota:"marcada à mão"},
   {id:"f1",registroId:"r1",data:dia(-5),ordem:2,feita:true,feitaEm:dia(-5),manual:false,minutos:null,questoes:null,
    acertos:null,dificuldade:null,atividade:"",nota:""}];
  w=abrir(seed); await espera(350);
  await salvarSessao(w);
  ok("a manual lá na frente sobreviveu ao plano", !!db(w).revisoes.find(r=>r.id==="m1"));
  await ajustes(w, doc=>{ doc.querySelector('[name="revisarAte"]').value=dia(30); });
  const depois=db(w).revisoes;
  ok("encolhendo o teto, as automáticas além dele saem",
     depois.filter(r=>!r.manual && !r.feita).every(r=>r.data<=dia(30)),
     depois.filter(r=>!r.manual&&!r.feita).map(r=>r.data));
  ok("a revisão marcada à mão continua, mesmo além do teto",
     !!depois.find(r=>r.id==="m1"), depois.map(r=>r.id));
  ok("e a já feita também", !!depois.find(r=>r.id==="f1"));

  /* ---- 6. a prova passou: pergunta e para de agendar ---- */
  w=abrir(base({dataProva:dia(-3)})); await espera(400);
  let doc=w.document;
  ok("a prova passada abre a pergunta", !w.document.getElementById("overlay").hidden &&
     /E depois da prova/.test(doc.getElementById("modalTitulo").textContent),
     doc.getElementById("modalTitulo").textContent);
  ok("com as três saídas", [...doc.querySelectorAll('[name="rumo"]')].map(r=>r.value).join(",")
     ==="continuo,outra,encerrei", [...doc.querySelectorAll('[name="rumo"]')].map(r=>r.value));
  /* Decisão do Pedro (23/09): a pergunta não segura nada — enquanto ela não é
     respondida, as revisões seguem normalmente; parar é escolher "encerrei". */
  ok("enquanto não responder, o agendamento segue normalmente", db(w).revisoes.length>0, db(w).revisoes.length);

  // responder "continuo" volta a agendar
  doc.querySelector('[data-acao="salvar-pos-prova"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  // a data NÃO é apagada: fica guardada no modo Concurso, e o objetivo vira Sem objetivo
  ok("respondendo que continua, o objetivo vira Sem objetivo e o agendamento volta",
     db(w).objetivo==="livre" && db(w).dataProva===dia(-3) && db(w).posProva==="continuo",
     [db(w).objetivo, db(w).dataProva, db(w).posProva]);
  ok("e as revisões voltam a nascer", db(w).revisoes.length>0, db(w).revisoes.length);
  ok("a pergunta não se repete", w.document.getElementById("overlay").hidden);

  /* ---- 7. "encerrei" desliga o agendamento sem apagar nada ---- */
  w=abrir(base({dataProva:dia(-3), revisoes:[{id:"x1",registroId:"r1",data:dia(2),ordem:1,feita:false,manual:false,
    minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(400); doc=w.document;
  const enc=doc.querySelector('[name="rumo"][value="encerrei"]'); enc.checked=true;
  enc.dispatchEvent(new w.Event("change",{bubbles:true}));
  doc.querySelector('[data-acao="salvar-pos-prova"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("encerrando, a escolha fica guardada", db(w).posProva==="encerrei", db(w).posProva);
  ok("a revisão que já existia continua lá", !!db(w).revisoes.find(r=>r.id==="x1"), db(w).revisoes.map(r=>r.id));
  const antesDeSalvar=db(w).revisoes.length;
  await salvarSessao(w);
  ok("e nenhuma nova é criada", db(w).revisoes.length===antesDeSalvar, [antesDeSalvar, db(w).revisoes.length]);

  /* ---- 8. dá para religar pelos ajustes ---- */
  await ajustes(w, d2=>{ const cx=d2.querySelector('[name="religar"]'); cx.checked=true; });
  ok("religando, o agendamento volta", db(w).posProva==="continuo", db(w).posProva);
  ok("e o cronograma é refeito", db(w).revisoes.length>1, db(w).revisoes.length);

  /* ---- 9. o teto não tem limite (decisão do Pedro, 23/09: saiu o teto de um ano) ---- */
  w=abrir(base()); await espera(350);
  await ajustes(w, d2=>{ d2.querySelector('[name="revisarAte"]').value=dia(900); });
  ok("um teto de 900 dias é aceito como está", db(w).revisarAte===dia(900), db(w).revisarAte);
  ok("e o campo não traz limite no HTML", !/name="revisarAte"[^>]*max="/.test(html));
  ok("a escada termina sozinha: nada é agendado além do último degrau",
     db(w).revisoes.filter(r=>!r.feita).every(r=>r.data<=dia(400)), db(w).revisoes.map(r=>r.data));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nhorizonte, teto e pós-prova funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
