const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const baseSeed=(crono)=>({versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:300,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,
   inicio:"11:00",fim:"18:00",
   blocos:[{data:hoje,inicio:"11:00",fim:"13:00",minutos:120},{data:hoje,inicio:"15:00",fim:"18:00",minutos:180}]}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:45,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"",
   blocos:[{data:hoje,inicio:"08:00",fim:"08:45",minutos:45}]}],
 erros:[],cronometro:crono});
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const abrir=seed=>new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
  beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.__confirmarNativo=true; w.confirm=()=>true;}});
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  /* ---- 1. parado, com a sessão escolhida como destino ---- */
  const d1=abrir(baseSeed(null)); await espera(300);
  const w1=d1.window, doc1=d1.window.document;
  const sel=doc1.querySelector("#cronoDestino");
  sel.value="registro:rA";
  sel.dispatchEvent(new w1.Event("change",{bubbles:true}));
  await espera(250);
  const banner=doc1.querySelector("#formCrono .faixa-edicao");
  const faixas1=[...banner.querySelectorAll(".faixa")].map(f=>f.textContent);
  console.log("      antes de iniciar: "+faixas1.join(" | "));
  ok("escolher a sessão mostra o que já foi cronometrado nela",
     faixas1.join("|")==="11:00–13:00|15:00–18:00", faixas1);
  ok("com o rótulo explicando", /já cronometrado/.test(banner.textContent), banner.textContent.slice(0,120));

  /* ---- 2. rodando, somando na mesma sessão ---- */
  const d2=abrir(baseSeed({inicio:Date.now()-20*60000,disciplina:"",assunto:"",destinoTipo:"registro",destinoId:"rA"}));
  await espera(300);
  const info=d2.window.document.querySelector(".crono-info");
  const faixas2=[...info.querySelectorAll(".faixa")].map(f=>f.textContent);
  console.log("      rodando: "+faixas2.join(" | "));
  ok("rodando, lista as medições anteriores", faixas2.slice(0,2).join("|")==="11:00–13:00|15:00–18:00", faixas2);
  ok("e a medição em andamento aparece por último", /–agora$/.test(faixas2[faixas2.length-1]), faixas2);
  ok("a em andamento vem destacada", !!info.querySelector(".faixa.agora"));
  ok("some o 'começou às' redundante", !/começou às/.test(info.textContent), info.textContent.replace(/\s+/g," "));

  /* ---- 3. revisão como destino ---- */
  const d3=abrir(baseSeed({inicio:Date.now()-5*60000,disciplina:"",assunto:"",destinoTipo:"revisao",destinoId:"v1"}));
  await espera(300);
  const f3=[...d3.window.document.querySelectorAll(".crono-info .faixa")].map(f=>f.textContent);
  ok("revisão também mostra o que já foi cronometrado nela",
     f3[0]==="08:00–08:45" && /–agora$/.test(f3[1]), f3);

  /* ---- 4. sessão nova: não há o que listar ---- */
  const d4=abrir(baseSeed({inicio:Date.now()-60000,disciplina:"",assunto:"",destinoTipo:null,destinoId:null}));
  await espera(300);
  const info4=d4.window.document.querySelector(".crono-info");
  ok("sessão nova não inventa medição", info4.querySelectorAll(".faixa").length===0);
  ok("e mantém o 'começou às'", /começou às/.test(info4.textContent), info4.textContent.replace(/\s+/g," "));

  /* ---- 5. encerrar acrescenta a medição à lista ---- */
  const d5=abrir(baseSeed({inicio:Date.now()-30*60000,disciplina:"",assunto:"",destinoTipo:"registro",destinoId:"rA"}));
  await espera(300);
  const w5=d5.window;
  d5.window.document.querySelector('[data-acao="crono-encerrar"]').dispatchEvent(new w5.MouseEvent("click",{bubbles:true}));
  await espera(300);
  // rodando logo depois da meia-noite, o cronômetro "de 30 min atrás" cruza o dia e o app pergunta: tudo no dia em que começou
  { const tudo=d5.window.document.querySelector('#modalCorpo [data-acao="crono-virada"][data-dividir="0"]');
    if (tudo){ tudo.dispatchEvent(new w5.MouseEvent("click",{bubbles:true})); await espera(300); } }
  const reg=JSON.parse(w5.localStorage.getItem("plataforma-estudos:v1")).registros[0];
  ok("encerrar grava a terceira medição", reg.blocos.length===3, reg.blocos.map(b=>b.inicio+"–"+b.fim));
  ok("e o total sobe", reg.minutos===330, reg.minutos);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\no cronômetro mostra todas as medições da sessão");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
