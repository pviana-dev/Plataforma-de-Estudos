const fs = require("fs");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync(__dirname + "/../index.html", "utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}

/* O conteúdo agora se escolhe numa lista. Este atalho faz o que a pessoa faz:
   escolhe "criar novo", digita o nome e clica em adicionar. */
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const existe=[...sel.options].some(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (existe){ sel.value=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase()).value; }
  else {
    sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
    const campo=doc.querySelector("#novoConteudoNome"); if (!campo) return false;
    campo.value=nome;
  }
  const bt=doc.querySelector('[data-acao="add-assunto"]');
  bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return true;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje = iso(new Date()), ontem = iso(new Date(Date.now()-864e5)), anteontem = iso(new Date(Date.now()-2*864e5));
// dados do MODELO ANTIGO: duas sessões integradas por disciplina
const seed = {
  versao:1, tema:"claro", dataProva:"2026-10-11", metaDiariaMin:120, disciplinas:["Legislação"],
  registros:[
    { id:"rA", data:anteontem, disciplina:"Legislação", assuntos:["LAI"], assunto:"LAI", minutos:60, questoes:10, acertos:8, dificuldade:3, plano:"disciplina", criadoEm:1 },
    { id:"rB", data:ontem, disciplina:"Legislação", assuntos:["Lei 8.112"], assunto:"Lei 8.112", minutos:40, questoes:0, acertos:0, dificuldade:4, plano:"disciplina", criadoEm:2 },
    { id:"rC", data:hoje, disciplina:"Legislação", assuntos:["LAI - prazos"], assunto:"LAI - prazos", minutos:30, questoes:0, acertos:0, dificuldade:3, criadoEm:3 }
  ],
  revisoes:[
    { id:"v1", registroId:null, disciplina:"Legislação", assuntos:["LAI","Lei 8.112"], integrada:true, data:ontem, feita:true, feitaEm:ontem, manual:false, minutos:30, questoes:5, acertos:4, dificuldade:3, atividade:"", nota:"" },
    { id:"v2", registroId:null, disciplina:"Legislação", assuntos:["LAI","Lei 8.112"], integrada:true, data:hoje, feita:false, manual:false }
  ],
  erros:[], cronometro:null
};
let falhas = 0;
const ok = (n,c,e) => { console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e))); if(!c) falhas++; };
const dom = new JSDOM(html, { runScripts:"dangerously", url:"https://teste.local/", pretendToBeVisual:true,
  beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1", JSON.stringify(seed)); } });
const w = dom.window, doc = w.document;
const $ = s => doc.querySelector(s);
const lerDb = () => JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
const change = el => el.dispatchEvent(new w.Event("change", { bubbles:true }));
const submit = () => $("#formRegistro").dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));
const editar = id => click([...doc.querySelectorAll('[data-acao="editar-registro"]')].find(b => b.dataset.id === id));
const passo = (fn, ms=300) => new Promise(r => setTimeout(() => { fn(); r(); }, ms));

(async () => { try {
  /* ---- migração do modelo antigo ---- */
  await passo(() => {
    const d = lerDb();
    ok("as sessões saíram do plano por disciplina", !d.registros.some(r => r.plano === "disciplina"), d.registros.map(r=>r.plano));
    ok("a revisão pendente do plano antigo sumiu", !d.revisoes.some(r => r.id === "v2"));
    ok("a revisão já feita foi preservada", d.revisoes.some(r => r.id === "v1"));
    ok("as sessões desintegradas ganharam plano individual",
       d.revisoes.filter(r => r.registroId === "rA").length > 0 && d.revisoes.filter(r => r.registroId === "rB").length > 0,
       d.revisoes.map(r => r.registroId));
  });

  /* Daqui para baixo esta suíte criava grupos de revisão pelo formulário. A
     integração foi aposentada — o que se verifica agora é que ela não está
     mais lá, nem no formulário nem no dado. */
  click($('[data-aba="registros"]'));
  await passo(() => {
    editar("rC");
    ok("o formulário não oferece mais integrar", !$("#cxIntegrado") && !$("#grupoAlvo"));
    ok("nem o editor de grupo", !$("#grupoNome") && !$("#addMembro"));
    submit();
  });
  await passo(() => {
    const d = lerDb();
    ok("salvar não cria grupo nenhum", !(d.grupos || []).length, d.grupos);
    ok("e a sessão fica com plano próprio",
       d.revisoes.some(r => r.registroId === "rC") || d.registros.find(r => r.id === "rC").plano !== "grupo",
       d.revisoes.map(r => r.registroId));
    console.log(falhas ? "\n"+falhas+" FALHA(S)" : "\ntodos os testes de tela (2) passaram");
    process.exit(falhas ? 1 : 0);
  });
} catch(e){ console.error("ERRO:", e.message, "\n", e.stack.split("\n").slice(0,4).join("\n")); process.exit(2); } })();
