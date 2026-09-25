/* Excluir um conteúdo tira a ficha e o que ele tem na AGENDA. O estudo fica:
   as sessões continuam registradas, com as horas e as questões. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,ass,extra)=>Object.assign({id,data:dia(-2),disciplina:disc,assuntos:ass,assunto:ass[0],
  minutos:90,questoes:10,acertos:8,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
function seed(){
  return {versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
   disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
   conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
              {disciplina:"Legislação",nome:"Licitações",fase:"andamento"},
              {disciplina:"Português",nome:"Crase",fase:"andamento"}],
   conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
   registros:[sess("r1","Legislação",["LAI"]),                 // só LAI
              sess("r2","Legislação",["LAI","Licitações"]),    // compartilhada
              sess("r3","Português",["Crase"])],
   revisoes:[rev("v1","r1",dia(1),{retomada:true}),            // volta só de LAI
             rev("v2","r2",dia(2),{retomada:true}),            // volta de LAI + Licitações
             rev("v3","r3",dia(3),{retomada:true})],
   erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",texto:"art. 5º",importante:false,criadoEm:1}],
   cronometro:null};
}
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let perguntado="";
function abrir(confirmar){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed()));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"conteudos",gravadoEm:hoje}));
     w.confirm=t=>{ perguntado=t; return confirmar; }; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const nomes=doc=>[...doc.querySelectorAll("#view .item .titulo")].map(t=>t.textContent);
const botaoExcluir=(doc,cont)=>[...doc.querySelectorAll('[data-acao="excluir-conteudo"]')]
  .find(b=>b.dataset.cont===cont);

(async()=>{try{
  /* ---- 1. o botão existe e pergunta antes ---- */
  let w=abrir(false); await espera(450);
  let doc=w.document, $=s=>doc.querySelector(s);
  ok("cada conteúdo tem um botão de excluir",
     [...doc.querySelectorAll('[data-acao="excluir-conteudo"]')].length===3, nomes(doc));
  botaoExcluir(doc,"LAI").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("a exclusão pede confirmação", /Excluir o conteúdo “LAI”/.test(perguntado), perguntado);
  ok("a caixa diz o que SAI da agenda", /SAI da agenda: 1 item marcado/.test(perguntado), perguntado);
  ok("e diz o que FICA", /FICA o estudo: 2 sessões continuam registradas/.test(perguntado), perguntado);
  ok("avisa que não dá para desfazer", /Não dá para desfazer/.test(perguntado), perguntado);
  ok("dizendo não, nada acontece", (db(w).conteudos||[]).some(c=>c.nome==="LAI") &&
     db(w).revisoes.length===3, db(w).conteudos.map(c=>c.nome));

  /* ---- 2. confirmando ---- */
  w=abrir(true); await espera(450);
  doc=w.document; $=s=>doc.querySelector(s);
  const antes=db(w);
  botaoExcluir(doc,"LAI").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  const d=db(w);
  ok("a ficha do conteúdo some do cadastro", !(d.conteudos||[]).some(c=>c.nome==="LAI"),
     d.conteudos.map(c=>c.nome));
  ok("e some da aba Disciplinas", !nomes(doc).includes("LAI"), nomes(doc));
  ok("os outros conteúdos ficam", nomes(doc).sort().join()==="Crase,Licitações", nomes(doc));

  /* ---- 3. o que sai da agenda e o que fica ---- */
  ok("a volta que era SÓ de LAI foi apagada", !d.revisoes.some(r=>r.id==="v1"),
     d.revisoes.map(r=>r.id));
  ok("a do card que também cobre Licitações continua",
     d.revisoes.some(r=>r.id==="v2"), d.revisoes.map(r=>r.id));
  ok("e a de outra disciplina nem foi tocada", d.revisoes.some(r=>r.id==="v3"));

  /* ---- 4. o estudo fica inteiro ---- */
  ok("as sessões continuam todas registradas", d.registros.length===3, d.registros.map(r=>r.id));
  ok("inalteradas: a sessão de LAI mantém o conteúdo, as horas e as questões",
     JSON.stringify(d.registros.find(r=>r.id==="r1"))===
     JSON.stringify(antes.registros.find(r=>r.id==="r1")),
     d.registros.find(r=>r.id==="r1"));
  ok("as horas somadas não mudam",
     d.registros.reduce((s,r)=>s+r.minutos,0)===antes.registros.reduce((s,r)=>s+r.minutos,0),
     d.registros.map(r=>r.minutos));

  /* ---- 5. a parte que faz a exclusão PEGAR: não volta sozinho ---- */
  doc.querySelector('[data-aba="revisoes"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(400);
  ok("nenhuma volta nova nasce para o conteúdo excluído",
     !db(w).revisoes.some(r=>r.registroId==="r1"), db(w).revisoes.map(r=>[r.id,r.registroId]));
  ok("o total de itens na agenda continua 2", db(w).revisoes.length===2,
     db(w).revisoes.map(r=>r.id));

  /* ---- 6. e continua assim depois de recarregar ---- */
  const guardado=w.localStorage.getItem("plataforma-estudos:v1");
  const dom2=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",guardado);
     x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje})); }});
  await espera(500);
  const d2=JSON.parse(dom2.window.localStorage.getItem("plataforma-estudos:v1"));
  ok("recarregando, o conteúdo excluído não ressuscita",
     !(d2.conteudos||[]).some(c=>c.nome==="LAI") && !d2.revisoes.some(r=>r.registroId==="r1"),
     {conteudos:d2.conteudos.map(c=>c.nome), revs:d2.revisoes.map(r=>[r.id,r.registroId])});

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nexcluir conteúdo: some do cadastro e da agenda, o estudo fica");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
