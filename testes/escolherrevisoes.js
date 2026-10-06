/* A JANELA DE CONCLUIR (pedido do Pedro, 06/10).
   - Concluir um conteúdo (ou uma disciplina) pergunta SEMPRE se as revisões
     automáticas devem nascer; só ao confirmar o conteúdo é concluído.
   - A janela mostra o cronograma inteiro: quantas revisões e quantos dias cada
     uma espera depois da anterior, com a data ao lado; tudo pode mudar.
   - Com vários conteúdos: um cronograma para todos ou um para cada.
   - O mesmo editor está na janela "✎ editar" do conteúdo concluído. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const off=d=>Math.round((new Date(d+"T12:00")-new Date(hoje+"T12:00"))/864e5);
const sess=(id,nome,extra)=>Object.assign({id,data:dia(-5),disciplina:"Legislação",assuntos:[nome],assunto:nome,
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.replace(/\D/g,""))||1},extra||{});
const ficha=(nome,extra)=>Object.assign({id:"c-"+nome,disciplina:"Legislação",nome,fase:"andamento",concluidoEm:null,criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[ficha("LAI"),ficha("LGPD")],registros:[sess("r1","LAI"),sess("r2","LGPD")],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed, nativo){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"conteudos",gravadoEm:hoje}));
     if (nativo){ w.__confirmarNativo=true; w.confirm=()=>true; } w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const fichaDe=(w,n)=>db(w).conteudos.find(c=>c.nome===n);
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const digitar=(w,el,v)=>{ el.value=String(v); el.dispatchEvent(new w.Event("input",{bubbles:true})); };
const escada=(w,n)=>db(w).revisoes.filter(r=>!r.feita&&!r.retomada&&(r.assuntos||[]).includes(n)).map(r=>off(r.data)).sort((a,b)=>a-b);
const botaoConcluir=(w,n)=>[...w.document.querySelectorAll('[data-acao="concluir-conteudo"]')].find(b=>(b.dataset.conts||"").split("|").includes(n));
const dialogo=w=>w.document.getElementById("dialogo");
const enviar=w=>w.document.querySelector("#formDialogo").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));

(async()=>{
  /* ---- 1. a janela abre, mostra a sugestão com datas, e cancelar não conclui ---- */
  let w=abrir(base()); await espera(400);
  click(w, botaoConcluir(w,"LAI")); await espera(150);
  ok("concluir abre a janela", !dialogo(w).hidden, null);
  const doc=w.document;
  const linhas=()=>[...doc.querySelectorAll("#dialogo .linha-escada")];
  ok("com a caixa de criar revisões automáticas, marcada", doc.querySelector('[name="criarAuto"]').checked, null);
  ok("e o cronograma sugerido (médio: 7 revisões)", linhas().length===7, linhas().length);
  ok("os dias de cada revisão vêm preenchidos (1, 2, 4…)",
     linhas().slice(0,3).map(l=>l.querySelector('[name="passo"]').value).join()==="1,2,4",
     linhas().map(l=>l.querySelector('[name="passo"]').value));
  ok("cada linha mostra a data", /\d\d\/\d\d/.test(linhas()[0].querySelector(".data-escada").textContent),
     linhas()[0].textContent);
  ok("a 1ª cai amanhã", linhas()[0].querySelector(".data-escada").textContent.includes(dia(1).slice(8,10)+"/"+dia(1).slice(5,7)),
     linhas()[0].textContent);
  click(w, doc.querySelector('#dialogo [data-dialogo="cancelar"]')); await espera(150);
  ok("cancelar fecha a janela", dialogo(w).hidden, null);
  ok("e o conteúdo NÃO é concluído", fichaDe(w,"LAI").fase==="andamento", fichaDe(w,"LAI"));

  /* ---- 2. escolher 3 revisões com dias próprios ---- */
  click(w, botaoConcluir(w,"LAI")); await espera(150);
  digitar(w, doc.querySelector('#dialogo [name="quantas"]'), 3); await espera(50);
  ok("mudar a quantidade refaz as linhas", linhas().length===3, linhas().length);
  const passos=linhas().map(l=>l.querySelector('[name="passo"]'));
  digitar(w, passos[0], 2); digitar(w, passos[1], 5); digitar(w, passos[2], 10); await espera(50);
  ok("a data acompanha o dia escrito (2 + 5 = D+7)",
     linhas()[1].querySelector(".data-escada").textContent.includes(dia(7).slice(8,10)+"/"+dia(7).slice(5,7)),
     linhas()[1].textContent);
  ok("a prévia não mexe nos dados", fichaDe(w,"LAI").fase==="andamento" && escada(w,"LAI").length===0, escada(w,"LAI"));
  enviar(w); await espera(300);
  ok("confirmar conclui", fichaDe(w,"LAI").fase==="concluido", fichaDe(w,"LAI"));
  ok("com as revisões escolhidas: D+2, D+7, D+17", escada(w,"LAI").join()==="2,7,17", escada(w,"LAI"));
  ok("e o cronograma fica guardado no conteúdo", JSON.stringify(fichaDe(w,"LAI").escada)==="[2,5,10]", fichaDe(w,"LAI").escada);

  /* ---- 3. desmarcar a caixa: conclui sem revisões automáticas ---- */
  click(w, botaoConcluir(w,"LGPD")); await espera(150);
  const chave=doc.querySelector('[name="criarAuto"]');
  chave.checked=false; chave.dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("sem a caixa, o cronograma some e a nota aparece",
     doc.querySelector("#painelEscadaConcluir").hidden && !doc.querySelector("#notaSemAuto").hidden, null);
  enviar(w); await espera(300);
  ok("conclui mesmo assim", fichaDe(w,"LGPD").fase==="concluido", fichaDe(w,"LGPD"));
  ok("sem nenhuma revisão automática", escada(w,"LGPD").length===0 && fichaDe(w,"LGPD").semAutomaticas===true,
     [escada(w,"LGPD"), fichaDe(w,"LGPD")]);

  /* ---- 4. concluir disciplina: um cronograma para cada ---- */
  w=abrir(base()); await espera(400);
  click(w, w.document.querySelector('[data-acao="concluir-disciplina"]')); await espera(150);
  const d2=w.document;
  ok("concluir disciplina também abre a janela", !dialogo(w).hidden && !!d2.querySelector('[name="modoEscada"]'), null);
  ok("começa com um cronograma para todos", d2.querySelectorAll("#dialogo .bloco-escada").length===1, null);
  const cada=d2.querySelector('[name="modoEscada"][value="cada"]');
  cada.checked=true; cada.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(50);
  const blocos=[...d2.querySelectorAll("#dialogo .bloco-escada")];
  ok("um para cada: dois blocos com o nome do conteúdo", blocos.length===2 && /LAI/.test(blocos[0].textContent) && /LGPD/.test(blocos[1].textContent),
     blocos.map(b=>b.querySelector(".cab-escada").textContent));
  digitar(w, blocos[0].querySelector('[name="quantas"]'), 1);
  digitar(w, blocos[1].querySelector('[name="quantas"]'), 2); await espera(30);
  digitar(w, blocos[1].querySelectorAll('[name="passo"]')[1], 3); await espera(30);
  enviar(w); await espera(300);
  ok("os dois concluídos", fichaDe(w,"LAI").fase==="concluido" && fichaDe(w,"LGPD").fase==="concluido", null);
  ok("LAI com 1 revisão (D+1)", escada(w,"LAI").join()==="1", escada(w,"LAI"));
  ok("LGPD com 2 revisões (D+1, D+4)", escada(w,"LGPD").join()==="1,4", escada(w,"LGPD"));

  /* ---- 5. ✎ editar: o mesmo cronograma, e mudar refaz as pendentes ---- */
  click(w, [...w.document.querySelectorAll('[data-acao="renomear-conteudo"]')].find(b=>b.dataset.cont==="LGPD")); await espera(150);
  const d3=w.document, bl=d3.querySelector("#cronogramaConteudo .bloco-escada");
  ok("a janela do conteúdo traz o cronograma", !!bl && bl.querySelectorAll(".linha-escada").length===2, bl && bl.textContent);
  digitar(w, bl.querySelector('[name="quantas"]'), 3); await espera(30);
  digitar(w, bl.querySelectorAll('[name="passo"]')[2], 6); await espera(30);
  ok("com as datas na prévia", /\d\d\/\d\d/.test(bl.querySelectorAll(".data-escada")[2].textContent), bl.textContent);
  enviar(w); await espera(300);
  ok("salvar refaz a escada: D+1, D+4, D+10", escada(w,"LGPD").join()==="1,4,10", escada(w,"LGPD"));
  ok("e guarda o cronograma", JSON.stringify(fichaDe(w,"LGPD").escada)==="[1,3,6]", fichaDe(w,"LGPD").escada);

  /* ---- 6. a mudança de dificuldade não mexe no cronograma escolhido ---- */
  w=abrir(base({conteudos:[ficha("LAI",{fase:"concluido",concluidoEm:hoje,escada:[3,3]}),ficha("LGPD")]}), true); await espera(400);
  ok("cronograma guardado vale na garantia de revisão", escada(w,"LAI").join()==="3,6", escada(w,"LAI"));

  /* ---- 7. igual à sugestão: nada fica guardado (segue a dificuldade) ---- */
  w=abrir(base()); await espera(400);
  click(w, botaoConcluir(w,"LAI")); await espera(150);
  enviar(w); await espera(300);
  ok("sem mexer: concluído, escada sugerida, nada guardado", fichaDe(w,"LAI").fase==="concluido" &&
     escada(w,"LAI")[0]===1 && !("escada" in fichaDe(w,"LAI")), [escada(w,"LAI"), fichaDe(w,"LAI")]);

  console.log(falhas ? falhas+" FALHA(S)" : "janela de concluir e cronograma escolhido funcionando");
  process.exit(falhas?1:0);
})().catch(e=>{console.log("ERRO",e);process.exit(1);});
