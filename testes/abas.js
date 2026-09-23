const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true});
const w=dom.window,doc=w.document;
setTimeout(()=>{
  const abas=[...doc.querySelectorAll("#abas [data-aba]")];
  console.log("ordem na tela:");
  abas.forEach((b,i)=>console.log("  "+(i+1)+". "+b.textContent.trim()+"   ("+b.dataset.aba+")"));
  const esperada="hoje,registros,revisoes,conteudos,erros,questoes,painel";
  const obtida=abas.map(b=>b.dataset.aba).join(",");
  console.log(obtida===esperada ? "\nordem correta" : "\nORDEM ERRADA: "+obtida);
  // os rótulos visíveis (os ids internos não mudam com o rebranding)
  const rotulos=abas.map(b=>b.textContent.trim().replace(/\s*\d+$/,""));
  const alvo="Hoje,Sessões,Agenda,Disciplinas,Anotações,Questões,Progresso";
  const okRot = rotulos.join(",")===alvo;
  console.log(okRot ? "rótulos conferem" : "RÓTULOS ERRADOS: "+rotulos.join(","));
  // cada aba ainda abre a tela certa
  let erros=0;
  abas.forEach(b=>{ b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
    const t=(doc.querySelector("#view").textContent||"").trim();
    if(t.length<20){ console.log("  FALHA: aba "+b.dataset.aba+" não renderizou"); erros++; } });
  console.log(erros?erros+" aba(s) com problema":"todas as abas renderizam");
  process.exit(obtida===esperada && okRot && !erros ?0:1);
},250);
