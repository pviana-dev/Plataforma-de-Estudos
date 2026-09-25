/* A quebra de linha do compositor tem de chegar inteira ao que é salvo e ao que
   aparece na tela — e a caixa tem de crescer, senão parece que não pegou. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,disciplinas:["JavaScript"],lancamentos:[],
 conteudos:[{disciplina:"JavaScript",nome:"DOM e Eventos",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[{id:"r1",data:dia(-1),disciplina:"JavaScript",assuntos:["DOM e Eventos"],assunto:"DOM e Eventos",
   minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",
     eDisciplina:"JavaScript", eAssunto:"javascript|dom e eventos", gravadoEm:hoje})); }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  await espera(600);
  click($('[data-acao="abrir-composer"]')); await espera(400);
  const ta=$("#txtNovo");
  ok("o compositor abre com a caixa de texto", !!ta);

  /* ---- a caixa nasce pequena e cresce até o teto ---- */
  const css=html.match(/\.compositor textarea\{[^}]*\}/)[0];
  const min=parseFloat((css.match(/min-height:([\d.]+)em/)||[])[1]);
  ok("a caixa nasce pequena (umas duas linhas)", min>0 && min<=4, css);
  ok("e tem teto, para não empurrar os botões para fora da tela", /max-height/.test(css), css);
  ok("a caixa cresce com o texto", /function crescerCaixa/.test(html));

  /* ---- o rodapé é apoio: linha miúda ---- */
  const rod=$(".compositor .rodape .ajuda-composer");
  ok("a frase de apoio tem classe própria (não estilo solto)", !!rod, $(".compositor .rodape").innerHTML.slice(0,90));
  const cssRod=html.match(/\.compositor \.rodape \.ajuda-composer\{[^}]*\}/)[0];
  ok("e é miúda", /font-size:11px/.test(cssRod), cssRod);
  ok("o rodapé cola na caixa", /\.compositor \.rodape\{[^}]*margin-top:5px/.test(html),
     (html.match(/\.compositor \.rodape\{[^}]*\}/)||[])[0]);

  /* ---- a quebra atravessa: caixa → dado → tela ---- */
  const texto="primeira linha\nsegunda linha\n\noutro parágrafo\n- um item\n- outro item";
  ta.value=texto; ta.dispatchEvent(new w.Event("input",{bubbles:true})); await espera(200);
  ok("o rascunho guarda as quebras",
     JSON.parse(w.localStorage.getItem("plataforma-estudos:tela")).rascunhoAnot===texto);
  click($('[data-acao="salvar-aprendizado"]')); await espera(500);
  const salvo=db().erros[0];
  ok("o dado salvo guarda as quebras exatamente como digitadas",
     salvo && salvo.ensinamento===texto, salvo && salvo.ensinamento);

  const card=$(".apr-item .aprendizado");
  ok("a tela quebra a linha simples com <br>", /primeira linha<br>segunda linha/.test(card.innerHTML),
     card.innerHTML);
  ok("a linha em branco vira parágrafo novo",
     card.querySelectorAll("p").length>=2, card.innerHTML);
  ok("e as linhas com '-' viram lista", card.querySelectorAll("li").length===2, card.innerHTML);

  /* ---- o rascunho atravessa a troca de aba ---- */
  // salvar mantém o compositor aberto para a próxima anotação
  const ta2=$("#txtNovo");
  ok("o compositor continua aberto depois de salvar", !!ta2);
  ta2.value="linha A\nlinha B"; ta2.dispatchEvent(new w.Event("input",{bubbles:true}));
  await espera(200);
  click($('[data-aba="hoje"]')); await espera(250);
  click($('[data-aba="erros"]')); await espera(350);
  ok("o rascunho volta com as quebras depois de trocar de aba",
     $("#txtNovo") && $("#txtNovo").value==="linha A\nlinha B",
     $("#txtNovo") && $("#txtNovo").value);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nquebra de linha e tamanho da caixa ok");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
