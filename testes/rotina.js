const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const mais=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:4,dificuldade:4,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:5,acertos:5,dificuldade:2,anotacoes:"",criadoEm:2}],
 revisoes:[
  {id:"v1",registroId:"rA",data:ontem,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"v2",registroId:"rA",data:mais(3),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"v3",registroId:"rB",data:mais(2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"v4",registroId:"rB",data:mais(9),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
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
  click(doc.querySelector('[data-aba="revisoes"]'));
  setTimeout(()=>verPorAssunto(doc, w), 60);
  setTimeout(()=>{
    const blocos=[...doc.querySelectorAll(".grupo-rev")];
    ok("cada conteúdo virou um bloco próprio", blocos.length===2, blocos.length);
    ok("o bloco com atraso é marcado", blocos.some(b=>b.classList.contains("tem-atraso")),
       blocos.map(b=>b.className));
    ok("o bloco sem atraso não é", blocos.some(b=>!b.classList.contains("tem-atraso")));
    ok("cada bloco tem cabeçalho separado do conteúdo", blocos.every(b=>!!b.querySelector(".cab")));
    ok("as revisões ficam dentro do bloco do conteúdo",
       blocos.every(b=>b.querySelectorAll(".item").length===2), blocos.map(b=>b.querySelectorAll(".item").length));
    ok("nenhuma revisão sobrou fora de um bloco (fora o card de atrasadas)",
       [...doc.querySelectorAll("#view .item")].every(i=>i.closest(".grupo-rev") || i.closest("#revisoes-atrasadas")));
    ok("o título do conteúdo está no cabeçalho",
       blocos.map(b=>b.querySelector(".cab strong").textContent).sort().join(",")==="Crase,LAI",
       blocos.map(b=>b.querySelector(".cab strong").textContent));
    // agora são 3: fechar o conteúdo, + revisão e anotações ("editar card" saiu com a integração)
    ok("os botões do conteúdo seguem no cabeçalho",
       // o minimizar (seta + nome) é da tela, não do conteúdo: fica fora da conta
       blocos.every(b=>b.querySelectorAll('.cab [data-acao]:not([data-acao="minimizar-assunto"])').length===3),
       blocos.map(b=>[...b.querySelectorAll('.cab [data-acao]')].map(x=>x.dataset.acao)));
    console.log(falhas?"\n"+falhas+" FALHA(S)":"\nos blocos da Rotina estão separados");
    process.exit(falhas?1:0);
  },220);
},260);
