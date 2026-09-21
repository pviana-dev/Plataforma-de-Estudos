const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 lancamentos:[],registros:[{id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
  questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"prazo de 20 dias",
   categoria:"",refeita:false,importante:false,criadoEm:Date.now()}],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje}));
   w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const erros=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).erros;

(async()=>{try{
  await espera(350);
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(350);

  /* ---- abre centralizado, como as outras telas de edição ---- */
  ok("a edição abre na tela sobreposta", !$("#overlay").hidden && !!$("#modalCorpo #formEdicaoErro"));
  ok("com título próprio", $("#modalTitulo").textContent==="Editar ponto importante", $("#modalTitulo").textContent);
  ok("na versão larga da caixa", $("#modalCaixa").classList.contains("grande"));
  ok("o overlay centraliza a caixa", /\.overlay\{[^}]*place-items:center/s.test(html));

  /* ---- o Salvar não exige rolagem: fica no rodapé fixo ---- */
  const rodape=$("#modalCaixa > .acoes-form");
  ok("os botões saem da área que rola", !!rodape && !$("#modalCorpo .acoes-form"),
     $("#modalCaixa").innerHTML.slice(0,60));
  ok("Salvar, Cancelar e Excluir estão lá",
     !!rodape.querySelector('button[type="submit"]') &&
     !!rodape.querySelector('[data-acao="cancelar-edicao-erro"]') &&
     !!rodape.querySelector('[data-acao="excluir-erro"]'),
     rodape.textContent);
  ok("e o Salvar continua ligado ao formulário",
     rodape.querySelector('button[type="submit"]').getAttribute("form")==="formEdicaoErro",
     rodape.querySelector('button[type="submit"]').getAttribute("form"));
  ok("a caixa não tem moldura dentro de moldura",
     !$("#modalCorpo #formEdicaoErro").classList.contains("edicao"),
     $("#modalCorpo #formEdicaoErro").className);

  /* ---- a linha correspondente fica marcada atrás ---- */
  ok("a anotação que está sendo editada fica marcada no card",
     doc.querySelectorAll("#view .apr-item.em-edicao").length===1);
  ok("e o texto dela continua visível atrás", /prazo de 20 dias/.test($("#view").textContent));

  /* ---- salvar pelo rodapé funciona e fecha ---- */
  $("#eEnsinamento").value="prazo de 20 dias, prorrogável por 10";
  click(rodape.querySelector('button[type="submit"]')); await espera(350);
  ok("salvar do rodapé grava", /prorrogável/.test(erros()[0].ensinamento), erros()[0].ensinamento);
  ok("e fecha a tela", $("#overlay").hidden);
  ok("a marca de edição some do card", !doc.querySelector("#view .apr-item.em-edicao"));

  /* ---- cancelar também fecha ---- */
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(300);
  click(doc.querySelector('#modalCaixa [data-acao="cancelar-edicao-erro"]')); await espera(300);
  ok("cancelar fecha sem gravar", $("#overlay").hidden && /prorrogável/.test(erros()[0].ensinamento));

  /* ---- Esc fecha, como nas outras telas ---- */
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(300);
  doc.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Escape",bubbles:true})); await espera(300);
  ok("Esc fecha a tela de edição", $("#overlay").hidden);

  /* ---- excluir dali também funciona ---- */
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(300);
  click(doc.querySelector('#modalCaixa [data-acao="excluir-erro"]')); await espera(350);
  ok("excluir pelo rodapé apaga o ponto", erros().length===0, erros());
  ok("e a tela fecha junto", $("#overlay").hidden);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nedição do ponto importante na tela sobreposta");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
