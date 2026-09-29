/* LIGAR NA EDIÇÃO (29/09). A sessão de hoje foi registrada e o card de hoje
   ficou em aberto: editando a sessão, dá para dizer que ela cumpriu o card.
   Só sessão de hoje com card de hoje, da mesma disciplina. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,ass,d,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",plano:"individual",criadoEm:Number(id.slice(1))},extra||{});
const volta=(id,reg,ass,d)=>({id,registroId:reg,data:d||hoje,retomada:true,feita:false,assuntos:[ass]});
function abrir(registros, revisoes){
  const seed={versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas:["Legislação","Português"],lancamentos:[],grupos:[],
    conteudos:[{id:"cA",disciplina:"Legislação",nome:"A",fase:"andamento",criadoEm:1},
               {id:"cB",disciplina:"Legislação",nome:"B",fase:"andamento",criadoEm:2},
               {id:"cP",disciplina:"Português",nome:"P",fase:"andamento",criadoEm:3}],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
    registros, revisoes, erros:[], cronometro:null};
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
      w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const rev=(w,id)=>db(w).revisoes.find(r=>r.id===id);
const reg=(w,id)=>db(w).registros.find(r=>r.id===id);
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const enviar=(w,f)=>f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
async function editar(w,id){ click(w,w.document.querySelector('[data-acao="editar-registro"][data-id="'+id+'"]')); await espera(300);
  return w.document.querySelector("#formRegistro"); }
const opcoes=f=>{ const s=f && f.querySelector("#revisaoAlvo"); return s ? [...s.options].map(o=>o.value).filter(Boolean) : null; };
async function escolher(w,f,id){ const s=f.querySelector("#revisaoAlvo"); s.value=id;
  s.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300); return w.document.querySelector("#formRegistro"); }

(async()=>{try{
  const base=()=>[sess("r1",["A"],dia(-3)), sess("r2",["B"],dia(-3)), sess("r4",["P"],dia(-3),{disciplina:"Português"})];

  /* ---- 1. sessão de A hoje, card de B hoje em aberto: liga na edição ---- */
  let w=abrir(base().concat([sess("r3",["A"],hoje,{plano:"sem"})]),
          [volta("vA","r1","A"), volta("vB","r2","B"), volta("vF","r2","B",dia(2)), volta("vP","r4","P")]);
  await espera(500);
  let f=await editar(w,"r3");
  ok("a edição de uma sessão de hoje oferece os cards de hoje", !!opcoes(f), f && f.textContent.slice(0,300));
  ok("só da mesma disciplina e de hoje (vA e vB; nem o de amanhã, nem o de Português)",
     JSON.stringify((opcoes(f)||[]).sort())==='["vA","vB"]', opcoes(f));
  f=await escolher(w,f,"vB");
  ok("escolhido, avisa que o conteúdo do card entra", /entra na sessão: B/.test(f.textContent));
  enviar(w,f); await espera(500);
  ok("salvo, o card de B fica cumprido pela sessão", rev(w,"vB").feita && rev(w,"vB").sessaoId==="r3", rev(w,"vB"));
  ok("e a sessão aponta para ele e fala de B", reg(w,"r3").revisaoId==="vB" && reg(w,"r3").assuntos.includes("B"), reg(w,"r3"));
  ok("o tempo continua o mesmo", reg(w,"r3").minutos===60);

  /* ---- 2. "sem cronograma" com o card do próprio conteúdo ---- */
  w=abrir(base().concat([sess("r3",["A"],hoje,{plano:"sem"})]), [volta("vA","r1","A")]);
  await espera(500);
  ok("sessão sem cronograma não cumpre o card sozinha", !rev(w,"vA").feita);
  f=await editar(w,"r3"); f=await escolher(w,f,"vA"); enviar(w,f); await espera(500);
  ok("editando, liga ao card de A", rev(w,"vA").feita && rev(w,"vA").sessaoId==="r3" && reg(w,"r3").revisaoId==="vA",
     [rev(w,"vA"),reg(w,"r3")]);

  /* ---- 3. escolher "nenhum" não liga nada ---- */
  w=abrir(base().concat([sess("r3",["A"],hoje,{plano:"sem"})]), [volta("vA","r1","A")]);
  await espera(500);
  f=await editar(w,"r3"); enviar(w,f); await espera(500);
  ok("sem escolher, o card continua em aberto", !rev(w,"vA").feita && !reg(w,"r3").revisaoId);

  /* ---- 4. sessão de ontem: nada de ligar ---- */
  w=abrir(base().concat([sess("r3",["A"],dia(-1),{plano:"sem"})]), [volta("vA","r1","A"), volta("vB","r2","B")]);
  await espera(500);
  f=await editar(w,"r3");
  ok("sessão de outro dia não oferece card", !f.querySelector("#revisaoAlvo"));

  /* ---- 5. a data mudou para ontem no formulário: recusa ---- */
  w=abrir(base().concat([sess("r3",["A"],hoje,{plano:"sem"})]), [volta("vB","r2","B")]);
  await espera(500);
  f=await editar(w,"r3"); f=await escolher(w,f,"vB");
  f.querySelector('[name="data"]').value=dia(-1); enviar(w,f); await espera(400);
  ok("trocar a data para outro dia recusa o vínculo", !rev(w,"vB").feita && /Só uma sessão de hoje/.test(w.document.getElementById("erroForm").textContent),
     w.document.getElementById("erroForm").textContent);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nligar na edição: sessão de hoje cumpre card de hoje");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
