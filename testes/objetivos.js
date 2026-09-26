/* O OBJETIVO DE ESTUDO: Sem objetivo, Concurso e Vestibular/ENEM. Trocar de
   modo a qualquer momento sem perder nada; vestibular com quantos dias
   quiser; ligação OPCIONAL de disciplina/conteúdo a um dia, com silêncio
   depois do dia dele e volta espalhada depois do último. */
const responderDialogos=require("./_dialogo.cjs");
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,disc,ass,d,dif)=>({id,data:d||hoje,disciplina:disc,assuntos:ass,assunto:ass[0],minutos:60,
  questoes:0,acertos:0,dificuldade:dif||3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.replace(/\D/g,""))||1});
const ficha=(disc,nome,extra)=>Object.assign({id:"c-"+nome,disciplina:disc,nome,fase:"concluido",concluidoEm:hoje},extra||{});
const item=(id,registroId,data,extra)=>Object.assign({id,registroId,data,ordem:1,feita:false,feitaEm:null,minutos:null,
  questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",manual:false},extra||{});
const VEST=(dias,disciplinas)=>({objetivo:"vestibular",dataProva:"",vestibular:{dias,disciplinas:disciplinas||{}}});
function abrir(extra, semSeed, aba){
  const seed=Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
    disciplinas:["Legislação","Português"],lancamentos:[],conteudos:[],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true;
     if (!semSeed) w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"revisoes",gravadoEm:hoje}));
     w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const $=(w,s)=>w.document.querySelector(s);
// o número e o texto vêm em elementos colados (<b>10</b><span>dias…): junta com um espaço
const topo=w=>[...$(w,"#regressiva").childNodes].map(n=>n.textContent).join(" ").replace(/🔥/g,"").replace(/\s+/g," ").trim();
async function ajustes(w, fn){
  click(w, $(w,"#btnAjustes")); await espera(250);
  await fn(w.document);
  $(w,"#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(350);
}
const escolher=(doc,v)=>{ const r=doc.querySelector('[name="objetivo"][value="'+v+'"]'); r.checked=true;
  r.dispatchEvent(new doc.defaultView.Event("change",{bubbles:true})); };
const automaticas=(w,filtro)=>db(w).revisoes.filter(r=>!r.feita && !r.manual && (!filtro || filtro(r)));
function porConteudo(doc, w, nome){             // o mesmo atalho de formrev.js
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const achada=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (achada) sel.value=achada.value;
  else { sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
         doc.querySelector("#novoConteudoNome").value=nome; }
  click(w, doc.querySelector('[data-acao="add-assunto"]'));
  return true;
}
const sessaoDe=(w,r)=>db(w).registros.find(x=>x.id===r.registroId);

(async()=>{try{
  /* ---- 1. dado antigo: o modo sai da data da prova ---- */
  let w=abrir({dataProva:dia(30)}); await espera(300);
  ok("base com data de prova vira Concurso", db(w).objetivo==="concurso", db(w).objetivo);
  ok("e não pergunta nada", $(w,"#overlay").hidden);
  w=abrir({dataProva:""}); await espera(300);
  ok("base sem data vira Sem objetivo", db(w).objetivo==="livre", db(w).objetivo);
  // desde 25/09: sem data de prova, a contagem some e o card das datas mostra só hoje
  ok("sem data de prova, a contagem some e o card mostra só hoje",
     $(w,"#regressiva").hidden && !topo(w).trim() && /^Hoje\d/.test($(w,"#chipData").textContent.trim()) &&
     !/Prova|Sem objetivo/.test($(w,"#chipData").textContent), [topo(w), $(w,"#chipData").textContent]);

  /* ---- 2. primeira abertura ---- */
  w=abrir(null, true); await espera(300);
  ok("sem dado nenhum, a pergunta abre", !$(w,"#overlay").hidden &&
     /Para que você estuda/.test($(w,"#modalTitulo").textContent), $(w,"#modalTitulo").textContent);
  ok("e o modo já fica Sem objetivo (fechar também é resposta)", db(w).objetivo==="livre", db(w).objetivo);
  ok("sem a data fixa antiga", db(w).dataProva==="", db(w).dataProva);
  escolher(w.document,"vestibular");
  ok("escolher Vestibular abre os dias", $(w,"#painelVestibular").classList.contains("aberto"));
  let linhas=w.document.querySelectorAll(".dia-prova");
  linhas[0].querySelector('[name="diaNome"]').value="1ª fase";
  linhas[0].querySelector('[name="diaData"]').value=dia(10);
  click(w, $(w,'[data-acao="add-dia-prova"]'));
  click(w, $(w,'[data-acao="add-dia-prova"]'));
  linhas=w.document.querySelectorAll(".dia-prova");
  ok("dá para ter quantos dias quiser", linhas.length===3, linhas.length);
  linhas[1].querySelector('[name="diaNome"]').value="2ª fase";
  linhas[1].querySelector('[name="diaData"]').value=dia(24);
  linhas[2].querySelector('[name="diaNome"]').value="3ª fase";
  linhas[2].querySelector('[name="diaData"]').value=dia(17);
  $(w,"#formObjetivo").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  let d=db(w);
  ok("grava Vestibular com os três dias, em ordem de data", d.objetivo==="vestibular" &&
     d.vestibular.dias.map(x=>x.nome).join(",")==="1ª fase,3ª fase,2ª fase", d.vestibular);
  ok("o topo conta até o primeiro, pelo nome", /10 dias para 1ª fase/.test(topo(w)), topo(w));

  /* ---- 3. a contagem salta de dia em dia ---- */
  w=abrir(VEST([{id:"d1",nome:"1º dia",data:dia(-2)},{id:"d2",nome:"2º dia",data:dia(5)}])); await espera(300);
  ok("passado o 1º dia, conta para o 2º", /5 dias para 2º dia/.test(topo(w)), topo(w));
  ok("e não pergunta o pós-prova entre os dias", $(w,"#overlay").hidden);
  w=abrir(VEST([{id:"d1",nome:"1º dia",data:hoje},{id:"d2",nome:"2º dia",data:dia(7)}])); await espera(300);
  ok("no dia, diz que é hoje", /hoje é 1º dia/.test(topo(w)), topo(w));
  w=abrir(VEST([{id:"d1",nome:"1º dia",data:dia(-9)},{id:"d2",nome:"2º dia",data:dia(-2)}])); await espera(300);
  ok("depois do último, pergunta o pós-prova", /E depois da prova/.test($(w,"#modalTitulo").textContent),
     $(w,"#modalTitulo").textContent);

  /* ---- 4. agendamento: nada em dia de prova nem depois do último ---- */
  const base4={registros:[sess("r1","Legislação",["LAI"]), sess("r2","Português",["Crase"])],
               conteudos:[ficha("Legislação","LAI"), ficha("Português","Crase")]};
  w=abrir(Object.assign({}, base4, VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(20)}])));
  await espera(300); await ajustes(w, ()=>{});
  let revs=automaticas(w);
  ok("sem ligação nenhuma, os cards nascem normalmente", revs.length>=4, revs.length);
  ok("nenhum cai num dia de prova", !revs.some(r=>r.data===dia(10)||r.data===dia(20)), revs.map(r=>r.data));
  // a prova não corta a escada (decisão do Pedro, 23/09): as revisões seguem depois dela
  ok("e a escada segue depois do último dia", revs.some(r=>r.data>dia(20)), revs.map(r=>r.data));
  ok("e o espaço entre os dias é usado", revs.some(r=>r.data>dia(10)), revs.map(r=>r.data));

  /* ---- 5. ligação opcional: o conteúdo ligado é cobrado só até a véspera do seu dia ---- */
  w=abrir(Object.assign({}, base4, VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(20)}])),
          false, "conteudos");
  await espera(300); await ajustes(w, ()=>{});        // gera a agenda de todo mundo antes de ligar
  const selDisc=[...w.document.querySelectorAll("select[data-vinc-disc]")].find(s=>s.dataset.vincDisc==="Legislação" && !s.dataset.vincCont);
  ok("com dois dias, a aba Disciplinas oferece a ligação", !!selDisc);
  selDisc.value="d1"; selDisc.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("ligar a disciplina grava pelo nome", db(w).vestibular.disciplinas["Legislação"]==="d1", db(w).vestibular);
  revs=automaticas(w);
  const lai=revs.filter(r=>sessaoDe(w,r).disciplina==="Legislação"), crase=revs.filter(r=>sessaoDe(w,r).disciplina==="Português");
  // a ligação não corta mais a escada: ela só silencia o conteúdo durante os dias de prova
  ok("ligar não corta a escada de Legislação", lai.length && lai.some(r=>r.data>dia(10)), lai.map(r=>r.data));
  ok("Português, sem ligação, continua até o último dia", crase.some(r=>r.data>dia(10)), crase.map(r=>r.data));
  // exceção por conteúdo: LAI sai do dia da disciplina
  const selCont=[...w.document.querySelectorAll("select[data-vinc-cont]")].find(s=>s.dataset.vincCont==="LAI");
  ok("cada conteúdo tem a sua exceção", !!selCont);
  selCont.value="-"; selCont.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("conteúdo com 'nenhum dia' volta a valer até o último", automaticas(w,r=>sessaoDe(w,r).disciplina==="Legislação")
     .some(r=>r.data>dia(10)), automaticas(w).map(r=>r.data));
  // com um dia só, não há o que ligar
  w=abrir(Object.assign({}, base4, VEST([{id:"d1",nome:"ENEM",data:dia(10)}])), false, "conteudos"); await espera(300);
  ok("com um dia só, a ligação nem aparece", !w.document.querySelector("select[data-vinc-disc]"));

  /* ---- 6. silêncio ---- */
  const base6=Object.assign({
    registros:[sess("r1","Legislação",["LAI"],dia(-20)), sess("r2","Português",["Crase"],dia(-20)),
               sess("r3","Legislação",["Decreto"],dia(-20))],
    conteudos:[ficha("Legislação","LAI",{fase:"andamento"}), ficha("Português","Crase",{fase:"andamento"}),
               ficha("Legislação","Decreto",{fase:"andamento",diaProva:"-"})],
    revisoes:[item("v1","r1",dia(-3),{retomada:true}), item("m1","r1",dia(2),{manual:true}),
              item("v2","r2",dia(-2),{retomada:true}), item("v3","r3",dia(-2),{retomada:true})]},
    VEST([{id:"d1",nome:"1º dia",data:dia(-1)},{id:"d2",nome:"2º dia",data:dia(6)}],{"Legislação":"d1"}));
  w=abrir(base6); await espera(300);
  const tela=$(w,"#view").textContent;
  ok("o conteúdo em silêncio some da agenda", !/LAI/.test(tela), tela.slice(0,200));
  ok("o que não está em silêncio continua", /Crase/.test(tela));
  ok("a exceção 'nenhum dia' não silencia", /Decreto/.test(tela));
  ok("o atrasado escondido não conta como atraso", !/3 atrasad/i.test(tela) &&
     /Atrasad/.test(tela), tela.match(/Atrasad[^0-9]*\d+/));
  ok("mas continua guardado", ["v1","m1"].every(id=>db(w).revisoes.some(r=>r.id===id)));
  await ajustes(w, ()=>{});
  ok("salvar os ajustes (replaneja tudo) não apaga o que está em silêncio",
     ["v1","m1"].every(id=>db(w).revisoes.some(r=>r.id===id)), db(w).revisoes.map(r=>r.id));
  ok("nem cria volta nova para ele", !db(w).revisoes.some(r=>r.registroId==="r1" && !["v1","m1"].includes(r.id)),
     db(w).revisoes.filter(r=>r.registroId==="r1"));
  // item misto: LAI (em silêncio) + Decreto (sem dia) continua aparecendo
  w=abrir(Object.assign({}, base6, {registros:base6.registros.concat([sess("r4","Legislação",["LAI","Decreto"],dia(-20))]),
    revisoes:[item("x1","r4",dia(-2),{retomada:true})]})); await espera(300);
  ok("item com um conteúdo ainda ativo não silencia", /LAI · Decreto|Decreto · LAI/.test($(w,"#view").textContent));

  /* ---- 7. depois do último dia: volta com data nova e espalhada ---- */
  const muitos=["A","B","C","D","E","F","G"];
  const base7=Object.assign({
    registros:muitos.map((n,i)=>sess("p"+(i+1),"Português",[n],dia(-30),(i%3)+1)).concat([sess("r1","Legislação",["LAI"],dia(-30))]),
    conteudos:muitos.map(n=>ficha("Português",n,{concluidoEm:dia(-30)})).concat([ficha("Legislação","LAI",{concluidoEm:dia(-30)})]),
    revisoes:[item("m1","r1",dia(-4),{manual:true})]},
    VEST([{id:"d1",nome:"1º dia",data:dia(-8)},{id:"d2",nome:"2º dia",data:dia(-1)}],{"Legislação":"d1"}));
  w=abrir(base7); await espera(300);
  ok("a pergunta do pós-prova abre", /E depois da prova/.test($(w,"#modalTitulo").textContent));
  click(w, $(w,'[data-acao="salvar-pos-prova"]')); await espera(400);
  d=db(w);
  ok("continuo: o objetivo vira Sem objetivo", d.objetivo==="livre", d.objetivo);
  ok("e os dias ficam guardados", d.vestibular.dias.length===2, d.vestibular.dias);
  const m1=d.revisoes.find(r=>r.id==="m1");
  ok("o item escondido volta com data nova, não atrasado", m1 && m1.data>hoje && m1.dataOriginal===dia(-4), m1);
  const primeiras={};
  d.registros.forEach(reg=>{
    const l=d.revisoes.filter(r=>r.registroId===reg.id && !r.feita && !r.retomada).map(r=>r.data).sort();
    if (l.length) primeiras[l[0]]=(primeiras[l[0]]||0)+1;
  });
  ok("as primeiras revisões ficam espalhadas: no máximo 3 por dia", Object.values(primeiras).every(n=>n<=3) &&
     Object.keys(primeiras).length>=3, primeiras);

  /* ---- 8. trocar de modo não apaga nada ---- */
  w=abrir(Object.assign({posProva:"encerrei", dataProva:dia(-40)},
    VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(20)}],{"Legislação":"d1"})));
  await espera(300);
  await ajustes(w, doc=>{ escolher(doc,"concurso"); doc.querySelector('[name="dataProva"]').value=dia(30); });
  d=db(w);
  ok("vira Concurso com a data nova", d.objetivo==="concurso" && d.dataProva===dia(30), [d.objetivo,d.dataProva]);
  ok("os dias do vestibular e a ligação ficam guardados", d.vestibular.dias.length===2 && d.vestibular.disciplinas["Legislação"]==="d1", d.vestibular);
  ok("trocar de modo zera o 'encerrei' antigo", d.posProva==="", d.posProva);
  ok("o topo conta para a prova", /30 dias para a prova/.test(topo(w)), topo(w));
  await ajustes(w, doc=>escolher(doc,"vestibular"));
  d=db(w);
  ok("voltar ao vestibular encontra tudo como era", d.objetivo==="vestibular" && d.vestibular.dias.length===2 &&
     d.dataProva===dia(30), d);
  await ajustes(w, doc=>escolher(doc,"livre"));
  ok("Sem objetivo mantém as duas configurações", db(w).dataProva===dia(30) && db(w).vestibular.dias.length===2);
  await ajustes(w, doc=>{ escolher(doc,"concurso"); doc.querySelector('[name="dataProva"]').value=""; });
  ok("concurso sem data: a contagem some (não há o que contar)", db(w).objetivo==="concurso" && $(w,"#regressiva").hidden, topo(w));

  /* ---- 9. validação dos dias ---- */
  w=abrir(VEST([{id:"d1",nome:"1º dia",data:dia(-1)},{id:"d2",nome:"2º dia",data:dia(6)}],{"Legislação":"d1"}));
  await espera(300);
  await ajustes(w, ()=>{});
  ok("um dia gravado que já passou não trava o salvar", $(w,"#overlay").hidden, $(w,"#erroAjustes") && $(w,"#erroAjustes").textContent);
  await ajustes(w, doc=>{ doc.querySelectorAll('[name="diaData"]')[1].value=dia(-3); });
  ok("data nova no passado é recusada", /depois de hoje/.test($(w,"#erroAjustes").textContent), $(w,"#erroAjustes").textContent);
  click(w,$(w,'[data-acao="fechar-modal"]')); await espera(100);
  await ajustes(w, doc=>{ click(w, doc.querySelector('[data-acao="add-dia-prova"]'));
    const l=doc.querySelectorAll('[name="diaData"]'); l[l.length-1].value=dia(6); });
  ok("dois dias na mesma data são recusados", /mesma data/.test($(w,"#erroAjustes").textContent), $(w,"#erroAjustes").textContent);
  click(w,$(w,'[data-acao="fechar-modal"]')); await espera(100);
  await ajustes(w, doc=>{ click(w, doc.querySelector('.dia-prova[data-id="d1"] [data-acao="tirar-dia-prova"]')); });
  d=db(w);
  ok("tirar um dia desfaz as ligações a ele", d.vestibular.dias.length===1 && !d.vestibular.disciplinas["Legislação"], d.vestibular);

  /* ---- 10. revisão à mão: dia de prova é recusado, o intervalo entre eles não ---- */
  w=abrir(Object.assign({}, base4, VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(20)}])));
  await espera(300);
  const novaRev=async data=>{
    click(w, $(w,'[data-acao="nova-revisao"]')); await espera(250);
    const f=$(w,"#modalCorpo #formRevisao");
    f.querySelector("[name=data]").value=data;
    const sd=f.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
    await espera(50);
    porConteudo(w.document, w, "LAI");
    f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  };
  await novaRev(dia(10));
  ok("no dia de prova, recusa", /dia é de prova/.test(($(w,"#erroRevisao")||{}).textContent||""), ($(w,"#erroRevisao")||{}).textContent);
  click(w,$(w,'[data-acao="fechar-modal"]')); await espera(100);
  await novaRev(dia(15));
  ok("entre os dias, aceita", db(w).revisoes.some(r=>r.manual && r.data===dia(15)), ($(w,"#erroRevisao")||{}).textContent);

  // depois da prova (inclusive com "encerrei"), a revisão à mão vale em qualquer data
  w=abrir(Object.assign({}, base4, {dataProva:dia(-5), posProva:"encerrei"})); await espera(300);
  await novaRev(dia(12));
  ok("prova passada e agendamento encerrado: revisão à mão depois dela é aceita",
     db(w).revisoes.some(r=>r.manual && r.data===dia(12)), ($(w,"#erroRevisao")||{}).textContent);
  ok("e o encerrado continua sem criar nada sozinho", db(w).revisoes.filter(r=>!r.manual).length===0,
     db(w).revisoes);
  // com a prova à frente, marcar depois dela também vale: as revisões seguem normalmente
  w=abrir(Object.assign({}, base4, {dataProva:dia(20)})); await espera(300);
  await novaRev(dia(25));
  ok("com a prova à frente, revisão à mão depois dela é aceita", db(w).revisoes.some(r=>r.manual && r.data===dia(25)),
     ($(w,"#erroRevisao")||{}).textContent);

  /* ---- 11. renomear a disciplina leva a ligação junto ---- */
  w=abrir(Object.assign({}, base4, VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(20)}],{"Legislação":"d1"})),
          false, "conteudos");
  responderDialogos(w, ()=>"Direito"); await espera(300);
  click(w, [...w.document.querySelectorAll('[data-acao="renomear-disciplina"]')].find(b=>b.dataset.disc==="Legislação"));
  await espera(400);
  ok("a ligação acompanha o nome novo", db(w).vestibular.disciplinas["Direito"]==="d1" && !db(w).vestibular.disciplinas["Legislação"],
     db(w).vestibular.disciplinas);

  /* ---- 12. a ★ diz "Importante" em todos os modos ---- */
  for (const [nome, extra] of [["Concurso",{dataProva:dia(30)}],
       ["Vestibular",VEST([{id:"d1",nome:"1º dia",data:dia(10)},{id:"d2",nome:"2º dia",data:dia(17)}])],
       ["Sem objetivo",{dataProva:""}]]){
    w=abrir(Object.assign({erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",ensinamento:"prazo de 20 dias",
      importante:true,criadoEm:1,data:hoje}]}, extra), false, "erros"); await espera(300);
    const t=$(w,"#view").textContent;
    ok(nome+": a ★ diz Importante, nunca véspera", /importantes/i.test(t) && !/véspera/i.test(t), t.slice(0,160));
  }

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nobjetivos de estudo funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
