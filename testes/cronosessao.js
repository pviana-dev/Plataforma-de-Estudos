/* DO CRONÔMETRO ATÉ A SESSÃO (pedido do Pedro, 24/09). Com uma sessão escolhida
   como destino do tempo — antes de iniciar ou já rodando nela —, o cronômetro
   ganha "ver na aba Sessões →": leva à aba Sessões, rola até a linha e a acende.
   Sem sessão escolhida (nenhum destino, ou "Nova sessão"), o botão não aparece.
   Um filtro que esconderia a sessão é limpo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
const reg=(id,disc,ass)=>({id,data:hoje,disciplina:disc,assuntos:[ass],assunto:ass,minutos:30,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:id.charCodeAt(1)});
const seed=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,
 planosManuaisMigrados:true,
 conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"},{id:"c2",disciplina:"Português",nome:"Crase",fase:"andamento"}],
 registros:[reg("r1","Legislação","LAI"), reg("r2","Português","Crase")],revisoes:[],erros:[],cronometro:null}, extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(s, tela){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify(Object.assign({aba:"hoje",gravadoEm:hoje},tela||{})));
     w.confirm=()=>true; w.HTMLElement.prototype.scrollIntoView=function(){ w.__rolou=this; }; }});
  return dom.window;
}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const escolher=(w,v)=>{ const sel=w.document.querySelector("#cronoDestino"); sel.value=v; sel.dispatchEvent(new w.Event("change",{bubbles:true})); };
const botao=w=>w.document.querySelector('.card-crono [data-acao="ir-para-sessao"]');

(async()=>{try{
  // antes de iniciar: só com sessão escolhida
  let w=abrir(seed(), {fDisciplina:"Português"}); await espera(400);
  ok("sem destino escolhido, não há botão", !botao(w));
  escolher(w,"novo"); await espera(150);
  ok("com 'Nova sessão', também não", !botao(w));
  escolher(w,"registro:r1"); await espera(150);
  ok("escolhida uma sessão, aparece 'ver na aba Sessões →'", !!botao(w) && botao(w).dataset.id==="r1" &&
     /ver na aba Sessões/.test(botao(w).textContent));
  click(w,botao(w)); await espera(250);
  const linha=w.document.querySelector('tbody tr[data-id="r1"]');
  ok("leva à aba Sessões, com a linha da sessão na tela", w.document.querySelector('[data-aba="registros"]').getAttribute("aria-selected")==="true" && !!linha);
  ok("o filtro que escondia a sessão (Português) foi limpo", !w.document.querySelector("#fDisciplina").value);
  ok("rola até a linha e a acende", w.__rolou===linha && linha.classList.contains("realce"));
  ok("e não abre a edição por cima", w.document.querySelector("#overlay").hidden);

  // rodando numa sessão: o botão continua lá
  w=abrir(seed({cronometro:{inicio:Date.now()-60000,disciplina:"",assunto:"",destinoTipo:"registro",destinoId:"r2"}})); await espera(400);
  ok("com o cronômetro rodando numa sessão, o botão aparece e aponta para ela", !!botao(w) && botao(w).dataset.id==="r2");
  click(w,botao(w)); await espera(250);
  ok("e leva à linha dela", w.__rolou===w.document.querySelector('tbody tr[data-id="r2"]'));
  w=abrir(seed({cronometro:{inicio:Date.now()-60000,disciplina:"",assunto:"",destinoTipo:null,destinoId:null}})); await espera(400);
  ok("rodando para uma sessão nova, não há botão", !botao(w));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndo cronômetro até a sessão funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
