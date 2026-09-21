const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:dia(-2),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:6,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
w.confirm=()=>true;                       // jsdom não implementa confirm()
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));
const txt=()=>$("#view").textContent.replace(/\s+/g," ");

(async()=>{try{
  await passo(()=>{ click(doc.querySelector('[data-aba="questoes"]')); });
  await passo(()=>{
    ok("a aba oferece lançar questões", !!doc.querySelector('[data-acao="novo-lancamento"]'));
    ok("a taxa começa em 60%", /Taxa de acerto60%/.test(txt()), txt().slice(0,160));
    click(doc.querySelector('[data-acao="novo-lancamento"]'));
  });
  await passo(()=>{
    ok("abre na tela sobreposta", !$("#overlay").hidden && !!$("#modalCorpo #formLancamento"));
    ok("o seletor de sessão é obrigatório", !!$("#formLancamento [name=registroId][required]"));
    const opts=[...$("#formLancamento [name=registroId]").options].map(o=>o.textContent);
    ok("a sessão registrada aparece como destino", opts.some(t=>/LAI/.test(t)), opts);
    ok("a data vem com hoje", $("#formLancamento [name=data]").value===hoje);
    // tentar salvar sem escolher a sessão
    $("#formLancamento [name=registroId]").value="";
    $("#formLancamento").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
    ok("sem sessão é recusado", /Escolha a sessão/.test($("#erroLancamento").textContent), $("#erroLancamento").textContent);
    // acertos maiores que questões
    $("#formLancamento [name=registroId]").value="rA";
    $("#formLancamento [name=questoes]").value="10";
    $("#formLancamento [name=acertos]").value="12";
    $("#formLancamento").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
    ok("acertos acima do total é recusado", /Acertos não podem/.test($("#erroLancamento").textContent));
    $("#formLancamento [name=acertos]").value="9";
    $("#formLancamento").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const d=lerDb();
    ok("o lançamento foi gravado ligado ao registro",
       d.lancamentos.length===1 && d.lancamentos[0].registroId==="rA", d.lancamentos);
    ok("com a data de hoje, não a da sessão", d.lancamentos[0].data===hoje, d.lancamentos[0].data);
    ok("a sessão não foi alterada", d.registros[0].questoes===10 && d.registros[0].acertos===6,
       {q:d.registros[0].questoes,a:d.registros[0].acertos});
    ok("a tela fechou", $("#overlay").hidden);
    ok("o total somou as duas origens", /Questões feitas20/.test(txt()), txt().slice(0,160));
    ok("a taxa virou 75%", /Taxa de acerto75%/.test(txt()), txt().slice(0,200));
    ok("aparece na tabela como 'questões'", /questões/.test(txt()));
  });

  /* ---- editar ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-lancamento"]')); });
  await passo(()=>{
    ok("reabre preenchido", $("#formLancamento [name=questoes]").value==="10" &&
       $("#formLancamento [name=registroId]").value==="rA",
       {q:$("#formLancamento [name=questoes]").value, r:$("#formLancamento [name=registroId]").value});
    $("#formLancamento [name=questoes]").value="4";
    $("#formLancamento [name=acertos]").value="4";
    $("#formLancamento").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const d=lerDb();
    ok("a edição gravou sem duplicar", d.lancamentos.length===1 && d.lancamentos[0].questoes===4, d.lancamentos);
    ok("o total acompanhou", /Questões feitas14/.test(txt()), txt().slice(0,120));
  });

  /* ---- o conteúdo e a disciplina recebem as questões ---- */
  await passo(()=>{
    ok("a linha por disciplina soma o lançamento", /Legislação/.test(txt()) && /14/.test(txt()));
    click(doc.querySelector('[data-aba="painel"]'));
  });
  await passo(()=>{
    ok("o painel soma sessão + lançamento na semana", /Questões da semana14/.test(txt()), txt().slice(0,200));
  });

  /* ---- excluir o registro leva o lançamento junto ---- */
  await passo(()=>{ click(doc.querySelector('[data-aba="questoes"]')); });
  await passo(()=>{ click(doc.querySelector('[data-acao="excluir-lancamento"]')); });
  await passo(()=>{
    ok("dá para excluir o lançamento", lerDb().lancamentos.length===0, lerDb().lancamentos);
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nlançamento de questões funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
