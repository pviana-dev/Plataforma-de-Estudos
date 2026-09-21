const fs=require("fs"),{JSDOM}=require("jsdom");
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
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  // sessão de hoje já registrada com 50min e 10 questões
  {id:"rHoje",data:hoje,disciplina:"Legislação",assuntos:["Crase"],assunto:"Crase",minutos:50,questoes:10,acertos:8,dificuldade:3,anotacoes:"",criadoEm:2,tipo:"estudo",
   blocos:[{data:hoje,inicio:"09:00",fim:"09:50",minutos:50}]},
  {id:"rBase",data:dia(-4),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:0,tipo:"estudo"}],
 revisoes:[{id:"vLAI",registroId:"rBase",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="hoje"]')); await espera(300);
  const antesDia=($("#view").textContent.match(/Estudo de hoje(\S+)/)||[])[1];
  console.log("  estudo do dia antes: "+antesDia);

  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rHoje")); await espera(320);
  $("#tipoRevisao").checked=true; change($("#tipoRevisao")); await espera(320);
  $("#revisaoAlvo").value="vLAI"; change($("#revisaoAlvo")); await espera(320);
  ok("as horas continuam no formulário ao converter", $("#modalCorpo [name=minutos]").value==="50",
     $("#modalCorpo [name=minutos]").value);
  ok("e as questões também", $("#modalCorpo [name=questoes]").value==="10");
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);

  const d=lerDb(), sess=d.registros.find(r=>r.id==="rHoje"), rev=d.revisoes.find(r=>r.id==="vLAI");
  ok("a sessão manteve as 50min", sess.minutos===50, sess.minutos);
  ok("manteve as questões", sess.questoes===10 && sess.acertos===8, {q:sess.questoes,a:sess.acertos});
  ok("manteve a medição do cronômetro", (sess.blocos||[]).length===1, sess.blocos);
  ok("a revisão NÃO ganhou números próprios", rev.minutos===null && rev.questoes===null,
     {m:rev.minutos,q:rev.questoes});
  ok("mas ficou marcada e ligada à sessão", rev.feita===true && rev.sessaoId==="rHoje");

  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  const t=$("#view").textContent.replace(/\s+/g," ");
  console.log("  linha da revisão: "+(t.match(/Revisão 1[^R]{0,90}/)||[""])[0]);
  ok("a Rotina mostra as 50min como tempo da revisão", /50min/.test(t), t.slice(0,200));
  ok("e as questões da sessão", /8\/10 questões/.test(t), t.slice(0,220));

  click(doc.querySelector('[data-aba="hoje"]')); await espera(300);
  const depoisDia=($("#view").textContent.match(/Estudo de hoje(\S+)/)||[])[1];
  console.log("  estudo do dia depois: "+depoisDia);
  ok("o total do dia não mudou (nada foi somado duas vezes)", antesDia===depoisDia, {antesDia,depoisDia});
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nverificado");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
