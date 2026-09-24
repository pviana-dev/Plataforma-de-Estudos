/* Conteúdo EM ANDAMENTO tem cards de "Continuar" (até 24/09, "Retomar"); conteúdo CONCLUÍDO tem revisões.
   A tela de edição é a mesma para os dois — e precisa falar a língua certa. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,ass)=>({id,data:dia(-5),disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,
  questoes:10,acertos:8,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Português",nome:"Crase",fase:"concluido",concluidoEm:dia(-5)}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[Object.assign(sess("r1","Legislação","LAI"),{fase:"andamento"}),
            Object.assign(sess("r2","Português","Crase"),{fase:"concluido",concluidoEm:dia(-5)})],
 revisoes:[
   {id:"v1",registroId:"r1",data:dia(1),ordem:1,retomada:true,feita:false,manual:false,
    minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
   {id:"v2",registroId:"r2",data:dia(2),ordem:1,feita:false,manual:false,
    minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",
     JSON.stringify({aba:"revisoes",visaoAgenda:"assunto",verTodosAssuntos:true,gravadoEm:hoje})); }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const lim=s=>s.replace(/\s+/g," ").trim();
const abrirEdicao=async id=>{
  click([...doc.querySelectorAll('[data-acao="editar-revisao"]')].find(b=>b.dataset.id===id));
  await espera(400);
};
const fechar=async()=>{ click($('[data-acao="fechar-modal"]')); await espera(300); };

(async()=>{try{
  await espera(450);

  /* ---- 1. a volta, na agenda, já se chama Retomar ---- */
  ok("o item do conteúdo em andamento se chama Continuar", /Continuar/.test($("#view").textContent),
     lim($("#view").textContent).slice(0,200));

  /* ---- 2. a tela de edição de uma VOLTA ---- */
  await abrirEdicao("v1");
  ok("o título é 'Editar card'", $("#modalTitulo").textContent==="Editar card",
     $("#modalTitulo").textContent);
  const corpo=lim($("#modalCaixa").textContent);
  ok("não sobrou o termo 'revisão' nos rótulos dos campos",
     !/Data da revisão|Nome da revisão|Conteúdos revisados|Detalhes da revisão/.test(corpo), corpo.slice(0,300));
  ok("os campos falam do card de continuar",
     /Data do card/.test(corpo) && /Nome do card/.test(corpo) &&
     /Conteúdos a continuar/.test(corpo) && /Detalhes do card/.test(corpo), corpo.slice(0,300));
  ok("a tela explica que isto é para continuar, não uma revisão",
     /continuar o conteúdo/.test(corpo) && /em andamento/.test(corpo), corpo.slice(0,220));
  ok("o nome sugerido é 'Continuar', não 'Revisão 1'",
     $('#modalCaixa [name="rotulo"]').placeholder==="Continuar",
     $('#modalCaixa [name="rotulo"]').placeholder);
  ok("o botão de apagar diz 'Excluir card'",
     /Excluir card/.test($('#modalCaixa [data-acao="excluir-revisao"]').textContent),
     $('#modalCaixa [data-acao="excluir-revisao"]').textContent);
  ok("sem a frase-guia do rodapé", !/não ficam aqui/.test(corpo) && !/cumprir esta revisão/.test(corpo)); // frase-guia tirada a pedido do Pedro (24/09)
  await fechar();

  /* ---- 3. a tela de edição de uma REVISÃO de verdade não mudou ---- */
  await abrirEdicao("v2");
  ok("conteúdo concluído continua falando de revisão",
     $("#modalTitulo").textContent==="Editar revisão", $("#modalTitulo").textContent);
  const corpo2=lim($("#modalCaixa").textContent);
  ok("com os rótulos de sempre",
     /Data da revisão/.test(corpo2) && /Conteúdos revisados/.test(corpo2), corpo2.slice(0,260));
  ok("e sem o aviso da volta", !/volta ao conteúdo/.test(corpo2), corpo2.slice(0,200));
  await fechar();

  /* ---- 4. a ordem dos assuntos é alfabética ---- */
  const titulos=[...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent);
  /* as revisões entram na ordem v1 (LAI) → v2 (Crase); sem a ordenação nova a
     lista sairia nessa ordem, então o teste pega a diferença de verdade */
  ok("os cards por assunto vêm em ordem alfabética", titulos.join()==="Crase,LAI", titulos);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nvocabulário da retomada e ordem alfabética ok");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
