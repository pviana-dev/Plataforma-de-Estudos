const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const sess=(id,disc,ass)=>({id,data:hoje,disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,questoes:10,acertos:6,
  dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],
 grupos:[],lancamentos:[],registros:[sess("r1","Legislação","LAI"),sess("r2","Português","Crase")],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let guardado=null;                 // o localStorage que sobrevive ao "recarregar"
function abrir(){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){
     if (guardado) Object.keys(guardado).forEach(k=>w.localStorage.setItem(k,guardado[k]));
     else w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   }});
  return dom.window;
}
const copiar=w=>{ const o={}; for (let i=0;i<w.localStorage.length;i++){ const k=w.localStorage.key(i);
  o[k]=w.localStorage.getItem(k); } return o; };

(async()=>{try{
  /* ---- 1ª visita: escolhe filtros e começa a escrever ---- */
  let w=abrir(); await espera(350);
  let doc=w.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));

  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const fd=$("#fDisciplina"); fd.value="Português"; change(fd); await espera(300);
  const fo=$("#fOrdem"); fo.value="tempo-desc"; change(fo); await espera(300);
  const busca=$("#fBusca"); busca.value="crase";
  busca.dispatchEvent(new w.Event("input",{bubbles:true})); await espera(300);
  ok("os filtros valem nesta sessão", $("#fDisciplina").value==="Português" && $("#fBusca").value==="crase");

  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(300);
  const ta=$("#txtNovo"); ta.value="prazo de resposta é de 20 dias";
  ta.dispatchEvent(new w.Event("input",{bubbles:true})); await espera(200);
  guardado=copiar(w);
  ok("o estado de tela é gravado à parte", !!guardado["plataforma-estudos:tela"],
     Object.keys(guardado));
  ok("e não entra no banco de dados",
     !/rascunhoAnot|fDisciplina/.test(guardado["plataforma-estudos:v1"]));

  /* ---- recarregar ---- */
  w=abrir(); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  ok("volta na mesma aba", doc.querySelector('[data-aba="erros"]').getAttribute("aria-selected")==="true",
     [...doc.querySelectorAll(".aba")].map(a=>[a.dataset.aba,a.getAttribute("aria-selected")]));
  ok("o compositor continua aberto", !!$("#txtNovo"));
  ok("com o texto que estava sendo escrito", $("#txtNovo").value==="prazo de resposta é de 20 dias",
     $("#txtNovo").value);
  ok("e o contador já reflete o rascunho",
     $(".fmt .contador").textContent.startsWith(String($("#txtNovo").value.length)+" /"),
     [$(".fmt .contador").textContent, $("#txtNovo").value.length]);

  const click2=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  click2(doc.querySelector('[data-aba="registros"]')); await espera(300);
  ok("os filtros de Registros voltaram", $("#fDisciplina").value==="Português" &&
     $("#fOrdem").value==="tempo-desc" && $("#fBusca").value==="crase",
     [$("#fDisciplina").value, $("#fOrdem").value, $("#fBusca").value]);
  ok("e a lista está mesmo filtrada",
     [...doc.querySelectorAll("tbody tr[data-id]")].every(tr=>tr.dataset.id==="r2"),
     [...doc.querySelectorAll("tbody tr[data-id]")].map(tr=>tr.dataset.id));

  /* ---- fechar o compositor descarta o rascunho ---- */
  click2(doc.querySelector('[data-aba="erros"]')); await espera(300);
  click2(doc.querySelector('[data-acao="cancelar-composer"]')); await espera(250);
  guardado=copiar(w);
  w=abrir(); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  ok("depois de fechar, o rascunho não volta", !$("#txtNovo"),
     $(".compositor") && $(".compositor").innerHTML.slice(0,60));

  /* ---- filtro apontando para disciplina apagada é descartado ---- */
  const bruto=JSON.parse(guardado["plataforma-estudos:v1"]);
  bruto.registros=bruto.registros.filter(r=>r.id!=="r2");
  bruto.disciplinas=["Legislação"];
  guardado["plataforma-estudos:v1"]=JSON.stringify(bruto);
  w=abrir(); await espera(400);
  doc=w.document; $=s=>doc.querySelector(s);
  doc.querySelector('[data-aba="registros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  ok("filtro de disciplina que não existe mais é descartado", $("#fDisciplina").value==="",
     $("#fDisciplina").value);
  // a busca digitada NÃO é descartada: ela não aponta para nada que possa sumir
  ok("a busca digitada continua valendo", $("#fBusca").value==="crase", $("#fBusca").value);
  const b=$("#fBusca"); b.value=""; b.dispatchEvent(new w.Event("input",{bubbles:true})); await espera(300);
  ok("limpando a busca, a sessão que restou aparece",
     [...doc.querySelectorAll("tbody tr[data-id]")].map(tr=>tr.dataset.id).join()==="r1",
     [...doc.querySelectorAll("tbody tr[data-id]")].map(tr=>tr.dataset.id));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nestado de tela lembrado");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
