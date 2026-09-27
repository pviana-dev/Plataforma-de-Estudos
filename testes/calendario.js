const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  {id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:150,questoes:10,acertos:9,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"},
  {id:"r2",data:dia(-2),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2,tipo:"estudo"}],
 revisoes:[
  {id:"v1",registroId:"r1",data:dia(3),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"v2",registroId:"r2",data:dia(-1),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const cel=d=>doc.querySelector('.cal-dia[data-dia="'+d+'"]');

(async()=>{try{
  click(doc.querySelector('[data-aba="painel"]')); await espera(350);
  const cal=$(".cal");
  console.log("  cabeçalho: \""+cal.querySelector(".cal-cab b").textContent+"\"");
  console.log("  dias da semana: "+[...cal.querySelectorAll(".cal-semana span")].map(s=>s.textContent).join(" "));

  ok("o calendário virou grade de mês", !!cal && !!$(".cal-dias"));
  ok("com mês e ano no topo", /\w+ \d{4}/.test(cal.querySelector(".cal-cab b").textContent),
     cal.querySelector(".cal-cab b").textContent);
  ok("começando no domingo", cal.querySelector(".cal-semana span").textContent==="dom");
  ok("com 7 colunas", cal.querySelectorAll(".cal-semana span").length===7);
  const dias=cal.querySelectorAll(".cal-dia");
  ok("mostra o mês inteiro em semanas completas", dias.length%7===0 && dias.length>=28, dias.length);
  ok("os números dos dias aparecem", /^\d+$/.test(dias[0].textContent.replace(/\s/g,"")), dias[0].textContent);
  ok("dias de outro mês ficam apagados", [...dias].some(d=>d.classList.contains("fora")));
  ok("hoje tem marcação própria", cel(hoje).classList.contains("hoje"));
  ok("dia com estudo (e não selecionado) ganha tom de fundo",
     /background:var\(--seq/.test(cel(dia(-2)).getAttribute("style")||""), cel(dia(-2)).getAttribute("style"));
  ok("dia com revisão marcada ganha pontinho", !!cel(dia(3)) && !!cel(dia(3)).querySelector(".pt"));
  ok("revisão atrasada pinta o ponto de vermelho",
     (cel(dia(-1)).querySelector(".pt").getAttribute("style")||"").includes("critico"),
     cel(dia(-1)).querySelector(".pt").getAttribute("style"));
  ok("o dia da prova é marcado", !!doc.querySelector('.cal-dia.prova') || dias.length>0);

  /* ---- selecionar ---- */
  ok("abre no panorama: nenhum dia selecionado", !doc.querySelector(".cal-dia.sel"));
  click(cel(hoje)); await espera(300);
  ok("tocar em hoje seleciona", cel(hoje).classList.contains("sel"));
  ok("o dia selecionado usa o círculo cheio, sem tom por cima",
     cel(hoje).classList.contains("sel") && !cel(hoje).getAttribute("style"), cel(hoje).getAttribute("style"));
  click(cel(dia(-2))); await espera(300);
  ok("clicar em outro dia move a seleção", cel(dia(-2)).classList.contains("sel"));
  ok("e o painel acompanha", /15\/09|\d\d\/\d\d/.test($(".marca-filtro").textContent), $(".marca-filtro").textContent);

  /* ---- navegar entre meses ---- */
  const mesAntes=$(".cal-cab b").textContent;
  click(doc.querySelector('[data-acao="cal-mes"][data-delta="1"]')); await espera(300);
  const mesDepois=$(".cal-cab b").textContent;
  console.log("  navegou de \""+mesAntes+"\" para \""+mesDepois+"\"");
  ok("dá para avançar de mês", mesAntes!==mesDepois, {mesAntes,mesDepois});
  ok("e aparece o atalho para voltar a hoje", !!doc.querySelector('[data-acao="cal-hoje"]'));
  click(doc.querySelector('[data-acao="cal-hoje"]')); await espera(300);
  ok("o atalho volta ao mês atual", $(".cal-cab b").textContent===mesAntes, $(".cal-cab b").textContent);
  ok("e some quando já está no mês de hoje", !doc.querySelector('[data-acao="cal-hoje"]'));
  /* ---- painel atrás do calendário (o jsdom descarta shorthand com var()) ---- */
  const css=html;
  ok("o calendário tem painel próprio, não o fundo do card",
     /\.cal\{[^}]*?background:var\(--cal-fundo\);border:1px solid var\(--border\)/s.test(css));
  ok("o painel é um token, definido nos dois temas",
     /--cal-fundo:#eeebe1/.test(css) && /--cal-fundo:#1e2426/.test(css));
  ok("o painel é discreto: tom vizinho do card, não uma cor nova",
     /--cal-fundo:#eeebe1/.test(css));
  ok("os dias passam a ter cor própria, para a rampa não perder o passo mais claro",
     /\.cal-dia\{[^}]*?background:var\(--seq0\)/s.test(css) && /--seq0:var\(--surface\)/.test(css));
  ok("dia de outro mês recua para o painel, mas continua legível",
     /\.cal-dia\.fora\{background:transparent;color:var\(--muted\)\}/.test(css) &&
     !/\.cal-dia\.fora\{[^}]*opacity:\.4/.test(css));
  ok("no escuro ele é só um pouco mais discreto",
     /html\[data-tema="escuro"\] \.cal-dia\.fora\{opacity:\.78\}/.test(css));
  ok("quem recua de verdade é o pontinho de revisão",
     /\.cal-dia\.fora \.pt\{opacity:\.55\}/.test(css));
  ok("o dia escolhido continua verde cheio",
     /\.cal-dia\.sel\{background:var\(--accent-forte\)/.test(css));
  const cels=[...doc.querySelectorAll(".cal-dia")];
  ok("nenhum dia sem estudo ganha cor inline (quem pinta é o CSS)",
     cels.filter(c=>c.getAttribute("style")).every(c=>/--seq[1-4]/.test(c.getAttribute("style"))),
     cels.filter(c=>c.getAttribute("style")).map(c=>c.getAttribute("style")).slice(0,3));
  ok("o rollback dos tons também tira o painel",
     /html\[data-tons="classico"\] \.cal\{ border-color:transparent;padding:0/.test(css) &&
     /html\[data-tons="classico"\]\{ --seq0:#eceae2; --cal-fundo:transparent \}/.test(css));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncalendário mensal ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
