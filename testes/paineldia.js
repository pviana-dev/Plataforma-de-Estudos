const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const r=(id,data,disc,ass,min,q,a)=>({id,data,disciplina:disc,assuntos:[ass],assunto:ass,minutos:min,
  questoes:q,acertos:a,dificuldade:3,anotacoes:"",criadoEm:Number(id.slice(1)),tipo:"estudo"});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  r("r1",hoje,"Legislação","LAI",60,10,9),        // hoje: 9/10 = 90%
  r("r2",hoje,"Português","Crase",30,10,5),       // hoje: 5/10 = 50%
  r("r3",dia(-3),"Legislação","LAI",120,20,4),    // outro dia: 20%
  r("r4",dia(-6),"Português","Crase",45,10,10)],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const card=t=>[...doc.querySelectorAll("#view .card")].find(c=>c.querySelector("h2")&&new RegExp(t).test(c.querySelector("h2").textContent));
const txt=c=>c.textContent.replace(/\s+/g," ");

(async()=>{try{
  click(doc.querySelector('[data-aba="painel"]')); await espera(350);

  /* ---- calendário ---- */
  const cal=card("Calendário de estudos");
  ok("o calendário é uma grade de mês", !!cal.querySelector(".cal-dias"));
  ok("a semana começa no domingo", cal.querySelector(".cal-semana span").textContent==="dom");
  ok("tem mês e ano no topo", /\w+ \d{4}/.test(cal.querySelector(".cal-cab b").textContent),
     cal.querySelector(".cal-cab b").textContent);
  ok("a legenda explica os pontinhos", /revisão marcada/.test(txt(cal)), txt(cal).slice(-120));

  /* ---- com o dia de hoje selecionado (padrão) ---- */
  ok("o painel já abre com hoje escolhido", !!$(".marca-filtro"), txt(card("% de acerto")).slice(0,80));
  const taxa=card("% de acerto por disciplina");
  console.log("  taxa por disciplina (hoje): "+txt(taxa).slice(0,120));
  ok("a taxa mostra só o dia (Legislação 90%)", /90%/.test(taxa.innerHTML), txt(taxa));
  ok("e não a taxa acumulada da Legislação (43%)", !/43%/.test(taxa.innerHTML), txt(taxa));
  const tempo=card("Tempo de estudo por disciplina");
  ok("o tempo também é só do dia (1h e 30min)", /1h/.test(txt(tempo)) && /30min/.test(txt(tempo)) && !/2h/.test(txt(tempo)),
     txt(tempo));

  /* ---- o que deve ficar de fora do filtro ---- */
  const tiles=[...doc.querySelectorAll("#view .tiles .tile")].map(txt);
  const geral=tiles.find(t=>/% de acerto geral/.test(t));
  ok("o % de acerto geral continua acumulado (50 acertos/50 questões → 56%)",
     /56%/.test(geral), geral);
  ok("estudo na semana continua somando a semana", /Estudo na semana/.test(tiles.join("")),
     tiles.find(t=>/Estudo na semana/.test(t)));
  ok("a prioridade da reta final não é filtrada por dia",
     /Improbidade|LAI|Crase/.test(txt(card("Prioridade"))), txt(card("Prioridade")).slice(0,120));

  /* ---- trocar de dia muda os gráficos ---- */
  const celula=doc.querySelector('.cal-dia[data-dia="'+dia(-3)+'"]');
  click(celula); await espera(350);
  const taxa2=card("% de acerto por disciplina");
  console.log("  taxa por disciplina (3 dias atrás): "+txt(taxa2).slice(0,120));
  ok("escolher outro dia troca os números", /20%/.test(taxa2.innerHTML), txt(taxa2));
  ok("e o bloco do topo passa a mostrar aquele dia", doc.querySelector("#view .tile").textContent.includes(dia(-3).slice(8)+"/"+dia(-3).slice(5,7)),
     doc.querySelector("#view .tile").textContent);
  ok("o card de evolução saiu da aba", !card("Evolução"),
     [...doc.querySelectorAll("#view .card h2")].map(h=>h.textContent));
  ok("mas a função continua no arquivo, para voltar depois",
     /function linhaEvolucao/.test(fs.readFileSync(__dirname + "/../index.html","utf8")));

  /* ---- limpar ---- */
  click(doc.querySelector('.marca-filtro').parentElement.querySelector('[data-acao="sel-dia"]')); await espera(350);
  ok("dá para voltar a ver tudo", !$(".marca-filtro"));
  const taxa3=card("% de acerto por disciplina");
  ok("sem dia, volta o acumulado", /43%/.test(taxa3.innerHTML), txt(taxa3));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nfiltro de dia no painel ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
