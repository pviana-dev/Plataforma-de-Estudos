/* Esta suíte conta itens da lista: abre em "Todas as agendadas" (o padrão mostra só as 2 próximas revisões e a próxima retomada de cada conteúdo). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
const rev=(id,d,o)=>({id,registroId:"rA",data:d,ordem:o,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"}],
 revisoes:[rev("v1",hoje,1),rev("v2",dia(1),2),rev("v3",dia(2),3),rev("v4",dia(3),4),rev("v5",dia(4),5),
           rev("v6",dia(5),6),rev("v7",dia(6),7),rev("v8",dia(7),8),rev("v9",dia(7),9)],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({agendaCompleta:true,gravadoEm:new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-"+String(new Date().getDate()).padStart(2,"0")}));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  await espera(350);
  /* ---- Hoje ---- */
  const t=$("#view").textContent;
  ok("sumiu 'resolva questões, não releia'", !/resolva questões/.test(t));
  const prox=[...doc.querySelectorAll(".card")].find(c=>/Próximos 7 dias/.test(c.textContent));
  ok("próximos 7 dias mostra uma amostra curta (3 cards)", prox.querySelectorAll(".item").length===3,
     prox.querySelectorAll(".item").length);
  ok("e oferece ver todas", !!doc.querySelector('[data-acao="toggle-proximas"]'),
     prox.textContent.slice(-40));
  click(doc.querySelector('[data-acao="toggle-proximas"]')); await espera(250);
  const prox2=[...doc.querySelectorAll(".card")].find(c=>/Próximos 7 dias/.test(c.textContent));
  ok("expandindo, mostra todas", prox2.querySelectorAll(".item").length===8,
     prox2.querySelectorAll(".item").length);
  ok("e dá para recolher", /mostrar menos/.test(prox2.textContent));

  const hojeCard=[...doc.querySelectorAll(".card")].find(c=>/Registrado hoje/.test(c.textContent));
  ok("existe o bloco de registros de hoje", !!hojeCard);
  ok("com tipo e tempo, sem questões",
     /estudo/.test(hojeCard.textContent) && /1h/.test(hojeCard.textContent) && !/Questões/.test(hojeCard.textContent),
     hojeCard.textContent.replace(/\s+/g," ").slice(0,160));

  /* ---- cronômetro ---- */
  const dest=[...$("#cronoDestino").options].map(o=>o.textContent);
  ok("o cronômetro não oferece mais revisões direto", !dest.some(t=>/atrasada|revisão de/i.test(t)), dest);
  ok("mas oferece as sessões de hoje", dest.some(t=>/LAI/.test(t)), dest);

  /* ---- Registros: filtro de tipo e excluir fora da linha ---- */
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  ok("existe o filtro por tipo", !!$("#fTipo"), [...doc.querySelectorAll(".filtros select")].map(s=>s.id));
  ok("o botão de excluir saiu da linha", !doc.querySelector('tbody [data-acao="excluir-registro"]'));
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA")); await espera(300);
  ok("e continua dentro da tela de edição", !!doc.querySelector('#modalCaixa [data-acao="excluir-registro"]'));
  click(doc.querySelector('#overlay [data-acao="fechar-modal"]')); await espera(250);

  /* ---- formulário de revisão manual: só agenda ---- */
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  click(doc.querySelector('[data-acao="nova-revisao"]')); await espera(300);
  const f=$("#modalCorpo #formRevisao");
  ok("a revisão manual não pede mais tempo", !f.querySelector("[name=minutos]"));
  ok("nem questões", !f.querySelector("[name=questoes]"));
  ok("nem 'já revisei'", !f.querySelector("[name=feita]"));
  ok("nem atividade", !f.querySelector("[name=atividade]"));
  ok("e explica onde o tempo entra", /entram na <b>sessão de estudo<\/b>/.test(f.innerHTML));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\netapas 4 a 7 ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
