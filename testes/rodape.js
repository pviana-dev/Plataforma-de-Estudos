const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:6,
   dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,
   acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.__confirmarNativo=true; w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const caixa=()=>$("#modalCaixa"), corpo=()=>$("#modalCorpo");

async function abrir(sel){ click(doc.querySelector(sel)); await espera(300); }

(async()=>{try{
  await espera(300);

  /* ---- a folha: quem rola é o miolo, não a caixa inteira ---- */
  ok("a caixa não rola por inteiro",
     /\.modal\{[^}]*?display:flex;flex-direction:column;overflow:hidden/s.test(html));
  ok("quem rola é o miolo", /\.modal > \.conteudo\{flex:1 1 auto;min-height:0;overflow:auto\}/.test(html));
  ok("o cabeçalho fica fora do scroll", /\.modal > header\{flex:none\}/.test(html));
  ok("o rodapé fica fora do scroll e ganha o fio de separação",
     /\.modal\.com-rodape > \.acoes-form\{flex:none;[^}]*?border-top:1px solid var\(--grade\)/s.test(html));
  ok("o rodapé sticky de antes foi embora", !/\.acoes-form\{position:sticky/.test(html));

  /* ---- editar sessão de estudo ---- */
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA");
  click(linha ? linha.querySelector("td") || linha : doc.querySelector("tbody tr")); await espera(350);
  ok("a tela de edição abriu", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  const rod=caixa().querySelector(":scope > .acoes-form");
  ok("o rodapé é filho direto da caixa, fora do miolo", !!rod, caixa().innerHTML.slice(0,80));
  ok("e não sobrou nenhum rodapé dentro do miolo", !corpo().querySelector(".acoes-form"));
  ok("a caixa está marcada como tendo rodapé", caixa().classList.contains("com-rodape"));
  ok("o excluir foi junto para o rodapé", !!rod.querySelector('[data-acao="excluir-registro"]'));
  ok("os botões continuam ligados ao formulário pelo form=",
     [...rod.querySelectorAll("button")].every(b=>b.getAttribute("form")==="formRegistro"),
     [...rod.querySelectorAll("button")].map(b=>b.getAttribute("form")));
  ok("o navegador confirma o dono do formulário",
     rod.querySelector('button[type="submit"]').form === $("#formRegistro"));

  /* ---- e o submit continua funcionando de lá ---- */
  $("#modalCorpo [name=minutos]").value="90";
  click(rod.querySelector('button[type="submit"]')); await espera(300);
  const reg=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).registros[0];
  ok("salvar pelo botão do rodapé grava a sessão", reg.minutos===90, reg.minutos);
  ok("e a tela fecha", $("#overlay").hidden);

  /* ---- nova revisão ---- */
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  await abrir('[data-acao="nova-revisao"]');
  const rod2=caixa().querySelector(":scope > .acoes-form");
  ok("a tela de revisão também tira o rodapé do scroll", !!rod2 && !corpo().querySelector(".acoes-form"));
  ok("com os botões ligados ao formulário certo",
     rod2.querySelector('button[type="submit"]').getAttribute("form")==="formRevisao",
     rod2.querySelector('button[type="submit"]').getAttribute("form"));
  click(doc.querySelector('#modalCaixa [data-acao="cancelar-revisao"]')); await espera(250);
  ok("cancelar do rodapé fecha a tela", $("#overlay").hidden);
  ok("e o rodapé some junto", !caixa().querySelector(":scope > .acoes-form") &&
     !caixa().classList.contains("com-rodape"));

  /* ---- lançar questões ---- */
  click(doc.querySelector('[data-aba="questoes"]')); await espera(300);
  await abrir('[data-acao="novo-lancamento"]');
  ok("a tela de lançamento também", !!caixa().querySelector(":scope > .acoes-form") &&
     !corpo().querySelector(".acoes-form"));
  click(doc.querySelector('[data-acao="fechar-modal"]')); await espera(250);

  /* o editor de card de revisão saiu junto com a integração; fechar continua
     tendo de limpar a tela sobreposta */
  click(doc.querySelector('[data-acao="fechar-modal"]')); await espera(250);
  ok("fechar limpa tudo", $("#overlay").hidden && corpo().innerHTML==="" &&
     !caixa().querySelector(":scope > .acoes-form"));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrodapé fora do scroll funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
