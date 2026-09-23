/* OS NÚMEROS DA ABA SESSÕES NÃO CONTAM HORAS. "Tempo na semana" e "Tempo total"
   saíram: um relógio somando tudo o que já foi estudado cobra em vez de
   informar. No lugar ficaram dois números de progresso. O tempo de CADA sessão
   continua na linha dela — ali é dado, não placar. Esta suíte guarda isso. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=new Date();
const domingo=new Date(hoje); domingo.setDate(hoje.getDate()-hoje.getDay());
const dow=n=>{const d=new Date(domingo); d.setDate(domingo.getDate()+n); return iso(d);};
const r=(id,data,min,extra)=>Object.assign({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:min,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:Number(id.slice(1)),tipo:"estudo"},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Legislação",nome:"Licitações",fase:"concluido",concluidoEm:dow(1)},
            {disciplina:"Português",nome:"Crase",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[
  r("r1",dow(0),60),
  r("r2",dow(3),90,{assuntos:["Licitações"],assunto:"Licitações"}),
  r("r3",dow(6),30,{disciplina:"Português",assuntos:["Crase"],assunto:"Crase"}),
  r("r4",iso(new Date(domingo.getTime()-864e5)),120),
  r("r5",iso(new Date(domingo.getTime()-10*864e5)),45)],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const tiles=()=>[...doc.querySelectorAll("#view .tiles .tile")].map(t=>t.textContent.replace(/\s+/g," "));
// 1h30, 45min, 3h — qualquer soma de horas num bloco
const temHora=t=>/\d+\s?h(\d|\b)|\d+\s?min/.test(t);

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(350);
  const t=tiles();
  console.log("  blocos:"); t.forEach(x=>console.log("    "+x));

  /* ---- 1. nenhum bloco conta horas ---- */
  ok("nenhum dos blocos da aba mostra soma de horas", !t.some(temHora), t.filter(temHora));
  ok("“Tempo na semana” não existe mais", !t.some(x=>/Tempo na semana/.test(x)), t);
  ok("“Tempo total” também não", !t.some(x=>/Tempo total/.test(x)), t);
  ok("e nem sobrou o tempo do filtro no primeiro bloco", !/no filtro/.test(t[0]), t[0]);

  /* ---- 2. o que entrou no lugar ---- */
  ok("o primeiro bloco continua contando as sessões listadas",
     /^Sessões listadas5/.test(t[0]), t[0]);
  ok("e diz em quantos dias diferentes", /dias diferentes/.test(t[0]), t[0]);
  ok("o segundo bloco conta os CONTEÚDOS estudados", /^Conteúdos estudados3/.test(t[1]), t[1]);
  ok("com as disciplinas que eles cobrem", /2 disciplinas/.test(t[1]), t[1]);
  ok("o último conta os conteúdos já CONCLUÍDOS", /^Conteúdos concluídos1/.test(t[3]), t[3]);
  ok("e quantos ainda estão em andamento", /2 ainda em andamento/.test(t[3]), t[3]);
  ok("com uma barra de progresso", !!doc.querySelectorAll("#view .tiles .tile .barra")[0],
     doc.querySelectorAll("#view .tiles .barra").length);
  ok("o bloco da agenda ficou onde estava", /^Pendentes na agenda/.test(t[2]), t[2]);

  /* ---- 3. os novos números respeitam o filtro ---- */
  const d=$("#fDisciplina"); d.value="Português"; change(d); await espera(350);
  const t2=tiles();
  console.log("  com filtro de Português:"); t2.forEach(x=>console.log("    "+x));
  ok("filtrando, sobra só o conteúdo daquela disciplina", /^Conteúdos estudados1/.test(t2[1]), t2[1]);
  ok("numa disciplina só", /1 disciplina/.test(t2[1]), t2[1]);
  ok("e nenhum concluído nela", /^Conteúdos concluídos0/.test(t2[3]), t2[3]);
  ok("nem com filtro aparece hora somada", !t2.some(temHora), t2.filter(temHora));

  /* ---- 4. o tempo de cada sessão continua na lista ---- */
  d.value=""; change(d); await espera(350);
  const cab=[...doc.querySelectorAll("#view thead th")].map(x=>x.textContent);
  ok("a coluna Tempo continua na tabela", cab.includes("Tempo"), cab);
  const corpo=doc.querySelector("#view tbody").textContent;
  ok("e cada sessão continua mostrando o tempo dela", /1h30|1h|30min/.test(corpo),
     corpo.replace(/\s+/g," ").slice(0,120));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nos números da aba Sessões não contam horas");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
