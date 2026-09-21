const fs = require("fs");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync(__dirname + "/../index.html", "utf8");

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

  /* ---- criar um grupo NOVO pelo nome, a partir da sessão de hoje ---- */
  click($('[data-aba="registros"]'));
  await passo(() => {
    editar("rC");
    const cx = $("#cxIntegrado"); cx.checked = true; change(cx);
    const sel = $("#grupoAlvo"); sel.value = "__novo"; change(sel);
    ok("criar novo grupo abre o editor com o nome vazio", $("#grupoNome") && $("#grupoNome").value === "", $("#grupoNome") && $("#grupoNome").value);
    submit();
    ok("grupo novo sem nome é recusado", /nome ao grupo/.test($("#erroForm").textContent), $("#erroForm").textContent);
  });
  await passo(() => {
    // traz a sessão da LAI para dentro antes de salvar
    const add = $("#addMembro");
    ok("o editor oferece as outras sessões da disciplina", [...add.options].some(o => o.value === "rA"), [...add.options].map(o=>o.textContent));
    add.value = "rA";
    click([...doc.querySelectorAll('[data-acao="add-membro"]')][0]);
    const chips = [...doc.querySelectorAll("#listaMembros [data-membro]")].map(t => t.dataset.membro);
    ok("a sessão trazida vira uma etiqueta na lista", chips.join(",") === "rA", chips);
    ok("a sessão trazida sai do seletor", ![...$("#addMembro").options].some(o => o.value === "rA"));
    $("#grupoNome").value = "LAI";
    submit();
  });
  await passo(() => {
    const d = lerDb(), g = d.grupos[0];
    ok("o grupo novo foi criado", d.grupos.length === 1 && g.nome === "LAI", d.grupos);
    const dentro = d.registros.filter(r => r.grupoId === g.id).map(r => r.id).sort();
    ok("o grupo reúne a sessão de hoje e a que foi trazida", dentro.join(",") === "rA,rC", dentro);
    ok("as revisões que a sessão trazida já tinha viraram cards do grupo",
       d.revisoes.filter(r => r.registroId === "rA" && !r.feita).every(r => r.grupoId === g.id),
       d.revisoes.filter(r=>r.registroId==="rA").map(r=>r.data+":"+(r.grupoId||"-")));
    ok("o plano do grupo existe", d.revisoes.some(r => r.grupoId === g.id && !r.feita));
  });

  /* ---- a Rotina mostra o nome do grupo ---- */
  await passo(() => {
    click($('[data-aba="revisoes"]'));
  });
  await passo(() => {
    const txt = $("#view").textContent;
    ok("a aba Rotina mostra o grupo pelo nome", /LAI/.test(txt) && /plano integrado/.test(txt));
    ok("a Rotina lista os conteúdos reunidos", /LAI · LAI - prazos|LAI - prazos · LAI/.test(txt), txt.slice(txt.indexOf("plano integrado")-120, txt.indexOf("plano integrado")+80));
  });

  /* ---- tirar um conteúdo do grupo ---- */
  click($('[data-aba="registros"]'));
  await passo(() => {
    editar("rC");
    const chip = doc.querySelector('#listaMembros [data-membro="rA"]');
    ok("o conteúdo trazido aparece na etiqueta ao reabrir", !!chip);
    click(chip.querySelector('[data-acao="remover-membro"]'));
    ok("a etiqueta sai da lista", !doc.querySelector('#listaMembros [data-membro="rA"]'));
    ok("e volta para o seletor", [...$("#addMembro").options].some(o => o.value === "rA"));
    submit();
  });
  await passo(() => {
    const d = lerDb(), g = d.grupos[0];
    ok("quem saiu não está mais no grupo", d.registros.filter(r => r.grupoId === g.id).map(r=>r.id).join(",") === "rC",
       d.registros.map(r => r.id+":"+(r.grupoId||"-")));
    ok("quem saiu ficou em revisão manual", d.registros.find(r => r.id === "rA").plano === "manual");
    ok("o grupo continua com a sessão de hoje", d.revisoes.some(r => r.grupoId === g.id));
  });

  /* ---- desmarcar a integração ---- */
  await passo(() => {
    editar("rC");
    const cx = $("#cxIntegrado"); cx.checked = false; change(cx);
    ok("desmarcar esconde o seletor", $("#grupoAlvo").hidden);
    ok("desmarcar fecha o editor do grupo", $("#painelGrupo").innerHTML === "");
    submit();
  });
  await passo(() => {
    const d = lerDb();
    ok("a sessão saiu do grupo", d.registros.find(r => r.id === "rC").plano === "manual");
    ok("o grupo vazio foi descartado", d.grupos.length === 0, d.grupos);
  });

  console.log(falhas ? "\n"+falhas+" FALHA(S)" : "\ntodos os testes de tela (2) passaram");
  process.exit(falhas ? 1 : 0);
} catch(e){ console.error("ERRO:", e.message, "\n", e.stack.split("\n").slice(0,5).join("\n")); process.exit(2); } })();
