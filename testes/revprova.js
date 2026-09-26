/* REVISÕES ATÉ A PROVA, ESCOLHIDAS POR CONTEÚDO (pedido do Pedro, 25/09).
   - Só em conteúdo CONCLUÍDO (o que tem escada) e com prova à frente.
   - "Eu escolho": quantas revisões e o dia de cada uma; a plataforma só sugere.
     Até a prova, a escada automática daquele conteúdo fica pausada.
   - Nada empurra as datas escolhidas (contato com o conteúdo não as move).
   - Depois da prova, o automático volta sozinho. Reabrir o conteúdo desfaz.
   - Entrada: o atalho “Personalizar revisões até a prova” na Agenda (25/09: saiu da aba Disciplinas). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const off=d=>Math.round((new Date(d+"T12:00")-new Date(hoje+"T12:00"))/864e5);
const sess=(id,extra)=>Object.assign({id,data:dia(-20),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const ficha=(nome,extra)=>Object.assign({id:"c-"+nome,disciplina:"Legislação",nome,fase:"concluido",concluidoEm:dia(-20),criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"concurso",dataProva:dia(20),revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[ficha("LAI"),ficha("Crase",{fase:"andamento",concluidoEm:null})],
  registros:[sess("s1"),sess("s2",{assuntos:["Crase"],assunto:"Crase",criadoEm:2})],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba,extraTela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba:aba||"revisoes",gravadoEm:hoje},extraTela||{})));
     w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const daLAI=(w)=>{const d=db(w);return d.revisoes.filter(r=>!r.feita && !r.retomada &&
  ((r.assuntos&&r.assuntos.length?r.assuntos:(d.registros.find(s=>s.id===r.registroId)||{}).assuntos||[]).includes("LAI")))
  .sort((a,b)=>a.data.localeCompare(b.data));};
const fichaLAI=w=>db(w).conteudos.find(c=>c.nome==="LAI");
/** o atalho da Agenda (a única entrada desde 25/09: saiu da aba Disciplinas) */
const atalho=doc=>doc.querySelector('.linha-rev-prova [data-acao="revisoes-prova"]');
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto");
  const achada=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase());
  sel.value=achada.value;
  click(w, doc.querySelector('[data-acao="add-assunto"]'));
}
/** a pessoa registra uma sessão de estudo nova pelo formulário (é contato com o conteúdo) */
async function novaSessao(w, data){
  click(w, w.document.querySelector('[data-aba="registros"]')); await espera(200);
  click(w, w.document.querySelector('[data-acao="toggle-form-registro"]')); await espera(250);
  const f=w.document.querySelector("#formRegistro");
  f.querySelector("[name=data]").value=data;
  const sd=f.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(50);
  porConteudo(w.document, w, "LAI");
  const f2=w.document.querySelector("#formRegistro");
  if (f2.querySelector("[name=minutos]")) f2.querySelector("[name=minutos]").value="30";
  f2.querySelector("[name=dificuldade]").value="2";
  f2.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  return (w.document.querySelector("#erroRegistro")||{}).textContent||"";
}
function submeter(w){ w.document.querySelector("#formRevProva").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); }

(async()=>{try{
  /* ---- 1. a entrada é só a da Agenda; a aba Disciplinas não tem o botão ---- */
  let w=abrir(base(),"conteudos"); await espera(300);
  let doc=w.document;
  ok("a aba Disciplinas não tem a opção", !doc.querySelector('[data-acao="revisoes-prova"]'));
  ok("nem emoji de calendário em lugar nenhum", !/📅/.test(doc.body.innerHTML) && !/📅/.test(html));
  w=abrir(base(),"revisoes"); await espera(300); doc=w.document;
  ok("com um conteúdo concluído e prova à frente, a Agenda tem o atalho", !!atalho(doc));
  const autoAntes=daLAI(w);
  ok("antes, o conteúdo tem a escada automática até a prova", autoAntes.some(r=>!r.manual && r.data<dia(20)), autoAntes.map(r=>off(r.data)));

  /* ---- 2. a janela: modos, sugestão de datas ---- */
  click(w,atalho(doc)); await espera(200);
  let f=doc.querySelector("#formRevProva");
  ok("só os concluídos entram no seletor (Crase, em andamento, não)",
     [...f.querySelector('[name="conteudoProva"]').options].map(o=>o.textContent).join("|")==="LAI — Legislação");
  ok("a janela abre no modo automático", f && (f.querySelector('[name="modo"]:checked')||{}).value==="auto" && doc.querySelector("#painelRevProva").hidden);
  const eu=f.querySelector('[name="modo"][value="eu"]'); eu.checked=true; eu.dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("“Eu escolho” mostra a quantidade e as datas", !doc.querySelector("#painelRevProva").hidden);
  f.elements.namedItem("quantas").value="4"; f.elements.namedItem("quantas").dispatchEvent(new w.Event("input",{bubbles:true}));
  let datas=[...f.querySelectorAll('[name="dataRev"]')].map(i=>i.value);
  ok("mudar a quantidade refaz a sugestão: 4 datas distintas", datas.length===4 && new Set(datas).size===4, datas.map(off));
  ok("a sugestão termina na véspera da prova e não passa dela", off(datas[3])===19 && datas.every(d=>d>=hoje && d<dia(20)), datas.map(off));
  ok("e vem espaçada por igual (5, 10, 14, 19)", JSON.stringify(datas.map(off))===JSON.stringify([5,10,14,19]), datas.map(off));

  /* validação */
  f.elements.namedItem("quantas").value="2"; f.elements.namedItem("quantas").dispatchEvent(new w.Event("input",{bubbles:true}));
  let ins=[...f.querySelectorAll('[name="dataRev"]')];
  ins[0].value=dia(7); ins[1].value=dia(7);
  submeter(w); await espera(100);
  ok("duas revisões no mesmo dia: não salva e explica", /mesmo dia/.test(doc.querySelector("#erroRevProva").textContent) && !fichaLAI(w).revisoesProva,
     doc.querySelector("#erroRevProva").textContent);
  ins[1].value=dia(20);
  submeter(w); await espera(100);
  ok("data no dia da prova ou depois: não salva", /véspera/.test(doc.querySelector("#erroRevProva").textContent), doc.querySelector("#erroRevProva").textContent);

  /* ---- 3. salvar “Eu escolho” ---- */
  ins[0].value=dia(5); ins[1].value=dia(12);
  submeter(w); await espera(200);
  let lista=daLAI(w);
  ok("o conteúdo fica no modo escolhido até a data da prova", fichaLAI(w).revisoesProva===dia(20), fichaLAI(w));
  const ate=lista.filter(r=>r.data<=dia(20));
  ok("até a prova, só as 2 revisões escolhidas", ate.length===2 && ate.every(r=>r.planoProva && r.manual) &&
     JSON.stringify(ate.map(r=>off(r.data)))==="[5,12]", lista.map(r=>off(r.data)+(r.planoProva?"P":"")));
  ok("a escada automática recomeça depois da prova", lista.some(r=>!r.manual && r.data>dia(20)), lista.map(r=>off(r.data)));
  const wd=abrir(db(w),"conteudos"); await espera(300);
  ok("o conteúdo na aba Disciplinas avisa: 2 escolhidas, automático pausado",
     /2 revisões escolhidas até .*automático pausado/.test((wd.document.querySelector(".meta.ate-prova")||{}).textContent||""),
     (wd.document.querySelector(".meta.ate-prova")||{}).textContent);

  /* ---- 4. contato com o conteúdo não empurra as datas escolhidas ---- */
  const erroSessao=await novaSessao(w, hoje);
  ok("(uma sessão de LAI registrada hoje)", !erroSessao && db(w).registros.length===3, erroSessao);
  lista=daLAI(w);
  ok("estudar o conteúdo hoje não move as revisões escolhidas", JSON.stringify(lista.filter(r=>r.planoProva).map(r=>off(r.data)))==="[5,12]",
     lista.map(r=>off(r.data)+(r.planoProva?"P":"")));
  ok("e nenhuma automática volta a nascer antes da prova", !lista.some(r=>!r.manual && r.data<=dia(20)), lista.map(r=>off(r.data)));
  /* abrir a página de novo (garantirAgenda) não duplica nada */
  const n1=daLAI(w).length; const wx=abrir(db(w),"revisoes"); await espera(300);
  ok("abrir a plataforma de novo não cria nada a mais", daLAI(wx).length===n1, [n1,daLAI(wx).length]);

  /* ---- 5. Agenda: o atalho fica abaixo de "Revisões"; o card só tem o selo ---- */
  let w2=abrir(db(w),"revisoes",{visaoAgenda:"assunto"}); await espera(300);
  let d2=w2.document;
  const card=[...d2.querySelectorAll(".grupo-rev")].find(g=>/LAI/.test((g.querySelector("strong")||{}).textContent||""));
  ok("o card de LAI na Agenda mostra que as datas são suas", card && /datas suas até/.test(card.textContent), card && card.textContent.slice(0,200));
  ok("o card não tem mais o botão (ele subiu para os filtros)", card && !card.querySelector('[data-acao="revisoes-prova"]'));
  const at2=d2.querySelector('.filtros-agenda .linha-rev-prova [data-acao="revisoes-prova"]');
  const linhaRevs=[...d2.querySelectorAll(".filtros-agenda > .linha")].find(l=>/Revisões:/.test(l.textContent));
  ok("“Personalizar revisões até a prova” fica logo abaixo de “Revisões”",
     at2 && /Personalizar revisões até a prova/.test(at2.textContent) && linhaRevs && linhaRevs.nextElementSibling===at2.parentElement,
     at2 && at2.textContent);
  click(w2, at2); await espera(200);
  f=d2.querySelector("#formRevProva");
  const selCont=f.querySelector('[name="conteudoProva"]');
  ok("vindo da Agenda, a janela pergunta o conteúdo — só os concluídos",
     selCont && [...selCont.options].map(o=>o.textContent).join("|")==="LAI — Legislação (personalizado)", selCont && [...selCont.options].map(o=>o.textContent));
  ok("o modo se chama “Personalizar”", /Personalizar/.test(f.querySelector('[name="modo"][value="eu"]').parentElement.textContent) &&
     !/Eu escolho/.test(f.textContent));
  datas=[...f.querySelectorAll('[name="dataRev"]')].map(i=>i.value);
  ok("reaberta, a janela vem em “Personalizar” com as datas atuais", (f.querySelector('[name="modo"]:checked')||{}).value==="eu" && JSON.stringify(datas.map(off))==="[5,12]", datas.map(off));

  /* ---- 6. voltar ao automático ---- */
  const auto=f.querySelector('[name="modo"][value="auto"]'); auto.checked=true; auto.dispatchEvent(new w2.Event("change",{bubbles:true}));
  submeter(w2); await espera(200);
  lista=daLAI(w2);
  ok("voltar ao automático tira o modo", !fichaLAI(w2).revisoesProva, fichaLAI(w2));
  ok("as escolhidas saem e a escada volta antes da prova", !lista.some(r=>r.planoProva) && lista.some(r=>!r.manual && r.data<dia(20)),
     lista.map(r=>off(r.data)+(r.planoProva?"P":"")));

  /* ---- 6b. com dois concluídos, o filtro escolhe o conteúdo e o seletor troca ---- */
  const dois=base({conteudos:[ficha("LAI"),ficha("LGPD")],
    registros:[sess("s1"),sess("s3",{assuntos:["LGPD"],assunto:"LGPD",criadoEm:3})]});
  let w3=abrir(dois,"revisoes",{aDisciplina:"Legislação",aAssunto:"legislação|lgpd"}); await espera(300);
  let d3=w3.document;
  click(w3, d3.querySelector('.linha-rev-prova [data-acao="revisoes-prova"]')); await espera(200);
  let sel3=d3.querySelector('#formRevProva [name="conteudoProva"]');
  const escolhido=()=>d3.querySelector(".intro-rev-prova b").textContent;
  ok("os dois concluídos estão no seletor", sel3 && sel3.options.length===2, sel3 && [...sel3.options].map(o=>o.textContent));
  ok("com o filtro em LGPD, a janela já abre nele", sel3.options[sel3.selectedIndex].textContent.startsWith("LGPD") || escolhido()==="LGPD",
     {sel:sel3.value, intro:escolhido(), tela:w3.localStorage.getItem("plataforma-estudos:tela")});
  const outro=[...sel3.options].find(o=>!o.selected); sel3.value=outro.value; sel3.dispatchEvent(new w3.Event("change",{bubbles:true}));
  await espera(100);
  ok("trocar no seletor troca o conteúdo da janela", escolhido()===outro.textContent.split(" — ")[0], [escolhido(), outro.textContent]);

  /* ---- 7. reabrir o conteúdo desfaz o modo ---- */
  w=abrir(base(),"revisoes"); await espera(300); doc=w.document;
  click(w,atalho(doc)); await espera(200);
  f=doc.querySelector("#formRevProva");
  f.querySelector('[name="modo"][value="eu"]').checked=true;
  f.elements.namedItem("quantas").value="1"; f.elements.namedItem("quantas").dispatchEvent(new w.Event("input",{bubbles:true}));
  submeter(w); await espera(200);
  ok("(uma revisão escolhida, na véspera)", daLAI(w).filter(r=>r.planoProva).map(r=>off(r.data)).join()==="19", daLAI(w).map(r=>off(r.data)));
  click(w, doc.querySelector('[data-aba="conteudos"]')); await espera(200);
  click(w, doc.querySelector('[data-acao="reabrir-conteudo"][data-conts="LAI"]')); await espera(200);
  ok("reabrir o conteúdo tira o modo e as revisões escolhidas", !fichaLAI(w).revisoesProva && !db(w).revisoes.some(r=>r.planoProva && !r.feita),
     {f:fichaLAI(w), r:db(w).revisoes.filter(r=>r.planoProva)});
  click(w, doc.querySelector('[data-aba="revisoes"]')); await espera(200);
  ok("sem conteúdo concluído, a Agenda não mostra o atalho", !atalho(w.document));

  /* ---- 8. passada a prova, o automático volta sozinho ---- */
  const passada=base({dataProva:dia(-2), conteudos:[ficha("LAI",{revisoesProva:dia(-2)}),ficha("Crase",{fase:"andamento",concluidoEm:null})],
    revisoes:[{id:"p1",registroId:"s1",assuntos:["LAI"],data:dia(-5),ordem:1,degrau:0,feita:true,feitaEm:dia(-5),manual:true,planoProva:true}]});
  w=abrir(passada,"revisoes"); await espera(300);
  ok("depois da prova o modo acaba", !fichaLAI(w).revisoesProva, fichaLAI(w));
  lista=daLAI(w);
  ok("e a escada automática continua dali", lista.length>0 && lista.every(r=>!r.manual) && lista[0].data>=hoje, lista.map(r=>off(r.data)));
  ok("sem prova à frente, não há atalho", !atalho(w.document));

  /* ---- 9. a pausa vale para a prova escolhida, não para a próxima que aparecer ---- */
  const outra=base({dataProva:dia(40), conteudos:[ficha("LAI",{revisoesProva:dia(10)})],
    revisoes:[{id:"p2",registroId:"s1",assuntos:["LAI"],data:dia(4),ordem:1,degrau:0,passo:4,feita:false,feitaEm:null,manual:true,planoProva:true}]});
  w=abrir(outra,"revisoes"); await espera(300);
  lista=daLAI(w);
  ok("prova mudou para mais tarde: a pausa segue até a data guardada",
     !lista.some(r=>!r.manual && r.data<=dia(10)) && lista.some(r=>!r.manual && r.data>dia(10) && r.data<dia(40)),
     lista.map(r=>off(r.data)+(r.planoProva?"P":"")));

  /* ---- 10. sem prova: nada disso aparece ---- */
  w=abrir(base({objetivo:"livre",dataProva:""}),"revisoes"); await espera(300);
  ok("em estudo contínuo (sem prova) o atalho não aparece", !atalho(w.document));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrevisões até a prova escolhidas por conteúdo");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
