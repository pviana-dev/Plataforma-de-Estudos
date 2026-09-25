const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:128,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join("");
const curto=iso(new Date()).slice(8)+"/"+iso(new Date()).slice(5,7);

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const faixa=$("tr.sep-dia td").textContent.replace(/\s+/g," ").trim();
  console.log("  faixa do dia: \""+faixa+"\"");
  ok("a data não aparece mais duas vezes",
     (faixa.match(/\d\d\/\d\d/g)||[]).length===1, faixa);
  ok("ficou o dia da semana + a data com ano",
     /^(dom|seg|ter|qua|qui|sex|sáb) · \d\d\/\d\d\/\d{4}/.test(faixa), faixa);
  ok("e o total do dia continua", /no dia/.test(faixa), faixa);

  ok("o hover das linhas deixou de usar o cinza dos filtros",
     /tbody tr:not\(\.sep-dia\):hover\{background:var\(--accent-soft\)\}/.test(css));
  ok("a faixa de data não muda de cor no hover", /tr:not\(\.sep-dia\)/.test(css));
  // a faixa de dia é moldura neutra e segue no cinza-areia; os filtros viraram
  // chrome ativo (verde claro) — regiões diferentes, sem risco de confusão com o hover
  ok("a faixa de dia segue no cinza", /tr\.sep-dia td\{[^}]*--surface-2/.test(css));
  ok("e os filtros passaram ao chrome verde", /\.filtros\{[^}]*--chrome/.test(css));

  click(doc.querySelector('[data-aba="painel"]')); await espera(300);
  const cab=$(".dia-info .dia-cab").textContent.replace(/\s+/g," ").trim();
  console.log("  detalhe do dia: \""+cab+"\"");
  ok("no Painel a data também não se repete", (cab.match(/\d\d\/\d\d/g)||[]).length===1, cab);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndatas e hover ajustados");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
