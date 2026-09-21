const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"CESPE 2026 Q42",
         oQueErrei:"marquei a alternativa errada",ensinamento:"prazo de 20 dias",
         categoria:"conteudo",refeita:false,importante:false,criadoEm:Date.now()}],
 cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(250);
  const f=$("#formEdicaoErro");
  console.log("  campos: "+[...f.querySelectorAll(".campo > span")].map(x=>x.textContent).join(" | "));

  ok("o campo 'o que me confundiu' saiu", !f.querySelector("[name=oQueErrei]"));
  ok("e o texto 'marquei que cabe recurso' também", !/cabe recurso/i.test(f.innerHTML));
  ok("sobrou só uma barra de formatação (a da anotação)", f.querySelectorAll(".fmt").length===1);

  const rotFonte=[...f.querySelectorAll(".campo > span")].map(x=>x.textContent).find(t=>/De onde veio/.test(t));
  ok("o campo de origem cita ENEM e vestibular, não só banca",
     !!rotFonte && /ENEM/.test(rotFonte) && /vestibular/i.test(rotFonte), rotFonte);
  ok("o exemplo do campo também", /ENEM 2024/.test(f.querySelector("[name=fonte]").placeholder),
     f.querySelector("[name=fonte]").placeholder);

  const ta=f.querySelector("[name=ensinamento]");
  ok("o campo da anotação ficou maior", ta.classList.contains("texto-grande"));
  const css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join("");
  ok("e a altura maior está no CSS", /textarea\.texto-grande\{min-height:170px\}/.test(css));

  /* ---- salvar não apaga o que já estava escrito no campo removido ---- */
  ta.value="prazo de 20 dias — confirmado";
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(300);
  const e=lerDb().erros[0];
  ok("a anotação foi salva", /confirmado/.test(e.ensinamento), e.ensinamento);
  ok("o texto antigo do campo removido continua guardado",
     e.oQueErrei==="marquei a alternativa errada", e.oQueErrei);
  ok("e continua aparecendo no card", /O que me confundiu/.test($("#view").textContent));

  /* ---- salvar com a anotação vazia é recusado ---- */
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(250);
  $("#formEdicaoErro [name=ensinamento]").value="";
  $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("anotação vazia é recusada com aviso claro", /Escreva a anotação/.test($("#erroEdicao").textContent),
     $("#erroEdicao").textContent);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nedição da anotação ajustada");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
