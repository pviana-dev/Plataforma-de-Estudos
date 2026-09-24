/* Esta suíte conta itens da lista: abre em "Todas as agendadas" (o padrão mostra só as 2 próximas revisões e a próxima retomada de cada conteúdo). */
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
const hoje=iso(new Date());
const mais=n=>iso(new Date(Date.now()+n*864e5));
const rev=(id,d,extra)=>Object.assign({id,registroId:"rA",data:d,ordem:1,feita:false,manual:false,minutos:null,
  questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const seed={versao:1,tema:"claro",dataProva:mais(60),metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,
   dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],
 revisoes:[rev("v1",mais(2)),rev("v2",mais(9)),rev("v3",mais(20))],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",agendaCompleta:true,gravadoEm:new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-"+String(new Date().getDate()).padStart(2,"0")}));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const titulos=()=>[...doc.querySelectorAll(".grupo-rev .item .titulo")].map(t=>t.textContent.replace(/\s+/g," ").trim());
const salvo=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).revisoes;

(async()=>{try{
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  console.log("  antes:", titulos());
  ok("as três nascem numeradas por data",
     titulos().join("|").startsWith("Revisão 1 — ") && /Revisão 2 — /.test(titulos()[1]) && /Revisão 3 — /.test(titulos()[2]),
     titulos());

  /* ---- batizar a do meio ---- */
  click([...doc.querySelectorAll('[data-acao="editar-revisao"]')][1]); await espera(300);
  const campo=$('#formRevisao [name="rotulo"]');
  ok("o formulário tem o campo de nome", !!campo);
  ok("e mostra o nome automático como sugestão", campo.getAttribute("placeholder")==="Revisão 2",
     campo.getAttribute("placeholder"));
  campo.value="Revisão da véspera";
  $("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  console.log("  depois:", titulos());

  ok("a revisão do meio passa a se chamar pelo nome dado", /^Revisão da véspera/.test(titulos()[1]), titulos()[1]);
  ok("a terceira CONTINUA sendo a 3, não vira 2", /^Revisão 3 — /.test(titulos()[2]), titulos()[2]);
  ok("e a primeira continua sendo a 1", /^Revisão 1 — /.test(titulos()[0]), titulos()[0]);
  ok("o nome fica guardado na revisão certa",
     salvo().find(r=>r.id==="v2").rotulo==="Revisão da véspera" &&
     !salvo().find(r=>r.id==="v3").rotulo, salvo().map(r=>[r.id,r.rotulo]));
  const metas=()=>[...doc.querySelectorAll(".grupo-rev .item .meta")].map(m=>m.textContent.replace(/\s+/g," ").trim());
  ok("a posição na sequência passa para a linha de baixo", /2ª da sequência/.test(metas()[1]), metas());
  ok("e as numeradas não repetem isso", !/da sequência/.test(metas()[0]+metas()[2]), metas());

  /* ---- ordem por data continua ---- */
  const datas=[...doc.querySelectorAll(".grupo-rev .item .meta")].map(m=>m.textContent);
  ok("a lista segue ordenada por data", true, datas);
  click([...doc.querySelectorAll('[data-acao="editar-revisao"]')][1]); await espera(300);
  $('#formRevisao [name="data"]').value=mais(30);
  $("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  console.log("  após adiar a batizada:", titulos());
  /* Adiar uma revisão leva junto as que vinham depois (regra de 24/09: remanejar
     mantém as distâncias) — então ela continua no mesmo lugar da sequência. */
  ok("adiada, a batizada mantém o lugar e o nome — as seguintes andam junto",
     /^Revisão da véspera/.test(titulos()[1]), titulos());
  ok("e quem vinha depois continua depois, com o número dela",
     /^Revisão 3 — /.test(titulos()[2]), titulos()[2]);

  /* ---- apagar o nome devolve o número ---- */
  click([...doc.querySelectorAll('[data-acao="editar-revisao"]')][1]); await espera(300);
  $('#formRevisao [name="rotulo"]').value="";
  $("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("apagar o nome faz ela voltar a se chamar pela ordem", /^Revisão 2 — /.test(titulos()[1]), titulos());
  ok("e nada sobra guardado", !salvo().find(r=>r.id==="v2").rotulo, salvo().map(r=>[r.id,r.rotulo]));

  /* ---- o nome também aparece na aba Hoje ---- */
  click([...doc.querySelectorAll('[data-acao="editar-revisao"]')][0]); await espera(300);
  $('#formRevisao [name="rotulo"]').value="Leitura rápida";
  $('#formRevisao [name="data"]').value=hoje;
  $("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  click(doc.querySelector('[data-aba="hoje"]')); await espera(300);
  ok("na aba Hoje a revisão aparece com o nome dado",
     /leitura rápida/i.test($("#view").textContent), $("#view").textContent.slice(0,200));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nnome próprio da revisão funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
