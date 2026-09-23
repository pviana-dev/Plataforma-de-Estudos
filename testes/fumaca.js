/* Smoke test: o caminho completo de quem usa a plataforma, do zero até o plano.
   Substitui as suítes cenario/ui3/ui6, perdidas quando o /tmp foi limpo —
   é também o motivo de os testes agora viverem dentro do repositório. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
  beforeParse(w){ w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")||"{}");

(async()=>{try{
  await espera(400);
  /* ---- 1. a plataforma abre do zero ---- */
  ok("abre sem dados, na aba Hoje", !!$("#view") && $('[data-aba="hoje"]').getAttribute("aria-selected")==="true");
  ok("as sete abas estão lá", doc.querySelectorAll("#abas .aba").length===7);
  ok("o cronômetro aparece logo no topo", !!$(".card-crono"));

  /* ---- 2. registrar a primeira sessão ---- */
  click($('[data-aba="registros"]')); await espera(300);
  click($('[data-acao="toggle-form-registro"]')); await espera(350);
  ok("o formulário abre na tela sobreposta", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  $('#modalCaixa [name="data"]').value=hoje;
  // base vazia: a disciplina precisa ser criada na hora
  const disc=$('#modalCaixa [name="disciplina"]');
  disc.value="__nova"; disc.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(200);
  $('#modalCaixa [name="novaDisciplina"]').value="Legislação";
  // conteúdo é escolhido numa lista; numa base vazia, cria-se na hora
  const campoAssunto=$("#modalCaixa #campoAssunto");
  campoAssunto.value="__novo";
  campoAssunto.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(150);
  $("#modalCaixa #novoConteudoNome").value="LAI";
  click($('#modalCaixa [data-acao="add-assunto"]')); await espera(200);
  $('#modalCaixa [name="minutos"]').value="60";
  $('#modalCaixa [name="questoes"]').value="10";
  $('#modalCaixa [name="acertos"]').value="7";
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(450);
  const regs=db().registros||[];
  ok("a sessão é gravada", regs.length===1 && regs[0].minutos===60, regs.map(r=>[r.disciplina,r.minutos]));
  ok("com o assunto que eu digitei", (regs[0].assuntos||[]).join()==="LAI", regs[0].assuntos);
  // a fase mora na ficha do conteúdo, não na sessão
  const fichaLAI=(db().conteudos||[]).find(c=>c.nome==="LAI");
  ok("o conteúdo vira ficha no cadastro", !!fichaLAI, db().conteudos);
  ok("e nasce em andamento", fichaLAI.fase==="andamento", fichaLAI.fase);
  ok("e ganha uma volta marcada", (db().revisoes||[]).length===1, db().revisoes);
  ok("a volta é do tipo retomada", db().revisoes[0].retomada===true);

  /* ---- 3. o tempo aparece onde deve ---- */
  click($('[data-aba="hoje"]')); await espera(300);
  ok("o tempo de hoje aparece na aba Hoje", /1h/.test($("#view").textContent), $("#view").textContent.slice(0,120));
  click($('[data-aba="questoes"]')); await espera(300);
  ok("as questões entram na aba Questões", /10/.test($("#view").textContent));
  click($('[data-aba="painel"]')); await espera(300);
  ok("o Progresso monta sem erro", $("#view").textContent.length>200);

  /* ---- 4. fechar o conteúdo dá partida na escada ---- */
  click($('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(300);
  ok("o card mostra o conteúdo em andamento", /em andamento/.test($("#view").textContent));
  click($('[data-acao="concluir-conteudo"]')); await espera(400);
  const pend=(db().revisoes||[]).filter(r=>!r.feita);
  ok("fechar cria a escada inteira", pend.length>=4, pend.map(r=>r.data));
  ok("e some a volta", pend.every(r=>!r.retomada), pend.map(r=>!!r.retomada));

  /* ---- 5. cronômetro: começa, conta e encerra ---- */
  click($('[data-aba="hoje"]')); await espera(300);
  const sel=$("#cronoDestino");
  sel.value=[...sel.options].find(o=>/LAI/.test(o.textContent) || o.value==="novo").value;
  sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  $("#formCrono").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("o cronômetro inicia", !!db().cronometro, db().cronometro);
  ok("e aparece o chip no cabeçalho", !!$("#cronoChip").textContent.trim());
  click($('[data-acao="crono-cancelar"]')); await espera(300);
  ok("descartar encerra sem registrar", !db().cronometro);

  /* ---- 6. um ponto importante, do começo ao fim ---- */
  click($('[data-aba="erros"]')); await espera(300);
  click($('[data-acao="abrir-composer"]')); await espera(300);
  $("#txtNovo").value="prazo de 20 dias, prorrogável por mais 10";
  // onde entra virou dois campos: disciplina e, dentro dela, o conteúdo
  const onde=$("#novoConteudo");
  if (onde){
    onde.value="Legislação";
    onde.dispatchEvent(new w.Event("change",{bubbles:true}));
    const c=$('.compositor [name="alvoConteudo"]');
    if (c) c.value="LAI";
  }
  click($('[data-acao="salvar-aprendizado"]')); await espera(350);
  ok("o ponto é salvo", (db().erros||[]).length===1, db().erros);
  ok("e aparece na lista", /prorrogável/.test($("#view").textContent));

  /* ---- 7. exportar não quebra ---- */
  ok("o backup tem tudo o que foi criado",
     (db().registros||[]).length===1 && (db().erros||[]).length===1 && (db().revisoes||[]).length>=4);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nfluxo completo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
