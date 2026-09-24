/* DIAS DA RETOMADA (pedido do Pedro, 23/09). Conteúdo em andamento volta em N
   dias; o padrão sai da DIFICULDADE e do TEMPO ATÉ A PROVA (perto = mais junto),
   e nos ajustes dá para escolher os dias de cada dificuldade. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const off=d=>Math.round((new Date(d+"T12:00")-new Date(hoje+"T12:00"))/864e5);
const sess=(id,ass,dif)=>({id,data:dia(-1),disciplina:"Legislação",assuntos:[ass],assunto:ass,minutos:60,
  questoes:0,acertos:0,dificuldade:dif,anotacoes:"",tipo:"estudo",criadoEm:1});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"a",disciplina:"Legislação",nome:"A",fase:"andamento"},{id:"b",disciplina:"Legislação",nome:"B",fase:"andamento"},
             {id:"c",disciplina:"Legislação",nome:"C",fase:"andamento"}],
  registros:[sess("r3","A",3), sess("r2","B",2), sess("r1","C",1)],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed)); w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
/** dias até a volta de cada sessão: [difícil, médio, fácil] */
const voltas=w=>["r3","r2","r1"].map(id=>{ const v=db(w).revisoes.find(r=>r.retomada && !r.feita && r.registroId===id); return v?off(v.data):null; });

(async()=>{try{
  let w=abrir(base()); await espera(400);
  ok("sem prova: difícil 1, médio 2, fácil 4 dias", voltas(w).join()==="1,2,4", voltas(w));
  w=abrir(base({objetivo:"concurso", dataProva:dia(60)})); await espera(400);
  ok("prova em 60 dias: fácil encurta para 3", voltas(w).join()==="1,2,3", voltas(w));
  w=abrir(base({objetivo:"concurso", dataProva:dia(20)})); await espera(400);
  ok("prova em 20 dias: tudo mais junto (1, 1, 2)", voltas(w).join()==="1,1,2", voltas(w));

  /* ---- tempo de estudo previsto: vale também SEM objetivo ---- */
  w=abrir(base({estudoAte:dia(20)})); await espera(400);
  ok("sem objetivo, estudo previsto para 20 dias: voltas mais juntas (1, 1, 2)", voltas(w).join()==="1,1,2", voltas(w));
  w=abrir(base({estudoAte:dia(60)})); await espera(400);
  ok("sem objetivo, 60 dias previstos: 1, 2, 3", voltas(w).join()==="1,2,3", voltas(w));
  w=abrir(base({objetivo:"concurso", dataProva:dia(20), estudoAte:dia(200)})); await espera(400);
  ok("o previsto manda sobre a prova: prova em 20 dias, estudo até 200 → ritmo de longe (1, 2, 4)",
     voltas(w).join()==="1,2,4", voltas(w));
  w=abrir(base()); await espera(400);
  w.document.getElementById("btnAjustes").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  const cxAte=w.document.querySelector('#formAjustes [name="estudoAte"]');
  ok("os ajustes têm o campo de tempo de estudo previsto, em branco", !!cxAte && !cxAte.value);
  w.document.querySelector('[data-acao="estudo-previsto"][data-meses="3"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const tres=new Date(); tres.setMonth(tres.getMonth()+3);
  ok("o atalho +3 meses preenche a data", cxAte.value===iso(tres), [cxAte.value, iso(tres)]);
  cxAte.value=dia(25);
  w.document.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("salvo, ele fica gravado e muda o ritmo (1, 1, 2)", db(w).estudoAte===dia(25) && voltas(w).join()==="1,1,2",
     [db(w).estudoAte, voltas(w)]);

  /* ---- nos ajustes, cada dificuldade tem o seu campo ---- */
  w=abrir(base()); await espera(400);
  const doc=w.document;
  doc.getElementById("btnAjustes").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  const campo=n=>doc.querySelector('#formAjustes [name="volta'+n+'"]');
  ok("os ajustes têm um campo de dias por dificuldade", !!campo(1) && !!campo(2) && !!campo(3));
  ok("em branco, mostrando o padrão", !campo(1).value && campo(1).placeholder==="4" && campo(3).placeholder==="1",
     [campo(1).value, campo(1).placeholder, campo(3).placeholder]);
  const nomes=[...doc.querySelectorAll("#formAjustes [name]")].map(e=>e.name);
  ok("a meta diária vem antes do revisar até", nomes.indexOf("meta")>=0 && nomes.indexOf("meta")<nomes.indexOf("revisarAte"), nomes);
  const cxPrev=doc.querySelector('#formAjustes [name="estudoAte"]');
  cxPrev.value=dia(20); cxPrev.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("mudando o tempo previsto, o número apagado já mostra o que vai valer (fácil 2, médio 1)",
     campo(1).placeholder==="2" && campo(2).placeholder==="1", [campo(1).placeholder, campo(2).placeholder]);
  cxPrev.value=""; cxPrev.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("e volta quando apaga", campo(1).placeholder==="4", campo(1).placeholder);
  campo(1).value="6"; campo(3).value="2";
  doc.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("o que você escolhe fica gravado", db(w).diasRetomada[1]===6 && db(w).diasRetomada[3]===2 && !db(w).diasRetomada[2],
     db(w).diasRetomada);
  ok("e as voltas passam a usar esses dias (difícil 2, médio no padrão 2, fácil 6)", voltas(w).join()==="2,2,6", voltas(w));

  doc.getElementById("btnAjustes").dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("reabrindo os ajustes, os valores escolhidos aparecem", campo(1).value==="6" && campo(3).value==="2");
  campo(1).value=""; campo(3).value="";
  doc.querySelector("#formAjustes").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("apagando, volta ao padrão", voltas(w).join()==="1,2,4" && Object.keys(db(w).diasRetomada).length===0, [voltas(w), db(w).diasRetomada]);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndias da retomada funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
