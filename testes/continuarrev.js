/* Continuar uma sessão de REVISÃO abre outra revisão — não estudo — já ligada
   ao item da agenda deste conteúdo que estiver na vez (pedido do Pedro, 27/09). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:dia(-5),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",concluidoEm:dia(-5),criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
async function continuar(w,id){
  const linha=[...w.document.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
  linha.querySelector('[data-acao="continuar-sessao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
}
const tipoMarcado=w=>{const r=w.document.querySelector('#modalCaixa [name="tipo"]:checked');return r&&r.value;};

(async()=>{try{
  /* ---- revisão com item da agenda na vez ---- */
  let seed=base({
    registros:[sess("r1"), sess("r2",{data:dia(-2),tipo:"revisao",revisaoId:"v1"})],
    revisoes:[rev("v1","r1",dia(-2),{feita:true,feitaEm:dia(-2),sessaoId:"r2"}), rev("v2","r1",dia(-1),{nota:"refazer questões"}),
              rev("v3","r1",dia(6))]});
  let w=abrir(seed); await espera(450);
  await continuar(w,"r2");
  ok("continuar uma revisão abre como revisão", tipoMarcado(w)==="revisao", tipoMarcado(w));
  ok("já ligada à revisão atrasada deste conteúdo",
     w.document.querySelector("#revisaoAlvo").value==="v2", w.document.querySelector("#revisaoAlvo").value);
  ok("com a nota do item na descrição",
     w.document.querySelector('#modalCaixa [name="anotacoes"]').value==="refazer questões");
  w.document.querySelector('#modalCaixa [name="minutos"]').value="30";
  w.document.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(500);
  let d=db(w), nova=d.registros.find(r=>r.data===hoje);
  ok("é gravada como revisão", nova && nova.tipo==="revisao" && nova.revisaoId==="v2", nova);
  ok("e cumpre o item", d.revisoes.find(r=>r.id==="v2").feita);

  /* ---- sem item vencido: adianta a próxima ---- */
  seed=base({registros:[sess("r1"), sess("r2",{data:dia(-2),tipo:"revisao",revisaoId:"v1"})],
    revisoes:[rev("v1","r1",dia(-2),{feita:true,feitaEm:dia(-2),sessaoId:"r2"}), rev("v3","r1",dia(6))]});
  w=abrir(seed); await espera(450);
  await continuar(w,"r2");
  ok("sem item vencido, liga à próxima revisão", tipoMarcado(w)==="revisao" &&
     w.document.querySelector("#revisaoAlvo").value==="v3", [tipoMarcado(w), w.document.querySelector("#revisaoAlvo")&&w.document.querySelector("#revisaoAlvo").value]);

  /* ---- sem item nenhum: continua revisão, pedindo a escolha ---- */
  seed=base({registros:[sess("r1"), sess("r2",{data:dia(-2),tipo:"revisao",revisaoId:"v1"})],
    revisoes:[rev("v1","r1",dia(-2),{feita:true,feitaEm:dia(-2),sessaoId:"r2"})]});
  seed.registros[0].plano="sem";
  w=abrir(seed); await espera(450);
  await continuar(w,"r2");
  ok("sem revisão na agenda ainda abre como revisão", tipoMarcado(w)==="revisao", tipoMarcado(w));

  /* ---- estudo continua estudo ---- */
  seed=base({registros:[sess("r1")]}); Object.assign(seed.conteudos[0],{fase:"andamento",concluidoEm:null});
  w=abrir(seed); await espera(450);
  await continuar(w,"r1");
  ok("continuar um estudo segue abrindo como estudo", tipoMarcado(w)==="estudo", tipoMarcado(w));

  /* ---- conteúdo concluído não aceita Estudo ---- */
  w=abrir(base({registros:[sess("r1")], revisoes:[rev("v2","r1",dia(-1))]})); await espera(450);
  await continuar(w,"r1");     // o r1 é de estudo, mas o conteúdo já foi concluído depois dele
  let est=w.document.querySelector("#tipoEstudo");
  ok("sessão nova de conteúdo concluído abre como revisão", tipoMarcado(w)==="revisao", tipoMarcado(w));
  ok("com a opção Estudo desabilitada", est && est.disabled);
  ok("e ligada à revisão do conteúdo", w.document.querySelector("#revisaoAlvo").value==="v2");
  ok("explicando como estudar de novo", /reabra o conteúdo/.test(w.document.querySelector("#modalCaixa").textContent));

  // sessão nova escolhendo o conteúdo à mão: vira revisão ao adicionar
  w=abrir(base({registros:[sess("r1")], revisoes:[rev("v2","r1",dia(-1))]})); await espera(450);
  let doc=w.document;
  doc.querySelector('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(400);
  ok("o formulário vazio começa em estudo", tipoMarcado(w)==="estudo", tipoMarcado(w));
  const sel=doc.querySelector("#modalCaixa select.sel-disciplina"); sel.value="Legislação";
  sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  const ca=doc.querySelector("#campoAssunto"); ca.value="LAI"; ca.dispatchEvent(new w.Event("change",{bubbles:true}));
  if(!doc.querySelector('#listaAssuntosForm [data-assunto="LAI"]')) ca.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));
  await espera(400);
  ok("escolher um conteúdo concluído troca para revisão", tipoMarcado(w)==="revisao", tipoMarcado(w));

  // o dia em que o conteúdo foi concluído ainda aceita estudo (é a sessão que o fechou)
  seed=base({registros:[sess("r1")]}); seed.conteudos[0].concluidoEm=hoje;
  w=abrir(seed); await espera(450);
  await continuar(w,"r1");
  ok("no dia da conclusão, estudo continua valendo", tipoMarcado(w)==="estudo" && !w.document.querySelector("#tipoEstudo").disabled, tipoMarcado(w));

  // sessão de estudo já registrada continua editável como estudo
  w=abrir(base({registros:[sess("r1",{data:dia(-1)})]})); await espera(450);
  w.document.querySelector('[data-acao="editar-registro"][data-id="r1"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("editar uma sessão de estudo antiga não força revisão", tipoMarcado(w)==="estudo", tipoMarcado(w));
}catch(e){console.log("ERRO",e);falhas++;}
console.log(falhas?falhas+" falha(s)":"tudo ok"); process.exit(falhas?1:0);})();
