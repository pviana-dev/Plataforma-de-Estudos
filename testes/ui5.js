const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[{id:"rA",data:ontem,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:8,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[{id:"v1",registroId:"rA",data:iso(new Date(Date.now()+3*864e5)),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const aberto=()=>!$("#overlay").hidden;
const grande=()=>$("#modalCaixa").classList.contains("grande");
const titulo=()=>$("#modalTitulo").textContent;
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));

(async()=>{try{
  /* ---- registro: criar ---- */
  await passo(()=>{ click($('[data-aba="registros"]')); });
  await passo(()=>{
    ok("a aba abre sem formulário expandido", !$("#formRegistro"));
    ok("nada de modal aberto no começo", !aberto());
    click($('[data-acao="toggle-form-registro"]'));
  });
  await passo(()=>{
    ok("o botão abre a tela sobreposta", aberto() && !!$("#formRegistro"));
    ok("a tela sobreposta é a grande", grande());
    ok("o formulário está DENTRO do modal", !!$("#modalCorpo #formRegistro"));
    ok("a página de trás continua montada", /Todas as sessões/.test($("#view").textContent));
    ok("o título da tela é o do formulário", titulo()==="Registrar sessão", titulo());
    ok("a rolagem da página de trás fica travada", doc.body.style.overflow==="hidden");
    click(doc.querySelector('#modalCaixa [data-acao="toggle-form-registro"]'));   // Cancelar
  });
  await passo(()=>{
    ok("Cancelar fecha a tela sobreposta", !aberto() && !$("#formRegistro"));
    ok("a rolagem volta ao normal", doc.body.style.overflow==="");
  });

  /* ---- registro: editar pelo histórico ---- */
  await passo(()=>{ click($('[data-acao="editar-registro"]')); });
  await passo(()=>{
    ok("editar abre a mesma tela sobreposta", aberto() && !!$("#modalCorpo #formRegistro"));
    ok("o título diz que é edição", titulo()==="Editar sessão", titulo());
    ok("o formulário vem preenchido", $("#modalCorpo [name=minutos]").value==="60", $("#modalCorpo [name=minutos]").value);
    ok("o modo edição é sinalizado pela faixa verde", !!$("#modalCorpo .faixa-edicao"));
    // digitar e conferir que um redesenho não apaga
    $("#modalCorpo [name=minutos]").value="75";
    doc.getElementById("fBusca") && (doc.getElementById("fBusca").value="x");
  });
  await passo(()=>{
    click(doc.querySelector('#modalCorpo [data-acao="add-assunto"]'));   // ação que não redesenha
    ok("o que foi digitado continua lá", $("#modalCorpo [name=minutos]").value==="75");
    $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    ok("salvar fecha a tela sobreposta", !aberto());
    ok("a alteração foi gravada", lerDb().registros[0].minutos===75, lerDb().registros[0].minutos);
  });

  /* ---- fechar pelo ✕ cancela a edição ---- */
  await passo(()=>{ click($('[data-acao="editar-registro"]')); });
  await passo(()=>{
    $("#modalCorpo [name=minutos]").value="999";
    click(doc.querySelector('#overlay [data-acao="fechar-modal"]'));
  });
  await passo(()=>{
    ok("o ✕ fecha e cancela a edição", !aberto() && lerDb().registros[0].minutos===75, lerDb().registros[0].minutos);
    click($('[data-acao="editar-registro"]'));
  });
  await passo(()=>{
    doc.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
  });
  await passo(()=>{ ok("Esc também fecha", !aberto()); });

  /* ---- revisão: criar e editar ---- */
  await passo(()=>{ click($('[data-aba="revisoes"]')); });
  await passo(()=>{ verPorAssunto(doc, w); });
  await passo(()=>{
    ok("a Rotina não traz formulário embutido", !$("#view #formRevisao"));
    click($('[data-acao="nova-revisao"]'));
  });
  await passo(()=>{
    ok("nova revisão abre na tela sobreposta", aberto() && !!$("#modalCorpo #formRevisao"));
    ok("a tela de revisão também é a grande", grande());
    ok("o título é o da revisão", titulo()==="Nova revisão", titulo());
    click(doc.querySelector('#modalCaixa [data-acao="cancelar-revisao"]'));
  });
  await passo(()=>{ ok("Cancelar fecha a revisão", !aberto()); });
  // o plano é regerado ao salvar a sessão: guarda QUAL revisão foi aberta
  let revAberta=null;
  await passo(()=>{ const b=doc.querySelector('[data-acao="editar-revisao"]');
                    revAberta=b.dataset.id; click(b); });
  await passo(()=>{
    ok("editar revisão abre sobreposto", aberto() && !!$("#modalCorpo #formRevisao"));
    ok("o título diz Editar revisão", titulo()==="Editar revisão", titulo());
    const alvo=JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).revisoes
               .find(r=>r.id===revAberta);
    ok("a revisão vem preenchida", $("#modalCorpo [name=data]").value===alvo.data,
       [$("#modalCorpo [name=data]").value, alvo.data]);
    $("#modalCorpo [name=nota]").value="refazer as questões da aula 3";
    $("#modalCorpo #formRevisao").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    ok("salvar a revisão fecha a tela", !aberto());
    ok("a revisão foi gravada", /aula 3/.test(lerDb().revisoes[0].nota||""), lerDb().revisoes[0].nota);
  });

  /* ---- o editor de card continua funcionando (outro modal) ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-card"]')); });
  await passo(()=>{
    ok("o editor de card abre normal", aberto() && !!$("#tituloCard"));
    ok("o editor de card NÃO usa a tela grande", !grande());
    click(doc.querySelector('[data-acao="fechar-modal"]'));
  });
  await passo(()=>{ ok("e fecha sem quebrar nada", !aberto() && !!$("#view").textContent); });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntodos os testes da tela sobreposta passaram");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
