/* PEDIDOS DE 26/09 (depois da revisão de UX):
   1. a Agenda não tem mais o "Como o cronograma é montado?" no pé;
   2. com as revisões até a prova personalizadas, "Todas as agendadas" mostra as
      personalizadas ativas e as outras pendentes do conteúdo bloqueadas (apagadas,
      sem ✓ nem editar); "Só as 2 próximas" mostra só as personalizadas;
   3. a dificuldade de um conteúdo se muda na aba Disciplinas e vale para o sistema
      todo (é a da sessão mais recente; sem sessão, fica na ficha). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const ficha=(nome,extra)=>Object.assign({id:"c"+nome,disciplina:"Legislação",nome,fase:"andamento",concluidoEm:null},extra||{});
const reg=(id,d,ass,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,
  acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:id.charCodeAt(1)},extra||{});
const base=()=>({versao:1,tema:"claro",objetivo:"concurso",dataProva:dia(20),revisarAte:dia(60),metaDiariaMin:120,disciplinas:["Legislação"],
 grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
 conteudos:[],registros:[],revisoes:[],erros:[],cronometro:null});
function abrir(seed, aba, tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba,gravadoEm:hoje},tela||{})));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const muda=(w,el,v)=>{ el.value=v; el.dispatchEvent(new w.Event("change",{bubbles:true})); };

(async()=>{try{
  /* ---- 1 e 2 ---- */
  const s=base();
  s.conteudos=[ficha("LAI",{fase:"concluido",concluidoEm:dia(-3),revisoesProva:dia(20)})];
  s.registros=[reg("r1",dia(-3),["LAI"])];
  s.revisoes=[
    {id:"p1",registroId:"r1",assuntos:["LAI"],data:dia(2),feita:false,manual:true,planoProva:true,degrau:0},
    {id:"p2",registroId:"r1",assuntos:["LAI"],data:dia(10),feita:false,manual:true,planoProva:true,degrau:0},
    {id:"a1",registroId:"r1",assuntos:["LAI"],data:dia(22),feita:false,manual:false,degrau:1,passo:3},
    {id:"a2",registroId:"r1",assuntos:["LAI"],data:dia(30),feita:false,manual:false,degrau:2,passo:8}];
  let w=abrir(s,"revisoes",{agendaCompleta:true}); await espera(450);
  ok("1. a Agenda não tem mais 'Como o cronograma é montado?'", !/Como o cronograma é montado/.test(w.document.querySelector("#view").textContent));
  const item=id=>w.document.getElementById("rev-"+id);
  ok("2. em Todas, as personalizadas ficam ativas", item("p1") && !item("p1").classList.contains("bloqueada") &&
     !item("p1").querySelector("button.check").disabled);
  ok("2. e as outras do conteúdo aparecem bloqueadas, sem ✓ nem editar",
     ["a1","a2"].every(id=>item(id) && item(id).classList.contains("bloqueada") && item(id).querySelector("button.check").disabled &&
       !item(id).querySelector('[data-acao="editar-revisao"]')), ["a1","a2"].map(id=>item(id)&&item(id).className));
  ok("2. com o aviso de até quando", /bloqueada até/.test(item("a1").textContent), item("a1").textContent);
  w=abrir(s,"revisoes",{agendaCompleta:false}); await espera(450);
  ok("2. em Só as 2 próximas, só as personalizadas", !!w.document.getElementById("rev-p1") && !!w.document.getElementById("rev-p2") &&
     !w.document.getElementById("rev-a1"));

  /* ---- 3. conteúdo com sessão ---- */
  const s3=base(); s3.objetivo="livre"; s3.dataProva="";
  s3.conteudos=[ficha("LAI"),ficha("LGPD")];
  s3.registros=[reg("r1",dia(-5),["LAI"],{dificuldade:1}),reg("r2",dia(-1),["LAI"],{dificuldade:1})];
  w=abrir(s3,"conteudos"); await espera(450);
  const volta=()=>db(w).revisoes.find(r=>r.retomada && !r.feita && (r.assuntos||[]).includes("LAI"));
  const antes=volta();
  const sel=w.document.querySelector('.sel-dif-cont[data-cont="LAI"]');
  ok("3. a linha do conteúdo mostra a dificuldade atual (Fácil)", sel && sel.value==="1", sel && sel.value);
  muda(w,sel,"3"); await espera(350);
  ok("3. mudar para Difícil grava na sessão mais recente", db(w).registros.find(r=>r.id==="r2").dificuldade===3 &&
     db(w).registros.find(r=>r.id==="r1").dificuldade===1, db(w).registros.map(r=>[r.id,r.dificuldade]));
  ok("3. e o card de continuar anda com a cadência nova (fica mais perto)", volta() && antes && volta().data<antes.data, [antes&&antes.data, volta()&&volta().data]);
  ok("3. e a tela continua mostrando Difícil", w.document.querySelector('.sel-dif-cont[data-cont="LAI"]').value==="3");
  // o formulário herda a nova
  w.document.querySelector('[data-aba="registros"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  w.document.querySelector('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  const f=w.document.querySelector("#formRegistro");
  muda(w,f.querySelector("select.sel-disciplina"),"Legislação"); await espera(250);
  const cs=w.document.querySelector("#campoAssunto"); cs.value="LAI";
  w.document.querySelector('[data-acao="add-assunto"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(200);
  ok("3. uma sessão nova de LAI já vem com Difícil", w.document.querySelector('#formRegistro [name="dificuldade"]').value==="3",
     w.document.querySelector('#formRegistro [name="dificuldade"]').value);

  /* ---- 3. conteúdo sem sessão ---- */
  w=abrir(s3,"conteudos"); await espera(450);
  const sel2=w.document.querySelector('.sel-dif-cont[data-cont="LGPD"]');
  ok("3. sem sessão, a caixa começa vazia ('Dificuldade')", sel2 && sel2.value==="", sel2 && sel2.value);
  muda(w,sel2,"2"); await espera(300);
  ok("3. e a escolha fica na ficha", db(w).conteudos.find(c=>c.nome==="LGPD").dificuldade===2, db(w).conteudos);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndificuldade na aba Disciplinas e revisões bloqueadas até a prova funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
