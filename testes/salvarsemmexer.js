/* Salvar uma sessão sem mexer no que decide o plano não pode refazer o
   cronograma dela — nem dizer que refez. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const rev=(id,d,extra)=>Object.assign({id,registroId:"r1",data:d,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(revisoes, fase){
  const seed={versao:1,tema:"claro",dataProva:dia(120),metaDiariaMin:120,disciplinas:["Legislação"],
   lancamentos:[],conteudos:[{disciplina:"Legislação",nome:"LAI",fase:fase||"concluido",
     concluidoEm:(fase||"concluido")==="concluido"?dia(-6):null}],
   conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
   registros:[{id:"r1",data:dia(-6),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
     questoes:10,acertos:8,dificuldade:2,anotacoes:"minha descrição",tipo:"estudo",criadoEm:1}],
   revisoes,erros:[],cronometro:null};
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const plano=w=>db(w).revisoes.map(r=>r.id+"@"+r.data).sort().join("  ");
async function editarESalvar(w, mexer){
  const doc=w.document;
  (doc.querySelector('tbody tr[data-id="r1"] [data-acao="editar-registro"]')
   || doc.querySelector('tbody tr[data-id="r1"]'))
    .dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  if (mexer) mexer(doc);
  doc.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(550);
}

(async()=>{try{
  const escada=()=>[rev("v1",dia(1)),rev("v2",dia(4)),rev("v3",dia(10))];

  /* ---- 1. salvar sem mexer em nada ---- */
  let w=abrir(escada()); await espera(600);
  let antes=plano(w);
  await editarESalvar(w, null);
  ok("salvar sem mexer não toca no cronograma", plano(w)===antes, {antes, depois:plano(w)});
  ok("e a mensagem diz isso",
     /agenda continua a mesma/.test(w.document.querySelector("#toast").textContent),
     w.document.querySelector("#toast").textContent);

  /* ---- 2. mexer só na descrição, no tempo e nas questões ---- */
  w=abrir(escada()); await espera(600);
  antes=plano(w);
  await editarESalvar(w, doc => {
    doc.querySelector('#modalCaixa [name="anotacoes"]').value="descrição corrigida";
    doc.querySelector('#modalCaixa [name="minutos"]').value="95";
    doc.querySelector('#modalCaixa [name="questoes"]').value="20";
    doc.querySelector('#modalCaixa [name="acertos"]').value="11";
  });
  ok("corrigir descrição, tempo e questões também não move revisão nenhuma",
     plano(w)===antes, {antes, depois:plano(w)});
  ok("mas a sessão foi mesmo salva",
     db(w).registros[0].anotacoes==="descrição corrigida" && db(w).registros[0].minutos===95,
     db(w).registros[0]);

  /* ---- 3. mexer na DIFICULDADE refaz, e a mensagem avisa ---- */
  w=abrir(escada()); await espera(600);
  antes=plano(w);
  await editarESalvar(w, doc => {
    const sel=doc.querySelector('#modalCaixa [name="dificuldade"]');
    if (sel){ sel.value="3"; sel.dispatchEvent(new w.Event("change",{bubbles:true})); }
    else {
      const r=[...doc.querySelectorAll('#modalCaixa [name="dificuldade"]')];
      if (r.length){ r[r.length-1].checked=true; }
    }
  });
  const mudou3 = plano(w)!==antes;
  ok("mudar a dificuldade refaz o cronograma", mudou3, {antes, depois:plano(w)});
  ok("e a mensagem avisa que refez",
     !mudou3 || /agenda atualizada/.test(w.document.querySelector("#toast").textContent),
     w.document.querySelector("#toast").textContent);

  /* ---- 4. mexer na DATA refaz ---- */
  w=abrir(escada()); await espera(600);
  antes=plano(w);
  await editarESalvar(w, doc => { doc.querySelector('#modalCaixa [name="data"]').value=dia(-1); });
  ok("mudar a data da sessão refaz o cronograma", plano(w)!==antes, {antes, depois:plano(w)});

  /* ---- 5. sessão SEM plano automático volta a ter um ---- */
  w=abrir([]); await espera(600);
  // conteúdo concluído sem revisão nenhuma ganha a escada já na carga (garantia de revisão)
  ok("conteúdo concluído sem revisão ganha a escada sozinho", db(w).revisoes.length>0, db(w).revisoes);
  await editarESalvar(w, null);
  ok("salvar devolve o cronograma a quem não tinha", db(w).revisoes.length>0,
     db(w).revisoes.map(r=>r.data));

  /* ---- 5b. conteúdo em andamento: a mensagem fala da RETOMADA, não de revisões ---- */
  w=abrir([], "andamento"); await espera(600);
  await editarESalvar(w, doc => { const sel=doc.querySelector('#modalCaixa [name="dificuldade"]'); sel.value="3"; });
  const msg5=w.document.querySelector("#toast").textContent;
  ok("em andamento, mudar a dificuldade diz quando continuar", /continuar /.test(msg5) && !/revis/.test(msg5), msg5);

  /* ---- 6. o que foi remarcado à mão nunca é refeito — mas anda junto ----
     A revisão à mão não é apagada nem recriada; se um contato empurra a
     escada, ela anda junto, mantendo a distância (decisão do Pedro, 23/09). */
  w=abrir([rev("v1",dia(1)), rev("v2",dia(30),{manual:true})]); await espera(600);
  await editarESalvar(w, doc => { doc.querySelector('#modalCaixa [name="data"]').value=dia(-2); });
  const manual=db(w).revisoes.find(r=>r.id==="v2");
  ok("a revisão remarcada à mão sobrevive ao replanejamento, sem voltar para trás",
     !!manual && manual.manual===true && manual.data>=dia(30), manual);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nsalvar sem mexer não refaz o cronograma");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
