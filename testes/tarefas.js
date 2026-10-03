/* TAREFAS (02/10): lembretes da agenda que não são estudo de um conteúdo.
   Título e data, hora e detalhes opcionais; várias datas de uma vez. O ✓ só
   marca — não cria sessão, não mexe na agenda nem no Progresso. Vencida e não
   marcada, fica atrasada até ser marcada. Aparecem na Agenda (por dia, por
   assunto, mês, atrasados) e na aba Hoje; o filtro de disciplina as esconde. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const responderDialogos=require("./_dialogo.cjs");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const tar=(id,data,extra)=>Object.assign({id,titulo:"Tarefa "+id,data,hora:"",nota:"",feita:false,feitaEm:"",criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[sess("r1")],revisoes:[rev("v1","r1",dia(1),{retomada:true})],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let resposta=null;
function abrir(seed,aba,tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba:aba||"revisoes",gravadoEm:hoje},tela||{})));
     w.__confirmarNativo=true; w.confirm=()=>true;
     responderDialogos(w, ()=>resposta); }});
  return dom.window;
}
const lerDb=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const enviar=(w,f)=>f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
const textos=(w,sel)=>[...w.document.querySelectorAll(sel)].map(e=>e.textContent.replace(/\s+/g," ").trim());

(async()=>{try{
  /* ---- 1. criar pelo botão da Agenda ---- */
  let w=abrir(base()); await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);
  ok("a Agenda tem o + Adicionar tarefa", !!$('[data-acao="nova-tarefa"]'));
  click(w,$('[data-acao="nova-tarefa"]')); await espera(250);
  let f=$("#formTarefa");
  ok("abre o formulário da tarefa, sem disciplina nem conteúdo",
     !!f && !f.querySelector("select.sel-disciplina") && !f.querySelector("#campoAssunto"));
  ok("sem o botão Espaçado (é da revisão)", f && !f.querySelector('[data-acao="escada-datas-rev"]'));
  enviar(w,f); await espera(200);
  ok("sem título, não salva", /título/i.test($("#erroTarefa").textContent) && !(lerDb(w).tarefas||[]).length,
     $("#erroTarefa").textContent);
  f.querySelector('[name="titulo"]').value="Pagar a inscrição";
  f.querySelector('[name="data"]').value=dia(2);
  f.querySelector('[name="hora"]').value="19:30";
  f.querySelector('[name="nota"]').value="boleto no e-mail";
  enviar(w,f); await espera(300);
  let d=lerDb(w);
  ok("a tarefa foi gravada", d.tarefas.length===1 && d.tarefas[0].titulo==="Pagar a inscrição" &&
     d.tarefas[0].data===dia(2) && d.tarefas[0].hora==="19:30" && d.tarefas[0].nota==="boleto no e-mail", d.tarefas);
  ok("e não criou sessão nem item de agenda", d.registros.length===1 && d.revisoes.length===1);
  ok("o formulário fechou", !$("#formTarefa"));
  let linha=$("#view .item.tarefa");
  ok("aparece na visão por dia, com o selo tarefa e a hora",
     !!linha && /tarefa/.test(linha.textContent) && /19:30/.test(linha.textContent) && /boleto/.test(linha.textContent),
     linha && linha.textContent);

  /* ---- 2. várias datas de uma vez ---- */
  click(w,$('[data-acao="nova-tarefa"]')); await espera(250);
  f=$("#formTarefa");
  f.querySelector('[name="titulo"]').value="Simulado";
  f.querySelector('[name="data"]').value=dia(3);
  f.querySelector("#cadeiaCada").value="7"; f.querySelector("#cadeiaVezes").value="3";
  click(w,f.querySelector('[data-acao="gerar-datas-rev"]')); await espera(100);
  enviar(w,f); await espera(300);
  d=lerDb(w);
  const sim=d.tarefas.filter(t=>t.titulo==="Simulado").map(t=>t.data).sort();
  ok("a cada 7 dias, 3 vezes → três tarefas", JSON.stringify(sim)===JSON.stringify([dia(3),dia(10),dia(17)]), sim);

  /* ---- 3. editar e excluir ---- */
  const id=d.tarefas.find(t=>t.titulo==="Pagar a inscrição").id;
  click(w,$('#tar-'+id+' [data-acao="editar-tarefa"]')); await espera(250);
  f=$("#formTarefa");
  ok("editar abre com o que já estava", f && f.querySelector('[name="titulo"]').value==="Pagar a inscrição" &&
     f.querySelector('[name="hora"]').value==="19:30");
  f.querySelector('[name="titulo"]').value="Pagar a inscrição (até 18h)";
  f.querySelector('[name="hora"]').value="";
  enviar(w,f); await espera(300);
  d=lerDb(w);
  ok("a edição foi gravada, e a hora pode sair", d.tarefas.find(t=>t.id===id).titulo==="Pagar a inscrição (até 18h)" &&
     d.tarefas.find(t=>t.id===id).hora==="", d.tarefas.find(t=>t.id===id));
  click(w,$('#tar-'+id+' [data-acao="editar-tarefa"]')); await espera(250);
  click(w,$('#modalCaixa [data-acao="excluir-tarefa"]')); await espera(300);
  d=lerDb(w);
  ok("excluir tira a tarefa", !d.tarefas.some(t=>t.id===id) && d.tarefas.length===3, d.tarefas.map(t=>t.titulo));

  /* ---- 4. hoje, atrasada e o ✓ ---- */
  const seed4=base({tarefas:[tar("tH",hoje,{titulo:"Aula ao vivo",hora:"19:00"}), tar("tA",dia(-2),{titulo:"Levar documento"}),
                             tar("tF",dia(4),{titulo:"Revisar edital"}), tar("tV",dia(-3),{titulo:"Antiga",feita:true,feitaEm:dia(-3)})]});
  w=abrir(seed4,"hoje"); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  const cardHoje=[...doc.querySelectorAll("#view .card")].find(c=>/Agenda de hoje e atrasados/.test(c.textContent));
  ok("aba Hoje: a de hoje e a atrasada no card do dia",
     cardHoje && /Aula ao vivo/.test(cardHoje.textContent) && /Levar documento/.test(cardHoje.textContent),
     cardHoje && cardHoje.textContent.slice(0,200));
  ok("aba Hoje: a já feita não aparece no card do dia", cardHoje && !/Antiga/.test(cardHoje.textContent));
  const prox=[...doc.querySelectorAll("#view .card")].find(c=>/Próximos 7 dias/.test(c.textContent));
  ok("aba Hoje: a futura nos próximos 7 dias, sem ✓", prox && /Revisar edital/.test(prox.textContent) &&
     !prox.querySelector('[data-id="tF"]'), prox && prox.textContent.slice(0,200));
  const tileAtr=[...doc.querySelectorAll(".tile")].find(t=>/Atrasados/.test(t.textContent));
  ok("a atrasada conta nos Atrasados", tileAtr && /\b1\b/.test(tileAtr.querySelector(".val").textContent), tileAtr && tileAtr.textContent);
  ok("e no pino da aba", /1/.test(($('[data-aba="hoje"] .pin')||{}).textContent||""));
  click(w,cardHoje.querySelector('[data-acao="tarefa-check"][data-id="tH"]')); await espera(300);
  d=lerDb(w);
  ok("o ✓ marca a tarefa como feita hoje", d.tarefas.find(t=>t.id==="tH").feita && d.tarefas.find(t=>t.id==="tH").feitaEm===hoje);
  ok("sem abrir formulário de sessão nem criar sessão", !$("#formRegistro") && d.registros.length===1);

  /* ---- 5. Agenda: card de hoje, atrasados, remarcar ---- */
  w=abrir(seed4,"revisoes"); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  const cardAg=[...doc.querySelectorAll("#view .card")].find(c=>/Agenda de hoje/.test(c.querySelector("h2")?.textContent||""));
  ok("Agenda de hoje mostra a tarefa de hoje, com editar", cardAg && !!cardAg.querySelector('[data-acao="editar-tarefa"][data-id="tH"]'));
  const atr=$("#revisoes-atrasadas");
  ok("a atrasada está no card Atrasados", atr && /Levar documento/.test(atr.textContent) &&
     !!atr.querySelector('[data-acao="remarcar-tarefa"][data-id="tA"]'), atr && atr.textContent);
  resposta=dia(1);
  click(w,atr.querySelector('[data-acao="remarcar-tarefa"]')); await espera(300);
  d=lerDb(w);
  ok("remarcar muda a data", d.tarefas.find(t=>t.id==="tA").data===dia(1), d.tarefas.find(t=>t.id==="tA"));
  ok("e o card Atrasados some", !$("#revisoes-atrasadas"));
  // desmarcar
  click(w,$('[data-acao="tarefa-check"][data-id="tH"]')); await espera(300);
  ok("marcada na Agenda, ela fica no card de hoje como feita",
     $('[data-acao="tarefa-check"][data-id="tH"]').getAttribute("aria-checked")==="true");
  click(w,$('[data-acao="tarefa-check"][data-id="tH"]')); await espera(300);
  ok("o ✓ desmarca também", !lerDb(w).tarefas.find(t=>t.id==="tH").feita);

  /* ---- 6. filtro, por assunto, mês, concluídos ---- */
  w=abrir(seed4,"revisoes",{aDisciplina:"Legislação"}); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  const forasDoHoje=[...doc.querySelectorAll("#view .card")].filter(c=>!/Agenda de hoje/.test(c.querySelector("h2")?.textContent||""));
  ok("com filtro de disciplina, as tarefas saem da lista", !forasDoHoje.some(c=>c.querySelector(".item.tarefa")),
     forasDoHoje.map(c=>c.textContent.slice(0,60)));

  w=abrir(seed4,"revisoes",{visaoAgenda:"assunto"}); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  const cardTar=[...doc.querySelectorAll("#view .card")].find(c=>/^Tarefas/.test(c.querySelector("h2")?.textContent||""));
  ok("por assunto: um card Tarefas", cardTar && /Revisar edital/.test(cardTar.textContent) && /Levar documento/.test(cardTar.textContent),
     cardTar && cardTar.textContent);
  ok("e os assuntos continuam lá", /LAI/.test(doc.querySelector("#view").textContent));

  w=abrir(seed4,"revisoes",{visaoAgenda:"mes",mesAgenda:dia(4).slice(0,7)}); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  const celF=$('.cal-dia[data-dia="'+dia(4)+'"]');
  ok("mês: o dia da tarefa tem o pontinho dela", celF && !!celF.querySelector(".pt-tarefa") && celF.querySelectorAll(".pt").length===1,
     celF && celF.outerHTML);
  click(w,celF); await espera(300);
  ok("e tocar no dia lista a tarefa", /Revisar edital/.test(doc.querySelector("#view").textContent));

  w=abrir(seed4,"revisoes",{faseAgenda:"concluidos"}); await espera(400); doc=w.document;
  ok("concluídos: a feita em dia anterior aparece", /Antiga/.test(doc.querySelector("#view").textContent));

  /* ---- 7. dado que chega: backup sem tarefas, tarefa quebrada ---- */
  const semTar=base(); delete semTar.tarefas;
  w=abrir(semTar); await espera(400); doc=w.document; $=s=>doc.querySelector(s);
  ok("backup antigo, sem tarefas, abre sem nenhuma", !doc.querySelector(".item.tarefa"));
  click(w,$('[data-acao="nova-tarefa"]')); await espera(250);
  $('#formTarefa [name="titulo"]').value="Primeira";
  enviar(w,$("#formTarefa")); await espera(300);
  ok("e a primeira tarefa entra normalmente", (lerDb(w).tarefas||[]).length===1, lerDb(w).tarefas);
  w=abrir(base({tarefas:[{id:"x1",titulo:"ok",data:dia(1)},{id:"x2",titulo:"sem data"},{titulo:"sem id",data:dia(1)},
                         {id:"x3",titulo:"",data:dia(1),hora:"25h"}]})); await espera(400);
  click(w,w.document.querySelector('[data-acao="tarefa-check"][data-id="x1"]')); await espera(300);   // grava
  d=lerDb(w);
  ok("tarefa sem id ou sem data é descartada; o resto é normalizado",
     d.tarefas.map(t=>t.id).join()==="x1,x3" && d.tarefas[1].titulo==="Tarefa" && d.tarefas[1].hora==="", d.tarefas);

}catch(e){ console.log("ERRO:", e.message, "\n", e.stack); falhas++; }
console.log(falhas ? "\n"+falhas+" FALHA(S)" : "tarefas funcionando");
process.exit(falhas?1:0);
})();
