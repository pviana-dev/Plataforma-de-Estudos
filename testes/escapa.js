const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const anot=(id,txt)=>({id,disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:txt,
  categoria:"",refeita:false,importante:false,criadoEm:Date.now()-Number(id.slice(1))*1000});
const textos=[
  "se a == b então c == d",               // e1: comparação, não pode pintar
  "==grifado== mesmo",                     // e2: marcador legítimo
  "escrevendo \\==isto\\== cru",           // e3: escape
  "2 + 2 ++ 3 + 3",                        // e4: mais e mais
  "gritou !! e depois !! de novo",         // e5: exclamações soltas
  "e-mail a@@b sem virar cor @@ nada",     // e6
  "++regra++ e **negrito** juntos"         // e7
];
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,
   dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:textos.map((t,i)=>anot("e"+(i+1),t)),cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  const linhas=[...doc.querySelectorAll(".aprendizado")];
  const achar=t=>linhas.find(l=>l.textContent.includes(t));
  linhas.forEach(l=>console.log("   ", JSON.stringify(l.textContent), "→", l.innerHTML.replace(/class="mk /g,'class="')));

  const cmp=achar("então");
  ok("== solto numa comparação não vira cor", !cmp.querySelector(".mk"), cmp.innerHTML);
  ok("e o texto sai igual ao digitado", cmp.textContent==="se a == b então c == d", cmp.textContent);

  const gr=achar("grifado");
  ok("o marcador colado continua pintando", !!gr.querySelector(".mk-grifo") &&
     gr.querySelector(".mk-grifo").textContent==="grifado", gr.innerHTML);

  const esc=achar("cru");
  ok("a barra invertida escreve o símbolo cru", esc.textContent==="escrevendo ==isto== cru", esc.textContent);
  ok("e não sobra barra nenhuma na tela", !/\\\\/.test(esc.textContent), esc.textContent);
  ok("nem vira cor", !esc.querySelector(".mk"), esc.innerHTML);

  const mm=achar("2 + 2");
  ok("++ solto entre espaços não vira cor", !mm.querySelector(".mk"), mm.innerHTML);
  const ex=achar("gritou");
  ok("!! solto não vira cor", !ex.querySelector(".mk"), ex.innerHTML);
  const ar=achar("e-mail");
  ok("@@ solto não vira cor", !ar.querySelector(".mk"), ar.innerHTML);

  const jun=achar("regra");
  ok("marcadores legítimos seguem funcionando juntos",
     !!jun.querySelector(".mk-regra") && !!jun.querySelector("strong"), jun.innerHTML);

  /* ---- o botão de cor não deixa espaço dentro da marca ---- */
  const selD=$("#eDisciplina"); selD.value="Legislação";
  selD.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(250);
  const ta=$("#txtNovo"); ta.value="prazo de 20 dias aqui";
  ta.setSelectionRange(8,17);                      // " 20 dias " com espaços nas pontas
  click(doc.querySelector('.fmt .act.cor'));
  ok("o espaço da seleção fica fora da marca", ta.value==="prazo de ==20 dias== aqui", ta.value);

  /* ---- a dica ensina o escape ---- */
  const dica=$(".fmt .dica-fmt");
  ok("a barra explica como escrever o símbolo cru", /\\==/.test(dica.textContent), dica.textContent);
  ok("e o detalhe completo está no title", /barra invertida/.test(dica.getAttribute("title")||""),
     dica.getAttribute("title"));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nescape e marcadores colados funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
