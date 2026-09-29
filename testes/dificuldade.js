/* Dificuldade tem três níveis — fácil, médio, difícil — e é deles que saem a
   cadência das voltas e o tamanho do plano. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],
  grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const volta=w=>db(w).revisoes.filter(r=>!r.feita).map(r=>Math.round(
  (new Date(r.data+"T12:00")-new Date(hoje+"T12:00"))/864e5))[0];

(async()=>{try{
  /* ---- o seletor tem três opções ---- */
  let w=abrir(base({registros:[sess("r1")]})); await espera(450);
  const doc=w.document; let $0;
  doc.querySelector('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(350);
  // OBRIGATÓRIA e sem padrão (decisão do Pedro, 23/09): a sessão nova começa em "Escolha…"
  const ops=[...doc.querySelectorAll('#modalCaixa [name="dificuldade"] option')].filter(o=>o.value);
  ok("são três níveis", ops.length===3, ops.map(o=>o.value+":"+o.textContent));
  ok("chamados difícil, médio e fácil",
     ops.map(o=>o.textContent).join("|")==="Difícil|Médio|Fácil", ops.map(o=>o.textContent));
  ok("não há padrão: a sessão nova começa sem dificuldade escolhida",
     doc.querySelector('#modalCaixa [name="dificuldade"]').value==="", doc.querySelector('#modalCaixa [name="dificuldade"]').value);
  $0=doc.querySelector("#formRegistro");
  const sd=$0.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(300); $0=doc.querySelector("#formRegistro");
  // conteúdo NOVO, nunca estudado: não há de onde herdar, a escolha é obrigatória
  const ca=doc.querySelector("#campoAssunto"); ca.value="__novo"; ca.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(100); doc.querySelector("#novoConteudoNome").value="Improbidade";
  (()=>{const _c=doc.querySelector("#campoAssunto"),_n=doc.querySelector("#novoConteudoNome");if(_c.value==="__novo")_n.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));else _c.dispatchEvent(new w.Event("change",{bubbles:true}));})();
  ok("conteúdo nunca estudado não traz dificuldade", doc.querySelector('#modalCaixa [name="dificuldade"]').value==="");
  $0.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("e salvar sem escolher é recusado, com o aviso", /Escolha a dificuldade/.test(doc.querySelector("#erroForm").textContent),
     doc.querySelector("#erroForm").textContent);
  // conteúdo JÁ estudado (LAI teve sessão, dificuldade média): ao escolher, a dificuldade vem dele
  const ca2=doc.querySelector("#campoAssunto"); ca2.value=[...ca2.options].find(o=>o.value==="LAI").value;
  (()=>{const _c=doc.querySelector("#campoAssunto"),_n=doc.querySelector("#novoConteudoNome");if(_c.value==="__novo")_n.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));else _c.dispatchEvent(new w.Event("change",{bubbles:true}));})();
  ok("escolhido um conteúdo já estudado, a dificuldade vem da última sessão dele (médio)",
     doc.querySelector('#modalCaixa [name="dificuldade"]').value==="2", doc.querySelector('#modalCaixa [name="dificuldade"]').value);
  ok("e a tela avisa de onde ela veio", /última sessão deste conteúdo/.test(doc.querySelector("#dicaDificuldade").textContent));

  /* ---- a taxa de acerto não entra no cálculo ---- */
  const comTaxa=abrir(base({registros:[sess("r1",{dificuldade:1,questoes:10,acertos:3})],   // 30% de acerto
    revisoes:[{id:"v1",registroId:"r1",data:hoje,ordem:1,retomada:true,feita:true,feitaEm:hoje,
      manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(450);
  ok("errando muito, o conteúdo fácil continua voltando em 4 dias", volta(comTaxa)===4, volta(comTaxa));

  /* ---- a cadência da volta sai do nível ---- */
  for (const [nivel,esperado,rot] of [[1,4,"fácil"],[2,2,"médio"],[3,1,"difícil"]]){
    const ww=abrir(base({registros:[sess("r1",{dificuldade:nivel,questoes:10,acertos:9})],
      revisoes:[{id:"v1",registroId:"r1",data:hoje,ordem:1,retomada:true,feita:true,feitaEm:hoje,
        manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
    await espera(450);
    ok("conteúdo "+rot+" volta em "+esperado+" dia(s)", volta(ww)===esperado, volta(ww));
  }

  /* ---- quantas revisões o plano pede ---- */
  for (const [nivel,minimo,rot] of [[1,2,"fácil"],[2,3,"médio"],[3,5,"difícil"]]){
    const ww=abrir(base({revisarAte:dia(365),
      conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",concluidoEm:hoje,criadoEm:1}],
      registros:[sess("r1",{dificuldade:nivel})]}));
    await espera(450);
    ww.document.querySelector('[data-aba="registros"]').dispatchEvent(new ww.MouseEvent("click",{bubbles:true}));
    await espera(250);
    ww.document.querySelector("tbody tr[data-id] td").dispatchEvent(new ww.MouseEvent("click",{bubbles:true}));
    await espera(300);
    ww.document.querySelector("#formRegistro").dispatchEvent(new ww.Event("submit",{bubbles:true,cancelable:true}));
    await espera(400);
    const n=db(ww).revisoes.filter(r=>!r.feita).length;
    ok("conteúdo "+rot+" recebe ao menos "+minimo+" revisões", n>=minimo, n);
  }

  /* ---- dado antigo (cinco níveis) é traduzido uma vez ---- */
  const antigo=base({registros:[sess("rA",{dificuldade:5}), sess("rB",{dificuldade:4}),
                                sess("rC",{dificuldade:3}), sess("rD",{dificuldade:2}),
                                sess("rE",{dificuldade:1})]});
  delete antigo.dificuldadesMigradas;
  w=abrir(antigo); await espera(500);
  const niveis=db(w).registros.map(r=>r.id+":"+r.dificuldade).join(" ");
  console.log("      conversão:", niveis);
  ok("5 e 4 viram difícil", /rA:3/.test(niveis) && /rB:3/.test(niveis), niveis);
  ok("3 vira médio", /rC:2/.test(niveis), niveis);
  ok("2 e 1 viram fácil", /rD:1/.test(niveis) && /rE:1/.test(niveis), niveis);
  ok("e a conversão não se repete", db(w).dificuldadesMigradas===true);

  /* ---- e nem no tamanho do plano ---- */
  const planoTaxa=abrir(base({revisarAte:dia(365),
    conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",concluidoEm:hoje,criadoEm:1}],
    registros:[sess("r1",{dificuldade:1,questoes:20,acertos:4})]}));      // 20% de acerto
  await espera(450);
  planoTaxa.document.querySelector('[data-aba="registros"]').dispatchEvent(new planoTaxa.MouseEvent("click",{bubbles:true}));
  await espera(250);
  planoTaxa.document.querySelector("tbody tr[data-id] td").dispatchEvent(new planoTaxa.MouseEvent("click",{bubbles:true}));
  await espera(300);
  planoTaxa.document.querySelector("#formRegistro").dispatchEvent(new planoTaxa.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  const nFacil=db(planoTaxa).revisoes.filter(r=>!r.feita).length;
  ok("o plano do fácil não cresce por causa da taxa baixa", nFacil<=6, nFacil);

  /* ---- o badge da lista usa os nomes novos ---- */
  w=abrir(base({registros:[sess("r1",{dificuldade:3})]}), "registros"); await espera(450);
  ok("a lista mostra o nível pelo nome",
     /Difícil/.test(w.document.querySelector("#view").textContent),
     w.document.querySelector("#view").textContent.slice(0,200));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntrês níveis de dificuldade funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
