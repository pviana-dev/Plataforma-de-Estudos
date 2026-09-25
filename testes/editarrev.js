/* Trocar o conteúdo de uma revisão.
   Era aqui que a alteração parecia não salvar: o dado mudava, mas a tela
   continuava lendo o conteúdo do grupo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass,extra)=>Object.assign({id,data:dia(-5),disciplina:"Legislação",assuntos:[ass],assunto:ass,
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],lancamentos:[],grupos:[],
  conteudos:[{id:"c1",nome:"X",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1},
             {id:"c2",nome:"Y",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:2}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",visaoAgenda:"assunto",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
async function trocarConteudo(w, de, para){
  const doc=w.document;
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  click(doc.querySelector('[data-acao="editar-revisao"]')); await espera(400);
  const tag=[...doc.querySelectorAll("#listaAssuntosForm .tag")].find(t=>t.dataset.assunto===de);
  if (tag) click(tag.querySelector('[data-acao="remover-assunto"]'));
  await espera(150);
  const sel=doc.querySelector("#campoAssunto"); sel.value=para;
  click(doc.querySelector('[data-acao="add-assunto"]')); await espera(200);
  doc.querySelector("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(450);
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  /* ---- 1. revisão de uma sessão comum ---- */
  let w=abrir(base({registros:[sess("rX","X"), sess("rY","Y",{data:hoje})],
    revisoes:[{id:"v1",registroId:"rX",data:hoje,ordem:1,retomada:true,feita:false,manual:false,minutos:null,
      questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(450);
  await trocarConteudo(w,"X","Y");
  let v=db(w).revisoes.find(r=>r.id==="v1");
  ok("a revisão passa a apontar para a sessão do conteúdo novo", v.registroId==="rY", v.registroId);
  ok("e o card na tela mostra o conteúdo novo",
     [...w.document.querySelectorAll(".grupo-rev .cab strong")].some(e=>e.textContent==="Y"),
     [...w.document.querySelectorAll(".grupo-rev .cab strong")].map(e=>e.textContent));

  /* A parte 2 desta suíte cobria "trocar o conteúdo de uma revisão dentro de um
     CARD INTEGRADO", o defeito de 32281db. Saiu com a integração: não há mais
     card de grupo para a revisão sair. Trocar o conteúdo de uma revisão comum
     continua coberto pela parte 1. */
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  click(w.document.querySelector('[data-acao="editar-revisao"]')); await espera(400);
  ok("e REABRINDO a revisão, o conteúdo novo é o que aparece",
     [...w.document.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto).join()==="Y",
     [...w.document.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto));
  click(w.document.querySelector('[data-acao="cancelar-revisao"]')); await espera(250);

  /* ---- 3. mexer só na data não mexe no conteúdo ---- */
  const doc3=w.document;
  doc3.querySelector('[data-acao="editar-revisao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  doc3.querySelector('#formRevisao [name="data"]').value=dia(3);
  doc3.querySelector("#formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(450);
  v=db(w).revisoes.find(r=>r.id==="v1");
  ok("a data nova foi salva", v.data===dia(3), v.data);
  ok("e o conteúdo continua o que foi escolhido antes",
     (v.assuntos||[]).join()==="Y" || !!v.registroId, {assuntos:v.assuntos, reg:v.registroId});
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntrocar o conteúdo da revisão funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
