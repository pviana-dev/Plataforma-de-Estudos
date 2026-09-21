const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",
   ensinamento:"O prazo é de ==20 dias==, !!não confunda!! com o recurso.\n++Vale para órgão e entidade++ conforme @@art. 11@@.\nE **negrito** com _itálico_ seguem valendo.",
   categoria:"",refeita:false,importante:false,criadoEm:Date.now()}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);

  /* ---- as marcas viram cor na exibição ---- */
  const texto=$(".aprendizado");
  ok("grifado vira marca amarela", !!texto.querySelector(".mk-grifo") &&
     texto.querySelector(".mk-grifo").textContent==="20 dias", texto.innerHTML);
  ok("atenção vira vermelho", texto.querySelector(".mk-atencao").textContent==="não confunda");
  ok("regra vira verde", texto.querySelector(".mk-regra").textContent==="Vale para órgão e entidade");
  ok("referência vira azul", texto.querySelector(".mk-ref").textContent==="art. 11");
  ok("negrito e itálico continuam", !!texto.querySelector("strong") && !!texto.querySelector("em"));
  ok("nenhum marcador sobra na tela", !/==|!!|\+\+|@@/.test(texto.textContent), texto.textContent);
  ok("as cores vêm do CSS, não do dado",
     !/style=/.test(texto.innerHTML) && !/#[0-9a-f]{6}/i.test(texto.innerHTML), texto.innerHTML);
  ok("o dado guardado continua sendo texto com marcadores",
     /==20 dias==/.test(w.localStorage.getItem("plataforma-estudos:v1")));

  /* ---- barra de formatação ---- */
  const selD=$("#eDisciplina"); selD.value="Legislação";
  selD.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(250);
  const barra=$(".fmt");
  ok("a barra tem 4 botões de cor", barra.querySelectorAll(".act.cor").length===4,
     barra.querySelectorAll(".act.cor").length);
  ok("cada um mostra a amostra da cor", barra.querySelectorAll(".act.cor .amostra").length===4);
  ok("não há seletor de fonte", !/fonte|font-family/i.test(barra.textContent));

  /* ---- o botão aplica o marcador no texto ---- */
  const ta=$("#txtNovo"); ta.value="prazo de 20 dias";
  ta.setSelectionRange(9,16);                       // "20 dias"
  click([...barra.querySelectorAll(".act.cor")][0]);
  ok("grifar embrulha a seleção", ta.value==="prazo de ==20 dias==", ta.value);
  ta.setSelectionRange(ta.value.length, ta.value.length);
  click([...barra.querySelectorAll(".act.cor")][1]);
  // sem seleção entram só as marcas, com o cursor no meio — nada de palavra-modelo
  ok("sem seleção, entram só as marcas", /!!!!$/.test(ta.value) && !/atenção/.test(ta.value), ta.value);
  ok("e o cursor fica entre elas", ta.selectionStart===ta.value.length-2, ta.selectionStart);

  /* ---- limite de caracteres ---- */
  const max=Number(ta.getAttribute("maxlength"));
  ok("a caixa tem limite declarado", max===2000, max);
  const cont=barra.querySelector(".contador");
  ok("existe um contador", !!cont && /\/ 2000/.test(cont.textContent), cont&&cont.textContent);
  ta.value="x".repeat(1900); ta.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("o contador acompanha a digitação", /^1900 \/ 2000/.test(cont.textContent), cont.textContent);
  ok("e avisa quando está perto do teto", cont.classList.contains("perto"), cont.className);
  ta.value="x".repeat(2000); ta.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("no teto, fica vermelho", cont.classList.contains("cheio") && !cont.classList.contains("perto"),
     cont.className);
  ta.setSelectionRange(2000,2000);
  click([...barra.querySelectorAll(".act.cor")][0]);
  ok("no teto, o botão de cor não estoura a caixa", ta.value.length===2000, ta.value.length);

  /* ---- a caixa de edição também tem limite e contador ---- */
  click(doc.querySelector('[data-acao="cancelar-composer"]')); await espera(200);
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(250);
  const ed=$("#eEnsinamento");
  ok("a caixa de edição tem o mesmo limite", Number(ed.getAttribute("maxlength"))===2000);
  const contEd=doc.querySelector('.contador[data-para="eEnsinamento"]');
  ok("e já abre contando o que existe", contEd.textContent.startsWith(String(ed.value.length)),
     [contEd.textContent, ed.value.length]);
  ok("a barra de cores também está na edição",
     doc.querySelectorAll('#formEdicaoErro .act.cor').length===4);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncores e limite funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
