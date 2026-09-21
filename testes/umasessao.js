/* Marcar a revisão quando JÁ EXISTE uma sessão daquele conteúdo hoje: o tempo
   entra na sessão que existe, em vez de nascer uma segunda com o mesmo nome. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:[ass],assunto:ass,
  minutos:90,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"Y",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  /* Cenário do relato: sessão de Y com 1h30 registradas hoje, e uma revisão de
     hoje que foi apontada para Y. Marcar a revisão não pode criar outra Y. */
  const w=abrir(base({registros:[sess("rY","Y")],
    revisoes:[{id:"v1",registroId:"rY",data:hoje,ordem:1,feita:false,manual:true,minutos:null,
      questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(450);
  const doc=w.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  ok("começa com uma sessão só", db(w).registros.length===1, db(w).registros.map(r=>r.id));

  click($('#view [data-acao="concluir"]')); await espera(450);
  ok("a tela aberta é a da sessão que já existe, não uma nova",
     !!$("#modalCorpo #formRegistro") && $("#modalTitulo").textContent==="Editar sessão",
     $("#modalTitulo").textContent);
  ok("com o tempo que já estava lá", $('#modalCaixa [name="minutos"]').value==="90",
     $('#modalCaixa [name="minutos"]').value);
  ok("e a plataforma explica por quê", /já é deste conteúdo/.test($("#toast").textContent),
     $("#toast").textContent);
  ok("a revisão a ser cumprida já vem escolhida e travada",
     !!$("#revisaoAlvo") && $("#revisaoAlvo").value==="v1", $("#revisaoAlvo") && $("#revisaoAlvo").value);
  ok("o tipo continua Estudo — é uma sessão de estudo que conta como revisão",
     $('#modalCaixa [name="tipo"]:checked').value==="estudo",
     $('#modalCaixa [name="tipo"]:checked').value);

  // acrescenta o tempo da revisão e salva
  $('#modalCaixa [name="minutos"]').value="150";
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(500);
  const d=db(w);
  ok("continua havendo UMA sessão", d.registros.length===1, d.registros.map(r=>[r.id,r.assuntos,r.tipo]));
  ok("com o tempo somado nela", d.registros[0].minutos===150, d.registros[0].minutos);
  ok("do tipo estudo", d.registros[0].tipo==="estudo", d.registros[0].tipo);
  ok("e a revisão fica cumprida por ela",
     d.revisoes[0].feita===true && d.revisoes[0].sessaoId==="rY",
     [d.revisoes[0].feita, d.revisoes[0].sessaoId]);
  ok("a sessão aponta de volta para a revisão", d.registros[0].revisaoId==="v1", d.registros[0].revisaoId);

  /* Sem sessão daquele conteúdo hoje, o caminho antigo continua: abre uma nova */
  const w2=abrir(base({registros:[sess("rY","Y",{data:dia(-4)})],
    revisoes:[{id:"v1",registroId:"rY",data:hoje,ordem:1,feita:false,manual:true,minutos:null,
      questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(450);
  w2.document.querySelector('#view [data-acao="concluir"]')
    .dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
  await espera(450);
  ok("sem sessão de hoje, abre o formulário de uma sessão nova",
     w2.document.querySelector("#modalTitulo").textContent==="Registrar sessão",
     w2.document.querySelector("#modalTitulo").textContent);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\numa sessão só por conteúdo no dia");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
