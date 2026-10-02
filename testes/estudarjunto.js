/* ESTUDAR JUNTO (28/09). Dois conteúdos da mesma disciplina com card para hoje,
   estudados numa sessão só: a sessão cumpre o card de CADA um, o tempo conta
   uma vez, e a caixa "Estudar junto" do formulário põe o outro conteúdo na
   sessão. Antes só o primeiro card era cumprido e o outro ficava em aberto. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,ass,d)=>({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",plano:"individual",criadoEm:Number(id.slice(1))});
const volta=(id,reg,ass)=>({id,registroId:reg,data:hoje,retomada:true,feita:false,assuntos:[ass]});
function abrir(registros, aba){
  const seed={versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],grupos:[],
    conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"andamento",criadoEm:1},
               {id:"cB",disciplina:"Legislação",nome:"B",fase:"andamento",criadoEm:2}],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    registros, revisoes:[volta("vA","r1","A"),volta("vB","r2","B")], erros:[], cronometro:null};
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
      w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const rev=(w,id)=>db(w).revisoes.find(r=>r.id===id);
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const enviar=(w,f)=>f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
/** voltas ABERTAS por conteúdo */
function abertas(w){
  const d=db(w), por={};
  d.revisoes.filter(x=>!x.feita && x.retomada).forEach(x=>{
    const reg=d.registros.find(r=>r.id===x.registroId);
    ((x.assuntos&&x.assuntos.length)?x.assuntos:(reg?reg.assuntos:[])).forEach(a=>{ por[a]=(por[a]||0)+1; });
  });
  return por;
}

(async()=>{try{
  const base=()=>[sess("r1",["A"],dia(-3)), sess("r2",["B"],dia(-3))];

  /* ---- 1. sessão com A + B (registrada com os dois conteúdos) ---- */
  let w=abrir(base().concat([sess("r3",["A","B"],dia(-1))]),"registros"); await espera(500);
  let doc=w.document;
  click(w,doc.querySelector('[data-acao="editar-registro"][data-id="r3"]')); await espera(300);
  let f=doc.querySelector("#formRegistro");
  f.querySelector('[name="data"]').value=hoje; f.querySelector('[name="minutos"]').value="90";
  enviar(w,f); await espera(500);
  ok("sessão A+B cumpre o card de A", rev(w,"vA").feita && rev(w,"vA").sessaoId==="r3", rev(w,"vA"));
  ok("e TAMBÉM o card de B", rev(w,"vB").feita && rev(w,"vB").sessaoId==="r3", rev(w,"vB"));
  let r3=db(w).registros.find(r=>r.id==="r3");
  ok("a sessão guarda os dois vínculos", r3.revisaoId==="vA" && JSON.stringify(r3.juntasIds)==='["vB"]', [r3.revisaoId,r3.juntasIds]);
  ok("o tempo continua numa sessão só (90 min no dia)",
     db(w).registros.filter(r=>r.data===hoje).reduce((s,r)=>s+r.minutos,0)===90);
  ok("A e B seguem com uma volta aberta cada (a próxima)", JSON.stringify(abertas(w))==='{"A":1,"B":1}', abertas(w));

  /* ---- 2. desmarcar o card de B: só ele volta a ficar em aberto ---- */
  const antes=db(w);
  const dom2=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(antes));
      x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
      x.__confirmarNativo=true; x.confirm=()=>true; }});
  w=dom2.window; doc=w.document; await espera(500);
  ok("o card de B diz que foi feito junto com A", /junto com A/.test(doc.getElementById("view").textContent),
     doc.getElementById("view").textContent.slice(0,400));
  click(w,doc.querySelector('#view [data-acao="reabrir"][data-id="vB"]')); await espera(400);
  ok("desmarcado, o card de B fica em aberto", !rev(w,"vB").feita && !rev(w,"vB").sessaoId, rev(w,"vB"));
  r3=db(w).registros.find(r=>r.id==="r3");
  ok("e a sessão continua cumprindo A", rev(w,"vA").feita && r3.revisaoId==="vA" && !r3.juntasIds, [r3.revisaoId,r3.juntasIds]);

  /* ---- 3. excluir a sessão: os dois voltam ---- */
  w=abrir(base().concat([sess("r3",["A","B"],dia(-1))]),"registros"); await espera(500); doc=w.document;
  click(w,doc.querySelector('[data-acao="editar-registro"][data-id="r3"]')); await espera(300);
  f=doc.querySelector("#formRegistro"); f.querySelector('[name="data"]').value=hoje; enviar(w,f); await espera(500);
  click(w,doc.querySelector('[data-acao="editar-registro"][data-id="r3"]')); await espera(300);
  ok("a sessão mostra o que cumpriu junto", /Cumpriu também/.test(doc.getElementById("modalCorpo").textContent));
  const bx=doc.querySelector('[data-acao="excluir-registro"][data-id="r3"]');
  click(w,bx); await espera(500);
  ok("sessão excluída: A e B voltam a ficar em aberto",
     !rev(w,"vA").feita && !rev(w,"vB").feita && !rev(w,"vA").sessaoId && !rev(w,"vB").sessaoId, [rev(w,"vA"),rev(w,"vB")]);

  /* ---- 4. pelo ✓ do card de A, com a caixa "Estudar junto" ---- */
  w=abrir(base(),"revisoes"); await espera(500); doc=w.document;
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  const caixa=f && f.querySelector('input[name="juntar"][value="vB"]');
  ok("o formulário oferece estudar B junto", !!caixa && /Estudar junto/.test(f.textContent));
  ok("e não oferece o próprio A", !f.querySelector('input[name="juntar"][value="vA"]'));
  ok("a caixa vem desmarcada", caixa && !caixa.checked);
  caixa.checked=true; caixa.dispatchEvent(new w.Event("change",{bubbles:true}));
  const tags=()=>[...f.querySelectorAll("#listaAssuntosForm [data-assunto]")].map(t=>t.dataset.assunto).join("+");
  ok("marcar põe B na sessão", tags()==="A+B", tags());
  caixa.checked=false; caixa.dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("desmarcar tira B (A fica)", tags()==="A", tags());
  caixa.checked=true; caixa.dispatchEvent(new w.Event("change",{bubbles:true}));
  f.querySelector('[name="minutos"]').value="80"; f.querySelector('[name="dificuldade"]').value="2";
  enviar(w,f); await espera(600);
  const hojeRegs=db(w).registros.filter(r=>r.data===hoje);
  ok("nasce UMA sessão com A e B", hojeRegs.length===1 && hojeRegs[0].assuntos.join("+")==="A+B", hojeRegs);
  ok("que cumpre os dois cards", rev(w,"vA").sessaoId===hojeRegs[0].id && rev(w,"vB").sessaoId===hojeRegs[0].id,
     [rev(w,"vA"),rev(w,"vB")]);
  ok("com 80 min contados uma vez", hojeRegs.reduce((s,r)=>s+r.minutos,0)===80);
  ok("e a próxima volta de cada um nasce", JSON.stringify(abertas(w))==='{"A":1,"B":1}', abertas(w));

  /* ---- 5. sem outro card na disciplina, a caixa não aparece ---- */
  w=abrir([sess("r1",["A"],dia(-3))],"revisoes"); await espera(500); doc=w.document;
  const s5=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
  s5.revisoes=s5.revisoes.filter(r=>r.id!=="vB");
  const dom5=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s5));
      x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
      x.__confirmarNativo=true; x.confirm=()=>true; }});
  w=dom5.window; doc=w.document; await espera(500);
  const bt=doc.querySelector('#view [data-acao="concluir"][data-id="vA"]');
  if (bt){ click(w,bt); await espera(400); }
  ok("só com o card de A, nada de \"Estudar junto\"", !!bt && !doc.querySelector('input[name="juntar"]'));

  /* ---- 6. CARD DUPLICADO (30/09): dois cards do MESMO conteúdo A, o de ontem
       (que ninguém conseguiu marcar) e o de hoje. Um deles vira a sessão; o
       outro tem de aparecer em "Estudar junto" e ser cumprido junto. ---- */
  const seed6 = () => {
    const s = { versao:1, tema:"claro", dataProva:"", objetivo:"livre", metaDiariaMin:120,
      disciplinas:["Legislação"], lancamentos:[], grupos:[],
      conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"andamento",criadoEm:1},
                 {id:"cB",disciplina:"Legislação",nome:"B",fase:"andamento",criadoEm:2}],
      conteudosMigrados:true, fasesMigradas:true, dificuldadesMigradas:true,
      registros:[sess("r1",["A"],dia(-5)), sess("r1b",["A"],dia(-4)), sess("r2",["B"],dia(-3))],
      revisoes:[ Object.assign(volta("vA1","r1","A"), {data:dia(-1)}),
                 volta("vA2","r1b","A"), volta("vB","r2","B") ],
      erros:[], cronometro:null };
    return s;
  };
  const abrirSeed = (seed, aba) => new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
      x.__confirmarNativo=true; x.confirm=()=>true; }}).window;

  w=abrirSeed(seed6(),"revisoes"); await espera(500); doc=w.document;
  ok("os dois cards de A continuam abertos", !!rev(w,"vA1") && !!rev(w,"vA2") &&
     !rev(w,"vA1").feita && !rev(w,"vA2").feita, db(w).revisoes.map(r=>[r.id,r.data,r.feita]));
  // o ✓ está no card de HOJE; o de ontem é justamente o que não deu para marcar
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA2"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  const dupla=f && f.querySelector('input[name="juntar"][value="vA1"]');
  ok("a caixa oferece o OUTRO card de A", !!dupla, f && f.textContent.slice(0,300));
  ok("dizendo que é o mesmo conteúdo, com a data", !!dupla && /o mesmo conteúdo, card atrasado de/.test(f.textContent));
  ok("e ela vem DESMARCADA (você escolhe)", !!dupla && !dupla.checked);
  ok("o card de B (outro conteúdo) continua na lista", !!f.querySelector('input[name="juntar"][value="vB"]'));
  dupla.checked=true; dupla.dispatchEvent(new w.Event("change",{bubbles:true}));
  const tags6=[...f.querySelectorAll("#listaAssuntosForm [data-assunto]")].map(t=>t.dataset.assunto).join("+");
  ok("marcar não duplica o conteúdo na sessão", tags6==="A", tags6);
  f.querySelector('[name="minutos"]').value="45"; f.querySelector('[name="dificuldade"]').value="2";
  enviar(w,f); await espera(600);
  const reg6=db(w).registros.filter(r=>r.data===hoje);
  ok("nasce UMA sessão de A", reg6.length===1 && reg6[0].assuntos.join("+")==="A", reg6);
  ok("que cumpre o card de hoje", rev(w,"vA2").feita && rev(w,"vA2").sessaoId===reg6[0].id, rev(w,"vA2"));
  ok("e TAMBÉM o card atrasado, igual a ele", rev(w,"vA1").feita && rev(w,"vA1").sessaoId===reg6[0].id, rev(w,"vA1"));
  ok("com 45 min contados uma vez", reg6.reduce((s,r)=>s+r.minutos,0)===45);
  ok("o card de B, não marcado, fica em aberto", !rev(w,"vB").feita && !rev(w,"vB").sessaoId, rev(w,"vB"));

  /* ---- 7. sem marcar a caixa, o card duplicado continua em aberto ---- */
  w=abrirSeed(seed6(),"revisoes"); await espera(500); doc=w.document;
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA2"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  f.querySelector('[name="minutos"]').value="30"; f.querySelector('[name="dificuldade"]').value="2";
  enviar(w,f); await espera(600);
  ok("caixa desmarcada: só o card de hoje se cumpre",
     rev(w,"vA2").feita && !rev(w,"vA1").feita, [rev(w,"vA1"),rev(w,"vA2")]);

  /* ---- 8. A JUNÇÃO É SÓ DA SESSÃO (02/10): estudados juntos hoje, A e B
       ganham cada um a sua próxima volta — não um card "A · B". ---- */
  w=abrir(base(),"revisoes"); await espera(500); doc=w.document;
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  const cx8=f.querySelector('input[name="juntar"][value="vB"]');
  cx8.checked=true; cx8.dispatchEvent(new w.Event("change",{bubbles:true}));
  f.querySelector('[name="minutos"]').value="60"; f.querySelector('[name="dificuldade"]').value="2";
  enviar(w,f); await espera(600);
  const prox8=db(w).revisoes.filter(r=>!r.feita && r.retomada).map(r=>(r.assuntos||[]).join("+")).sort();
  ok("a próxima volta vem separada: um card de A e outro de B", JSON.stringify(prox8)==='["A","B"]', prox8);

  /* ---- 9. a sessão conjunta que FECHA os dois: a escada de cada um anda
       sozinha, sem se juntar num card "A · B" ---- */
  const seed9 = { versao:1, tema:"claro", dataProva:"", objetivo:"livre", metaDiariaMin:120,
    disciplinas:["Legislação"], lancamentos:[], grupos:[],
    conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"concluido",concluidoEm:hoje,criadoEm:1},
               {id:"cB",disciplina:"Legislação",nome:"B",fase:"concluido",concluidoEm:hoje,criadoEm:2}],
    conteudosMigrados:true, fasesMigradas:true, dificuldadesMigradas:true,
    registros: base().concat([Object.assign(sess("r3",["A","B"],hoje), {revisaoId:"vA", juntasIds:["vB"]})]),
    revisoes:[ Object.assign(volta("vA","r1","A"),{feita:true,feitaEm:hoje,sessaoId:"r3"}),
               Object.assign(volta("vB","r2","B"),{feita:true,feitaEm:hoje,sessaoId:"r3"}) ],
    erros:[], cronometro:null };
  w=abrirSeed(seed9,"revisoes"); await espera(500);
  const escada9=db(w).revisoes.filter(r=>!r.feita && !r.retomada && r.registroId==="r3");
  ok("a escada nasce", escada9.length>0, db(w).revisoes);
  ok("e cada degrau é um card de um conteúdo só", escada9.every(r=>(r.assuntos||[]).length===1),
     escada9.map(r=>[r.data,r.assuntos]));

  /* ---- 10. cada um no SEU ritmo: A fácil e B difícil, estudados juntos pelo
       card de A. A volta de B segue a dificuldade de B (não a da sessão, que é
       a de A), e B continua difícil. ---- */
  const base10=()=>[Object.assign(sess("r1",["A"],dia(-3)),{dificuldade:1}), Object.assign(sess("r2",["B"],dia(-3)),{dificuldade:3})];
  // a régua: a data que cada um ganharia estudado SOZINHO
  const sozinho=async(id,nome,dif)=>{ const x=abrir(base10(),"revisoes"); await espera(500);
    click(x,x.document.querySelector('#view [data-acao="concluir"][data-id="'+id+'"]')); await espera(400);
    const g=x.document.querySelector("#formRegistro");
    g.querySelector('[name="minutos"]').value="60"; g.querySelector('[name="dificuldade"]').value=String(dif);
    enviar(x,g); await espera(600);
    const v=db(x).revisoes.find(r=>!r.feita && r.retomada && (r.assuntos||[]).join("+")===nome);
    return v && v.data; };
  const sozA=await sozinho("vA","A",1), sozB=await sozinho("vB","B",3);
  w=abrir(base10(),"revisoes"); await espera(500); doc=w.document;
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  const cx10=f.querySelector('input[name="juntar"][value="vB"]');
  cx10.checked=true; cx10.dispatchEvent(new w.Event("change",{bubbles:true}));
  f.querySelector('[name="minutos"]').value="60"; f.querySelector('[name="dificuldade"]').value="1";
  enviar(w,f); await espera(600);
  const volta10=n=>db(w).revisoes.find(r=>!r.feita && r.retomada && (r.assuntos||[]).join("+")===n);
  ok("sozinhos, A e B voltariam em dias diferentes", sozA && sozB && sozA!==sozB, [sozA,sozB]);
  ok("a volta de A vem no dia em que viria sozinha", volta10("A") && volta10("A").data===sozA, [volta10("A"),sozA]);
  ok("a volta de B também (ritmo de B, não o da sessão)", volta10("B") && volta10("B").data===sozB, [volta10("B"),sozB]);
  const fB=db(w).conteudos.find(c=>c.nome==="B");
  ok("e B continua difícil", fB.dificuldade===3, fB);

  /* ---- 11. concluídos: revisar B junto com A (fácil) não refaz a escada de B
       com a dificuldade de A ---- */
  const seed11 = { versao:1, tema:"claro", dataProva:"", objetivo:"livre", metaDiariaMin:120, revisarAte:dia(400),
    disciplinas:["Legislação"], lancamentos:[], grupos:[],
    conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"concluido",concluidoEm:dia(-3),criadoEm:1},
               {id:"cB",disciplina:"Legislação",nome:"B",fase:"concluido",concluidoEm:dia(-3),criadoEm:2}],
    conteudosMigrados:true, fasesMigradas:true, dificuldadesMigradas:true,
    registros: base10().map(r=>Object.assign(r,{data:dia(-3)})),
    revisoes:[ {id:"vA",registroId:"r1",assuntos:["A"],data:hoje,degrau:1,passo:3,feita:false,manual:false},
               {id:"vB",registroId:"r2",assuntos:["B"],data:hoje,degrau:1,passo:3,feita:false,manual:false} ],
    erros:[], cronometro:null };
  w=abrirSeed(seed11,"revisoes"); await espera(500); doc=w.document;
  const passosB=()=>db(w).revisoes.filter(r=>r.id!=="vB" && !r.feita && (r.assuntos||[]).join()==="B").sort((a,b)=>a.data.localeCompare(b.data)).map(r=>r.passo);
  const antesB=JSON.stringify(passosB());
  click(w,doc.querySelector('#view [data-acao="concluir"][data-id="vA"]')); await espera(400);
  f=doc.querySelector("#formRegistro");
  const cx11=f.querySelector('input[name="juntar"][value="vB"]');
  cx11.checked=true; cx11.dispatchEvent(new w.Event("change",{bubbles:true}));
  f.querySelector('[name="minutos"]').value="30"; const sd=f.querySelector('[name="dificuldade"]'); if (sd) sd.value="1";
  enviar(w,f); await espera(600);
  ok("revisados juntos: os dois cards ficam cumpridos", rev(w,"vA").feita && rev(w,"vB").feita, [rev(w,"vA"),rev(w,"vB")]);
  ok("a escada de B mantém os passos dela", JSON.stringify(passosB())===antesB, [antesB, passosB()]);
  ok("e B continua difícil", db(w).conteudos.find(c=>c.nome==="B").dificuldade===3, db(w).conteudos);

  /* ---- 12 e 13. TIRAR DE "ESTUDAR JUNTO" (02/10): na sessão de HOJE desfaz o
       check do card; em sessão de ontem para trás, o card continua marcado e só
       o nome sai da sessão. ---- */
  const juntoEm=async(d)=>{
    const seed={ versao:1, tema:"claro", dataProva:"", objetivo:"livre", metaDiariaMin:120,
      disciplinas:["Legislação"], lancamentos:[], grupos:[],
      conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"andamento",criadoEm:1},
                 {id:"cB",disciplina:"Legislação",nome:"B",fase:"andamento",criadoEm:2}],
      conteudosMigrados:true, fasesMigradas:true, dificuldadesMigradas:true,
      registros: base().concat([Object.assign(sess("r3",["A","B"],d),{revisaoId:"vA",juntasIds:["vB"]})]),
      revisoes:[ Object.assign(volta("vA","r1","A"),{data:d,feita:true,feitaEm:d,sessaoId:"r3"}),
                 Object.assign(volta("vB","r2","B"),{data:d,feita:true,feitaEm:d,sessaoId:"r3"}) ],
      erros:[], cronometro:null };
    const x=abrirSeed(seed,"registros"); await espera(500);
    click(x,x.document.querySelector('[data-acao="editar-registro"][data-id="r3"]')); await espera(300);
    const g=x.document.querySelector("#formRegistro");
    const c=g.querySelector('input[name="juntar"][value="vB"]');
    if (c){ c.checked=false; c.dispatchEvent(new x.Event("change",{bubbles:true})); }
    enviar(x,g); await espera(600);
    return { w:x, achou:!!c, voltasB:db(x).revisoes.filter(r=>!r.feita && r.retomada && (r.assuntos||[]).includes("B")).map(r=>r.data) };
  };
  let j=await juntoEm(hoje); w=j.w;
  let r3j=db(w).registros.find(r=>r.id==="r3");
  ok("hoje: a caixa de B aparece marcada na edição", j.achou);
  ok("hoje: tirar B desfaz o check do card de B", !rev(w,"vB").feita && !rev(w,"vB").sessaoId, rev(w,"vB"));
  ok("hoje: o card de A continua cumprido", rev(w,"vA").feita && r3j.revisaoId==="vA", rev(w,"vA"));
  ok("hoje: B sai da sessão", r3j.assuntos.join("+")==="A", r3j.assuntos);

  j=await juntoEm(dia(-1)); w=j.w;
  r3j=db(w).registros.find(r=>r.id==="r3");
  ok("ontem: a caixa de B aparece marcada na edição", j.achou);
  ok("ontem: B sai da sessão (só o nome)", r3j.assuntos.join("+")==="A", r3j.assuntos);
  ok("ontem: o card de B continua marcado", rev(w,"vB").feita && rev(w,"vB").sessaoId==="r3" && rev(w,"vB").feitaEm===dia(-1), rev(w,"vB"));
  ok("ontem: e a sessão continua cumprindo os dois", JSON.stringify(r3j.juntasIds)==='["vB"]' && rev(w,"vA").feita, [r3j.revisaoId,r3j.juntasIds]);
  ok("ontem: B não ganha volta extra", j.voltasB.length<=1, j.voltasB);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nestudar junto: a sessão cumpre o card de cada conteúdo");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
