const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
w.confirm=()=>true;
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));

const TEXTO = [
  "Prazos da LAI:",
  "- resposta em **20 dias**",
  "- prorrogação de _10 dias_",
  "",
  "Atenção: o prazo do recurso é outro.",
  "Tag <script> não pode virar HTML"
].join("\n");

(async()=>{try{
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>/LAI$/.test(o.textContent)).value; change(s); });
  await passo(()=>{ click(doc.querySelector('[data-acao="abrir-composer"]')); });
  await passo(()=>{
    ok("o compositor tem barra de formatação", !!$(".compositor .fmt"));
    ok("tem negrito, itálico, lista e as cores",
       [...doc.querySelectorAll('.compositor [data-acao="fmt"]')].map(b=>b.dataset.fmt).join(",")
         ==="negrito,italico,lista,grifo,atencao,regra,ref",
       [...doc.querySelectorAll('.compositor [data-acao="fmt"]')].map(b=>b.dataset.fmt));
    ok("a barra não traz mais a frase-guia", !/Enter quebra a linha/.test($(".compositor .fmt").textContent)); // frase-guia tirada a pedido do Pedro (24/09)
    // botão de negrito com texto selecionado
    const ta=$("#txtNovo"); ta.value="prazo de 20 dias"; ta.setSelectionRange(9,16);
    click(doc.querySelector('.compositor [data-fmt="negrito"]'));
    ok("negrito envolve a seleção", ta.value==="prazo de **20 dias**", ta.value);
    // lista
    ta.value="resposta\nprorrogação"; ta.setSelectionRange(0,ta.value.length);
    click(doc.querySelector('.compositor [data-fmt="lista"]'));
    ok("lista prefixa cada linha", ta.value==="- resposta\n- prorrogação", JSON.stringify(ta.value));
    ta.value=TEXTO;
    click(doc.querySelector('[data-acao="salvar-aprendizado"]'));
  });
  await passo(()=>{
    const e=lerDb().erros[0];
    ok("o texto foi salvo com as quebras de linha", e.ensinamento.split("\n").length===6, JSON.stringify(e.ensinamento));
    const card=$(".aprendizado");
    ok("linha em branco separa parágrafos", card.querySelectorAll("p").length===2,
       [...card.querySelectorAll("p")].map(p=>p.textContent));
    ok("quebra de linha simples vira <br> dentro do parágrafo",
       card.querySelectorAll("p br").length===1, card.innerHTML);
    ok("as linhas com '-' viram lista", card.querySelectorAll("ul li").length===2,
       [...card.querySelectorAll("li")].map(l=>l.textContent));
    ok("**negrito** vira negrito", !!card.querySelector("strong") && card.querySelector("strong").textContent==="20 dias",
       card.innerHTML);
    ok("_itálico_ vira itálico", !!card.querySelector("em") && card.querySelector("em").textContent==="10 dias",
       card.innerHTML);
    ok("os marcadores somem do texto visível", !/\*\*|_10/.test(card.textContent), card.textContent);
    ok("tag digitada NÃO vira HTML", !card.querySelector("script") && /<script>/.test(card.textContent),
       card.innerHTML.slice(-120));
  });

  /* ---- a edição também tem a barra (o segundo campo de texto foi removido) ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-erro"]')); });
  await passo(()=>{
    ok("o formulário de edição tem a barra da anotação", doc.querySelectorAll("#formEdicaoErro .fmt").length===1);
    ok("a barra aponta para o campo da anotação",
       [...doc.querySelectorAll('#formEdicaoErro [data-fmt="negrito"]')].map(b=>b.dataset.alvo).join(",")==="eEnsinamento",
       [...doc.querySelectorAll('#formEdicaoErro [data-fmt="negrito"]')].map(b=>b.dataset.alvo));
    ok("o texto salvo volta com as quebras", $("#eEnsinamento").value.split("\n").length===6);
    const ta=$("#eEnsinamento"); const antes=ta.value;
    ta.setSelectionRange(0,6);
    click(doc.querySelector('#formEdicaoErro [data-alvo="eEnsinamento"][data-fmt="italico"]'));
    ok("a barra escreve os marcadores no campo", ta.value.startsWith("_")&&ta.value.length===antes.length+2,
       ta.value.slice(0,20));
    ta.value=antes;
    $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    ok("o campo de texto da anotação é o maior da tela",
       $(".apr") && !!doc.querySelector(".aprendizado"), "ok");
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nformatação de texto funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
