/* Esta suíte conta itens da lista: abre em "Todas as agendadas" (o padrão mostra só as 2 próximas revisões e a próxima retomada de cada conteúdo). */
/* A aba Agenda tem três visões da mesma informação: por dia (padrão), por
   assunto e mês. O que muda é a apresentação — os itens são os mesmos. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass)=>({id,data:dia(-10),disciplina:"Legislação",assuntos:[ass],assunto:ass,minutos:60,questoes:0,
  acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const rev=(id,regId,data,extra)=>Object.assign({id,registroId:regId,data,ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
/* revisarAte curto: a escada é completada na carga (garantia de revisão), e esta suíte é sobre a tela, não sobre quantas revisões cabem. */
const seed={versao:1,tema:"claro",dataProva:"",revisarAte:dia(6),posProva:"",metaDiariaMin:120,
 fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 conteudos:[{id:"c1",nome:"LAI",disciplina:"Legislação",fase:"concluido",concluidoEm:dia(-10),criadoEm:1},
            {id:"c2",nome:"Licitações",disciplina:"Legislação",fase:"andamento",concluidoEm:null,criadoEm:2}],
 registros:[sess("r1","LAI"), sess("r2","Licitações")],
 revisoes:[rev("v0","r1",dia(-2)),                 // atrasada
           rev("v1","r1",hoje),                     // hoje
           rev("v2","r1",dia(1)), rev("v3","r1",dia(1)), rev("v4","r1",dia(6)),
           rev("v5","r2",dia(2),{retomada:true})],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",agendaCompleta:true,gravadoEm:hoje}));
   w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const visao=v=>click(doc.querySelector('[data-acao="visao-agenda"][data-visao="'+v+'"]'));
const titulos=()=>[...doc.querySelectorAll("#view .card h2")].map(h=>h.textContent.trim().split(" ")[0]);

(async()=>{try{
  await espera(450);
  /* ---- a aba mudou de nome e abre por dia ---- */
  // o "1" do fim é o contador de pendências da aba
  ok("a aba se chama Agenda",
     doc.querySelector('[data-aba="revisoes"]').textContent.trim().replace(/\d+$/,"")==="Agenda",
     doc.querySelector('[data-aba="revisoes"]').textContent);
  const sel=[...doc.querySelectorAll('[data-acao="visao-agenda"]')];
  ok("há três visões", sel.length===3, sel.map(b=>b.dataset.visao));
  ok("e a padrão é Por dia", sel.find(b=>b.getAttribute("aria-selected")==="true").dataset.visao==="dia");

  /* ---- por dia ---- */
  ok("o que é de hoje vem primeiro", /Agenda de hoje/.test($("#view").textContent));
  ok("as atrasadas têm card próprio", !!$("#revisoes-atrasadas"));
  ok("e há o bloco dos próximos dias", /Próximos dias/.test($("#view").textContent), titulos());
  const blocos=[...doc.querySelectorAll(".dia-bloco")];
  ok("os próximos são agrupados por dia", blocos.length===3, blocos.length);
  ok("o dia com dois itens junta os dois",
     blocos.some(b=>b.querySelectorAll(".item").length===2),
     blocos.map(b=>b.querySelectorAll(".item").length));
  ok("cada bloco diz quando é", /amanhã/.test(blocos[0].textContent), blocos[0].textContent.slice(0,60));
  ok("os cards por assunto NÃO aparecem nesta visão", !doc.querySelector(".grupo-rev"));

  /* ---- por assunto ---- */
  visao("assunto"); await espera(350);
  ok("na visão por assunto voltam os blocos por conteúdo", doc.querySelectorAll(".grupo-rev").length===2,
     doc.querySelectorAll(".grupo-rev").length);
  ok("e some a lista por dia", !/Próximos dias/.test($("#view").textContent));
  ok("as atrasadas continuam ali", !!$("#revisoes-atrasadas"));
  ok("o botão de fechar o conteúdo segue no card",
     !!doc.querySelector('[data-acao="concluir-conteudo"]'));

  /* ---- mês ---- */
  visao("mes"); await espera(350);
  ok("a visão de mês desenha o calendário", !!$(".cal-dias"), titulos());
  const cel=doc.querySelector('.cal-dia[data-dia="'+hoje+'"]');
  ok("o dia de hoje está marcado", !!cel && cel.classList.contains("hoje"), cel && cel.className);
  ok("dias com item ganham pontinho",
     [...doc.querySelectorAll(".cal-dia .pt")].length>=3,
     [...doc.querySelectorAll(".cal-dia .pt")].length);
  ok("o dia atrasado sai em vermelho",
     (doc.querySelector('.cal-dia[data-dia="'+dia(-2)+'"]').getAttribute("style")||"").includes("critico"),
     doc.querySelector('.cal-dia[data-dia="'+dia(-2)+'"]').getAttribute("style"));
  click(doc.querySelector('.cal-dia[data-dia="'+dia(1)+'"]')); await espera(350);
  ok("clicar num dia abre o que há nele",
     [...doc.querySelectorAll("#view .item")].length>=2, doc.querySelectorAll("#view .item").length);
  ok("e o dia fica selecionado",
     doc.querySelector('.cal-dia[data-dia="'+dia(1)+'"]').classList.contains("sel"));
  click(doc.querySelector('[data-acao="mes-agenda"][data-delta="1"]')); await espera(350);
  ok("dá para avançar de mês", !/setembro/.test($(".cal-cab b").textContent), $(".cal-cab b").textContent);

  /* ---- a escolha é lembrada ---- */
  const tela=JSON.parse(w.localStorage.getItem("plataforma-estudos:tela"));
  ok("a visão escolhida fica guardada", tela.visaoAgenda==="mes", tela.visaoAgenda);
  ok("e o dia escolhido também", tela.diaAgenda===dia(1), tela.diaAgenda);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntrês visões da agenda funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
