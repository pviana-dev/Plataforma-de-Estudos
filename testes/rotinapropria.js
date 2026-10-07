/* ROTINA PRÓPRIA (pedido do Pedro, 23/09). Quem já tem a própria rotina — ou
   traz uma de fora — desliga a criação automática nos ajustes e marca as datas
   à mão, de preferência várias de uma vez: cada data vira um card. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const off=d=>Math.round((new Date(d+"T12:00")-new Date(hoje+"T12:00"))/864e5);
const sess=(id,ass,extra)=>Object.assign({id,data:dia(-3),disciplina:"Legislação",assuntos:[ass],assunto:ass,minutos:60,
  questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:dia(-3)},
             {id:"c2",disciplina:"Legislação",nome:"LGPD",fase:"andamento"}],
  registros:[sess("r1","LAI"), sess("r2","LGPD")],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const pend=w=>db(w).revisoes.filter(r=>!r.feita);
async function ajustes(w, mexer){
  click(w, w.document.getElementById("btnAjustes")); await espera(250);
  mexer(w.document);
  w.document.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(350);
}
async function abrirNovaRevisao(w, conteudo){
  click(w, w.document.querySelector('[data-aba="revisoes"]')); await espera(200);
  click(w, w.document.querySelector('[data-acao="nova-revisao"]')); await espera(250);
  const f=w.document.querySelector("#modalCorpo #formRevisao");
  const sd=f.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(50);
  const sel=w.document.querySelector("#campoAssunto");
  const op=[...sel.options].find(o=>o.value===conteudo); if(!op) throw new Error("sem opção "+conteudo+": "+[...sel.options].map(o=>o.value).join("|"));
  sel.value=op.value;
  (()=>{const _c=w.document.querySelector("#campoAssunto"),_n=w.document.querySelector("#novoConteudoNome");if(_c.value==="__novo")_n.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));else _c.dispatchEvent(new w.Event("change",{bubbles:true}));})();
  return f;
}

(async()=>{try{
  /* ---- 1. a chave nos ajustes, e desligar mantendo o que existe ---- */
  let w=abrir(base()); await espera(400);
  const autoAntes=pend(w).length;
  ok("com o automático ligado (padrão), a agenda nasce sozinha", autoAntes>0, autoAntes);
  await ajustes(w, doc=>{
    const cx=doc.querySelector('#formAjustes [name="automatico"]');
    ok("os ajustes têm a chave 'Criar os agendamentos automaticamente', marcada", !!cx && cx.checked);
    cx.checked=false; cx.dispatchEvent(new w.Event("change",{bubbles:true}));
    ok("desmarcando, aparece a pergunta sobre o que já está na agenda",
       doc.querySelector("#painelAutomatico").classList.contains("aberto"));
  });
  ok("desligado fica gravado", db(w).agendaAutomatica===false, db(w).agendaAutomatica);
  ok("'manter' (padrão): nada sumiu, e tudo passou a ser seu", pend(w).length===autoAntes && pend(w).every(r=>r.manual),
     pend(w).map(r=>r.data+(r.manual?"M":"")));
  ok("a aba Agenda avisa que a agenda é a sua rotina", /Agendamento automático desligado/.test(w.document.querySelector("#view").textContent));

  /* ---- 2. desligado, nada é criado nem empurrado ---- */
  const d0=JSON.stringify(pend(w).map(r=>r.id+r.data).sort());
  w=abrir(Object.assign(db(w))); await espera(400);
  ok("reabrir não cria nada (nem escada, nem retomada)", JSON.stringify(pend(w).map(r=>r.id+r.data).sort())===d0);
  w=abrir(base({agendaAutomatica:false, conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:hoje}]}));
  await espera(400);
  ok("conteúdo concluído, com o automático desligado, não ganha escada", pend(w).length===0, pend(w));

  /* ---- 3. desligar APAGANDO as automáticas pendentes ---- */
  // marcada à mão como o app grava (salvarRevisaoManual sempre deixa `rotulo`, mesmo vazio)
  w=abrir(base({revisoes:[{id:"mm",registroId:"r1",data:dia(40),ordem:1,feita:false,manual:true,minutos:null,
    questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",rotulo:""}]})); await espera(400);
  await ajustes(w, doc=>{
    const cx=doc.querySelector('#formAjustes [name="automatico"]'); cx.checked=false;
    doc.querySelector('#formAjustes [name="jaNaAgenda"][value="apagar"]').checked=true;
  });
  ok("'apagar': fica só o que foi marcado à mão", pend(w).length===1 && pend(w)[0].id==="mm", pend(w).map(r=>r.id));

  /* ---- 4. religar recria a agenda ---- */
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  ok("religando, a agenda automática volta", db(w).agendaAutomatica===true && pend(w).length>1, pend(w).length);

  /* ---- 4b. desligar MANTENDO, religar e desligar APAGANDO (defeito de 06/10):
     o que o "Manter" fez virar seu volta ao automático ao religar, e o "Apagar"
     alcança; a revisão marcada à mão fica nas três voltas ---- */
  w=abrir(base({revisoes:[{id:"mm",registroId:"r1",data:dia(40),ordem:1,feita:false,manual:true,minutos:null,
    questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",rotulo:""}]})); await espera(400);
  const desligar=apagar=>ajustes(w, doc=>{
    doc.querySelector('#formAjustes [name="automatico"]').checked=false;
    if(apagar) doc.querySelector('#formAjustes [name="jaNaAgenda"][value="apagar"]').checked=true;
  });
  await desligar(false);
  ok("'manter' guarda que a revisão veio do automático", pend(w).filter(r=>r.id!=="mm").every(r=>r.manual && r.doAutomatico)
     && !pend(w).find(r=>r.id==="mm").doAutomatico, pend(w).map(r=>r.id+(r.doAutomatico?"A":"")));
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  ok("religando, as mantidas voltam a ser automáticas (sem cópia por cima)",
     pend(w).filter(r=>r.id!=="mm").every(r=>!r.manual && !r.doAutomatico) && pend(w).find(r=>r.id==="mm").manual,
     pend(w).map(r=>r.id+(r.manual?"M":"")));
  await desligar(true);
  ok("e desligar com 'apagar' tira todas elas, menos a marcada à mão", pend(w).length===1 && pend(w)[0].id==="mm",
     pend(w).map(r=>r.id));

  /* ---- 4c. editar a mantida a torna sua de verdade: o 'apagar' não a alcança ---- */
  w=abrir(base()); await espera(400);
  await desligar(false);
  const alvo=pend(w).find(r=>r.doAutomatico);
  click(w, w.document.querySelector('[data-aba="revisoes"]')); await espera(200);
  const bEd=w.document.querySelector('[data-acao="editar-revisao"][data-id="'+alvo.id+'"]');
  ok("a mantida tem o botão editar na agenda", !!bEd);
  click(w, bEd); await espera(400);
  w.document.querySelector("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  ok("salvar a edição tira a marca", !db(w).revisoes.find(r=>r.id===alvo.id).doAutomatico);
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  await desligar(true);
  ok("a mantida que foi editada fica", pend(w).some(r=>r.id===alvo.id), pend(w).map(r=>r.id));

  /* ---- 4d. dados de antes da marca: as mantidas são reconhecidas na carga ---- */
  w=abrir(base({agendaAutomatica:false, revisoes:[
    {id:"velha",registroId:"r1",data:dia(5),ordem:1,degrau:1,passo:1,feita:false,manual:true,minutos:null,
     questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
    {id:"minha",registroId:"r1",data:dia(6),ordem:2,feita:false,manual:true,minutos:null,
     questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",rotulo:""},
    {id:"prova",registroId:"r1",data:dia(7),ordem:3,feita:false,manual:true,planoProva:true,minutos:null,
     questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]})); await espera(400);
  const marca=id=>!!db(w).revisoes.find(r=>r.id===id).doAutomatico;
  ok("sem rótulo e com sessão dona: reconhecida como vinda do automático", marca("velha"));
  ok("a marcada à mão e a escolhida até a prova não", !marca("minha") && !marca("prova"));
  ok("a busca roda uma vez só", db(w).mantidasMarcadas===true);

  /* ---- 4e. desligar APAGANDO TUDO: automáticas e marcadas à mão saem; feitas ficam ---- */
  const comMinha=()=>base({revisoes:[
    {id:"mm",registroId:"r1",data:dia(40),ordem:1,feita:false,manual:true,minutos:null,
     questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",rotulo:""},
    {id:"ff",registroId:"r1",data:dia(-1),feitaEm:dia(-1),ordem:1,feita:true,manual:false,minutos:null,
     questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]});
  w=abrir(comMinha()); await espera(400);
  let perguntou="";
  w.confirm=t=>{ perguntou=t; return false; };
  await ajustes(w, doc=>{
    doc.querySelector('#formAjustes [name="automatico"]').checked=false;
    const op=doc.querySelector('#formAjustes [name="jaNaAgenda"][value="tudo"]');
    ok("a opção 'apagar todas' aparece ao desligar", !!op); op.checked=true;
  });
  ok("apagar todas pede confirmação, dizendo que as marcadas à mão também saem",
     /Apagar todas/.test(perguntou) && /marcou à mão/.test(perguntou), perguntou);
  ok("cancelando, nada muda (nem o automático é desligado)", db(w).agendaAutomatica!==false && pend(w).length>1,
     [db(w).agendaAutomatica, pend(w).length]);
  w.confirm=()=>true;
  await ajustes(w, doc=>{
    doc.querySelector('#formAjustes [name="automatico"]').checked=false;
    doc.querySelector('#formAjustes [name="jaNaAgenda"][value="tudo"]').checked=true;
  });
  ok("confirmando, nenhuma revisão pendente fica — nem a marcada à mão", db(w).agendaAutomatica===false && pend(w).length===0,
     pend(w).map(r=>r.id));
  ok("a revisão feita continua no histórico", db(w).revisoes.some(r=>r.id==="ff"), db(w).revisoes.map(r=>r.id));

  /* ---- 4f. apagar só um tipo (pedido de 07/10): só as revisões ou só os cards de continuar.
     O outro tipo fica, com a marca de que veio do automático; a marcada à mão fica sempre ---- */
  for (const [modo, saiRet] of [["revisoes", false], ["continuar", true]]){
    w=abrir(comMinha()); await espera(400);
    const antes=pend(w).filter(r=>r.id!=="mm");
    ok("["+modo+"] a agenda tem revisões e card de continuar automáticos",
       antes.some(r=>r.retomada) && antes.some(r=>!r.retomada), antes.map(r=>r.retomada?"C":"R"));
    await ajustes(w, doc=>{
      doc.querySelector('#formAjustes [name="automatico"]').checked=false;
      const op=doc.querySelector('#formAjustes [name="jaNaAgenda"][value="'+modo+'"]');
      ok("["+modo+"] a opção aparece ao desligar", !!op); op.checked=true;
    });
    const resto=pend(w).filter(r=>r.id!=="mm");
    ok("["+modo+"] sai só o tipo escolhido", resto.length>0 && resto.every(r=>!!r.retomada===!saiRet),
       resto.map(r=>r.retomada?"C":"R"));
    ok("["+modo+"] o que fica vira seu, guardando a origem", resto.every(r=>r.manual && r.doAutomatico));
    ok("["+modo+"] a marcada à mão e a feita ficam", pend(w).some(r=>r.id==="mm") && db(w).revisoes.some(r=>r.id==="ff"));
  }

  /* ---- 4g. religar, venha de qual opção vier, segue o cronograma (pedido de 07/10):
     o que foi apagado renasce contando do último estudo (ver 4i) e o que foi mantido
     volta ao automático no lugar — igual, nos dois casos, a apagar tudo e religar ---- */
  const foto=w=>JSON.stringify(pend(w).map(r=>(r.retomada?"C":"R")+":"+r.data+(r.manual?"M":"")).sort());
  const parte=(f,t)=>JSON.stringify(JSON.parse(f).filter(x=>x[0]===t));
  w=abrir(base()); await espera(400);
  const normal=foto(w);
  w=abrir(base()); await espera(400);
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=false;
    doc.querySelector('#formAjustes [name="jaNaAgenda"][value="apagar"]').checked=true; });
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  const zero=foto(w);
  for (const modo of ["manter","apagar","revisoes","continuar","tudo"]){
    w=abrir(base()); await espera(400);
    await ajustes(w, doc=>{
      doc.querySelector('#formAjustes [name="automatico"]').checked=false;
      doc.querySelector('#formAjustes [name="jaNaAgenda"][value="'+modo+'"]').checked=true;
    });
    await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
    // revisões mantidas voltam como estavam; as apagadas renascem como no "zero"
    const esperado=JSON.stringify(JSON.parse(["manter","continuar"].includes(modo) ? parte(normal,"R") : parte(zero,"R"))
      .concat(JSON.parse(parte(zero,"C"))).sort());
    ok("["+modo+"] religando, a agenda segue o cronograma, sem atrasado", foto(w)===esperado && pend(w).every(r=>r.data>=hoje),
       [foto(w), esperado]);
  }

  /* ---- 4h. ligado, escolher o que o automático cria (pedido de 07/10) ---- */
  const tipo=(v,sai)=>doc=>{
    doc.querySelector('#formAjustes [name="automatico"]').checked=true;
    doc.querySelector('#formAjustes [name="tiposAuto"][value="'+v+'"]').checked=true;
    if(sai) doc.querySelector('#formAjustes [name="tipoSai"][value="'+sai+'"]').checked=true;
  };
  const autoDe=(w,ret)=>pend(w).filter(r=>!!r.retomada===ret && !r.manual);
  w=abrir(base()); await espera(400);
  click(w, w.document.getElementById("btnAjustes")); await espera(250);
  ok("ligado, aparece 'O que criar' com os dois marcados",
     w.document.querySelector("#painelTipos").classList.contains("aberto") &&
     w.document.querySelector('#formAjustes [name="tiposAuto"][value="ambos"]').checked);
  const rSo=w.document.querySelector('#formAjustes [name="tiposAuto"][value="revisoes"]');
  rSo.checked=true; rSo.dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("tirando os cards de continuar, pergunta o que fazer com os que já estão na agenda",
     w.document.querySelector("#painelTipoSai").classList.contains("aberto") &&
     /cards de continuar/.test(w.document.querySelector("#rotuloTipoSai").textContent));
  w.document.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("só revisões (manter): fica gravado", db(w).automaticoTipos==="revisoes" && db(w).agendaAutomatica!==false);
  ok("o card de continuar vira seu, guardando a origem; as revisões seguem automáticas",
     pend(w).filter(r=>r.retomada).every(r=>r.manual && r.doAutomatico) && autoDe(w,false).length>1,
     pend(w).map(r=>(r.retomada?"C":"R")+(r.manual?"M":"")));
  ok("a Agenda avisa que só as revisões são automáticas", /cria\s*só as revisões/.test(w.document.querySelector("#view").textContent));

  w=abrir(base()); await espera(400);
  await ajustes(w, tipo("revisoes","apagar"));
  ok("só revisões (apagar): o card de continuar automático sai", !pend(w).some(r=>r.retomada), pend(w).map(r=>r.retomada?"C":"R"));
  w=abrir(db(w)); await espera(400);
  ok("e reabrir o app não cria card de continuar", !pend(w).some(r=>r.retomada) && autoDe(w,false).length>1);

  w=abrir(base()); await espera(400);
  await ajustes(w, tipo("continuar","apagar"));
  ok("só cards de continuar (apagar): as revisões automáticas saem, o card fica automático",
     autoDe(w,false).length===0 && autoDe(w,true).length===1, pend(w).map(r=>(r.retomada?"C":"R")+(r.manual?"M":"")));
  w=abrir(db(w)); await espera(400);
  ok("e reabrir o app não cria a escada", autoDe(w,false).length===0);
  await ajustes(w, tipo("ambos"));
  ok("voltando aos dois, segue o cronograma", foto(w)===zero, [foto(w), zero]);

  w=abrir(base()); await espera(400);
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=false; });
  click(w, w.document.getElementById("btnAjustes")); await espera(250);
  const cx=w.document.querySelector('#formAjustes [name="automatico"]');
  ok("desligado, 'O que criar' fica escondido", !w.document.querySelector("#painelTipos").classList.contains("aberto"));
  cx.checked=true; cx.dispatchEvent(new w.Event("change",{bubbles:true}));
  const cSo=w.document.querySelector('#formAjustes [name="tiposAuto"][value="continuar"]');
  cSo.checked=true; cSo.dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("religando, aparece, e não pergunta do que sai (nada estava valendo)",
     w.document.querySelector("#painelTipos").classList.contains("aberto") &&
     !w.document.querySelector("#painelTipoSai").classList.contains("aberto"));
  w.document.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("religando só os cards de continuar: eles voltam ao automático; as revisões continuam suas",
     autoDe(w,true).length===1 && pend(w).filter(r=>!r.retomada).every(r=>r.manual && r.doAutomatico),
     pend(w).map(r=>(r.retomada?"C":"R")+(r.manual?"M":"")));

  /* ---- 4i. religar conta do último estudo (pedido de 07/10): o que já passou conta
     como feito, sem marcar nada, e só nasce a próxima data por vir — nada de pilha ---- */
  const velho=()=>base({diasRetomada:{1:4,2:4,3:4},
    conteudos:[{id:"a1",disciplina:"Legislação",nome:"A",fase:"andamento"},
               {id:"a2",disciplina:"Legislação",nome:"B",fase:"andamento"},
               {id:"a3",disciplina:"Legislação",nome:"C",fase:"andamento"},
               {id:"k1",disciplina:"Legislação",nome:"K",fase:"concluido",concluidoEm:dia(-20)},
               {id:"k2",disciplina:"Legislação",nome:"Z",fase:"concluido",concluidoEm:dia(-900)}],
    registros:[sess("s1","A",{data:dia(-11)}), sess("s2","B",{data:dia(-6)}), sess("s3","C",{data:dia(-1)}),
               sess("s4","K",{data:dia(-20)}), sess("s5","Z",{data:dia(-900)})]});
  w=abrir(velho()); await espera(400);
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=false;
    doc.querySelector('#formAjustes [name="jaNaAgenda"][value="apagar"]').checked=true; });
  ok("desligado apagando, a agenda fica vazia", pend(w).length===0, pend(w).length);
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  ok("religando, nada nasce atrasado", pend(w).every(r=>r.data>=hoje), pend(w).map(r=>r.data));
  const n=4, card=nome=>pend(w).find(r=>r.retomada && r.assuntos && r.assuntos[0]===nome);
  ok("cada card de continuar segue o ritmo do último estudo dele (o que passou conta como feito)",
     [["A",-11],["B",-6],["C",-1]].every(([c,u])=>{ const k=card(c); return k && (off(k.data)-u)%n===0 && off(k.data)-u>0 && off(k.data)-n<0; }),
     [n].concat(["A","B","C"].map(c=>card(c)&&off(card(c).data))));
  const revK=pend(w).filter(r=>!r.retomada && r.assuntos && r.assuntos[0]==="K").sort((a,b)=>a.data.localeCompare(b.data));
  const fk=JSON.parse(JSON.stringify(db(w).conteudos.find(c=>c.nome==="K")));
  ok("a escada do concluído segue do degrau que ainda está por vir, sem pilha hoje",
     revK.length>0 && off(revK[0].data)>=0 && fk.ancoraEscada && off(fk.ancoraEscada.dia)<0,
     [revK.map(r=>off(r.data)), fk.ancoraEscada]);
  ok("escada que já passou inteira não renasce", !pend(w).some(r=>r.assuntos && r.assuntos[0]==="Z"));
  const f1=foto(w);
  w=abrir(db(w)); await espera(400);
  ok("e reabrir o app não refaz nada do começo", foto(w)===f1, [foto(w), f1]);

  /* ---- 5. várias datas de uma vez ---- */
  w=abrir(base({agendaAutomatica:false})); await espera(400);
  let f=await abrirNovaRevisao(w,"LGPD");
  const caixa=w.document.querySelector("#dataRevisao");
  for (const n of [2,5,9]){ caixa.value=dia(n); click(w, w.document.querySelector('[data-acao="add-data-rev"]')); }
  ok("cada data vira uma etiqueta", w.document.querySelectorAll('#datasRevisao .tag').length===3);
  click(w, w.document.querySelector('#datasRevisao .tag[data-data="'+dia(5)+'"] [data-acao="tirar-data-rev"]'));
  ok("e dá para tirar uma", w.document.querySelectorAll('#datasRevisao .tag').length===2);
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  let lg=pend(w).filter(r=>(r.assuntos||[]).includes("LGPD") || r.registroId==="r2").map(r=>off(r.data)).sort((a,b)=>a-b);
  ok("salvando, nasce um card por data", lg.join()==="2,9", lg);

  /* ---- 6. atalhos: a cada N dias, K vezes; e a escada ---- */
  f=await abrirNovaRevisao(w,"LAI");
  w.document.querySelector("#dataRevisao").value=dia(1);
  w.document.querySelector("#cadeiaCada").value="3"; w.document.querySelector("#cadeiaVezes").value="4";
  click(w, w.document.querySelector('[data-acao="gerar-datas-rev"]'));
  const geradas=[...w.document.querySelectorAll('#datasRevisao input[name="datas"]')].map(i=>off(i.value));
  ok("'a cada 3 dias, 4 vezes' gera 4 datas", geradas.join()==="1,4,7,10", geradas);
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  const lai=pend(w).filter(r=>r.registroId==="r1").map(r=>off(r.data)).sort((a,b)=>a-b);
  ok("e os 4 cards são criados, sem ninguém empurrar as datas (automático desligado)", lai.join()==="1,4,7,10", lai);
  f=await abrirNovaRevisao(w,"LAI");
  w.document.querySelector("#dataRevisao").value=hoje;
  click(w, w.document.querySelector('[data-acao="escada-datas-rev"]'));
  const esc=[...w.document.querySelectorAll('#datasRevisao input[name="datas"]')].map(i=>off(i.value));
  ok("o atalho da escada gera D+1, 3, 7, 16, 35", esc.join()==="1,3,7,16,35", esc);

  /* ---- 7. uma data só continua como antes ---- */
  click(w, w.document.querySelector('[data-acao="cancelar-revisao"]')); await espera(150);
  f=await abrirNovaRevisao(w,"LGPD");
  w.document.querySelector("#dataRevisao").value=dia(20);
  const antes7=pend(w).length;
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("sem etiqueta, a caixa de data sozinha cria um card", pend(w).length===antes7+1 && pend(w).some(r=>r.data===dia(20)),
     [antes7, pend(w).length]);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrotina própria e datas em cadeia funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
