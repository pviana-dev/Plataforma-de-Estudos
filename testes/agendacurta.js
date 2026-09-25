/* A AGENDA MOSTRA SÓ O QUE VEM LOGO (pedido do Pedro, 23/09): de cada conteúdo,
   as 2 próximas revisões e a próxima retomada — cumprida uma, a seguinte
   aparece. "Todas as agendadas" mostra a escada inteira. E o topo diz que dia
   é hoje, em todas as abas. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass,extra)=>Object.assign({id,data:dia(-10),disciplina:"Legislação",assuntos:[ass],assunto:ass,minutos:60,
  questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const rev=(id,reg,data,extra)=>Object.assign({id,registroId:reg,data,ordem:1,feita:false,feitaEm:null,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:dia(30),posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"concluido",concluidoEm:dia(-10)},
             {id:"c2",disciplina:"Legislação",nome:"Licitações",fase:"andamento"}],
  registros:[sess("r1","LAI"), sess("r2","Licitações")],
  revisoes:[rev("a1","r1",dia(-1)), rev("a2","r1",dia(3)), rev("a3","r1",dia(8)), rev("a4","r1",dia(20)),
            rev("v1","r2",dia(2),{retomada:true}), rev("v2","r2",dia(5),{retomada:true,manual:true})],
  erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba:"revisoes",gravadoEm:hoje,visaoAgenda:"assunto"},tela||{})));
     w.confirm=()=>true; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const idsNaTela=w=>[...w.document.querySelectorAll("#view [data-id]")].map(e=>e.dataset.id);
const aparece=(w,id)=>idsNaTela(w).includes(id);

(async()=>{try{
  let w=abrir(); await espera(400);
  // hoje fica no botão da prova, embaixo dela (pedido do Pedro, 23/09)
  const chip=w.document.querySelector("#chipData");
  const [a,m,d]=hoje.split("-");
  ok("o botão da prova diz que dia é hoje", /Hoje/.test(chip.querySelector(".hoje-rot").textContent) &&
     chip.querySelector(".hoje-data").textContent===d+"/"+m+"/"+a, chip.textContent);
  ok("com o dia da semana ao passar o mouse", /(domingo|segunda|terça|quarta|quinta|sexta|sábado)/.test(chip.querySelector(".hoje-data").title),
     chip.querySelector(".hoje-data").title);
  ok("e não fica mais embaixo do nome da plataforma", !w.document.querySelector("#hojeTopo"));
  click(w, w.document.querySelector('[data-aba="registros"]')); await espera(200);
  ok("e continua lá em outra aba", /Hoje/.test(w.document.querySelector("#chipData").textContent));
  click(w, w.document.querySelector('[data-aba="revisoes"]')); await espera(250);

  ok("por padrão, 'Só as próximas' vem marcado",
     w.document.querySelector('[data-acao="agenda-completa"][data-valor="false"]').getAttribute("aria-selected")==="true");
  ok("LAI mostra só as 2 próximas revisões (a atrasada conta)", aparece(w,"a1") && aparece(w,"a2") && !aparece(w,"a3") && !aparece(w,"a4"),
     idsNaTela(w));
  ok("Licitações mostra só a próxima retomada", aparece(w,"v1") && !aparece(w,"v2"), idsNaTela(w));
  // a frase "2 revisões e 1 retomada por conteúdo · N itens mais adiante" saiu a pedido do Pedro (23/09)
  ok("a barra não traz frase explicativa, só os dois botões", !/mais adiante|por conteúdo/.test(w.document.querySelector(".filtros-agenda").textContent),
     w.document.querySelector(".filtros-agenda").textContent);
  ok("a linha diz que a escolha é das revisões", /Revisões:/.test(w.document.querySelector(".filtros-agenda").textContent),
     w.document.querySelector(".filtros-agenda").textContent);
  ok("e os dois botões são os menores da barra", w.document.querySelectorAll('.aba-mini[data-acao="agenda-completa"]').length===2);

  click(w, w.document.querySelector('[data-acao="agenda-completa"][data-valor="true"]')); await espera(250);
  ok("'Todas as agendadas' mostra a escada inteira", ["a1","a2","a3","a4","v1","v2"].every(id=>aparece(w,id)), idsNaTela(w));
  ok("a escolha fica guardada na tela", JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).agendaCompleta===true);

  /* à medida que anda: cumprida a atrasada, a terceira aparece */
  const s2=JSON.parse(JSON.stringify(seed)); s2.revisoes[0].feita=true; s2.revisoes[0].feitaEm=dia(-1);
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(ww){ ww.__semLogin=true; ww.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s2));
     ww.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje,visaoAgenda:"assunto"})); }});
  w=dom.window; await espera(400);
  ok("cumprida uma, a seguinte aparece — continuam duas", aparece(w,"a2") && aparece(w,"a3") && !aparece(w,"a4"), idsNaTela(w));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nagenda curta e data de hoje funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
