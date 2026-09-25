const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));
const rotulo=b=>b.childNodes[1].textContent.trim();   // texto logo depois do "+"

(async()=>{try{
  const vistos=[];
  for (const [aba,nome] of [["registros","Registros"],["revisoes","Rotina"],["questoes","Questões"]]){
    await passo(()=>{ click(doc.querySelector('[data-aba="'+aba+'"]')); });
    await passo(()=>{
      const b=doc.querySelector(".btn-add");
      ok("a aba "+nome+" tem botão de adicionar", !!b);
      if (b) vistos.push([nome, rotulo(b)]);
    });
  }
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>/LAI$/.test(o.textContent)).value; change(s); });
  await passo(()=>{
    const b=doc.querySelector('[data-acao="abrir-composer"]');
    ok("a aba Feedback tem botão de adicionar", !!b);
    if (b) vistos.push(["Feedback", rotulo(b)]);
  });
  console.log("\n  rótulos:");
  vistos.forEach(([a,r])=>console.log("    "+a.padEnd(10)+" + "+r));
  ok("todos começam com letra maiúscula",
     vistos.every(([,r]) => r[0] === r[0].toUpperCase() && /[A-ZÀ-Ý]/.test(r[0])), vistos.map(v=>v[1]));
  ok("todos são curtos (até 4 palavras)", vistos.every(([,r]) => r.split(/\s+/).length<=4), vistos.map(v=>v[1]));

  /* ---- o de questões fica abaixo dos indicadores ---- */
  await passo(()=>{ click(doc.querySelector('[data-aba="questoes"]')); });
  await passo(()=>{
    const view=$("#view");
    const tiles=view.querySelector(".tiles");
    const bt=view.querySelector('[data-acao="novo-lancamento"]');
    ok("o botão de lançar questões existe", !!bt);
    ok("e vem DEPOIS dos indicadores",
       !!(tiles.compareDocumentPosition(bt) & w.Node.DOCUMENT_POSITION_FOLLOWING),
       "posição relativa");
    ok("a pista explica o vínculo", /sessão já registrada/.test(bt.querySelector(".pista").textContent),
       bt.textContent);
  });
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nbotões de adicionar ajustados");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
