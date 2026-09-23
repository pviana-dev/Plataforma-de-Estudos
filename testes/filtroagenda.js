/* A Agenda ganhou um filtro de assunto (visão por assunto), e o card de hoje
   não obedece a ele. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass)=>({id,data:dia(-10),disciplina:"Legislação",assuntos:[ass],assunto:ass,minutos:60,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
 fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",concluidoEm:dia(-10),criadoEm:1},
            {id:"c2",nome:"Licitações",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:2}],
 registros:[sess("r1","LAI"), sess("r2","Licitações")],
 revisoes:[rev("v0","r1",dia(-2)),                 // atrasada
           rev("v1","r1",hoje),                     // hoje
           rev("v2","r1",dia(1)), rev("v3","r1",dia(1)), rev("v4","r1",dia(6)),
           rev("v5","r2",dia(2),{retomada:true})],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
   w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const visao=v=>click(doc.querySelector('[data-acao="visao-agenda"][data-visao="'+v+'"]'));
const titulos=()=>[...doc.querySelectorAll("#view .card h2")].map(h=>h.textContent.trim().split(" ")[0]);

(async()=>{try{
  await espera(450);
  const texto=()=>doc.querySelector("#view").textContent;
  ok("as frases-guia saíram",
     !/hoje, o que atrasou e os próximos dias/.test(texto()) &&
     !/uma revisão à mão, que eu fiz ou quero fazer/.test(texto()), "");
  ok("sem filtro de assunto fora da visão por assunto", !$("#aAssunto"));
  visao("assunto"); await espera(300);
  const sel=$("#aAssunto");
  ok("a visão por assunto traz o filtro", !!sel);
  ok("com uma opção por assunto, mais 'Todos'", sel && sel.options.length===3,
     sel && [...sel.options].map(o=>o.textContent));
  ok("a frase da ordem alfabética saiu", !/Em ordem alfabética/.test(texto()));
  const grupos=()=>[...doc.querySelectorAll("#view .grupo-rev strong")].map(s=>s.textContent);
  ok("sem filtro, os dois assuntos", grupos().length===2, grupos());
  const lic=[...sel.options].find(o=>/Licitações/.test(o.textContent));
  sel.value=lic.value; sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("filtrado, só Licitações", JSON.stringify(grupos())==='["Licitações"]', grupos());
  ok("o card de hoje continua, com LAI", /LAI/.test(([...doc.querySelectorAll("#view .card")]
     .find(c=>/Agenda de hoje/.test(c.querySelector("h2")?.textContent||""))||{}).textContent||""));
  ok("a escolha fica no select", $("#aAssunto").value===lic.value);
  // o salto do card de hoje limpa o filtro, senão o alvo estaria escondido
  click(doc.querySelector('[data-acao="ir-para-card"]')); await espera(300);
  ok("saltar do card de hoje limpa o filtro", $("#aAssunto").value==="" && grupos().length===2, grupos());
}catch(e){console.log("ERRO",e);falhas++;}
console.log(falhas?falhas+" FALHA(S)":"filtro de assunto da agenda funcionando");process.exit(falhas?1:0);})();
