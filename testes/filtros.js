const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"nota",categoria:"",refeita:false,importante:true,criadoEm:3}],
 cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  /* ---- Registros ---- */
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const p=$(".filtros");
  ok("os campos ficam numa grade própria", !!p.querySelector(".filtros-campos"));
  ok("todos os rótulos são <span> estilizáveis",
     [...p.querySelectorAll(".campo")].every(c=>c.firstElementChild && c.firstElementChild.tagName==="SPAN"),
     [...p.querySelectorAll(".campo")].map(c=>c.firstElementChild&&c.firstElementChild.tagName));
  ok("a busca tem lupa e ocupa a linha inteira", !!p.querySelector(".campo-busca .lupa"));
  ok("sem filtro ativo, não há barra de ações nem 'limpar'",
     !p.querySelector(".filtros-acoes"), p.innerHTML.slice(0,80));
  ok("não sobrou o rótulo em branco (&nbsp;)", !/ /.test(p.textContent), JSON.stringify(p.textContent.slice(0,60)));

  const d=$("#fDisciplina"); d.value="Português"; change(d); await espera(250);
  ok("filtrando, aparece o aviso de filtro ativo", !!$(".marca-filtro"));
  ok("e o botão de limpar", !!doc.querySelector('[data-acao="limpar-filtros-reg"]'));
  ok("a lista respeitou o filtro", doc.querySelectorAll("tbody tr[data-id]").length===1,
     [...doc.querySelectorAll("tbody tr[data-id]")].map(t=>t.dataset.id));
  click(doc.querySelector('[data-acao="limpar-filtros-reg"]')); await espera(250);
  ok("limpar volta tudo ao padrão", $("#fDisciplina").value==="" && $("#fPeriodo").value==="todos" &&
     $("#fOrdem").value==="data-desc" && $("#fBusca").value==="",
     [$("#fDisciplina").value,$("#fPeriodo").value,$("#fOrdem").value,$("#fBusca").value]);
  ok("e a lista volta inteira", doc.querySelectorAll("tbody tr[data-id]").length===2);
  ok("o aviso de filtro some", !$(".marca-filtro"));

  /* ---- Pontos importantes ---- */
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  const pf=$(".filtros");
  ok("no Feedback os campos também ficam na grade", !!pf.querySelector(".filtros-campos"));
  ok("o ★ saiu do meio dos campos e foi para as ações",
     !!pf.querySelector('.filtros-acoes [data-acao="toggle-importantes"]') &&
     !pf.querySelector('.filtros-campos [data-acao="toggle-importantes"]'));
  ok("o ★ diz se está ligado", doc.querySelector('[data-acao="toggle-importantes"]').getAttribute("aria-pressed")==="false");
  click(doc.querySelector('[data-acao="toggle-importantes"]')); await espera(250);
  ok("ligando o ★, ele marca o estado", doc.querySelector('[data-acao="toggle-importantes"]').getAttribute("aria-pressed")==="true");
  ok("e aparece o limpar", !!doc.querySelector('[data-acao="limpar-filtros-fb"]'));
  click(doc.querySelector('[data-acao="limpar-filtros-fb"]')); await espera(250);
  ok("limpar desliga tudo no Feedback",
     $("#eDisciplina").value==="" && $("#eAssunto").value==="" &&
     doc.querySelector('[data-acao="toggle-importantes"]').getAttribute("aria-pressed")==="false",
     [$("#eDisciplina").value,$("#eAssunto").value]);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nfiltros reorganizados");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
