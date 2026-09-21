const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["Crase","LAI"],assunto:"Crase",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"Crase",fonte:"",oQueErrei:"",ensinamento:"anotação da Crase",categoria:"",refeita:false,importante:false,criadoEm:2}],
 cronometro:null};
let falhas=0,perguntas=[]; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.confirm=m=>{perguntas.push(m);return true;};}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA")); await espera(300);

  const tags=[...doc.querySelectorAll("#listaAssuntosForm .tag")];
  console.log("  etiquetas: "+tags.map(t=>t.dataset.assunto).join(" | "));
  ok("cada etiqueta tem o nome editável", tags.every(t=>{
    const txt=t.querySelector(".txt");
    return txt && txt.getAttribute("contenteditable")==="true";
  }));
  ok("a dica explica como renomear", /clique no nome da etiqueta/i.test($("#modalCorpo").textContent));

  // renomear "Crase" para "Crase e acento grave"
  const alvo=tags.find(t=>t.dataset.assunto==="Crase"), txt=alvo.querySelector(".txt");
  txt.dispatchEvent(new w.FocusEvent("focusin",{bubbles:true}));
  txt.textContent="Crase e acento grave";
  txt.dispatchEvent(new w.Event("input",{bubbles:true}));
  ok("o data-assunto acompanha o que foi digitado", alvo.dataset.assunto==="Crase e acento grave", alvo.dataset.assunto);

  // Esc desfaz
  const outro=tags.find(t=>t.dataset.assunto==="LAI"), t2=outro.querySelector(".txt");
  t2.dispatchEvent(new w.FocusEvent("focusin",{bubbles:true}));
  t2.textContent="LAIx"; t2.dispatchEvent(new w.Event("input",{bubbles:true}));
  t2.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
  ok("Esc desfaz a renomeação — no texto e no que será salvo",
     outro.dataset.assunto==="LAI" && t2.textContent==="LAI", {d:outro.dataset.assunto,t:t2.textContent});
  ok("e não fecha a tela de edição", !$("#overlay").hidden);

  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  const db=lerDb();
  console.log("  assuntos salvos: "+db.registros[0].assuntos.join(" | "));
  ok("o assunto foi renomeado na sessão, sem remover e recriar",
     db.registros[0].assuntos.join("|")==="Crase e acento grave|LAI", db.registros[0].assuntos);
  ok("a plataforma perguntou sobre o que apontava para o nome antigo",
     perguntas.some(p=>/virou/.test(p)&&/anotação/.test(p)), perguntas);
  ok("e a anotação foi junto", db.erros[0].assunto==="Crase e acento grave", db.erros[0].assunto);

  /* ---- trocar dois nomes de uma vez não dispara a pergunta (ambíguo) ---- */
  perguntas.length=0;
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA")); await espera(300);
  [...doc.querySelectorAll("#listaAssuntosForm .tag")].forEach((t,i)=>{
    const x=t.querySelector(".txt");
    x.dispatchEvent(new w.FocusEvent("focusin",{bubbles:true}));
    x.textContent="Assunto "+i; x.dispatchEvent(new w.Event("input",{bubbles:true}));
  });
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  ok("com dois nomes trocados de uma vez, não arrisca adivinhar", perguntas.length===0, perguntas);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrenomear assunto funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
