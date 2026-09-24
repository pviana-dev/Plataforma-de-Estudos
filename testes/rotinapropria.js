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
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
     w.confirm=()=>true; w.alert=()=>{}; }});
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
  click(w, w.document.querySelector('[data-acao="add-assunto"]'));
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
  w=abrir(base({revisoes:[{id:"mm",registroId:"r1",data:dia(40),ordem:1,feita:false,manual:true,minutos:null,
    questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]})); await espera(400);
  await ajustes(w, doc=>{
    const cx=doc.querySelector('#formAjustes [name="automatico"]'); cx.checked=false;
    doc.querySelector('#formAjustes [name="jaNaAgenda"][value="apagar"]').checked=true;
  });
  ok("'apagar': fica só o que foi marcado à mão", pend(w).length===1 && pend(w)[0].id==="mm", pend(w).map(r=>r.id));

  /* ---- 4. religar recria a agenda ---- */
  await ajustes(w, doc=>{ doc.querySelector('#formAjustes [name="automatico"]').checked=true; });
  ok("religando, a agenda automática volta", db(w).agendaAutomatica===true && pend(w).length>1, pend(w).length);

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
