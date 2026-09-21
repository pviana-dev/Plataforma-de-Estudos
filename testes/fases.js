const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* O conteúdo agora se escolhe numa lista. Este atalho faz o que a pessoa faz:
   escolhe "criar novo", digita o nome e clica em adicionar. */
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const existe=[...sel.options].some(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (existe){ sel.value=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase()).value; }
  else {
    sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
    const campo=doc.querySelector("#novoConteudoNome"); if (!campo) return false;
    campo.value=nome;
  }
  const bt=doc.querySelector('[data-acao="add-assunto"]');
  bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return true;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const seedBase=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  disciplinas:["Legislação"],grupos:[],lancamentos:[],registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"revisoes",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const revs=w=>db(w).revisoes;
const off=(w)=>revs(w).filter(r=>!r.feita).map(r=>Math.round((new Date(r.data+"T12:00")-new Date(hoje+"T12:00"))/864e5)).sort((a,b)=>a-b);
/* O plano nasce quando a sessão é gravada (não na carga). Regravar a sessão é
   o gatilho, igual ao que acontece na vida real. */
async function gravarSessao(w){
  const doc=w.document;
  doc.querySelector('[data-aba="registros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  doc.querySelector('[data-acao="editar-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  doc.querySelector("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(350);
  doc.querySelector('[data-aba="revisoes"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
}

(async()=>{try{
  /* ---- 1. conteúdo novo nasce em andamento, com UMA volta ---- */
  let w=abrir(seedBase({registros:[sess("r1")]})); await espera(400);
  await gravarSessao(w);
  const ficha=(ww,nome)=>(db(ww).conteudos||[]).find(c=>c.nome===(nome||"LAI"));
  ok("o conteúdo nasce em andamento", ficha(w).fase==="andamento", ficha(w));
  ok("e ganha uma volta só, não uma fila", revs(w).length===1, revs(w).map(r=>r.data));
  ok("marcada como volta, não revisão", revs(w)[0].retomada===true, revs(w)[0]);
  ok("a volta é curta (2 dias, dificuldade média)", off(w)[0]===2, off(w));
  ok("e o card mostra que o conteúdo está aberto",
     /em andamento/.test(w.document.querySelector("#view").textContent));
  ok("o item se chama Retomar, não Revisão 1",
     /Retomar/.test(w.document.querySelector(".grupo-rev .item .titulo").textContent),
     w.document.querySelector(".grupo-rev .item .titulo").textContent);

  /* ---- 2. dificuldade encurta a volta ---- */
  w=abrir(seedBase({registros:[sess("r1",{dificuldade:5})]})); await espera(400);
  await gravarSessao(w);
  ok("conteúdo difícil chama de volta no dia seguinte", off(w)[0]===1, off(w));
  w=abrir(seedBase({registros:[sess("r1",{dificuldade:1,questoes:10,acertos:9})]})); await espera(400);
  await gravarSessao(w);
  ok("conteúdo tranquilo e indo bem dá mais folga", off(w)[0]===4, off(w));

  /* ---- 3. fechar o conteúdo começa a escada, a partir de hoje ---- */
  w=abrir(seedBase({registros:[sess("r1",{data:dia(-10)})]})); await espera(400);
  await gravarSessao(w);
  const doc=w.document;
  const fechar=doc.querySelector('[data-acao="concluir-conteudo"]');
  ok("o card traz o botão de fechar o conteúdo", !!fechar, doc.querySelector(".grupo-rev .cab").textContent);
  fechar.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  ok("a ficha do conteúdo fica concluída", ficha(w).fase==="concluido", ficha(w));
  ok("com o dia em que foi fechada", ficha(w).concluidoEm===hoje, ficha(w).concluidoEm);
  const o=off(w);
  console.log("      escada depois de fechar: D+"+o.join(", D+"));
  ok("a escada nasce inteira", o.length>=4, o);
  ok("contada de HOJE, não do dia do estudo", o[0]===1, o);
  ok("nenhuma volta sobrou", revs(w).every(r=>!r.retomada||r.feita), revs(w).map(r=>[r.data,!!r.retomada]));
  ok("e o item volta a se chamar Revisão 1",
     /Revisão 1/.test(doc.querySelector(".grupo-rev .item .titulo").textContent),
     doc.querySelector(".grupo-rev .item .titulo").textContent);

  /* ---- 4. reabrir desfaz ---- */
  doc.querySelector('[data-acao="reabrir-conteudo"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("reabrir volta para em andamento", ficha(w).fase==="andamento", ficha(w));
  ok("e a fila encolhe para uma volta", revs(w).filter(r=>!r.feita).length===1, revs(w).length);

  /* ---- 5. fechar uma volta abre a sessão como ESTUDO ---- */
  w=abrir(seedBase({registros:[sess("r1",{data:dia(-3)})]}),"registros"); await espera(400);
  await gravarSessao(w);
  // traz a volta para hoje, para poder marcá-la
  const rev=revs(w)[0];
  const st=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
  st.revisoes[0].data=hoje; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(st));
  w=abrir(st,"revisoes"); await espera(400);
  const marcar=w.document.querySelector('.grupo-rev [data-acao="concluir"]');
  marcar.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  const tipoSel=w.document.querySelector('#modalCaixa [name="tipo"]:checked');
  ok("marcar a volta abre a sessão já como Estudo", tipoSel && tipoSel.value==="estudo",
     tipoSel && tipoSel.value);
  ok("e mostra qual volta está sendo fechada", !!w.document.querySelector("#revisaoAlvo"),
     w.document.querySelector("#modalCorpo").textContent.slice(0,80));
  w.document.querySelector('#modalCaixa [name="minutos"]').value="50";
  w.document.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(450);
  const nova=db(w).registros.find(r=>r.id!=="r1");
  ok("a sessão de estudo é gravada", !!nova && nova.minutos===50, nova && nova.minutos);
  ok("e fecha a volta", db(w).revisoes.find(r=>r.id===rev.id).feita===true,
     db(w).revisoes.map(r=>[r.id,r.feita]));
  ok("nascendo a próxima volta", db(w).revisoes.filter(r=>!r.feita && r.retomada).length===1,
     db(w).revisoes.map(r=>[r.data,r.feita,!!r.retomada]));

  /* ---- 6. o formulário pergunta a fase, com "ainda não" por padrão ---- */
  w=abrir(seedBase({registros:[sess("r1")]}),"registros"); await espera(400);
  w.document.querySelector('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(350);
  // a fase saiu do formulário: ela é do conteúdo, e a tela só mostra como está
  ok("o formulário mostra a fase dos conteúdos, sem perguntar",
     /Fase dos conteúdos/.test(w.document.querySelector("#modalCorpo").textContent) &&
     !w.document.querySelector('#modalCaixa [name="fase"]'),
     w.document.querySelector("#modalCorpo").textContent.slice(0,120));

  /* ---- 7. migração: o que já existia vira em andamento ---- */
  const antigo=seedBase({registros:[{id:"rX",data:dia(-20),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
    minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],
   revisoes:[
    {id:"a1",registroId:"rX",data:dia(2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
    {id:"a2",registroId:"rX",data:dia(9),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
    {id:"a3",registroId:"rX",data:dia(20),ordem:3,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
    {id:"m1",registroId:"rX",data:dia(40),ordem:4,feita:false,manual:true,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"minha"},
    {id:"f1",registroId:"rX",data:dia(-2),ordem:5,feita:true,feitaEm:dia(-2),manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]});
  w=abrir(antigo); await espera(450);
  const d7=db(w);
  ok("a sessão antiga passou a em andamento", d7.registros[0].fase==="andamento", d7.registros[0].fase);
  ok("e o conteúdo dela virou ficha no cadastro",
     (d7.conteudos||[]).some(c=>c.nome==="LAI" && c.disciplina==="Legislação"), d7.conteudos);
  ok("das automáticas pendentes sobrou a mais próxima",
     d7.revisoes.filter(r=>!r.feita && !r.manual).map(r=>r.id).join(",")==="a1",
     d7.revisoes.filter(r=>!r.feita&&!r.manual).map(r=>r.id));
  ok("a que eu marquei à mão continua", !!d7.revisoes.find(r=>r.id==="m1"));
  ok("e a já feita também", !!d7.revisoes.find(r=>r.id==="f1"));
  ok("a migração roda uma vez só", d7.fasesMigradas===true);
  ok("e a plataforma avisa o que aconteceu",
     /passaram a .em andamento/.test(w.document.getElementById("toast").textContent),
     w.document.getElementById("toast").textContent);

  /* ---- 8. quem já vinha com fase não é tocado ---- */
  const fechadoSeed=seedBase({registros:[sess("r1",{fase:"concluido",concluidoEm:hoje})],
    revisoes:[{id:"b1",registroId:"r1",data:dia(3),ordem:1,feita:false,manual:false,minutos:null,questoes:null,
      acertos:null,dificuldade:null,atividade:"",nota:""},
     {id:"b2",registroId:"r1",data:dia(10),ordem:2,feita:false,manual:false,minutos:null,questoes:null,
      acertos:null,dificuldade:null,atividade:"",nota:""}]});
  w=abrir(fechadoSeed); await espera(400);
  ok("conteúdo já fechado mantém a fila inteira",
     db(w).revisoes.filter(r=>!r.feita).length>=2, db(w).revisoes.map(r=>r.id));
  /* ---- 9. CONTINUAÇÃO: duas sessões do mesmo conteúdo, uma volta só ---- */
  const duas=seedBase({fasesMigradas:true, registros:[
    sess("r1",{data:dia(-2)}),
    Object.assign(sess("r2"),{minutos:50,criadoEm:2})]});
  w=abrir(duas,"registros"); await espera(400);
  const doc9=w.document;
  for (const id of ["r1","r2"]){
    const linha=[...doc9.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
    linha.querySelector("td").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
    doc9.querySelector("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
    await espera(350);
  }
  const pend=revs(w).filter(r=>!r.feita);
  console.log("      voltas pendentes do mesmo conteúdo:", pend.map(r=>r.registroId+"@"+r.data).join(" | "));
  ok("duas sessões do mesmo conteúdo dão UMA volta", pend.length===1,
     pend.map(r=>[r.registroId,r.data]));
  ok("e ela passa a pertencer à sessão mais recente", pend[0].registroId==="r2", pend[0].registroId);
  ok("contada a partir da sessão nova", pend[0].data===dia(2), pend[0].data);

  /* ---- 10. conteúdo diferente continua tendo a sua própria volta ---- */
  const outro=seedBase({fasesMigradas:true, registros:[
    sess("r1"),
    Object.assign(sess("r3"),{assuntos:["Licitações"],assunto:"Licitações",criadoEm:3})]});
  w=abrir(outro,"registros"); await espera(400);
  const doc10=w.document;
  for (const id of ["r1","r3"]){
    const linha=[...doc10.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
    linha.querySelector("td").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
    doc10.querySelector("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
    await espera(350);
  }
  ok("assuntos diferentes seguem com voltas próprias", revs(w).filter(r=>!r.feita).length===2,
     revs(w).map(r=>r.registroId));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nfases do conteúdo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
