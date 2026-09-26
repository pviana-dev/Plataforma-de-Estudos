/* A REVISÃO DE UX DE 26/09. Cada bloco prende uma correção do relatório:
   1.1 marcar um item da agenda não mostra a faixa "Sessão cronometrada: 0min ( → )";
   1.2 o ✓ de um item de outro dia salva (a revisão tocada está na lista);
   1.3 o rótulo do dia conta o dia inteiro, não só a amostra;
   1.5/1.6 estados vazios que não mentem (Questões sem sessão, Falta estudar sem cadastro);
   1.8 o card Agenda do Progresso fala de um escopo só;
   1.10 a ordem não conta como filtro;
   2.2 o ✓ abre o registro sem trocar de aba;
   2.3 o cronômetro começa já num conteúdo (lista "Estudar hoje");
   2.6 a confirmação é do app, com o verbo no botão;
   2.12 o Excluir do conteúdo mora na janela de editar;
   2.14 lançar questões escolhe o conteúdo;
   3.6 *assim* vira negrito;
   3.8 o ✓ tem nome para leitor de tela. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const ficha=(nome,extra)=>Object.assign({id:"c"+nome,disciplina:"Legislação",nome,fase:"andamento",concluidoEm:null},extra||{});
const reg=(id,d,ass,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,
  acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:id.charCodeAt(1)},extra||{});
const base=()=>({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:dia(40),metaDiariaMin:120,disciplinas:["Legislação"],
 grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
 conteudos:[],registros:[],revisoes:[],erros:[],cronometro:null});
/* nativo=true: responde às confirmações pelo w.confirm (como as suítes antigas);
   false: a confirmação do app aparece de verdade, em #dialogo */
function abrir(seed, aba, nativo=true){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"hoje",gravadoEm:hoje}));
     if (nativo){ w.__confirmarNativo=true; w.confirm=()=>true; } }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const submit=(w,f)=>f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
const aba=w=>w.document.querySelector("#abas .aba[aria-selected=true]").dataset.aba;

(async()=>{try{
  /* base comum: LAI concluída com revisões hoje e no futuro; LGPD em andamento */
  const s=base();
  s.conteudos=[ficha("LAI",{fase:"concluido",concluidoEm:dia(-10)}),ficha("LGPD"),ficha("Licitações")];
  s.registros=[reg("r1",dia(-10),["LAI"]),reg("r2",dia(-3),["LGPD"])];
  s.revisoes=[{id:"vh",registroId:"r1",assuntos:["LAI"],data:hoje,feita:false,manual:true},
              {id:"vf",registroId:"r1",assuntos:["LAI"],data:dia(4),feita:false,manual:true}];

  /* ---- 1.1 e 2.2 ---- */
  let w=abrir(s,"hoje"); await espera(400);
  click(w,w.document.querySelector('#view button.check[data-id="vh"]')); await espera(300);
  ok("2.2 o ✓ abre o registro sem sair da aba Hoje", aba(w)==="hoje" && !!w.document.querySelector("#formRegistro"), aba(w));
  ok("1.1 sem a faixa 'Sessão cronometrada' (não houve cronômetro)",
     !/Sessão cronometrada/.test(w.document.querySelector("#modalCorpo").textContent));
  ok("3.8 o ✓ diz de qual item é", /LAI/.test(w.document.querySelector('#view button.check[data-id="vh"]').getAttribute("aria-label")||""),
     w.document.querySelector('#view button.check[data-id="vh"]').getAttribute("aria-label"));

  /* ---- 1.2 ---- */
  w=abrir(s,"revisoes"); await espera(400);
  click(w,w.document.querySelector('#view button.check[data-id="vf"]')); await espera(300);
  const alvo=w.document.querySelector('#formRegistro [name="revisaoAlvo"]');
  ok("1.2 o item de outro dia aparece escolhido na lista", alvo && alvo.value==="vf", alvo && [...alvo.options].map(o=>o.value));
  const f=w.document.querySelector("#formRegistro");
  f.querySelector('[name="minutos"]').value=""; f.querySelector('[name="dificuldade"]').value="2";
  submit(w,f); await espera(400);
  const vf=db(w).revisoes.find(r=>r.id==="vf");
  ok("1.2 e salvar cumpre esse item (adiantado)", vf && vf.feita===true, vf);

  /* ---- 1.3 ---- */
  const s3=base(); s3.conteudos=["A","B","C","D","E"].map(n=>ficha(n)); s3.agendaAutomatica=false;
  s3.registros=s3.conteudos.map((c,i)=>reg("r"+i,dia(-2),[c.nome]));
  s3.revisoes=s3.conteudos.map((c,i)=>({id:"v"+i,registroId:"r"+i,assuntos:[c.nome],data:dia(1),feita:false,manual:true}));
  w=abrir(s3,"hoje"); await espera(400);
  const rot=[...w.document.querySelectorAll(".dia-rotulo")].map(e=>e.textContent)[0]||"";
  ok("1.3 o dia de amanhã diz 5 itens, mesmo mostrando só 3", /5 itens/.test(rot) &&
     w.document.querySelectorAll(".dia-bloco .item").length===3, rot);

  /* ---- 1.5 e 1.6 ---- */
  w=abrir(base(),"questoes"); await espera(300);
  ok("1.5 Questões sem sessão não fala de 'botão abaixo' e leva a Sessões",
     !/botão abaixo/.test(w.document.querySelector("#view").textContent) &&
     !!w.document.querySelector('#view [data-aba="registros"]'));
  w=abrir(Object.assign(base(),{disciplinas:[]}),"hoje"); await espera(300);
  ok("1.6 sem cadastro, o Falta estudar não diz que está tudo em dia",
     /Nenhum conteúdo cadastrado ainda/.test(w.document.querySelector("#view").textContent) &&
     !/Todo conteúdo cadastrado já tem sessão/.test(w.document.querySelector("#view").textContent));

  /* ---- 1.8 ---- */
  w=abrir(s,"painel"); await espera(400);
  const cardAg=[...w.document.querySelectorAll("#view .card")].find(c=>/^Agenda/.test(c.querySelector("h2").textContent));
  ok("1.8 o card Agenda do Progresso não mistura 'no dia' com o total",
     cardAg && !/Feitas no dia/.test(cardAg.textContent) && /Concluídas/.test(cardAg.textContent), cardAg && cardAg.textContent.slice(0,120));

  /* ---- 1.10 ---- */
  w=abrir(s,"registros"); await espera(300);
  const ord=w.document.querySelector("#fOrdem"); ord.value="tempo-desc"; ord.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  ok("1.10 mudar só a ordem não acende 'filtro ativo'", !w.document.querySelector("#view .marca-filtro") &&
     !/ativo/.test(w.document.querySelector('[data-acao="toggle-filtros-reg"]').textContent));

  /* ---- 2.3 ---- */
  w=abrir(s,"hoje"); await espera(400);
  const sel=w.document.querySelector("#cronoDestino");
  const grupo=[...sel.querySelectorAll("optgroup")].find(g=>g.label==="Estudar hoje");
  const opts=grupo ? [...grupo.querySelectorAll("option")].map(o=>o.textContent) : [];
  ok("2.3 a lista do cronômetro traz o que a agenda pede hoje e o que falta estudar",
     opts.some(t=>/^LAI/.test(t)) && opts.some(t=>/^Licitações/.test(t)), opts);
  sel.value=[...grupo.querySelectorAll("option")].find(o=>/^Licitações/.test(o.textContent)).value;
  sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(200);
  submit(w,w.document.querySelector("#formCrono")); await espera(300);
  ok("2.3 o cronômetro nasce sabendo o conteúdo", db(w).cronometro && db(w).cronometro.assunto==="Licitações" &&
     db(w).cronometro.disciplina==="Legislação", db(w).cronometro);
  ok("2.3 e o card mostra o nome dele", /Licitações/.test(w.document.querySelector(".card-crono").textContent));
  // ▶ estudar do mural, escolhendo cronometrar
  w=abrir(s,"hoje"); await espera(400); w.__escolha="crono";
  click(w,w.document.querySelector('[data-acao="estudar-afazer"]')); await espera(300);
  ok("2.3 ▶ estudar → Cronometrar agora liga o cronômetro no conteúdo", db(w).cronometro && db(w).cronometro.assunto==="Licitações",
     db(w).cronometro);

  /* ---- 2.6: a confirmação do próprio app ---- */
  const s6=base(); s6.conteudos=[ficha("LAI")];
  s6.erros=[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"prazo de 20 dias",categoria:"",refeita:false,importante:false,criadoEm:1}];
  w=abrir(s6,"erros",false); await espera(400);
  click(w,w.document.querySelector('[data-acao="editar-erro"]')); await espera(250);
  click(w,w.document.querySelector('[data-acao="excluir-erro"]')); await espera(150);
  const dlg=w.document.querySelector("#dialogo");
  ok("2.6 excluir pergunta na janela do app, com 'Excluir' no botão", !dlg.hidden &&
     w.document.querySelector("#formDialogo button[type=submit]").textContent==="Excluir" &&
     w.document.querySelector("#formDialogo button[type=submit]").classList.contains("perigo"));
  w.document.querySelector('#dialogo [data-dialogo="cancelar"]').click(); await espera(150);
  ok("2.6 cancelar não exclui", db(w).erros.length===1 && dlg.hidden);
  click(w,w.document.querySelector('[data-acao="excluir-erro"]')); await espera(150);
  submit(w,w.document.querySelector("#formDialogo")); await espera(250);
  ok("2.6 confirmar exclui", db(w).erros.length===0, db(w).erros);

  /* ---- 2.12 ---- */
  w=abrir(s,"conteudos"); await espera(400);
  ok("2.12 a linha do conteúdo não tem mais o excluir vermelho", !w.document.querySelector('#view [data-acao="excluir-conteudo"]') &&
     /✎ editar/.test(w.document.querySelector('[data-acao="renomear-conteudo"]').textContent));

  /* ---- 2.14 ---- */
  const s14=base(); s14.conteudos=[ficha("LAI")];
  s14.registros=[reg("r1",dia(-5),["LAI"]),reg("r2",dia(-1),["LAI"]),reg("r3",dia(-2),["LGPD"])];
  w=abrir(s14,"questoes"); await espera(400);
  click(w,w.document.querySelector('[data-acao="novo-lancamento"]')); await espera(250);
  const opL=[...w.document.querySelectorAll('#formLancamento [name="registroId"] option')].filter(o=>o.value);
  ok("2.14 um conteúdo por opção (não uma sessão por opção)", opL.map(o=>o.textContent).join()==="LAI,LGPD", opL.map(o=>o.textContent));
  ok("2.14 e o LAI se liga à sessão mais recente dele", opL[0].value==="r2", opL[0].value);

  /* ---- 3.6 ---- */
  const s36=base(); s36.conteudos=[ficha("LAI")];
  s36.erros=[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"isto *cai muito* em prova e 2*3 não",categoria:"",refeita:false,importante:false,criadoEm:1}];
  w=abrir(s36,"erros"); await espera(400);
  const txt=w.document.querySelector(".aprendizado").innerHTML;
  ok("3.6 *assim* vira negrito, e 2*3 continua conta", /<strong>cai muito<\/strong>/.test(txt) && /2\*3/.test(txt), txt);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrevisão de UX de 26/09: correções no lugar");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
