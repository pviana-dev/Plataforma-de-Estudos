const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:150,questoes:10,acertos:4,dificuldade:4,anotacoes:"",criadoEm:1}],
 revisoes:[
  {id:"v1",registroId:"rA",data:ontem,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"v2",registroId:"rA",data:hoje,ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
setTimeout(()=>{
  const tiles=[...doc.querySelectorAll(".tile")].map(t=>t.className+" :: "+t.textContent.replace(/\s+/g," ").slice(0,42));
  console.log("  blocos da aba Hoje:"); tiles.forEach(t=>console.log("    "+t));
  ok("atraso pinta o bloco de crítico", tiles.some(t=>/t-critico/.test(t)&&/atrasad/i.test(t)), tiles);
  ok("meta batida pinta de bom", tiles.some(t=>/t-bom/.test(t)&&/Estudo de hoje/.test(t)), tiles);
  const it=[...doc.querySelectorAll(".item")].map(e=>e.className);
  ok("a revisão atrasada tem o estado próprio", it.some(c=>/atrasada/.test(c)), it);
  ok("a de hoje também", it.some(c=>/\bhoje\b/.test(c)), it);
  ok("a aba ativa está marcada", !!$('.aba[aria-selected="true"]'));
  /* a caixinha de marcar: o ✓ é desenhado, não é o glifo da fonte */
  ok("o ✓ da caixa é desenhado com bordas", /\.check::after\{content:"";position:absolute/.test(html));
  ok("e o glifo do HTML fica escondido", /\.check\{[^}]*font-size:0;color:transparent/s.test(html));
  ok("marcada, o traço fica branco sobre o verde",
     /\.check\[aria-checked="true"\]\{background:var\(--bom\);border-color:var\(--bom\)\}/.test(html) &&
     /\.check\[aria-checked="true"\]::after[\s\S]{0,60}border-color:#fff/.test(html));
  ok("e o hover mostra uma prévia do traço", /\.check:hover::after\{border-color:var\(--accent\)\}/.test(html));
  click(doc.querySelector('[data-aba="questoes"]'));
  setTimeout(()=>{
    const t2=[...doc.querySelectorAll(".tile")].map(e=>e.className+" :: "+e.textContent.replace(/\s+/g," ").slice(0,40));
    ok("taxa de 40% vira bloco crítico", t2.some(x=>/t-critico/.test(x)&&/Taxa de acerto/.test(x)), t2);
    console.log(falhas?"\n"+falhas+" FALHA(S)":"\nos tons semânticos estão aparecendo");
    process.exit(falhas?1:0);
  },200);
},260);
