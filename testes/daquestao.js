const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const anot=(id,extra)=>Object.assign({id,disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",
  ensinamento:"prazo de 20 dias",categoria:"",refeita:false,importante:false,criadoEm:Date.now()-Number(id.slice(1))*1000},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 lancamentos:[],registros:[{id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
  questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1}],revisoes:[],
 erros:[anot("e1"), anot("e2",{fonte:"CESPE 2026 Q42",categoria:"conteudo",refeita:true,ensinamento:"não confundir com o recurso"})],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje})); w.__confirmarNativo=true; w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const erro=id=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).erros.find(e=>e.id===id);
const editar=async id=>{ const b=[...doc.querySelectorAll('[data-acao="editar-erro"]')].find(x=>x.dataset.id===id);
  click(b); await espera(320); };
const marcar=v=>{ const r=doc.querySelector('#modalCaixa [name="daQuestao"][value="'+v+'"]');
  r.checked=true; r.dispatchEvent(new w.Event("change",{bubbles:true})); };
const salvar=()=>{ $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); };

(async()=>{try{
  await espera(350);

  /* ---- anotação comum: a pergunta começa em Não e os campos ficam escondidos ---- */
  await editar("e1");
  const nao=doc.querySelector('#modalCaixa [name="daQuestao"][value="nao"]');
  const sim=doc.querySelector('#modalCaixa [name="daQuestao"][value="sim"]');
  ok("a pergunta existe, com duas respostas", !!nao && !!sim);
  ok("o padrão é não", nao.checked && !sim.checked, [nao.checked, sim.checked]);
  ok("a pergunta é amigável", /apareceu numa questão/.test($("#modalCorpo").textContent),
     ($("#modalCorpo").textContent.match(/.{0,40}questão\?.{0,10}/)||[""])[0]);
  const painel=$("#painelQuestao");
  ok("o bloco da questão existe, fechado", !!painel && !painel.classList.contains("aberto"),
     painel && painel.className);
  ok("fechado, ele não ocupa altura nem pega o teclado",
     /\.painel-questao\{display:grid;grid-template-rows:0fr/.test(html) &&
     /\.painel-questao > \.interno\{overflow:hidden;min-height:0;visibility:hidden/.test(html));
  ok("e a abertura é animada", /transition:grid-template-rows \.22s/.test(html));
  ok("banca, tipo do erro e 'refiz' estão dentro dele",
     !!painel.querySelector('[name="fonte"]') && !!painel.querySelector('[name="categoria"]') &&
     !!painel.querySelector('[name="refeita"]'));
  ok("a caixa de texto continua fora, sempre visível",
     !!$("#modalCorpo #eEnsinamento") && !$("#painelQuestao #eEnsinamento"));
  ok("o ★ da véspera também fica fora", !$('#painelQuestao [name="importante"]') &&
     !!doc.querySelector('#modalCaixa [name="importante"]'));

  /* ---- marcar sim revela, sem perder o que foi digitado ---- */
  $("#eEnsinamento").value="prazo de 20 dias, prorrogável";
  marcar("sim");
  ok("marcar sim abre o bloco", $("#painelQuestao").classList.contains("aberto"),
     $("#painelQuestao").className);
  ok("e os botões avisam que abriram",
     [...doc.querySelectorAll('#modalCaixa [name="daQuestao"]')].every(r=>r.getAttribute("aria-expanded")==="true"));
  ok("e o texto digitado continua lá", $("#eEnsinamento").value==="prazo de 20 dias, prorrogável",
     $("#eEnsinamento").value);
  marcar("nao");
  ok("voltar para não fecha de novo", !$("#painelQuestao").classList.contains("aberto"),
     $("#painelQuestao").className);
  ok("e os botões avisam que fecharam",
     [...doc.querySelectorAll('#modalCaixa [name="daQuestao"]')].every(r=>r.getAttribute("aria-expanded")==="false"));
  ok("quem move o bloco é o próprio par de botões",
     doc.querySelector('#modalCaixa [name="daQuestao"]').getAttribute("aria-controls")==="painelQuestao");

  /* ---- salvar com sim grava os campos da questão ---- */
  marcar("sim");
  $('#modalCaixa [name="fonte"]').value="CESPE 2026 Q90";
  $('#modalCaixa [name="categoria"]').value="bobo";
  $('#modalCaixa [name="refeita"]').checked=true;
  salvar(); await espera(320);
  ok("com sim, banca e tipo do erro são gravados",
     erro("e1").fonte==="CESPE 2026 Q90" && erro("e1").categoria==="bobo" && erro("e1").refeita===true,
     [erro("e1").fonte, erro("e1").categoria, erro("e1").refeita]);

  /* ---- anotação que já veio de questão abre com sim ---- */
  await editar("e2");
  ok("anotação com banca/erro já abre em sim",
     doc.querySelector('#modalCaixa [name="daQuestao"][value="sim"]').checked);
  ok("e com o bloco já aberto", $("#painelQuestao").classList.contains("aberto"),
     $("#painelQuestao").className);
  ok("com os valores preenchidos", $('#modalCaixa [name="fonte"]').value==="CESPE 2026 Q42" &&
     $('#modalCaixa [name="categoria"]').value==="conteudo" && $('#modalCaixa [name="refeita"]').checked);

  /* ---- passar para não limpa o que era da questão ---- */
  marcar("nao"); salvar(); await espera(320);
  ok("marcando não, banca some", erro("e2").fonte==="", erro("e2").fonte);
  ok("tipo do erro some", erro("e2").categoria==="", erro("e2").categoria);
  ok("e 'refiz' some", erro("e2").refeita===false, erro("e2").refeita);
  ok("mas o texto da anotação fica intacto", /não confundir com o recurso/.test(erro("e2").ensinamento),
     erro("e2").ensinamento);
  ok("e as etiquetas somem do card", !/CESPE 2026 Q42/.test($("#view").textContent));

  /* ---- o ★ não depende da pergunta ---- */
  await editar("e2");
  doc.querySelector('#modalCaixa [name="importante"]').checked=true;
  salvar(); await espera(320);
  ok("o ★ da véspera funciona com a resposta em não", erro("e2").importante===true, erro("e2"));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncampos da questão sob demanda");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
