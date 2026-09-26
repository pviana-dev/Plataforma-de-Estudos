const fs=require("fs"),{JSDOM}=require("jsdom");
const CONFIG_MAX=5;   // degraus que cabem até a véspera, nesta janela
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const dia=n=>iso(new Date(Date.now()+n*864e5));
const reg=(id,d,ass,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:[ass],assunto:ass,
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},extra||{});
/* A INTEGRAÇÃO FOI APOSENTADA — esta suíte passou a guardar a MIGRAÇÃO que a
   desfaz, com a forma mais difícil que existia: um grupo com duas sessões e um
   card que já era do grupo (sem dono próprio), mais uma sessão solta.
   O que não pode acontecer: revisão órfã, sessão sem agendamento, ou grupo
   sobrevivendo. X e Y estavam integrados no grupo "LAI"; Z estava sozinha. */
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],
 grupos:[{id:"g1",nome:"LAI",disciplina:"Legislação",criadoEm:1}],
 registros:[
   reg("rX",dia(-3),"LAI",{plano:"grupo",grupoId:"g1"}),
   reg("rY",dia(-1),"LAI - prazos",{plano:"grupo",grupoId:"g1"}),
   reg("rZ",dia(0),"LAI - recursos")],
 revisoes:[{id:"v1",registroId:"rX",grupoId:"g1",integrada:true,disciplina:"Legislação",assuntos:["LAI","LAI - prazos"],
            data:dia(2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
           {id:"vF",registroId:"rX",grupoId:"g1",integrada:true,disciplina:"Legislação",assuntos:["LAI"],
            data:dia(-2),ordem:1,feita:true,feitaEm:dia(-2),manual:false,minutos:30,questoes:5,acertos:4,
            dificuldade:2,atividade:"",nota:"revisei os arts. 1 a 10"}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.__confirmarNativo=true; w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  await espera(600);
  const d = lerDb();

  ok("o grupo foi desfeito", !(d.grupos || []).length, d.grupos);
  ok("nenhuma sessão continua com plano de grupo",
     !d.registros.some(r => r.plano === "grupo" || r.grupoId),
     d.registros.map(r => [r.id, r.plano, r.grupoId]));
  ok("e nenhuma ficou em 'manual', que a deixaria sem agendamento para sempre",
     !d.registros.some(r => r.plano === "manual"), d.registros.map(r => [r.id, r.plano]));

  /* O HISTÓRICO NÃO SE REPLANEJA: a revisão já feita atravessa a migração
     inteira, com o tempo, as questões e a nota. A pendente automática é
     recalculada, como em qualquer replanejamento — o que não pode é sumir
     sem deixar a sessão coberta (verificado no fim). */
  const vF = d.revisoes.find(r => r.id === "vF");
  ok("a revisão já FEITA sobrevive à migração", !!vF && vF.feita, d.revisoes.map(r => [r.id, r.feita]));
  ok("com o tempo, as questões e a nota intactos",
     !!vF && vF.minutos === 30 && vF.questoes === 5 && /arts\. 1 a 10/.test(vF.nota || ""), vF);
  ok("e agora pertence a uma sessão de verdade, não a um grupo",
     !!vF && !!d.registros.find(r => r.id === vF.registroId) && !vF.grupoId, vF && vF.registroId);
  ok("nenhuma revisão ficou órfã",
     d.revisoes.every(r => !r.registroId || !!d.registros.find(x => x.id === r.registroId)),
     d.revisoes.map(r => [r.id, r.registroId]));
  ok("sem sobras de integração no dado",
     !d.revisoes.some(r => r.grupoId || r.integrada),
     d.revisoes.map(r => [r.id, r.grupoId, r.integrada]));

  /* E o que importa no fim: ninguém ficou sem ser chamado de volta. */
  const abertas = new Set(d.revisoes.filter(r => !r.feita).map(r => r.registroId));
  ok("as três sessões seguem no radar da agenda",
     ["rX","rY","rZ"].every(id => d.registros.some(r => r.id === id)) && abertas.size >= 2,
     { abertas: [...abertas], revs: d.revisoes.map(r => [r.registroId, r.data]) });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nmigração desfaz o grupo encadeado sem deixar sobras");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
