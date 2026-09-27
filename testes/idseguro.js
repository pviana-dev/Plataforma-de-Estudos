/* CHECAGEM DE SEGURANÇA (27/09): um backup montado de propósito, com aspas num id,
   não pode rodar código. Os ids são limpos na carga (limparIds, a mesma troca em
   todo lugar para as ligações não quebrarem) e escapados ao irem para o HTML. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const MAU='r1" onmouseover="window.__invadiu=1" x="', MAU2="v1'><img src=x onerror=window.__invadiu=2>";
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
  lancamentos:[{id:"l1",registroId:MAU,data:hoje,questoes:10,acertos:7}],
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
  registros:[{id:MAU,data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,acertos:0,
    dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},
    {id:"r2ok",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:20,questoes:0,acertos:0,
    dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2}],
  revisoes:[{id:MAU2,registroId:MAU,assuntos:["LAI"],data:dia(2),ordem:1,feita:false,manual:true,
    minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
  erros:[],cronometro:null};
function abrir(aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  for (const aba of ["hoje","registros","agenda","questoes"]){
    const w=abrir(aba); await espera(600);
    const doc=w.document;
    doc.querySelectorAll("[data-id]").forEach(el=>el.dispatchEvent(new w.MouseEvent("mouseover",{bubbles:true})));
    const atributosRuins=[...doc.querySelectorAll("*")].filter(el=>[...el.attributes].some(a=>/^on/i.test(a.name)));
    ok("aba "+aba+": nenhum atributo on… injetado e nada rodou", !atributosRuins.length && !w.__invadiu,
       {atributos:atributosRuins.map(e=>e.outerHTML.slice(0,80)), invadiu:w.__invadiu});
  }
  const w=abrir("hoje"); await espera(600);
  const idNaTela=[...w.document.querySelectorAll("option")].map(o=>o.value).find(v=>/^registro:/.test(v)&&!/r2ok/.test(v));
  ok("na tela, o id ruim já aparece limpo", /^registro:[A-Za-z0-9_-]+$/.test(idNaTela||""), idNaTela);
  // a limpeza é na carga, em memória: a próxima gravação leva o dado limpo ao armazenamento
  const w2=abrir("registros"); await espera(600);
  w2.document.querySelector('tbody tr[data-id="r2ok"]').dispatchEvent(new w2.MouseEvent("click",{bubbles:true})); await espera(450);
  w2.document.querySelector("#formRegistro").dispatchEvent(new w2.Event("submit",{bubbles:true,cancelable:true})); await espera(550);
  const d=db(w2), reg=d.registros.find(r=>r.criadoEm===1), rev=d.revisoes[0];
  ok("o id ruim virou só letras, números, _ e -", /^[A-Za-z0-9_-]+$/.test(reg.id) && /^[A-Za-z0-9_-]+$/.test(rev.id), [reg.id, rev.id]);
  ok("a revisão continua ligada à mesma sessão", rev.registroId===reg.id, {rev:rev.registroId, reg:reg.id});
  ok("o lançamento também", d.lancamentos[0].registroId===reg.id, d.lancamentos[0].registroId);
  ok("id normal passa intacto", d.registros.some(r=>r.id==="r2ok") && d.conteudos[0].id==="c1");

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nbackup com id malicioso não roda código");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
