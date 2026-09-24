const responderDialogos=require("./_dialogo.cjs"), fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
/* A atrasada é de OUTRO conteúdo (LGPD): remarcá-la leva junto as revisões que
   vêm depois dela no mesmo conteúdo (regra de 24/09), e aqui a de hoje (LAI)
   precisa ficar onde está para a segunda parte do teste. */
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:dia(-5),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"},
            {id:"rB",data:dia(-5),disciplina:"Legislação",assuntos:["LGPD"],assunto:"LGPD",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2,tipo:"estudo"}],
 revisoes:[
  {id:"vHoje",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vAtras",registroId:"rB",data:dia(-3),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0,prompts=[]; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;
   responderDialogos(w, m=>{prompts.push(m);return iso(new Date(Date.now()+2*864e5));});}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  ok("existe o card de revisões atrasadas", !!doc.getElementById("revisoes-atrasadas"));
  ok("com a revisão atrasada dentro", /estava marcada para/.test($("#revisoes-atrasadas").textContent),
     $("#revisoes-atrasadas").textContent.replace(/\s+/g," ").slice(0,140));

  /* ---- remarcar ---- */
  click(doc.querySelector('[data-acao="remarcar-revisao"]')); await espera(300);
  const rev=lerDb().revisoes.find(r=>r.id==="vAtras");
  ok("a revisão foi remarcada", rev.data===dia(2), rev.data);
  ok("e guardou a data original", rev.dataOriginal===dia(-3), rev.dataOriginal);
  ok("saiu do card de atrasadas", !doc.getElementById("revisoes-atrasadas"));
  ok("e a marcação de atraso aparece na lista do assunto",
     /estava marcada para/.test($("#view").textContent), $("#view").textContent.slice(0,200));

  /* ---- marcar a caixa abre a sessão de revisão ---- */
  click(doc.querySelector('[data-acao="concluir"]')); await espera(350);
  ok("marcar abre a tela de sessão", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  ok("já no tipo revisão", $("#tipoRevisao") && $("#tipoRevisao").checked);
  ok("com a revisão escolhida e travada", $("#revisaoAlvo") && $("#revisaoAlvo").value==="vHoje",
     $("#revisaoAlvo") && $("#revisaoAlvo").value);
  ok("e o conteúdo dela já preenchido",
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].some(t=>/LAI/.test(t.textContent)),
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.textContent));
  $("#modalCorpo [name=minutos]").value="35";
  $("#modalCorpo [name=dificuldade]").value="2";          // obrigatória, sem padrão
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);

  const d=lerDb();
  ok("a revisão ficou marcada", d.revisoes.find(r=>r.id==="vHoje").feita===true);
  ok("as horas foram para a sessão, não para a revisão",
     d.revisoes.find(r=>r.id==="vHoje").minutos===null &&
     d.registros.some(r=>r.tipo==="revisao"&&r.minutos===35),
     {rev:d.revisoes.find(r=>r.id==="vHoje").minutos, sess:d.registros.map(r=>r.minutos)});

  /* ---- a Rotina mostra as horas da sessão ---- */
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  ok("a linha da revisão mostra o tempo vindo da sessão", /35min/.test($("#view").textContent),
     ($("#view").textContent.match(/.{0,60}35min.{0,20}/)||[""])[0]);
  ok("e oferece ir até a sessão", !!doc.querySelector('[data-acao="abrir-sessao"]'));

  /* ---- desmarcar mantém a sessão ---- */
  click(doc.querySelector('[data-acao="reabrir"]')); await espera(350);
  const d2=lerDb();
  ok("desmarcar solta a revisão", d2.revisoes.find(r=>r.id==="vHoje").feita===false);
  ok("mas a sessão e as horas continuam",
     d2.registros.some(r=>r.tipo==="revisao"&&r.minutos===35), d2.registros.map(r=>r.tipo+":"+r.minutos));
  ok("e a sessão perdeu só o vínculo",
     !d2.registros.find(r=>r.tipo==="revisao").revisaoId, d2.registros.find(r=>r.tipo==="revisao").revisaoId);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrotina e vínculo funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
