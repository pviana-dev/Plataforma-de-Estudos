/* A DISCIPLINA VEM PRIMEIRO (28/09). Em Registrar sessão, o conteúdo fica
   travado até haver uma disciplina — escolhida na lista ou digitada como nova. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(disciplinas){
  const seed={versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas,lancamentos:[],grupos:[],
    conteudos:disciplinas.length?[{id:"cA",disciplina:"Legislação",nome:"LAI",fase:"andamento",criadoEm:1}]:[],
    conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,registros:[],revisoes:[],erros:[],cronometro:null};
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
      w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
(async()=>{try{
  /* ---- com disciplinas cadastradas ---- */
  let w=abrir(["Legislação"]); await espera(450);
  let doc=w.document, $=s=>doc.querySelector(s);
  $('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  ok("sem disciplina, o conteúdo vem travado", $("#campoAssunto").disabled);
  ok("e o formulário diz o porquê", !$("#avisoDisciplinaPrimeiro").hidden && /disciplina primeiro/i.test($("#avisoDisciplinaPrimeiro").textContent));
  $("#formRegistro .sel-disciplina").value="Legislação";
  $("#formRegistro .sel-disciplina").dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("escolhida a disciplina, o conteúdo destrava", !$("#campoAssunto").disabled);
  ok("com os conteúdos dela", [...$("#campoAssunto").options].some(o=>o.value==="LAI"));
  ok("e o aviso some", $("#avisoDisciplinaPrimeiro").hidden);

  /* ---- sem nenhuma disciplina: criar uma nova ---- */
  w=abrir([]); await espera(450); doc=w.document;
  doc.querySelector('[data-acao="toggle-form-registro"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(300);
  const f=doc.querySelector("#formRegistro"), nova=f.querySelector(".nova-disciplina");
  ok("nova disciplina ainda sem nome: conteúdo travado", doc.querySelector("#campoAssunto").disabled);
  nova.value="Português"; nova.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("digitado o nome, o conteúdo destrava", !doc.querySelector("#campoAssunto").disabled);
  nova.value=""; nova.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("apagado o nome, trava de novo", doc.querySelector("#campoAssunto").disabled);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndisciplina primeiro: conteúdo travado até haver disciplina");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
