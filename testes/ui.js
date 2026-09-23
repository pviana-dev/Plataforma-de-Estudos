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
const corpoForm = () => ($("#modalCorpo") || {}).textContent || "";

setTimeout(() => {
  try {
    /* A INTEGRAÇÃO FOI APOSENTADA. Ela existia para isto: duas sessões do mesmo
       conteúdo abriam duas filas de revisão. Hoje a agenda resolve sozinha, e o
       formulário não oferece mais caixa nenhuma. É o que esta suíte verifica. */
    click($('[data-aba="registros"]'));
    const btnEditar = [...doc.querySelectorAll('[data-acao="editar-registro"]')].find(b => b.dataset.id === "rB");
    ok("a sessão de hoje pode ser editada pelo histórico", !!btnEditar);
    click(btnEditar);

    const form = $("#formRegistro");
    ok("formulário abriu em modo edição", !!form);
    ok("a caixa de integrar não existe mais", !$("#cxIntegrado"));
    ok("nem o seletor de destino", !$("#grupoAlvo"));
    ok("nem o editor do grupo", !$("#painelGrupo"));
    ok("a caixa de 'sem revisão' continua", !!$('#formRegistro [name=semRevisao]'));
    ok("e a fase dos conteúdos continua aparecendo", /Fase dos conte/.test(corpoForm()),
       corpoForm().slice(0, 80));

    /* Salvar sem integrar nada: a sessão agenda o plano dela, normalmente. */
    form.dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));
    setTimeout(() => {
      const d = lerDb();
      ok("salvar não pede destino nenhum", !$("#erroForm") || !$("#erroForm").textContent.trim(),
         $("#erroForm") && $("#erroForm").textContent);
      ok("nenhum grupo é criado", !(d.grupos || []).length, d.grupos);
      ok("nenhuma revisão nasce integrada", !d.revisoes.some(r => r.grupoId || r.integrada),
         d.revisoes.map(r => [r.id, r.grupoId, r.integrada]));

      /* O QUE SUBSTITUIU A INTEGRAÇÃO: duas sessões do MESMO conteúdo dividem
         um plano só, sem ninguém marcar nada. rA e rB falam de conteúdos
         diferentes, então cada uma tem o seu — o que está certo. */
      const porSessao = {};
      d.revisoes.filter(r => !r.feita).forEach(r => {
        porSessao[r.registroId] = (porSessao[r.registroId] || 0) + 1;
      });
      ok("cada sessão tem plano próprio, porque os conteúdos são diferentes",
         Object.keys(porSessao).length === 2, porSessao);

      /* Agora uma sessão NOVA do mesmo conteúdo de rA: não pode abrir fila nova. */
      const antes = d.revisoes.filter(r => !r.feita).length;
      click($('[data-acao="toggle-form-registro"]'));
      setTimeout(() => {
        $('#modalCaixa [name="data"]').value = hoje;
        const ds = $('#modalCaixa select.sel-disciplina');
        ds.value = "Legislação"; change(ds);
        setTimeout(() => {
          porConteudo(doc, w, "LAI");
          $('#modalCaixa [name="minutos"]').value = "30";
          $("#formRegistro").dispatchEvent(new w.Event("submit", { bubbles:true, cancelable:true }));
          setTimeout(() => {
            const d2 = lerDb();
            const depois = d2.revisoes.filter(r => !r.feita).length;
            ok("estudar LAI de novo cria a sessão", d2.registros.length === 3, d2.registros.length);
            ok("mas NÃO abre uma fila nova — era para isto que servia integrar",
               depois === antes, { antes, depois, revs: d2.revisoes.map(r => [r.registroId, r.data]) });
            ok("e continua sem grupo nenhum", !(d2.grupos || []).length, d2.grupos);
            console.log(falhas ? "\n"+falhas+" FALHA(S)" : "\ntodos os testes de tela passaram");
            process.exit(falhas ? 1 : 0);
          }, 400);
        }, 250);
      }, 350);
    }, 400);
  } catch(e){ console.error("ERRO:", e.message, "\n", e.stack.split("\n").slice(0,4).join("\n")); process.exit(2); }
}, 350);
