/* A agenda se resolve sozinha: registrar uma sessão do conteúdo dá o lembrete
   vencido por cumprido e faz nascer o próximo. E conteúdo atrasado é atrasado,
   esteja em andamento ou concluído. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:""   /* médio */,tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"registros",gravadoEm:hoje}));
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
async function gravar(w,id){
  const doc=w.document;
  doc.querySelector('[data-aba="registros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(250);
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);
  linha.querySelector("td").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  doc.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
}

(async()=>{try{
  /* ---- 1. conteúdo ABERTO: lembrete vencido é resolvido pela sessão ---- */
  let w=abrir(base({registros:[sess("r1",{data:dia(-3)}), sess("r2")],
                    revisoes:[rev("v1","r1",dia(-1),{retomada:true})]}));
  await espera(400);
  ok("o lembrete começa vencido", db(w).revisoes[0].feita===false);
  await gravar(w,"r2");
  const d1=db(w);
  const antigo=d1.revisoes.find(r=>r.id==="v1");
  ok("registrar a sessão resolve o lembrete vencido", !!antigo && antigo.feita===true,
     d1.revisoes.map(r=>[r.id,r.feita]));
  ok("e a sessão fica registrada como quem o cumpriu", antigo.sessaoId==="r2", antigo.sessaoId);
  const proximos=d1.revisoes.filter(r=>!r.feita);
  ok("nasce o próximo, contado a partir de hoje", proximos.length===1 && proximos[0].data===dia(2),
     proximos.map(r=>r.data));
  ok("e continua sendo um lembrete, não uma revisão", proximos[0].retomada===true);

  /* ---- 2. lembrete futuro não é consumido ---- */
  w=abrir(base({registros:[sess("r1",{data:dia(-3)}), sess("r2")],
                revisoes:[rev("v1","r1",dia(5),{retomada:true})]}));
  await espera(400); await gravar(w,"r2");
  ok("lembrete que ainda não venceu não é dado por cumprido",
     db(w).revisoes.every(r=>!r.feita), db(w).revisoes.map(r=>[r.data,r.feita]));

  /* ---- 3. conteúdo FECHADO: a revisão vencida é cumprida pela sessão ---- */
  const fechado=base({conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",
                                  concluidoEm:dia(-10),criadoEm:1}],
    registros:[sess("r1",{data:dia(-10)}), sess("r2")],
    revisoes:[rev("v1","r1",dia(-2)), rev("v2","r1",dia(6))]});
  w=abrir(fechado); await espera(400); await gravar(w,"r2");
  const d3=db(w);
  ok("a revisão vencida é cumprida", d3.revisoes.find(r=>r.id==="v1").feita===true,
     d3.revisoes.map(r=>[r.id,r.data,r.feita]));
  ok("a revisão futura continua de pé", d3.revisoes.find(r=>r.id==="v2").feita===false);
  /* A escada é do conteúdo: as próximas nascem DEPOIS da que já existia, uma
     por degrau — nada de uma segunda fila por cima da primeira. */
  const pend3=d3.revisoes.filter(r=>!r.feita).sort((a,b)=>a.data.localeCompare(b.data));
  ok("e NÃO nasce uma segunda escada para o mesmo conteúdo: ela continua depois da que existia",
     pend3[0].id==="v2" && new Set(pend3.map(r=>r.data)).size===pend3.length && pend3.every(r=>!r.retomada),
     pend3.map(r=>r.id+"@"+r.data));

  /* ---- 4. atraso vale para os dois, como pedido ---- */
  w=abrir(base({registros:[sess("r1",{data:dia(-5)})],
                revisoes:[rev("v1","r1",dia(-2),{retomada:true})]}), "revisoes");
  await espera(400);
  const texto=w.document.querySelector("#view").textContent;
  ok("lembrete vencido conta como atrasado", /Atrasadas\s*1|1\s*⚠|⚠/.test(texto) || /atrasad/i.test(texto),
     texto.slice(0,160));
  ok("e aparece no card de atrasadas", !!w.document.querySelector("#revisoes-atrasadas"),
     [...w.document.querySelectorAll("#view .card h2")].map(h=>h.textContent));
  ok("com a opção de remarcar", !!w.document.querySelector('[data-acao="remarcar-revisao"]'));

  /* ---- 5. sessão de outro conteúdo não resolve nada ---- */
  const outro=base({registros:[sess("r1",{data:dia(-3)}),
                     sess("r2",{assuntos:["Licitações"],assunto:"Licitações"})],
    conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1},
               {id:"c2",nome:"Licitações",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:2}],
    revisoes:[rev("v1","r1",dia(-1),{retomada:true})]});
  w=abrir(outro); await espera(400); await gravar(w,"r2");
  ok("estudar outro conteúdo não cumpre o lembrete deste",
     db(w).revisoes.find(r=>r.id==="v1").feita===false,
     db(w).revisoes.map(r=>[r.id,r.registroId,r.feita]));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nagenda que se resolve sozinha funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
