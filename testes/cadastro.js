/* Conteúdo virou ficha: escolhe-se numa lista filtrada pela disciplina, e a
   fase mora nela — fechar um conteúdo fecha todas as sessões que falam dele. */
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
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,assuntos,extra)=>Object.assign({id,data:hoje,disciplina:disc,assuntos,assunto:assuntos[0],
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],conteudos:[],grupos:[],lancamentos:[],
 registros:[sess("r1","Legislação",["LAI"]), sess("r2","Legislação",["LAI"],{data:dia(-3),minutos:45}),
            sess("r3","Legislação",["Licitações"]), sess("r4","Português",["Crase"])],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
   w.__confirmarNativo=true; w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const ficha=(disc,nome)=>(db().conteudos||[]).find(c=>c.disciplina===disc && c.nome===nome);
const opcoesConteudo=()=>[...doc.querySelectorAll("#campoAssunto option")].map(o=>o.value);

(async()=>{try{
  await espera(450);
  /* ---- 1. migração: o que estava em uso virou ficha ---- */
  const cads=db().conteudos||[];
  ok("os conteúdos em uso viraram fichas", cads.length===3, cads.map(c=>c.disciplina+"/"+c.nome));
  ok("cada ficha guarda a disciplina dela",
     cads.filter(c=>c.disciplina==="Legislação").length===2 &&
     cads.filter(c=>c.disciplina==="Português").length===1, cads.map(c=>c.disciplina));
  ok("e todas nascem em andamento", cads.every(c=>c.fase==="andamento"));
  ok("a migração roda uma vez só", db().conteudosMigrados===true);

  /* ---- 2. o campo de conteúdo lista só a disciplina escolhida ---- */
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r3").querySelector("td"));
  await espera(350);
  ok("editando uma sessão de Legislação, só vêm conteúdos dela",
     opcoesConteudo().includes("LAI") && !opcoesConteudo().includes("Crase"), opcoesConteudo());
  ok("o que já está na sessão não se repete na lista", !opcoesConteudo().includes("Licitações"),
     opcoesConteudo());
  ok("e há sempre a opção de criar", opcoesConteudo().includes("__novo"));

  // trocar a disciplina troca a lista
  const sd=$("#modalCaixa select.sel-disciplina");
  sd.value="Português"; change(sd); await espera(350);
  ok("trocando para Português, a lista muda",
     opcoesConteudo().includes("Crase") && !opcoesConteudo().includes("LAI"), opcoesConteudo());
  click($('#modalCaixa [data-acao="cancelar-edicao"]')); await espera(250);

  /* ---- 3. criar um conteúdo novo pelo formulário ---- */
  click($('[data-acao="toggle-form-registro"]')); await espera(350);
  const sd2=$("#modalCaixa select.sel-disciplina");
  sd2.value="Legislação"; change(sd2); await espera(350);
  const sel=$("#campoAssunto");
  sel.value="__novo"; change(sel); await espera(150);
  ok("escolher criar abre o campo do nome", !$("#novoConteudoNome").hidden);
  $("#novoConteudoNome").value="Improbidade";
  click($('[data-acao="add-assunto"]')); await espera(250);
  ok("o conteúdo novo entra como etiqueta",
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].some(t=>t.dataset.assunto==="Improbidade"),
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.dataset.assunto));
  ok("e já nasce no cadastro", !!ficha("Legislação","Improbidade"), db().conteudos.map(c=>c.nome));
  $('#modalCaixa [name="minutos"]').value="30";
  { const _d=$("#formRegistro [name=dificuldade]"); if (_d && !_d.value) _d.value="2"; }   // obrigatória, sem padrão
  $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(450);
  ok("a sessão é salva com o conteúdo escolhido",
     db().registros.some(r=>r.assuntos.join()==="Improbidade"), db().registros.map(r=>r.assuntos));

  /* ---- 4. fechar um conteúdo fecha TODAS as sessões dele ---- */
  // o plano nasce quando a sessão é gravada: regrava as duas de LAI
  for (const id of ["r1","r2"]){
    click($('[data-aba="registros"]')); await espera(250);
    click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id).querySelector("td"));
    await espera(300);
    { const _d=$("#formRegistro [name=dificuldade]"); if (_d && !_d.value) _d.value="2"; }   // obrigatória, sem padrão
    $("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(400);
  }
  click($('[data-aba="revisoes"]')); await espera(350);
  verPorAssunto(doc, w); await espera(300);
  const botao=[...doc.querySelectorAll('[data-acao="concluir-conteudo"]')]
    .find(b=>(b.dataset.conts||"")==="LAI");
  ok("o card de LAI traz o botão de concluir", !!botao,
     [...doc.querySelectorAll('[data-acao="concluir-conteudo"]')].map(b=>b.dataset.conts));
  click(botao); await espera(450);
  ok("a ficha de LAI fica concluída", ficha("Legislação","LAI").fase==="concluido", ficha("Legislação","LAI"));
  ok("as DUAS sessões de LAI ganharam a escada",
     db().revisoes.filter(r=>!r.retomada && !r.feita).length>=4,
     db().revisoes.map(r=>[r.registroId,r.data,!!r.retomada]));
  ok("e os outros conteúdos continuam em andamento",
     ficha("Legislação","Licitações").fase==="andamento" && ficha("Português","Crase").fase==="andamento");

  /* ---- 5. concluir a disciplina inteira ---- */
  click($('#abas [data-aba="conteudos"]')); await espera(350);
  ok("a tela de conteúdos separa por disciplina",
     [...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent).sort().join()
       ==="Legislação,Português",
     [...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent));
  click([...doc.querySelectorAll('[data-acao="concluir-disciplina"]')].find(b=>b.dataset.disc==="Legislação"));
  await espera(450);
  ok("concluir a disciplina fecha todos os conteúdos dela",
     (db().conteudos||[]).filter(c=>c.disciplina==="Legislação").every(c=>c.fase==="concluido"),
     db().conteudos.map(c=>[c.disciplina,c.nome,c.fase]));
  ok("sem tocar na outra disciplina", ficha("Português","Crase").fase==="andamento");
  ok("e a aba continua na tela para seguir mexendo",
     $('#abas [data-aba="conteudos"]').getAttribute("aria-selected")==="true" &&
     /Disciplinas/.test($("#view").textContent), $("#view").textContent.slice(0,80));

  /* ---- 6. reabrir a disciplina ---- */
  click([...doc.querySelectorAll('[data-acao="reabrir-disciplina"]')].find(b=>b.dataset.disc==="Legislação"));
  await espera(450);
  ok("reabrir a disciplina volta tudo para em andamento",
     (db().conteudos||[]).filter(c=>c.disciplina==="Legislação").every(c=>c.fase==="andamento"),
     db().conteudos.map(c=>[c.nome,c.fase]));
  ok("e cada conteúdo volta a ter uma volta só",
     db().revisoes.filter(r=>!r.feita && r.retomada).length>=1 &&
     db().revisoes.filter(r=>!r.feita && !r.retomada).length===0,
     db().revisoes.map(r=>[r.data,!!r.retomada]));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncadastro de conteúdos funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
