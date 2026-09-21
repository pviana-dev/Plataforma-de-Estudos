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
const hoje = iso(new Date()), ontem = iso(new Date(Date.now()-864e5));
const seed = {
  versao:1, tema:"claro", dataProva:"2026-10-11", metaDiariaMin:120, disciplinas:["Legislação"],
  grupos:[],
  registros:[
    { id:"rA", data:ontem, disciplina:"Legislação", assuntos:["LAI"], assunto:"LAI", minutos:60, questoes:10, acertos:8, dificuldade:3, anotacoes:"", criadoEm:1 },
    { id:"rB", data:hoje,  disciplina:"Legislação", assuntos:["LAI - art. 7º"], assunto:"LAI - art. 7º", minutos:50, questoes:0, acertos:0, dificuldade:4, anotacoes:"", criadoEm:2 }
  ],
  revisoes:[], erros:[], cronometro:null
};

let falhas = 0;
const ok = (nome, cond, extra) => { console.log((cond?"  ok   ":"  FALHA")+"  "+nome+(cond?"":"   → "+JSON.stringify(extra))); if(!cond) falhas++; };

const dom = new JSDOM(html, { runScripts:"dangerously", url:"https://teste.local/", pretendToBeVisual:true,
  beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1", JSON.stringify(seed)); } });
const w = dom.window, doc = w.document;
const $ = s => doc.querySelector(s);
const lerDb = () => JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
const change = el => el.dispatchEvent(new w.Event("change", { bubbles:true }));

setTimeout(() => {
  try {
    // 1. abrir a aba Registros e editar a sessão de hoje
    click($('[data-aba="registros"]'));
    const btnEditar = [...doc.querySelectorAll('[data-acao="editar-registro"]')].find(b => b.dataset.id === "rB");
    ok("a sessão de hoje pode ser editada pelo histórico", !!btnEditar);
    click(btnEditar);

    const form = $("#formRegistro");
    ok("formulário abriu em modo edição", !!form);
    const cx = $("#cxIntegrado"), sel = $("#grupoAlvo");
    ok("existe a caixa de integrar", !!cx);
    ok("o seletor de destino existe e começa escondido", sel && sel.hidden, sel && sel.hidden);
    ok("sem integrar, o editor do grupo não aparece", $("#painelGrupo").innerHTML === "");

    // 2. marcar a caixa: o seletor obrigatório aparece
    cx.checked = true; change(cx);
    ok("marcar a caixa mostra o seletor", !$("#grupoAlvo").hidden);
    const opcoes = [...$("#grupoAlvo").options].map(o => o.value + "|" + o.textContent);
    ok("o seletor lista a outra sessão da disciplina", opcoes.some(o => o.startsWith("r:rA")), opcoes);
    ok("o seletor oferece criar um grupo novo", opcoes.some(o => o.startsWith("__novo")), opcoes);
    ok("a sessão que está sendo editada não aparece como destino", !opcoes.some(o => o.startsWith("r:rB")), opcoes);

    // 3. tentar salvar sem escolher o destino → tem que ser recusado
    form.dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));
    ok("salvar sem escolher o destino é recusado", /Escolha com qual conte/.test($("#erroForm").textContent), $("#erroForm").textContent);
    ok("nada foi integrado ainda", lerDb().grupos.length === 0);

    // 4. escolher a sessão da LAI de ontem
    const alvo = $("#grupoAlvo"); alvo.value = "r:rA"; change(alvo);
    const nome = $("#grupoNome");
    ok("o editor do grupo aparece", !!nome);
    ok("o nome vem preenchido com o conteúdo escolhido", nome && nome.value === "LAI", nome && nome.value);
    const chips = [...doc.querySelectorAll("#listaMembros .tag")].map(t => t.textContent.replace("✕",""));
    ok("os conteúdos do grupo ficam listados", chips.length === 2 && chips.some(c => /esta sessão/.test(c)) && chips.some(c => /^LAI ·/.test(c)), chips);
    ok("dá para trazer mais sessões", !!$("#addMembro"));

    // 5. renomear e salvar
    nome.value = "LAI";
    form.dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));

    setTimeout(() => {
      const d = lerDb();
      ok("o grupo foi criado com o nome escolhido", d.grupos.length === 1 && d.grupos[0].nome === "LAI", d.grupos);
      const gid = d.grupos[0] && d.grupos[0].id;
      const dentro = d.registros.filter(r => r.plano === "grupo" && r.grupoId === gid).map(r => r.id).sort();
      ok("as DUAS sessões entraram no mesmo grupo", dentro.join(",") === "rA,rB", dentro);
      const revs = d.revisoes;
      ok("existe um plano único do grupo", revs.filter(r => r.grupoId === gid).length > 0, revs.length);
      ok("nenhuma revisão individual pendente sobrou", !revs.some(r => r.registroId && !r.feita),
         revs.filter(r => r.registroId).map(r => r.registroId));
      ok("nenhum card com o nome da disciplina", !revs.some(r => r.integrada && !r.grupoId));

      // 6. reabrir a sessão: o editor do grupo já vem carregado
      click([...doc.querySelectorAll('[data-acao="editar-registro"]')].find(b => b.dataset.id === "rA"));
      ok("ao reabrir, a caixa já está marcada", $("#cxIntegrado").checked);
      ok("ao reabrir, o destino aparece escolhido", $("#grupoAlvo").value === "g:"+gid, $("#grupoAlvo").value);
      ok("ao reabrir, o nome do grupo está no editor", $("#grupoNome").value === "LAI", $("#grupoNome") && $("#grupoNome").value);
      const membros = [...doc.querySelectorAll("#listaMembros .tag")].map(t => t.textContent.replace("✕",""));
      ok("o editor lista os conteúdos do grupo", membros.length === 2, membros);

      // 7. renomear o grupo por dentro da sessão
      $("#grupoNome").value = "LAI (Lei 12.527)";
      $("#formRegistro").dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));
      setTimeout(() => {
        const d2 = lerDb();
        ok("renomear o grupo funciona", d2.grupos[0].nome === "LAI (Lei 12.527)", d2.grupos.map(g=>g.nome));
        ok("o grupo continua com as duas sessões",
           d2.registros.filter(r => r.grupoId === d2.grupos[0].id).length === 2);
        const cards = [...doc.querySelectorAll("#app")].length;
        console.log(falhas ? "\n"+falhas+" FALHA(S)" : "\ntodos os testes de tela passaram");
        process.exit(falhas ? 1 : 0);
      }, 300);
    }, 300);
  } catch(e){ console.error("ERRO:", e.message, "\n", e.stack.split("\n").slice(0,4).join("\n")); process.exit(2); }
}, 300);
