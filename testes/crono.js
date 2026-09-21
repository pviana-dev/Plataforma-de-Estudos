const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[
  {id:"rHoje",data:hoje,   disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rOntem",data:dia(-1),disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:40,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2},
  {id:"rAntes",data:dia(-5),disciplina:"Legislação",assuntos:["Improbidade"],assunto:"Improbidade",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:3}],
 revisoes:[
  {id:"vHoje",  registroId:"rOntem",data:hoje,   ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vAtras", registroId:"rAntes",data:dia(-2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vFutura",registroId:"rHoje", data:dia(4), ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vFeitaOntem",registroId:"rAntes",data:dia(-1),ordem:2,feita:true,feitaEm:dia(-1),manual:false,minutos:20,questoes:null,acertos:null,dificuldade:3,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
setTimeout(()=>{
  const sel=$("#cronoDestino");
  const grupos=[...sel.querySelectorAll("optgroup")].map(g=>g.label);
  const opts=[...sel.options].map(o=>o.value+" :: "+o.textContent);
  console.log("  destinos oferecidos:"); opts.forEach(o=>console.log("    "+o));
  ok("a sessão de hoje aparece", opts.some(o=>/registro:rHoje/.test(o)));
  ok("a sessão de ontem NÃO aparece", !opts.some(o=>/registro:rOntem/.test(o)));
  ok("a sessão de 5 dias atrás NÃO aparece", !opts.some(o=>/registro:rAntes/.test(o)));
  ok("nenhuma revisão aparece direto (o alvo agora é a sessão)",
     !opts.some(o=>/^revisao:/.test(o)), opts);
  ok("nenhuma data de outro dia no rótulo das sessões",
     !opts.filter(o=>/^registro:/.test(o)).some(o=>/\d\d\/\d\d/.test(o)), opts.filter(o=>/^registro:/.test(o)));
  ok("o grupo diz que é de hoje", grupos.every(g=>/hoje/.test(g)), grupos);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\no cronômetro só oferece o que é de hoje");
  process.exit(falhas?1:0);
},280);
