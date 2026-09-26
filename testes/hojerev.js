const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()), ontem=iso(new Date(Date.now()-864e5)), mais=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,ass)=>({id,data:iso(new Date(Date.now()-5*864e5)),disciplina:disc,assuntos:[ass],assunto:ass,
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",fase:"concluido",criadoEm:Number(id.slice(1))});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
function base(revisoes){
  return {versao:1,tema:"claro",dataProva:mais(60),metaDiariaMin:120,disciplinas:["Legislação","Português"],
   grupos:[],lancamentos:[],registros:[sess("r1","Legislação","LAI"),sess("r2","Português","Crase")],
   revisoes,erros:[],cronometro:null};
}
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje})); }});
  return dom.window;
}
const cardDe=(doc,titulo)=>[...doc.querySelectorAll("#view .card")].find(c=>new RegExp(titulo).test(c.querySelector("h2")?c.querySelector("h2").textContent:""));

(async()=>{try{
  /* ---- duas de hoje, uma atrasada, uma futura ---- */
  let w=abrir(base([rev("v1","r1",hoje), rev("v2","r2",hoje), rev("v3","r1",ontem), rev("v4","r2",mais(4))]));
  await espera(400);
  let doc=w.document, $=s=>doc.querySelector(s);
  const card=cardDe(doc,"Agenda de hoje");
  ok("a aba Agenda abre com um card do que é de hoje", !!card,
     [...doc.querySelectorAll("#view .card h2")].map(h=>h.textContent));
  /* ordem da aba: indicadores, + Adicionar revisão, o card de hoje (fixo,
     fora do alcance dos filtros) e só então os filtros Situação / Organizar. */
  const acima=[...doc.querySelectorAll("#view .card, #view .btn-add")].filter(e=>!e.classList.contains("tiles"));
  ok("o + Adicionar revisão vem logo abaixo dos indicadores", acima[0].classList.contains("btn-add"),
     acima[0].textContent.slice(0,60));
  ok("o card de hoje vem logo depois", acima[1]===card,
     acima.slice(0,3).map(e=>e.textContent.slice(0,40)));
  ok("e os filtros Situação e Organizar depois dele, um abaixo do outro",
     /Situação:/.test(acima[2].textContent) && /Organizar:/.test(acima[2].textContent) &&
     acima[2].querySelectorAll(":scope > .linha").length>=2, acima[2].textContent.slice(0,60));
  ok("o cabeçalho traz a data de hoje",
     card.querySelector(".dica").textContent.includes(hoje.slice(8)+"/"+hoje.slice(5,7)),
     card.querySelector(".dica").textContent);
  const itens=[...card.querySelectorAll(".item")];
  ok("lista as duas de hoje", itens.length===2, itens.length);
  ok("cada uma marcada como 'Para hoje'",
     itens.every(i=>/Para hoje/.test(i.textContent)), itens.map(i=>i.textContent.replace(/\s+/g," ").slice(0,60)));
  ok("a atrasada (de outro dia, ainda aberta) não entra aqui", !/Atrasada desde/.test(card.textContent));
  ok("o cabeçalho conta o que está em aberto", /2 em aberto · 0 concluída/.test(card.querySelector(".dica").textContent),
     card.querySelector(".dica").textContent);
  ok("mas o card avisa quantas estão atrasadas", /1<\/b> atrasad/.test(card.innerHTML),
     card.querySelector(".sub").textContent);
  ok("a futura também fica de fora", !new RegExp(mais(4).slice(8)+"/"+mais(4).slice(5,7)).test(card.textContent));
  ok("o card de atrasadas continua existindo", !!doc.querySelector("#revisoes-atrasadas"));

  /* ---- marcar como feita dali funciona ---- */
  const check=card.querySelector('[data-acao="concluir"]');
  ok("dá para marcar a revisão como feita pelo card", !!check);
  check.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(350);
  ok("marcar abre a tela de sessão, como na aba Hoje",
     !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"), $("#overlay").hidden);

  /* ---- concluídas e em andamento também aparecem ---- */
  const sessaoHoje={id:"s9",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,
    acertos:0,dificuldade:3,anotacoes:"",tipo:"revisao",revisaoId:"v1",criadoEm:9};
  let seed=base([
    rev("v1","r1",hoje,{feita:true,feitaEm:hoje,sessaoId:"s9"}),        // concluída hoje
    rev("v2","r2",hoje),                                                // ainda aberta
    rev("v5","r1",ontem,{feita:true,feitaEm:hoje,sessaoId:"s9"}),       // era de ontem, feita hoje
    rev("v6","r2",ontem),                                               // atrasada de verdade
    rev("v4","r2",mais(4))]);
  seed.registros.push(sessaoHoje);
  w=abrir(seed); await espera(400);
  doc=w.document;
  const c2=cardDe(doc,"Agenda de hoje");
  const linhas=[...c2.querySelectorAll(".item")];
  ok("as concluídas hoje entram na lista", linhas.length===3, linhas.map(l=>l.textContent.replace(/\s+/g," ").slice(0,70)));
  ok("a concluída hoje é rotulada assim", /Concluída hoje/.test(c2.textContent), c2.textContent.replace(/\s+/g," "));
  ok("a que era de ontem diz de onde veio", /estava marcada para /.test(c2.textContent),
     c2.textContent.replace(/\s+/g," "));
  ok("a atrasada ainda aberta continua fora", !/Atrasada desde/.test(c2.textContent));
  ok("o cabeçalho separa aberto e concluído", /1 em aberto · 2 concluída/.test(c2.querySelector(".dica").textContent),
     c2.querySelector(".dica").textContent);
  ok("a pendente vem antes das concluídas",
     !linhas[0].classList.contains("feita") && linhas[1].classList.contains("feita"),
     linhas.map(l=>l.className));
  ok("a concluída pode ser desmarcada dali",
     linhas[1].querySelector('[data-acao="reabrir"]') && !linhas[1].querySelector('[data-acao="concluir"]'),
     linhas[1].querySelector(".check").dataset.acao);

  /* ---- com o cronômetro rodando naquela sessão ---- */
  seed=base([rev("v1","r1",hoje,{feita:true,feitaEm:hoje,sessaoId:"s9"}), rev("v2","r2",hoje)]);
  seed.registros.push(sessaoHoje);
  seed.cronometro={ inicio:Date.now()-600000, disciplina:"", assunto:"", destinoTipo:"registro", destinoId:"s9" };
  w=abrir(seed); await espera(400);
  doc=w.document;
  const c3=cardDe(doc,"Agenda de hoje");
  ok("a revisão cronometrada aparece como em andamento", /Em andamento agora/.test(c3.textContent),
     c3.textContent.replace(/\s+/g," "));
  ok("e vem em primeiro lugar", c3.querySelector(".item").classList.contains("em-andamento"),
     c3.querySelector(".item").className);

  /* ---- nenhuma para hoje, mas com atrasada ---- */
  w=abrir(base([rev("v3","r1",ontem), rev("v4","r2",mais(4))])); await espera(400);
  doc=w.document;
  const vazio=cardDe(doc,"Agenda de hoje");
  ok("sem revisão hoje, o card explica", /Nada marcado para hoje/.test(vazio.textContent), vazio.textContent);
  ok("e aponta para as atrasadas", /1 revisão atrasada/.test(vazio.textContent),
     vazio.textContent.replace(/\s+/g," "));

  /* ---- nada hoje e nada atrasado ---- */
  w=abrir(base([rev("v4","r2",mais(4))])); await espera(400);
  doc=w.document;
  const limpo=cardDe(doc,"Agenda de hoje");
  ok("sem nada pendente, o texto muda", /cronograma abaixo/.test(limpo.textContent), limpo.textContent);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrevisões de hoje na aba Revisões");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
