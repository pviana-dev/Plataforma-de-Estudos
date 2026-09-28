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

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nestudar junto: a sessão cumpre o card de cada conteúdo");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
