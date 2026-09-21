const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const base=regs=>({versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],
 grupos:[],lancamentos:[],registros:regs,revisoes:[],erros:[],cronometro:null});
const sessao=(id,data)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,
 acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
  return dom.window;
}
(async()=>{try{
  /* ---- caso 1: nenhum registro nenhum ---- */
  let w=abrir(base([])); await espera(350);
  let doc=w.document, $=s=>doc.querySelector(s);
  const bt=()=>$('#formCrono button[type="submit"]');
  ok("sem registro nenhum, o botão Iniciar existe e está clicável", !!bt() && !bt().disabled);
  bt().dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  $("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("clicar mostra a mensagem em vez de não fazer nada",
     /Escolha para onde o tempo vai/.test($("#erroCrono").textContent), $("#erroCrono").textContent);
  ok("e a mensagem indica o caminho de quem ainda não tem sessão hoje",
     /Nova sessão/.test($("#erroCrono").textContent), $("#erroCrono").textContent);
  ok("o aviso flutuante também aparece",
     /Escolha uma sessão/.test($("#toast").textContent), $("#toast").textContent);
  ok("o campo de destino fica destacado", $("#cronoDestino").classList.contains("campo-errado"));
  ok("e nenhum cronômetro começou",
     !JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).cronometro);
  ok("escolher o destino limpa o destaque na hora", (() => {
       const sel=$("#cronoDestino"); sel.value="novo";
       sel.dispatchEvent(new w.Event("change",{bubbles:true}));
       return !sel.classList.contains("campo-errado");
     })());

  /* ---- caso 2: há sessão hoje, mas nada escolhido ---- */
  w=abrir(base([sessao("rA",hoje)])); await espera(350);
  doc=w.document; $=s=>doc.querySelector(s);
  $("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("com sessão de hoje, a mensagem cita as duas saídas",
     /uma sessão de hoje ou uma sessão nova/.test($("#erroCrono").textContent), $("#erroCrono").textContent);

  /* ---- caso 3: só sessão de ontem = mesma orientação do caso 1 ---- */
  w=abrir(base([sessao("rB",ontem)])); await espera(350);
  doc=w.document; $=s=>doc.querySelector(s);
  $("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("sessão de ontem não conta: o texto manda abrir uma nova",
     /Nova sessão/.test($("#erroCrono").textContent), $("#erroCrono").textContent);

  /* ---- e iniciar de verdade continua funcionando ---- */
  const sel=$("#cronoDestino"); sel.value="novo";
  sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  $("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(250);
  ok("escolhendo “Nova sessão” o cronômetro inicia",
     !!JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).cronometro);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\naviso do cronômetro funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
