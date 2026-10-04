/* + Novo conteúdo na aba Disciplinas: obedece ao filtro, cria vários de uma vez
   e o que nasce sem sessão fica "a estudar", fora da agenda. */
const responderDialogos=require("./_dialogo.cjs"), fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Português",nome:"Crase",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[{id:"r1",data:dia(-2),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
   questoes:10,acertos:8,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1},
  {id:"r2",data:dia(-1),disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,
   questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2}],
 revisoes:[{id:"v1",registroId:null,disciplina:"Legislação",assuntos:["LAI"],data:dia(2),ordem:1,
   feita:false,manual:true,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",ensinamento:"art. 5º",importante:false,criadoEm:1}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let perguntado="", avisado="";
function abrir(resposta){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"conteudos",gravadoEm:hoje}));
     responderDialogos(w, t=>{ perguntado=t; return resposta; }, t=>{ avisado=t; });
     w.alert=t=>{ avisado=t; };
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const discsNaTela=doc=>[...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent);

(async()=>{try{
  let w=abrir(""); await espera(500);
  let doc=w.document, $=s=>doc.querySelector(s);
  const btn=()=>$('[data-acao="novo-conteudo"]');
  ok("há o botão + Novo conteúdo", !!btn());
  /* layout de 04/10: os dois botões de criar ficam lado a lado, acima do card (como na Agenda) */
  ok("ele fica ao lado do + Nova disciplina", btn().parentElement.classList.contains("linha-add") &&
     !!btn().parentElement.querySelector('[data-acao="nova-disciplina"]'));
  const ordem=[...doc.querySelectorAll('#view [data-acao="nova-disciplina"], #view #cDisciplina, #view [data-acao="novo-conteudo"]')]
    .map(e=>e.dataset.acao||e.id);
  ok("e acima dos filtros de disciplina", ordem[ordem.length-1]==="cDisciplina", ordem);
  /* Em Todas o botão responde (revisão de UX, 26/09): travado, não reagia ao toque e a
     explicação ficava num title que o celular não mostra. A janela pede a disciplina. */
  ok("em Todas, o botão responde e diz só '+ Novo conteúdo'", !btn().disabled && btn().textContent.trim()==="+ Novo conteúdo",
     btn().textContent);
  click(w,btn()); await espera(200);
  ok("abre a janela pedindo a disciplina", !$("#overlay").hidden && !!$("#novosDisc"));
  $("#formNovosConteudos textarea").value="Sintaxe";
  $("#formNovosConteudos").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(250);
  ok("sem disciplina escolhida, avisa e não cria", /Escolha a disciplina/.test($("#erroNovosConteudos").textContent) &&
     !db(w).conteudos.some(c=>c.nome==="Sintaxe"), $("#erroNovosConteudos").textContent);
  click(w,$('#modalCaixa [data-acao="fechar-modal"]')); await espera(200);
  { const w2=abrir(""); await espera(500);
    click(w2,w2.document.querySelector('[data-acao="novo-conteudo"]')); await espera(200);
    w2.document.querySelector("#novosDisc").value="Legislação";
    w2.document.querySelector("#formNovosConteudos textarea").value="Sintaxe";
    w2.document.querySelector("#formNovosConteudos").dispatchEvent(new w2.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
    ok("escolhida, cria nela", db(w2).conteudos.some(c=>c.nome==="Sintaxe"&&c.disciplina==="Legislação")); }

  { const s=$("#cDisciplina"); s.value="Português"; s.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300); }
  ok("filtrado, libera e cria na disciplina do filtro", !btn().disabled && btn().dataset.disc==="Português", btn().textContent);
  const revsAntes=db(w).revisoes.length;
  click(w,btn()); await espera(300);
  ok("abre a caixa", !$("#overlay").hidden && !!$("#formNovosConteudos"));
  $("#formNovosConteudos textarea").value="Regência\n  Concordância   verbal \n\ncrase\nRegência";
  $("#formNovosConteudos").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(400);
  const port=db(w).conteudos.filter(c=>c.disciplina==="Português").map(c=>c.nome).sort();
  ok("cria um por linha, sem repetir nem duplicar o que existe",
     JSON.stringify(port)===JSON.stringify(["Concordância verbal","Crase","Regência"]), port);
  ok("nada vai para Legislação", db(w).conteudos.filter(c=>c.disciplina==="Legislação").length===1);
  ok("fecha a caixa", $("#overlay").hidden);
  ok("nada entra na agenda", db(w).revisoes.length===revsAntes, [revsAntes,db(w).revisoes.length]);
  const txt=$("#view").textContent;
  ok("os novos aparecem como 'a estudar'", /Regência2?.*a estudar/.test(txt) || /0 sessões · a estudar/.test(txt), txt.slice(0,400));
  ok("Crase, que tem sessão, segue em andamento", /Crase\s*em andamento\s*1 sessão/.test(txt));
  ok("o resumo conta os a estudar à parte", /2 a estudar/.test(txt) && /1 em andamento/.test(txt));

  // tudo repetido: avisa e não fecha
  click(w,btn()); await espera(300);
  $("#formNovosConteudos textarea").value="Crase";
  $("#formNovosConteudos").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("só repetido: avisa e mantém a caixa", !$("#overlay").hidden && /já existe/.test($("#erroNovosConteudos").textContent),
     $("#erroNovosConteudos").textContent);

  // lista numerada, como vem do edital — numa linha só, uma por linha e misturado (pedido do Pedro, 24/09)
  $("#formNovosConteudos textarea").value="1. Pontuação 2. Ortografia\n3) Semântica\n1.1 Lei 8.112/1990\n- Estilística\n4 - Fonologia\n5.Morfologia 6.Sintaxe\nFonética\nEstrutura 2. Formação 3. Flexão";
  $("#formNovosConteudos").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  const novosNum=db(w).conteudos.filter(c=>c.disciplina==="Português").map(c=>c.nome);
  ok("lista numerada vira um conteúdo por item, sem o número",
     ["Pontuação","Ortografia","Semântica","Lei 8.112/1990","Estilística","Fonologia","Morfologia","Sintaxe","Fonética","Estrutura","Formação","Flexão"].every(n=>novosNum.includes(n)) &&
     !novosNum.some(n=>/^\d|^-/.test(n)), novosNum);
  click(w,btn()); await espera(300);

  // ✓ concluir disciplina: pula os a estudar, e o estudado ganha revisões
  click(w,$('[data-acao="fechar-modal"]')); await espera(200);
  const cb=$('[data-acao="concluir-disciplina"][data-disc="Português"]');
  ok("o botão avisa que os a estudar ficam de fora", cb && /14 conteúdos a estudar/.test(cb.title), cb && cb.title);
  click(w,cb); await espera(400);
  const fichas=Object.fromEntries(db(w).conteudos.filter(c=>c.disciplina==="Português").map(c=>[c.nome,c.fase]));
  ok("Crase é concluída", fichas["Crase"]==="concluido", fichas);
  ok("os a estudar continuam abertos", fichas["Regência"]==="andamento" && fichas["Concordância verbal"]==="andamento", fichas);
  const revsCrase=db(w).revisoes.filter(r=>r.registroId==="r2" && !r.feita);
  ok("Crase ganha revisões (não mais a volta)", revsCrase.length>0 && revsCrase.every(r=>!r.retomada), revsCrase);
  ok("os a estudar seguem sem nada na agenda",
     !db(w).revisoes.some(r=>(r.assuntos||[]).some(a=>/Regência|Concordância/.test(a))));
  ok("sem nada estudado em aberto, sobra reabrir", !$('[data-acao="concluir-disciplina"][data-disc="Português"]') &&
     !!$('[data-acao="reabrir-disciplina"][data-disc="Português"]'));
}catch(e){console.log("ERRO",e);falhas++;}
console.log(falhas?falhas+" FALHA(S)":"criar conteúdo pela aba Disciplinas funcionando");process.exit(falhas?1:0);})();
