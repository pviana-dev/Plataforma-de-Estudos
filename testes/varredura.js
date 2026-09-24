/* A VARREDURA DE 24/09. Cada bloco reproduz um defeito achado na revisão geral
   do app e confere a correção:
   1. salvar os Ajustes sem mudar datas não mexe na agenda; mudando, o atrasado continua atrasado;
   2. excluir a sessão "dona" não apaga a escada (nem o histórico) do conteúdo;
   3. dado danificado não é apagado: fica uma cópia, e a tela avisa;
   4. editar uma revisão feita antiga (sem sessão) não a desmarca nem apaga as questões;
   5. importar um backup antigo passa pelas mesmas migrações da abertura;
   6. editar uma sessão antiga não traz de volta um conteúdo excluído;
   7. o Progresso conta as baterias avulsas, como a aba Questões;
   8. a bateria de uma sessão antiga (fora das 60 recentes) se edita sem trocar de sessão;
   9. excluir um conteúdo tira o nome dele dos cards mistos;
  10. disciplina sem uso se exclui; com sessão, o botão nem aparece;
  11. dia com só uma bateria de questões conta na sequência. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed, aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ if(seed!==null) w.localStorage.setItem("plataforma-estudos:v1",typeof seed==="string"?seed:JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"hoje",gravadoEm:hoje}));
     w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const submit=(w,f)=>f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
const base=()=>({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,disciplinas:["Legislação"],
 grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
 conteudos:[],registros:[],revisoes:[],erros:[],cronometro:null});
const reg=(id,d,ass,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,
  acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:id.charCodeAt(1)},extra||{});
const ficha=(nome,extra)=>Object.assign({id:"c"+nome,disciplina:"Legislação",nome,fase:"andamento"},extra||{});

(async()=>{try{
  /* ---- 1. Ajustes ---- */
  const s1=base(); s1.conteudos=[ficha("LAI")]; s1.registros=[reg("r1",dia(-3),["LAI"])];
  s1.revisoes=[{id:"v1",registroId:"r1",data:dia(-1),ordem:1,retomada:true,assuntos:["LAI"],feita:false,manual:false}];
  let w=abrir(s1); await espera(400);
  click(w,w.document.querySelector("#btnAjustes")); await espera(150);
  w.document.querySelector('#formAjustes [name="meta"]').value="200";
  submit(w,w.document.querySelector("#formAjustes")); await espera(300);
  ok("1a. mudar só a meta não mexe na agenda (o atrasado de ontem continua)",
     db(w).metaDiariaMin===200 && JSON.stringify(db(w).revisoes.filter(r=>!r.feita).map(r=>r.data))===JSON.stringify([dia(-1)]),
     db(w).revisoes.map(r=>r.data));
  click(w,w.document.querySelector("#btnAjustes")); await espera(150);
  w.document.querySelector('#formAjustes [name="revisarAte"]').value=dia(60);
  submit(w,w.document.querySelector("#formAjustes")); await espera(300);
  ok("1b. mudar o teto replaneja, mas o card atrasado continua atrasado (não pula para a frente)",
     db(w).revisarAte===dia(60) && db(w).revisoes.filter(r=>!r.feita&&r.retomada).map(r=>r.data).join()===dia(-1),
     db(w).revisoes.map(r=>r.data));

  /* ---- 2. excluir a sessão dona ---- */
  const s2=base(); s2.conteudos=[ficha("LAI",{fase:"concluido",concluidoEm:dia(-10)})];
  s2.registros=[reg("r1",dia(-12),["LAI"]), reg("r2",dia(-10),["LAI"])];
  s2.revisoes=[{id:"f1",registroId:"r2",assuntos:["LAI"],data:dia(-9),degrau:1,passo:1,feita:true,feitaEm:dia(-9),manual:false},
               {id:"p1",registroId:"r2",assuntos:["LAI"],data:dia(2),degrau:2,passo:2,feita:false,manual:false}];
  w=abrir(s2,"registros"); await espera(400);
  const nAntes=db(w).revisoes.length;
  click(w,w.document.querySelector('tr[data-id="r2"] td')); await espera(300);
  click(w,w.document.querySelector('[data-acao="excluir-registro"]')); await espera(300);
  const rv2=db(w).revisoes;
  ok("2. excluir a sessão dona mantém o histórico e a escada, agora na outra sessão do conteúdo",
     rv2.length===nAntes && rv2.find(r=>r.id==="f1").feita && rv2.find(r=>r.id==="p1").data===dia(2) &&
     rv2.every(r=>r.registroId==="r1"), rv2.map(r=>r.id+"@"+r.registroId));

  /* ---- 3. dado danificado ---- */
  w=abrir('{"registros":[{"id":"r1"', "hoje"); await espera(400);
  ok("3. dado danificado: a cópia fica guardada e a tela avisa",
     w.localStorage.getItem("plataforma-estudos:v1:danificado")==='{"registros":[{"id":"r1"' &&
     w.document.querySelector("#modalTitulo").textContent==="Os dados salvos não abriram",
     w.document.querySelector("#modalTitulo").textContent);

  /* ---- 4. revisão feita antiga ---- */
  const s4=base(); s4.conteudos=[ficha("LAI",{fase:"concluido",concluidoEm:dia(-10)})]; s4.registros=[reg("r1",dia(-10),["LAI"])];
  s4.revisoes=[{id:"f1",registroId:"r1",data:dia(-8),feita:true,feitaEm:dia(-8),questoes:10,acertos:8,manual:false}];
  w=abrir(s4,"revisoes"); await espera(400);
  click(w,w.document.querySelector('[data-acao="fase-agenda"][data-fase="concluidos"]')); await espera(200);
  click(w,w.document.querySelector('[data-acao="editar-revisao"][data-id="f1"]')); await espera(300);
  w.document.querySelector('#formRevisao [name="rotulo"]').value="Revisão da lei";
  submit(w,w.document.querySelector("#formRevisao")); await espera(300);
  const f1=db(w).revisoes.find(r=>r.id==="f1");
  ok("4. dar nome a uma revisão feita antiga não a desmarca nem apaga as questões",
     f1.feita && f1.questoes===10 && f1.acertos===8 && f1.rotulo==="Revisão da lei", f1);

  /* ---- 5. importar backup antigo ---- */
  const velho={registros:[reg("r1",dia(-3),["LAI"],{dificuldade:5})],revisoes:[],erros:[]};
  w=abrir(base()); await espera(300);
  const inp=w.document.querySelector("#arquivo");
  Object.defineProperty(inp,"files",{value:[new w.Blob([JSON.stringify(velho)],{type:"application/json"})]});
  inp.dispatchEvent(new w.Event("change")); await espera(400);
  ok("5a. backup antigo: fichas e agenda nascem na hora da importação",
     db(w).conteudos.length===1 && db(w).revisoes.length===1, [db(w).conteudos.length, db(w).revisoes.length]);
  w=abrir(db(w)); await espera(400);
  ok("5b. e depois do F5 o difícil continua difícil", db(w).registros[0].dificuldade===3, db(w).registros[0].dificuldade);

  /* ---- 6. conteúdo excluído não volta ---- */
  const s6=base(); s6.conteudos=[ficha("LAI")]; s6.registros=[reg("r1",dia(-5),["LAI"])];
  w=abrir(s6,"conteudos"); await espera(400);
  click(w,w.document.querySelector('[data-acao="excluir-conteudo"]')); await espera(300);
  click(w,w.document.querySelector('[data-aba="registros"]')); await espera(200);
  click(w,w.document.querySelector('tr[data-id="r1"] td')); await espera(300);
  w.document.querySelector('#formRegistro [name="anotacoes"]').value="corrigi a descrição";
  submit(w,w.document.querySelector("#formRegistro")); await espera(400);
  ok("6. corrigir a descrição de uma sessão antiga não traz de volta o conteúdo excluído",
     !db(w).conteudos.length && !db(w).revisoes.length && db(w).registros[0].assuntos[0]==="LAI" &&
     db(w).registros[0].anotacoes==="corrigi a descrição", [db(w).conteudos, db(w).revisoes.length]);

  /* ---- 7. Progresso com bateria avulsa ---- */
  const s7=base(); s7.conteudos=[ficha("LAI")]; s7.registros=[reg("r1",dia(-1),["LAI"],{questoes:10,acertos:10})];
  s7.lancamentos=[{id:"l1",registroId:"r1",data:dia(-1),questoes:10,acertos:0,criadoEm:1}];
  w=abrir(s7,"painel"); await espera(400);
  click(w,w.document.querySelector('.dia-cab [data-acao="sel-dia"]')); await espera(200);
  const barra=[...w.document.querySelectorAll("#view svg text")].map(t=>t.textContent).filter(t=>/%/.test(t));
  click(w,w.document.querySelector(`.cal-dia[data-dia="${dia(-1)}"]`)); await espera(200);
  const doDia=[...w.document.querySelectorAll(".dia-numeros b")].map(b=>b.textContent);
  ok("7. o Progresso conta a bateria avulsa (50%, como a aba Questões) — nas barras e no dia",
     barra[0]==="50%" && doDia[1]==="20" && doDia[2]==="50%", [barra, doDia]);

  /* ---- 8. bateria de sessão antiga ---- */
  const s8=base(); s8.conteudos=[ficha("LAI")];
  s8.registros=Array.from({length:62},(_,i)=>reg("r"+i,dia(-i-1),["LAI"],{criadoEm:i}));
  s8.lancamentos=[{id:"l1",registroId:"r61",data:dia(-1),questoes:5,acertos:3,criadoEm:1}];
  w=abrir(s8,"questoes"); await espera(400);
  click(w,w.document.querySelector('[data-acao="editar-lancamento"][data-id="l1"]')); await espera(300);
  const sel=w.document.querySelector('#formLancamento [name="registroId"]');
  ok("8. a bateria de uma sessão antiga abre com a sessão dela escolhida", sel && sel.value==="r61", sel && sel.value);

  /* ---- 9. card misto ---- */
  const s9=base(); s9.conteudos=[ficha("LAI"),ficha("Licitações")];
  s9.registros=[reg("r1",dia(-2),["LAI","Licitações"])];
  s9.revisoes=[{id:"v1",registroId:"r1",data:dia(2),retomada:true,assuntos:["LAI","Licitações"],feita:false,manual:false}];
  w=abrir(s9,"conteudos"); await espera(400);
  click(w,w.document.querySelector('[data-acao="excluir-conteudo"][data-cont="LAI"]')); await espera(300);
  const v9=db(w).revisoes.find(r=>r.id==="v1");
  ok("9. excluir LAI tira o nome dele do card 'LAI · Licitações'", v9 && v9.assuntos.join()==="Licitações", v9);

  /* ---- 10. excluir disciplina ---- */
  const s10=base(); s10.disciplinas=["Legislação","Português"];
  s10.conteudos=[ficha("LAI"), {id:"cp",disciplina:"Português",nome:"Crase",fase:"andamento"}];
  s10.registros=[reg("r1",dia(-2),["LAI"])];
  w=abrir(s10,"conteudos"); await espera(400);
  ok("10a. só a disciplina sem uso tem o ✕ excluir",
     !!w.document.querySelector('[data-acao="excluir-disciplina"][data-disc="Português"]') &&
     !w.document.querySelector('[data-acao="excluir-disciplina"][data-disc="Legislação"]'));
  click(w,w.document.querySelector('[data-acao="excluir-disciplina"][data-disc="Português"]')); await espera(300);
  ok("10b. excluída, ela e os conteúdos dela saem do cadastro",
     !db(w).disciplinas.includes("Português") && !db(w).conteudos.some(c=>c.disciplina==="Português"), db(w).disciplinas);

  /* ---- 11. sequência com bateria ---- */
  const s11=base(); s11.conteudos=[ficha("LAI")];
  s11.registros=[reg("r1",dia(-2),["LAI"])];
  s11.lancamentos=[{id:"l1",registroId:"r1",data:dia(-1),questoes:5,acertos:3,criadoEm:1},
                   {id:"l2",registroId:"r1",data:hoje,questoes:5,acertos:3,criadoEm:2}];
  w=abrir(s11,"hoje"); await espera(400);
  const seq=[...w.document.querySelectorAll(".tile")].find(t=>/Sequência/.test(t.textContent));
  ok("11. dias só com bateria de questões contam na sequência", /3 dias/.test(seq.textContent), seq.textContent);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nvarredura de 24/09: defeitos corrigidos");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
