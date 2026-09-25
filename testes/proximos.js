/* Esta suíte conta itens da lista: abre em "Todas as agendadas" (o padrão mostra só as 2 próximas revisões e a próxima retomada de cada conteúdo). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const dia=n=>iso(new Date(Date.now()+n*864e5));
const rev=(id,reg,d)=>({id,registroId:reg,data:d,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""});
/* revisarAte curto: a escada é completada na carga (garantia de revisão), e esta suíte é sobre a tela, não sobre quantas revisões cabem. */
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",revisarAte:dia(5),metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],
 registros:[
  {id:"rA",data:dia(0),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:dia(0),disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[rev("v1","rA",dia(1)),rev("v2","rB",dia(1)),rev("v3","rA",dia(3)),rev("v4","rB",dia(6)),rev("v5","rA",dia(0))],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({agendaCompleta:true,gravadoEm:new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-"+String(new Date().getDate()).padStart(2,"0")}));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
setTimeout(()=>{
  // a lista abre com uma amostra de 3; o agrupamento por dia se testa com tudo à mostra
  const bt=doc.querySelector('[data-acao="toggle-proximas"]');
  if (bt) bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  setTimeout(()=>{
  const card=[...doc.querySelectorAll(".card")].find(c=>/Próximos 7 dias/.test(c.textContent));
  const blocos=[...card.querySelectorAll(".dia-bloco")];
  console.log("  blocos por dia:");
  blocos.forEach(b=>console.log("    "+b.querySelector(".dia-rotulo").textContent.replace(/\s+/g," ")+
    "  ("+b.querySelectorAll(".item").length+" card(s))"));
  ok("as revisões futuras viraram blocos por dia", blocos.length===3, blocos.length);
  ok("o dia com duas revisões junta as duas", blocos.some(b=>b.querySelectorAll(".item").length===2),
     blocos.map(b=>b.querySelectorAll(".item").length));
  ok("cada bloco diz o dia da semana e a data",
     blocos.every(b=>/^(dom|seg|ter|qua|qui|sex|sáb) · \d\d\/\d\d/.test(b.querySelector(".dia-rotulo").textContent.trim())),
     blocos.map(b=>b.querySelector(".dia-rotulo").textContent.trim()));
  ok("o primeiro bloco diz 'amanhã'", /amanhã/.test(blocos[0].textContent), blocos[0].querySelector(".dia-rotulo").textContent);
  ok("os outros dizem em quantos dias", /em 3 dias/.test(blocos[1].textContent), blocos[1].querySelector(".dia-rotulo").textContent);
  ok("a contagem de itens aparece", /2 itens/.test(blocos[0].textContent), blocos[0].textContent);
  ok("o card da revisão não repete a data", !/\d\d\/\d\d/.test(blocos[0].querySelector(".item").textContent),
     blocos[0].querySelector(".item").textContent.replace(/\s+/g," "));
  ok("a revisão de hoje não entrou nos próximos dias", !card.textContent.includes("Para hoje"));
  const hojeCard=[...doc.querySelectorAll(".card")].find(c=>/Agenda de hoje e atrasados/.test(c.textContent));
  ok("a de hoje segue no card de hoje, com o rótulo", /Para hoje/.test(hojeCard.textContent));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nos próximos 7 dias estão separados por dia");
  process.exit(falhas?1:0);
  },180);
},280);
