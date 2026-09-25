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
const hoje=iso(new Date());
const mais=n=>iso(new Date(Date.now()+n*864e5));
const assuntos=["LAI","Crase","Licitações","Verbos","Improbidade","Concordância"];
const registros=assuntos.map((a,i)=>({id:"r"+i,data:hoje,disciplina:i%2?"Português":"Legislação",
  assuntos:[a],assunto:a,minutos:30,questoes:10,acertos:6,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:i+1}));
const revisoes=assuntos.map((a,i)=>({id:"v"+i,registroId:"r"+i,data:mais(i+1),ordem:1,feita:false,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}));
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],grupos:[],registros,revisoes,erros:[],lancamentos:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document;
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const txt=()=>doc.querySelector("#view").textContent;
setTimeout(()=>{
  // 3. o cronômetro ganhou destaque na aba Hoje
  click(doc.querySelector('[data-aba="hoje"]'));
  setTimeout(()=>{
    const cards=[...doc.querySelectorAll("#view .card")];
    const crono=doc.querySelector(".card-crono");
    ok("a aba Hoje tem um card próprio do cronômetro", !!crono);
    ok("o cronômetro está entre os primeiros cards da tela", cards.indexOf(crono)<=1, cards.indexOf(crono));
    ok("o cronômetro continua funcional (destino + botão)",
       !!crono.querySelector('[name="destino"],select,#crono-destino') && /Cronômetro/.test(crono.textContent));

    // "Próximos 7 dias" mostra uma amostra ainda menor, com o mesmo "+"
    const prox=[...doc.querySelectorAll("#view .card")].find(c=>/Próximos 7 dias/.test(c.textContent));
    ok("próximos 7 dias mostra só 3 revisões", prox.querySelectorAll(".item").length===3,
       prox.querySelectorAll(".item").length);
    const bp=prox.querySelector('[data-acao="toggle-proximas"]');
    ok("e traz o + com o total", !!bp && /\+ ver todas as 6/.test(bp.textContent), bp && bp.textContent);
    click(bp);
    setTimeout(()=>{
    const prox2=[...doc.querySelectorAll("#view .card")].find(c=>/Próximos 7 dias/.test(c.textContent));
    ok("o + abre todas as próximas", prox2.querySelectorAll(".item").length===6,
       prox2.querySelectorAll(".item").length);
    click(prox2.querySelector('[data-acao="toggle-proximas"]'));
    setTimeout(()=>{

    click(doc.querySelector('[data-aba="revisoes"]'));
    setTimeout(()=>{
      // 1. nome do card e da aba
      const aba=doc.querySelector('[data-aba="revisoes"]');
      ok("a aba se chama “Agenda”", aba.textContent.trim()==="Agenda", aba.textContent);
      verPorAssunto(doc, w);
      ok("“Rotina” não aparece mais em lugar nenhum",
         !/Rotina/.test(doc.body.textContent), doc.body.textContent.match(/.{0,30}Rotina.{0,30}/));
      ok("o card se chama “Agenda por assunto”", /Agenda por assunto/.test(txt()));
      ok("o nome antigo sumiu", !/Rotina por assunto/.test(txt()));

      // 2. só alguns assuntos, com "+" para ver todos
      let blocos=[...doc.querySelectorAll(".grupo-rev")];
      ok("mostra só os primeiros assuntos", blocos.length===4, blocos.length);
      const btn=doc.querySelector('[data-acao="toggle-assuntos"]');
      ok("existe o botão de ver todos", !!btn);
      ok("o botão diz quantos assuntos existem", /\+ ver todos os 6/.test(btn.textContent), btn && btn.textContent);

      click(btn);
      setTimeout(()=>{
        blocos=[...doc.querySelectorAll(".grupo-rev")];
        ok("ao clicar no +, todos os assuntos aparecem", blocos.length===6, blocos.length);
        const btn2=doc.querySelector('[data-acao="toggle-assuntos"]');
        ok("o botão vira “mostrar menos”", /mostrar menos/.test(btn2.textContent), btn2.textContent);
        click(btn2);
        setTimeout(()=>{
          ok("dá para voltar a esconder", doc.querySelectorAll(".grupo-rev").length===4,
             doc.querySelectorAll(".grupo-rev").length);
          ok("a preferência não vai para o banco",
             !/verTodosAssuntos/.test(w.localStorage.getItem("plataforma-estudos:v1")));
          console.log(falhas?"\n"+falhas+" FALHA(S)":"\nver todos os assuntos funcionando");
          process.exit(falhas?1:0);
        },150);
      },150);
    },220);
    },150);
    },150);
  },220);
},400);
