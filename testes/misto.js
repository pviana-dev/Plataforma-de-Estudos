const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const mais=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:mais(60),metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  {id:"rA",data:ontem,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,
   dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Legislação",assuntos:["Licitações"],assunto:"Licitações",minutos:30,questoes:0,acertos:0,
   dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:2}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,
   acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const reg=id=>db().registros.find(r=>r.id===id);
const linha=id=>[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
const submeter=()=>{$("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));};

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);

  /* ---- o tipo novo existe no formulário ---- */
  click(doc.querySelector('[data-acao="toggle-form-registro"]')); await espera(300);
  const tipos=[...doc.querySelectorAll('#modalCaixa [name="tipo"]')].map(i=>i.value);
  ok("há três tipos de sessão", tipos.join(",")==="estudo,revisao,misto", tipos);
  const rot=[...doc.querySelectorAll('#modalCaixa .opcao span')].map(s=>s.textContent);
  ok("o novo se chama Estudo/Revisão", /Estudo\/Revisão/.test(rot.join("|")), rot);

  /* ---- escolher misto pede a revisão, igual à revisão ---- */
  const radio=doc.querySelector('#modalCaixa [name="tipo"][value="misto"]');
  radio.checked=true; radio.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("o painel da revisão aparece para o misto também", !!$("#revisaoAlvo"), $("#modalCorpo").innerHTML.slice(0,80));
  $("#revisaoAlvo").value="v1";
  $('#modalCaixa [name="minutos"]').value="45";
  submeter(); await espera(350);
  const novo=db().registros.find(r=>r.tipo==="misto");
  ok("a sessão é salva com o tipo misto", !!novo, db().registros.map(r=>[r.id,r.tipo]));
  ok("ela cumpre a revisão escolhida, como uma revisão comum",
     novo.revisaoId==="v1" && db().revisoes.find(r=>r.id==="v1").feita===true,
     [novo.revisaoId, db().revisoes.find(r=>r.id==="v1")]);
  ok("a revisão aponta de volta para a sessão", db().revisoes.find(r=>r.id==="v1").sessaoId===novo.id);
  ok("e não gera plano de revisões próprio",
     db().revisoes.filter(r=>r.registroId===novo.id).length===0 && novo.plano==="sem", novo.plano);
  ok("as horas dela contam como sessão", novo.minutos===45, novo.minutos);

  /* ---- como aparece em Registros e em Hoje ---- */
  await espera(150);
  const cel=linha(novo.id).querySelectorAll("td");
  ok("a coluna Tipo mostra estudo/revisão",
     /estudo\/revisão/.test(cel[cel.length-1].textContent), cel[cel.length-1].textContent);
  ok("com etiqueta própria, nem a da revisão nem a do estudo",
     !!cel[cel.length-1].querySelector(".b-misto"), cel[cel.length-1].innerHTML);
  ok("a coluna Tipo acompanha o cabeçalho, à esquerda, e não a margem direita",
     cel[cel.length-1].className==="col-tipo" &&
     /\.col-tipo\{text-align:left;white-space:nowrap;padding-right:14px\}/.test(html),
     cel[cel.length-1].className);
  click(doc.querySelector('[data-aba="hoje"]')); await espera(300);
  const hojeCard=[...doc.querySelectorAll(".card")].find(c=>/Registrado hoje/.test(c.textContent));
  ok("em Hoje o tipo também aparece", /estudo\/revisão/.test(hojeCard.textContent), hojeCard.textContent.replace(/\s+/g," "));

  /* ---- filtro por tipo ---- */
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  // o select é recriado a cada render: procurar de novo a cada troca
  const filtrar=async v=>{ const el=$("#fTipo"); el.value=v;
    el.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300); };
  ok("o filtro oferece o tipo novo", [...$("#fTipo").options].map(o=>o.value).join(",")
     ==="todos,estudo,revisao,misto,revisoes", [...$("#fTipo").options].map(o=>o.value));
  await filtrar("misto");
  ok("filtrando por estudo/revisão, só ela aparece",
     [...doc.querySelectorAll("tbody tr[data-id]")].length===1 && !!linha(novo.id),
     [...doc.querySelectorAll("tbody tr[data-id]")].map(t=>t.dataset.id));
  await filtrar("estudo");
  ok("no filtro 'só estudo' ela não entra", !linha(novo.id),
     [...doc.querySelectorAll("tbody tr[data-id]")].map(t=>t.dataset.id));
  await filtrar("revisoes");
  ok("no filtro 'revisão e estudo/revisão' ela entra", !!linha(novo.id));
  await filtrar("todos");

  /* ---- conversões ---- */
  click(linha(novo.id).querySelector("td")); await espera(350);
  ok("editando um misto, a opção Estudo fica travada",
     doc.querySelector('#modalCaixa [name="tipo"][value="estudo"]').disabled,
     [...doc.querySelectorAll('#modalCaixa [name="tipo"]')].map(i=>[i.value,i.disabled]));
  ok("e a tela explica por quê", /só volta a ser revisão/.test($("#modalCorpo").textContent));
  ok("mas Revisão continua liberada",
     !doc.querySelector('#modalCaixa [name="tipo"][value="revisao"]').disabled);

  // forçar estudo mesmo assim é recusado
  const rEst=doc.querySelector('#modalCaixa [name="tipo"][value="estudo"]');
  rEst.disabled=false; rEst.checked=true; submeter(); await espera(250);
  ok("forçar estudo/revisão → estudo é recusado", reg(novo.id).tipo==="misto", reg(novo.id).tipo);
  ok("com aviso na tela", /só pode voltar a ser revisão/.test($("#erroForm").textContent),
     $("#erroForm").textContent);

  // misto → revisão passa
  doc.querySelector('#modalCaixa [name="tipo"][value="revisao"]').checked=true;
  submeter(); await espera(350);
  ok("misto → revisão é permitido", reg(novo.id).tipo==="revisao", reg(novo.id).tipo);
  ok("e a revisão continua cumprida por ela", db().revisoes.find(r=>r.id==="v1").sessaoId===novo.id);

  // revisão → misto volta
  click(linha(novo.id).querySelector("td")); await espera(350);
  doc.querySelector('#modalCaixa [name="tipo"][value="misto"]').checked=true;
  submeter(); await espera(350);
  ok("revisão → misto também", reg(novo.id).tipo==="misto", reg(novo.id).tipo);

  /* ---- estudo antigo continua sem poder virar misto ---- */
  click(linha("rA").querySelector("td")); await espera(350);
  ok("sessão de ontem não pode virar estudo/revisão",
     doc.querySelector('#modalCaixa [name="tipo"][value="misto"]').disabled);
  ok("nem revisão", doc.querySelector('#modalCaixa [name="tipo"][value="revisao"]').disabled);
  click(doc.querySelector('#modalCaixa [data-acao="cancelar-edicao"]')); await espera(250);

  /* ---- estudo de hoje pode ---- */
  click(linha("rB").querySelector("td")); await espera(350);
  ok("sessão de hoje pode virar estudo/revisão",
     !doc.querySelector('#modalCaixa [name="tipo"][value="misto"]').disabled);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntipo estudo/revisão funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
