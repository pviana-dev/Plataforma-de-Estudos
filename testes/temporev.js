const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,
   blocos:[{data:hoje,inicio:"08:00",fim:"09:00",minutos:60}],inicio:"08:00",fim:"09:00"}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],
 cronometro:{inicio:Date.now()-45*60000,disciplina:"",assunto:"",destinoTipo:"revisao",destinoId:"v1"}};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  await espera(300);
  const antes=lerDb();
  console.log("  antes:  sessão "+antes.registros[0].minutos+"min · revisão "+(antes.revisoes[0].minutos||0)+"min");
  click(doc.querySelector('[data-acao="crono-encerrar"]')); await espera(400);
  // rodando logo depois da meia-noite, o cronômetro "de 30 min atrás" cruza o dia e o app pergunta: tudo no dia em que começou
  { const tudo=doc.querySelector('#modalCorpo [data-acao="crono-virada"][data-dividir="0"]');
    if (tudo){ click(tudo); await espera(400); } }
  const d=lerDb(), reg=d.registros[0], rev=d.revisoes[0];
  console.log("  depois: sessão "+reg.minutos+"min · revisão "+rev.minutos+"min");

  ok("o cronômetro não grava mais nada na revisão", rev.minutos===null && !(rev.blocos||[]).length,
     {min:rev.minutos, blocos:(rev.blocos||[]).length});
  ok("nem infla a sessão de estudo por conta própria", reg.minutos===60, reg.minutos);
  ok("o tempo medido vira uma sessão nova a registrar", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  ok("com os minutos medidos já preenchidos", $("#modalCorpo [name=minutos]").value==="45",
     $("#modalCorpo [name=minutos]").value);
  doc.querySelector('#overlay [data-acao="fechar-modal"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);

  // o que cada tela mostra
  click(doc.querySelector('[data-aba="hoje"]')); await espera(300);
  const tiles=[...doc.querySelectorAll(".tile")].map(t=>t.textContent.replace(/\s+/g," "));
  console.log("  estudo de hoje: "+(tiles.find(t=>/Estudo de hoje/.test(t))||""));
  ok("o dia conta só o que está registrado (1h)", tiles.some(t=>/Estudo de hoje1h/.test(t)), tiles[0]);

  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA");
  const tempoCol=linha.querySelectorAll("td")[2].textContent.replace(/\s+/g," ").trim();
  console.log("  coluna Tempo da sessão: \""+tempoCol+"\"");
  ok("no histórico a sessão continua com 1h", /^1h/.test(tempoCol), tempoCol);

  click(doc.querySelector('[data-aba="painel"]')); await espera(300);
  const info=$(".dia-info").textContent.replace(/\s+/g," ");
  ok("o detalhe do dia mostra a sessão de estudo", /estudo/.test(info), info.slice(0,200));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nverificado");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
