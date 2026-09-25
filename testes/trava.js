const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const enviar=()=>$("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));

(async()=>{try{
  await espera(300);
  const sel=$("#cronoDestino"), bt=$('#formCrono button[type="submit"]');
  console.log("  opções: "+[...sel.options].map(o=>o.textContent).join(" | "));
  ok("o seletor começa sem escolha", sel.value==="", sel.value);
  // o botão não é mais morto: ele é clicável e explica o que falta
  ok("o botão Iniciar fica clicável, para poder explicar", !bt.disabled);
  ok("com o motivo no title", /Escolha para onde o tempo vai/.test(bt.getAttribute("title")||""),
     bt.getAttribute("title"));
  ok("e o aviso explica o que falta", /só inicia com um destino definido/.test($("#formCrono").textContent),
     $("#formCrono").textContent.slice(0,140));

  enviar(); await espera(150);
  ok("tentar iniciar sem escolher é recusado", /Escolha para onde o tempo vai/.test($("#erroCrono").textContent),
     $("#erroCrono").textContent);
  ok("e nenhum cronômetro começou", !lerDb().cronometro, lerDb().cronometro);

  // escolher uma sessão destrava
  ok("o campo fica marcado como o que barrou", sel.classList.contains("campo-errado"), sel.className);
  sel.value="registro:rA"; change(sel); await espera(250);
  ok("escolher a sessão tira o title de pendência",
     !($('#formCrono button[type="submit"]').getAttribute("title")||""),
     $('#formCrono button[type="submit"]').getAttribute("title"));
  enviar(); await espera(250);
  ok("agora o cronômetro inicia", !!lerDb().cronometro && lerDb().cronometro.destinoId==="rA",
     lerDb().cronometro);

  /* ---- o pomodoro sumiu ---- */
  ok("não há mais relógio do pomodoro", !doc.getElementById("pomoRelogio"));
  ok("nem botões dele", !doc.querySelector('[data-acao="pomo-toggle"]') && !doc.querySelector('[data-acao="pomo-zerar"]'));
  ok("nem menção na tela", !/Pomodoro/i.test($("#view").textContent), ($("#view").textContent.match(/.{0,40}omodoro.{0,40}/)||[""])[0]);
  doc.getElementById("btnAjuda").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(200);
  ok("nem na ajuda", !/Pomodoro/i.test($("#modalCorpo").textContent),
     ($("#modalCorpo").textContent.match(/.{0,40}omodoro.{0,40}/)||[""])[0]);
  ok("o cronômetro do cabeçalho continua contando", !!doc.getElementById("cronoChip").textContent.trim());
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntrava do cronômetro e remoção do pomodoro ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
