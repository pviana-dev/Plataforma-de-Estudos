/* PREPARAR PARA O CELULAR (24/09, itens 3, 5, 7, 8 e 9 do LEVANTAMENTO-CELULAR.md).
   O layout em si (cartões, barra de abas embaixo) é CSS de tela estreita e foi
   conferido no Chrome com emulação de celular — o jsdom não tem layout. Aqui
   vai o que é comportamento: as setas ↑ ↓ de toque movem e GRAVAM a ordem (no
   mural e nas anotações), e a lista de sessões traz as marcas de cada campo
   (s-cont, s-data…) de que os cartões dependem. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const ficha=(disc,nome,criadoEm)=>({id:"c-"+nome,disciplina:disc,nome,fase:"andamento",concluidoEm:null,criadoEm});
const anot=(id,txt,criadoEm)=>({id,disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:txt,
  categoria:"",refeita:false,importante:false,criadoEm});
const agora=Date.now();
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[ficha("Legislação","LAI",1),ficha("Legislação","LGPD",2),ficha("Legislação","Licitações",3),ficha("Legislação","Improbidade",4)],
  registros:[{id:"r1",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,
    dificuldade:2,anotacoes:"li a lei",tipo:"estudo",criadoEm:1}],
  revisoes:[],erros:[anot("a1","primeira",agora),anot("a2","segunda",agora-1000),anot("a3","terceira",agora-2000)],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(s,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba,gravadoEm:hoje})); w.confirm=()=>true; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  /* ---- mural: ↑ ↓ de toque ---- */
  let w=abrir(seed,"hoje"); await espera(400);
  const mural=()=>[...w.document.querySelectorAll(".mural-item .mural-nome b")].map(b=>b.textContent);
  ok("cada item do mural tem ↑ e ↓ de toque", [...w.document.querySelectorAll(".mural-item")].every(i=>
     i.querySelectorAll('[data-acao="mover-toque"]').length===2));
  ok("ordem inicial: a do cadastro", mural().join()==="LGPD,Licitações,Improbidade", mural());
  click(w,w.document.querySelector('[data-acao="mover-toque"][data-tipo="afazer"][data-id="legislação|improbidade"][data-passo="-1"]')); await espera(150);
  ok("↑ sobe um lugar", mural().join()==="LGPD,Improbidade,Licitações", mural());
  click(w,w.document.querySelector('[data-acao="mover-toque"][data-tipo="afazer"][data-id="legislação|lgpd"][data-passo="1"]')); await espera(150);
  ok("↓ desce um lugar", mural().join()==="Improbidade,LGPD,Licitações", mural());
  click(w,w.document.querySelector('[data-acao="mover-toque"][data-tipo="afazer"][data-id="legislação|improbidade"][data-passo="-1"]')); await espera(150);
  ok("↑ no primeiro não faz nada", mural().join()==="Improbidade,LGPD,Licitações", mural());
  w=abrir(db(w),"hoje"); await espera(400);
  ok("a ordem ficou gravada", mural().join()==="Improbidade,LGPD,Licitações", mural());
  ok("o card diz que dá para arrastar ou usar ↑ ↓", /arraste ou use ↑ ↓/.test(w.document.querySelector("#view").textContent));

  /* ---- anotações: ↑ ↓ de toque ---- */
  w=abrir(seed,"erros"); await espera(400);
  const notas=()=>[...w.document.querySelectorAll(".apr-item .aprendizado")].map(e=>e.textContent);
  ok("cada anotação tem ↑ e ↓ de toque", [...w.document.querySelectorAll(".apr-item")].every(i=>
     i.querySelectorAll('[data-acao="mover-toque"]').length===2));
  click(w,w.document.querySelector('[data-acao="mover-toque"][data-tipo="anotacao"][data-id="a3"][data-passo="-1"]')); await espera(150);
  ok("↑ sobe a anotação no card", notas().join()==="primeira,terceira,segunda", notas());
  const ordem=db(w).erros.slice().sort((a,b)=>a.ordem-b.ordem).map(e=>e.id);
  ok("e grava a ordem do card inteiro", ordem.join()==="a1,a3,a2", ordem);

  /* ---- sessões: as marcas dos cartões ---- */
  w=abrir(seed,"registros"); await espera(400);
  const tr=w.document.querySelector('tbody tr[data-id="r1"]');
  ok("a linha da sessão traz as marcas de cada campo (viram cartão no celular)",
     ["s-data","s-disc","s-tempo","s-cont","s-dif","s-tipo","s-acao"].every(c=>tr.querySelector("td."+c)),
     [...tr.querySelectorAll("td")].map(td=>td.className));
  ok("o conteúdo e a descrição ficam juntos no mesmo campo", /LAI/.test(tr.querySelector(".s-cont").textContent) &&
     /li a lei/.test(tr.querySelector(".s-cont").textContent));

  /* ---- filtros recolhíveis da aba Sessões ---- */
  const filtros=()=>w.document.querySelector(".filtros.recolhivel");
  const botao=()=>w.document.querySelector('[data-acao="toggle-filtros-reg"]');
  ok("os filtros de Sessões têm o botão 'Filtros' e começam recolhidos",
     !!botao() && !filtros().classList.contains("aberto") && botao().getAttribute("aria-expanded")==="false");
  click(w,botao()); await espera(150);
  ok("tocar em 'Filtros' abre os campos", filtros().classList.contains("aberto") && botao().getAttribute("aria-expanded")==="true");
  const sel=w.document.querySelector("#fTipo"); sel.value="estudo"; sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(150);
  ok("e o botão conta os filtros que estão valendo", /1 ativo/.test(botao().textContent) && filtros().classList.contains("aberto"),
     botao().textContent);

  /* ---- as outras tabelas que viram cartão ---- */
  w=abrir(Object.assign({},seed,{registros:[Object.assign({},seed.registros[0],{data:hoje,questoes:10,acertos:7})]}),"hoje"); await espera(400);
  ok("'Registrado hoje' traz as marcas do cartão", !!w.document.querySelector(".tab-hoje td.c-nome") &&
     !!w.document.querySelector(".tab-hoje td.c-fim"));
  w=abrir(Object.assign({},seed,{registros:[Object.assign({},seed.registros[0],{questoes:10,acertos:7})]}),"questoes"); await espera(400);
  const rot=[...w.document.querySelectorAll(".tab-desempenho td[data-rot]")].map(td=>td.dataset.rot+"="+td.textContent);
  ok("'Desempenho' leva o rótulo junto de cada número (o cabeçalho some no cartão)",
     rot.join()==="questões=10,acertos=7,erros=3", rot);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncelular: setas de toque e marcas dos cartões funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
