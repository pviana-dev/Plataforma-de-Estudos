const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
setTimeout(()=>{
  click(doc.querySelector('[data-aba="questoes"]'));
  setTimeout(()=>{
    const bts=[...doc.querySelectorAll('[data-acao="q-visao"]')];
    console.log("  botões:", bts.map(b=>b.textContent+(b.getAttribute("aria-selected")==="true"?" ←selecionado":"")).join("  |  "));
    ok("Disciplina vem primeiro", bts[0].dataset.visao==="disciplina", bts.map(b=>b.dataset.visao));
    ok("Disciplina é o padrão", bts[0].getAttribute("aria-selected")==="true");
    ok("o título acompanha o padrão", /Desempenho por disciplina/.test($("#view").textContent));
    ok("a tabela abre por disciplina", /Legislação/.test($("#view").textContent));
    click(bts[1]);
    setTimeout(()=>{
      ok("dá para alternar para Conteúdo", /Desempenho por conteúdo/.test($("#view").textContent));
      console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntudo certo");
      process.exit(falhas?1:0);
    },150);
  },200);
},250);
