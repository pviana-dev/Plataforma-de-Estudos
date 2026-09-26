/* AJUSTES E AJUDA SEPARADOS (pedido do Pedro, 23/09): a engrenagem — no mesmo
   estilo do livro da marca — abre os ajustes; o "?" abre só a ajuda. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",metaDiariaMin:120,fasesMigradas:true,dificuldadesMigradas:true,
  conteudosMigrados:true,disciplinas:[],grupos:[],lancamentos:[],registros:[],revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed)); }});
  const w=dom.window, doc=w.document, $=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true,cancelable:true}));
  await espera(400);
  const eng=$("#btnAjustes");
  ok("há o botão de engrenagem dos ajustes", !!eng && !!eng.querySelector("svg") && eng.getAttribute("aria-label")==="Ajustes");
  ok("no estilo do livro da marca", eng.classList.contains("btn-ajustes"));
  ok("e o ? continua lá, agora só como ajuda", $("#btnAjuda").textContent.trim()==="?" && $("#btnAjuda").title==="Ajuda");

  click(eng); await espera(250);
  ok("a engrenagem abre os Ajustes", $("#modalTitulo").textContent==="Ajustes" && !!$("#formAjustes"), $("#modalTitulo").textContent);
  ok("sem o texto da ajuda", !/Metodologias aplicadas/.test($("#modalCorpo").textContent));
  click($('#modalCaixa [data-acao="abrir-ajuda"]'));   // o link foi para o rodapé fixo, junto do Salvar await espera(250);
  ok("o link dos ajustes leva à ajuda", $("#modalTitulo").textContent==="Ajuda", $("#modalTitulo").textContent);

  click($("#btnAjuda")); await espera(250);
  ok("o ? abre a Ajuda", $("#modalTitulo").textContent==="Ajuda");
  // a ajuda virou um tutorial em seções (pedido do Pedro, 24/09)
  const secoes=[...doc.querySelectorAll("#modalCorpo details.tutorial summary")].map(x=>x.textContent);
  ok("é um tutorial em seções, sem formulário", secoes.length>=8 && !$("#formAjustes"), secoes);
  ok("com o começo, as abas e como elas se ligam", /Comece por aqui/.test(secoes[0]) &&
     secoes.some(t=>/As abas/.test(t)) && secoes.some(t=>/Como as abas se ligam/.test(t)), secoes);
  ok("a primeira seção abre sozinha, as outras fechadas",
     $("#modalCorpo details.tutorial").open && ![...doc.querySelectorAll("#modalCorpo details.tutorial")].slice(1).some(d=>d.open));
  ok("cada aba do sistema está explicada",
     ["Hoje","Sessões","Agenda","Disciplinas","Anotações","Questões","Progresso"].every(n=>$("#aj-abas").textContent.includes(n)));
  const links=[...doc.querySelectorAll("#modalCorpo .aj-sumario a")];
  ok("o sumário fica numa coluna lateral, uma entrada por seção", links.length===secoes.length && !doc.querySelector(".aj-indice"),
     links.length);
  ok("a primeira entrada começa marcada", links[0].getAttribute("aria-current")==="true");
  click($('#modalCorpo .aj-sumario [data-alvo="aj-crono"]')); await espera(150);
  ok("clicar no sumário abre a seção escolhida", $("#aj-crono").open);
  ok("e ela passa a ser a marcada", $('.aj-sumario [data-alvo="aj-crono"]').getAttribute("aria-current")==="true" &&
     !links[0].hasAttribute("aria-current"));
  const ir=$("#ajudaIr"); ir.value="aj-dados"; ir.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(150);
  ok("no celular, a caixa 'Ir para…' faz o mesmo", $("#aj-dados").open && ir.value==="");
  ok("os subtópicos têm separador (cada aba explicada é um item)", doc.querySelectorAll("#aj-abas .aj-item").length===7);
  click($('#modalCorpo [data-acao="abrir-ajustes"]')); await espera(250);
  ok("e o botão da ajuda leva aos ajustes", $("#modalTitulo").textContent==="Ajustes" && !!$("#formAjustes"));

  click($('[data-acao="fechar-modal"]')); await espera(150);
  click($("#chipData")); await espera(250);
  // desde 25/09 o card das datas só avisa onde se muda a data — não abre mais os Ajustes
  ok("o card das datas avisa que a data se altera em Ajustes, sem abrir os Ajustes",
     $("#overlay").hidden && /alterada em Ajustes|marcar a data da prova/.test($("#toast").textContent), $("#toast").textContent);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\najustes e ajuda separados");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
