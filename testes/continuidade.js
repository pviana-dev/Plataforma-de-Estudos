/* Conteúdo em andamento nunca pode ficar sem agendamento: se a fila esvaziar
   por qualquer caminho, a próxima volta é reposta. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:dia(-6),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:""   /* médio */,tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:1}],
  registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"revisoes",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const pend=w=>db(w).revisoes.filter(r=>!r.feita);

(async()=>{try{
  /* ---- 1. base que chega sem nenhum agendamento ---- */
  let w=abrir(base({registros:[sess("r1")]})); await espera(500);
  ok("conteúdo aberto sem nada na agenda ganha a próxima volta", pend(w).length===1,
     db(w).revisoes);
  ok("marcada como volta", pend(w)[0].retomada===true);
  ok("contada de hoje, com a cadência da dificuldade", pend(w)[0].data===dia(2), pend(w)[0].data);
  ok("e a plataforma avisa que repôs", /Agenda atualizada: .*card de continuar/.test(w.document.getElementById("toast").textContent),
     w.document.getElementById("toast").textContent);

  /* ---- 2. base com tudo já feito ---- */
  w=abrir(base({registros:[sess("r1")],
    revisoes:[{id:"v0",registroId:"r1",data:dia(-2),ordem:1,retomada:true,feita:true,feitaEm:dia(-2),
      manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(500);
  ok("histórico cheio mas nada pendente também é reposto", pend(w).length===1, db(w).revisoes.map(r=>[r.id,r.feita]));
  ok("sem apagar o que já foi feito", db(w).revisoes.some(r=>r.id==="v0" && r.feita));

  /* ---- 3. excluir a última revisão à mão não deixa o conteúdo órfão ---- */
  w=abrir(base({registros:[sess("r1")],
    revisoes:[{id:"v1",registroId:"r1",data:dia(1),ordem:1,retomada:true,feita:false,manual:true,
      minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}), "revisoes");
  await espera(500);
  const doc=w.document;
  doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]')
     .dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  doc.querySelector('[data-acao="editar-revisao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(350);
  doc.querySelector('[data-acao="excluir-revisao"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  ok("excluída a última, outra é marcada no lugar", pend(w).length===1, db(w).revisoes);
  ok("e a excluída não volta", !db(w).revisoes.some(r=>r.id==="v1"), db(w).revisoes.map(r=>r.id));

  /* ---- 4. quem pediu para não ser lembrado continua sem lembrete ---- */
  w=abrir(base({registros:[sess("r1",{plano:"sem"})]})); await espera(500);
  ok("sessão marcada “sem revisão” continua sem agendamento", pend(w).length===0, db(w).revisoes);
  /* O plano "manual" era da versão antiga e prendia a sessão sem agendamento
     nenhum. Ele sai na carga: a sessão volta ao automático e ganha a volta. */
  w=abrir(base({registros:[sess("r1",{plano:"manual"})]})); await espera(500);
  ok("plano manual (versão antiga) vira automático e ganha a volta",
     pend(w).length===1 && pend(w)[0].retomada===true && db(w).registros[0].plano==="individual", db(w).revisoes);

  /* ---- 5. conteúdo concluído não ganha volta ---- */
  w=abrir(base({conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",
      concluidoEm:dia(-6),criadoEm:1}],
    registros:[sess("r1")],
    revisoes:[{id:"v9",registroId:"r1",data:dia(4),ordem:1,feita:false,manual:false,minutos:null,
      questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}]}));
  await espera(500);
  const p5=pend(w).slice().sort((a,b)=>a.data.localeCompare(b.data));
  ok("conteúdo fechado mantém a escada, sem volta nova — e ela continua depois da que existia",
     p5.length>1 && p5[0].id==="v9" && p5.every(r=>!r.retomada), p5.map(r=>[r.data,!!r.retomada]));

  /* ---- 6. o teto de revisões manda ---- */
  w=abrir(base({revisarAte:dia(1), registros:[sess("r1",{dificuldade:1,questoes:10,acertos:10})]}));
  await espera(500);
  ok("volta que cairia além do teto não é criada", pend(w).length===0, db(w).revisoes);

  /* ---- 7. agendamento encerrado é respeitado ---- */
  w=abrir(base({dataProva:dia(-5), posProva:"encerrei", registros:[sess("r1")]}));
  await espera(500);
  ok("com o agendamento encerrado, nada é reposto", pend(w).length===0, db(w).revisoes);

  /* ---- 8. dado antigo com grupo: a migração desfaz e a sessão volta a agendar ---- */
  w=abrir(base({grupos:[{id:"g1",nome:"Bloco LAI",disciplina:"Legislação",criadoEm:1}],
    registros:[sess("r1",{plano:"grupo",grupoId:"g1"})]}));
  await espera(500);
  ok("backup com grupo é desfeito e a sessão ganha a volta dela",
     pend(w).length===1 && pend(w)[0].registroId==="r1" && !pend(w)[0].grupoId &&
     (db(w).grupos||[]).length===0,
     {revs:db(w).revisoes, grupos:db(w).grupos});
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncontinuidade garantida");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
