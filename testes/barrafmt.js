const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 lancamentos:[],registros:[{id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
 questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje})); }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const bt=f=>doc.querySelector('.compositor [data-fmt="'+f+'"]');
const ta=()=>$("#txtNovo");
const põe=(txt,ini,fim)=>{ const t=ta(); t.value=txt; t.setSelectionRange(ini===undefined?txt.length:ini, fim===undefined?(ini===undefined?txt.length:ini):fim); };

(async()=>{try{
  await espera(350);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(300);
  ok("o compositor abriu", !!ta());

  /* ---- lista sem seleção: só o traço ---- */
  põe("");
  click(bt("lista"));
  ok("lista em caixa vazia escreve só \"- \"", ta().value==="- ", JSON.stringify(ta().value));
  ok("e o cursor fica pronto para escrever", ta().selectionStart===2, ta().selectionStart);
  ok("nenhuma palavra-modelo aparece", !/item/.test(ta().value), ta().value);

  põe("prazo de 20 dias");
  click(bt("lista"));
  ok("com texto na linha, o traço entra no começo dela", ta().value==="- prazo de 20 dias",
     JSON.stringify(ta().value));
  ok("e o cursor continua onde estava, deslocado pelo traço", ta().selectionStart===("- prazo de 20 dias").length,
     ta().selectionStart);
  click(bt("lista"));
  ok("clicar de novo não empilha traços", ta().value==="- prazo de 20 dias", JSON.stringify(ta().value));

  põe("um\ndois\ntrês", 0, 13);
  click(bt("lista"));
  ok("com várias linhas selecionadas, cada uma vira item",
     ta().value==="- um\n- dois\n- três", JSON.stringify(ta().value));

  /* ---- marcas sem seleção: só os sinais, cursor no meio ---- */
  põe("");
  click(bt("negrito"));
  ok("negrito sem seleção escreve só as marcas", ta().value==="****", JSON.stringify(ta().value));
  ok("com o cursor entre elas", ta().selectionStart===2 && ta().selectionEnd===2,
     [ta().selectionStart, ta().selectionEnd]);
  ok("nada de \"texto\" plantado", !/texto/.test(ta().value), ta().value);

  põe("");
  click(doc.querySelector('.compositor .act.cor'));
  ok("cor sem seleção também só marca", ta().value==="====", JSON.stringify(ta().value));
  ok("sem plantar o nome da cor", !/grifar/.test(ta().value), ta().value);

  põe("prazo de 20 dias", 9, 16);
  click(doc.querySelector('.compositor .act.cor'));
  ok("com seleção, embrulha o que está selecionado", ta().value==="prazo de ==20 dias==",
     JSON.stringify(ta().value));

  põe("a b", 1, 2);                      // seleção só de espaço
  click(bt("negrito"));
  ok("seleção só de espaços não vira marca solta", ta().value==="a b", JSON.stringify(ta().value));

  /* ---- o clique alimenta contador e rascunho (era perdido antes) ---- */
  põe("");
  click(bt("negrito")); await espera(120);
  ok("o contador acompanha o clique do botão",
     $(".compositor .contador").textContent.startsWith("4 /"), $(".compositor .contador").textContent);
  const tela=JSON.parse(w.localStorage.getItem("plataforma-estudos:tela"));
  ok("e o rascunho salvo também", tela.rascunhoAnot==="****", tela.rascunhoAnot);

  /* ---- o teto continua respeitado ---- */
  põe("x".repeat(2000));
  click(bt("negrito"));
  ok("no limite, o botão não estoura a caixa", ta().value.length===2000, ta().value.length);
  ok("e avisa", /limite de 2000/.test($("#toast").textContent), $("#toast").textContent);

  /* ---- vocabulário da aba ---- */
  ok("o botão de anotar tem o nome da aba",
     /Nova anotação/.test(doc.body.textContent) || /Nova anotação/.test(html), "");
  ok("o campo convida a não esquecer", /não quer esquecer/.test(ta().getAttribute("placeholder")),
     ta().getAttribute("placeholder"));
  ok("não sobrou 'aprendizado' na tela", !/aprendizado/i.test($("#view").textContent),
     ($("#view").textContent.match(/.{0,30}prendizado.{0,30}/)||[""])[0]);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nbarra de formatação sem texto-modelo");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
