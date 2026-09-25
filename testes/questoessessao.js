/* QUESTÕES DAS SESSÕES, EDITÁVEIS NA ABA QUESTÕES (pedido do Pedro, 24/09). O
   número mora na sessão: mudou na aba Questões, a sessão já mostra o novo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,
 conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
 registros:[{id:"r1",data:dia(-2),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,
   dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},
   {id:"r2",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,acertos:0,
   dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"questoes",gravadoEm:hoje})); w.confirm=()=>true; }});
  const w=dom.window, doc=w.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
  await espera(400);
  const card=[...doc.querySelectorAll("#view .card")].find(c=>/Questões das sessões/.test(c.querySelector("h2").textContent));
  ok("a aba Questões tem o card 'Questões das sessões'", !!card);
  ok("com a sessão que tem questões (e só ela)", card && card.querySelectorAll(".item").length===1 &&
     /10 questões · 7 acerto/.test(card.textContent), card && card.textContent.slice(0,160));
  click(card.querySelector('[data-acao="editar-questoes-sessao"]')); await espera(250);
  ok("editar abre a tela com os números da sessão", $("#modalTitulo").textContent==="Questões da sessão" &&
     $('#formQuestoesSessao [name="questoes"]').value==="10" && $('#formQuestoesSessao [name="acertos"]').value==="7");
  $('#formQuestoesSessao [name="questoes"]').value="12"; $('#formQuestoesSessao [name="acertos"]').value="15";
  $("#formQuestoesSessao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(200);
  ok("acertos acima do total é recusado", /não podem passar/.test($("#erroQuestoesSessao").textContent) && db().registros[0].questoes===10);
  $('#formQuestoesSessao [name="acertos"]').value="9";
  $("#formQuestoesSessao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  const r1=db().registros.find(r=>r.id==="r1");
  ok("salvo, a própria sessão fica com os números novos", r1.questoes===12 && r1.acertos===9, [r1.questoes,r1.acertos]);
  ok("e o card e os totais da aba já mostram", /12 questões · 9 acerto/.test($("#view").textContent));
  // a sessão, na aba Sessões, mostra o mesmo
  click($('[data-aba="registros"]')); await espera(250);
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1").querySelector("td")); await espera(350);
  ok("abrindo a sessão na aba Sessões, ela já tem 12 questões e 9 acertos",
     $('#modalCaixa [name="questoes"]').value==="12" && $('#modalCaixa [name="acertos"]').value==="9",
     [$('#modalCaixa [name="questoes"]').value, $('#modalCaixa [name="acertos"]').value]);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nquestões das sessões editáveis na aba Questões");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
