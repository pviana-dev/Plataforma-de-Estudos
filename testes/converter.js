const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  {id:"rHoje",data:hoje,disciplina:"Legislação",assuntos:["Crase"],assunto:"Crase",minutos:50,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2,tipo:"estudo"},
  {id:"rOntem",data:dia(-1),disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"},
  {id:"rBase",data:dia(-4),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:0,tipo:"estudo"}],
 revisoes:[
  {id:"vLAI",registroId:"rBase",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vCrase1",registroId:"rHoje",data:dia(2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vCrase2",registroId:"rHoje",data:dia(6),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0,perguntas=[]; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.confirm=m=>{perguntas.push(m);return true;};}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const abrir=async id=>{ click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id)); await espera(320); };

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);

  /* ---- sessão de ontem: travada ---- */
  await abrir("rOntem");
  ok("sessão de ontem não pode virar revisão", $("#tipoRevisao").disabled);
  ok("e a tela explica por quê", /só as de hoje/.test($("#modalCorpo").textContent),
     $("#modalCorpo").textContent.match(/.{0,60}vira revisão.{0,20}/));
  click(doc.querySelector('#overlay [data-acao="fechar-modal"]')); await espera(250);

  /* ---- sessão de hoje: pode ---- */
  await abrir("rHoje");
  ok("sessão de hoje pode virar revisão", !$("#tipoRevisao").disabled);
  $("#tipoRevisao").checked=true; change($("#tipoRevisao")); await espera(320);
  ok("o seletor de revisão aparece", !!$("#revisaoAlvo"));
  $("#revisaoAlvo").value="vLAI"; change($("#revisaoAlvo")); await espera(320);
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);

  const d=lerDb(), conv=d.registros.find(r=>r.id==="rHoje");
  ok("avisou que as revisões agendadas seriam apagadas",
     perguntas.some(p=>/apaga as 2 revisão/.test(p)), perguntas);
  ok("a sessão virou revisão", conv.tipo==="revisao", conv.tipo);
  ok("o conteúdo passou a ser o da revisão", conv.assuntos.join()==="LAI", conv.assuntos);
  ok("o tempo dela continua", conv.minutos===50, conv.minutos);
  ok("as revisões que ela tinha agendado sumiram",
     !d.revisoes.some(r=>r.registroId==="rHoje"), d.revisoes.map(r=>r.id+":"+r.registroId));
  ok("a revisão escolhida ficou marcada",
     d.revisoes.find(r=>r.id==="vLAI").feita===true && d.revisoes.find(r=>r.id==="vLAI").sessaoId==="rHoje",
     d.revisoes.find(r=>r.id==="vLAI"));
  ok("e as revisões de outras sessões não foram tocadas", d.revisoes.length===1, d.revisoes.length);

  /* ---- voltar para estudo ---- */
  await abrir("rHoje");
  $("#tipoEstudo").checked=true; change($("#tipoEstudo")); await espera(320);
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  const d2=lerDb(), volta=d2.registros.find(r=>r.id==="rHoje");
  ok("voltou a ser estudo", volta.tipo==="estudo", volta.tipo);
  /* O vínculo deixou de depender do tipo: uma sessão de ESTUDO também pode
     cumprir um item da agenda. Virar estudo não solta mais a revisão — é o que
     permite ter uma sessão só, do tipo estudo, contando como revisão. */
  ok("a revisão continua cumprida pela sessão", d2.revisoes.find(r=>r.id==="vLAI").feita===true,
     d2.revisoes.find(r=>r.id==="vLAI"));
  ok("e a sessão segue apontando para ela", volta.revisaoId==="vLAI", volta.revisaoId);
  ok("e continua sem cronograma próprio, como combinado",
     volta.plano==="sem" && !d2.revisoes.some(r=>r.registroId==="rHoje"),
     {plano:volta.plano, revs:d2.revisoes.filter(r=>r.registroId==="rHoje").length});
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nconversão de tipo funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
