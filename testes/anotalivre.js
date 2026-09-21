const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const sess=(id,disc,ass)=>({id,data:hoje,disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,questoes:0,acertos:0,
  dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],
 grupos:[],lancamentos:[],registros:[sess("r1","Legislação","LAI"),sess("r2","Português","Crase")],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const erros=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1")).erros;

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(350);

  /* ---- o botão aparece sem filtro nenhum ---- */
  ok("sem disciplina escolhida, o botão + já está lá", !!doc.querySelector('[data-acao="abrir-composer"]'));
  ok("e a pista explica que a escolha vem depois",
     /escolhe a disciplina ou o conteúdo na hora de salvar/.test(doc.querySelector('[data-acao="abrir-composer"]').textContent),
     doc.querySelector('[data-acao="abrir-composer"]').textContent);
  ok("o aviso antigo que substituía o botão sumiu",
     !/para anotar algo que vale para a matéria toda/.test($("#view").textContent));

  /* ---- o compositor traz o seletor ---- */
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(300);
  ok("o compositor abriu", !!$("#txtNovo"));
  const sel=$("#novoConteudo");
  ok("com o seletor de onde entra", !!sel, $(".compositor").innerHTML.slice(0,120));
  ok("o seletor oferece disciplinas e conteúdos",
     [...sel.options].map(o=>o.textContent).some(t=>/LAI/.test(t)) &&
     [...sel.options].map(o=>o.textContent).some(t=>/Crase/.test(t)),
     [...sel.options].map(o=>o.textContent));

  /* ---- salvar sem escolher é recusado ---- */
  $("#txtNovo").value="prazo de 20 dias";
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(250);
  ok("salvar sem escolher é recusado", erros().length===0, erros());
  ok("com mensagem no compositor", /Escolha a disciplina ou o conteúdo/.test($("#erroComposer").textContent),
     $("#erroComposer").textContent);
  ok("o aviso flutuante também aparece", /Escolha a disciplina ou o conteúdo/.test($("#toast").textContent),
     $("#toast").textContent);
  ok("e o seletor fica destacado", $("#novoConteudo").classList.contains("campo-errado"));
  ok("o texto digitado não se perde", $("#txtNovo").value==="prazo de 20 dias", $("#txtNovo").value);

  /* ---- escolhendo, salva ---- */
  const alvo=[...$("#novoConteudo").options].find(o=>/LAI/.test(o.textContent));
  $("#novoConteudo").value=alvo.value;
  $("#novoConteudo").dispatchEvent(new w.Event("change",{bubbles:true}));
  ok("escolher limpa o destaque na hora", !$("#novoConteudo").classList.contains("campo-errado"));
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(300);
  ok("agora a anotação é salva", erros().length===1, erros());
  ok("no conteúdo escolhido", erros()[0].disciplina==="Legislação" && erros()[0].assunto==="LAI",
     [erros()[0].disciplina, erros()[0].assunto]);
  ok("ela aparece na lista", /prazo de 20 dias/.test($("#view").textContent));
  ok("o compositor segue aberto para a próxima", !!$("#txtNovo"));

  /* ---- salvar sem texto avisa ---- */
  $("#novoConteudo").value=alvo.value;
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(250);
  ok("sem texto, também avisa", /Escreva a anotação/.test($("#erroComposer").textContent),
     $("#erroComposer").textContent);
  ok("e nada é salvo a mais", erros().length===1);

  /* ---- com disciplina escolhida, o comportamento antigo continua ---- */
  const d=$("#eDisciplina"); d.value="Português";
  d.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(300);
  ok("trocar o filtro fecha o compositor (o destino mudaria embaixo de você)", !$(".compositor"));
  ok("e o botão volta a dizer o destino do filtro",
     /Português/.test(doc.querySelector('[data-acao="abrir-composer"]').textContent),
     doc.querySelector('[data-acao="abrir-composer"]').textContent);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(300);
  ok("com filtro, o seletor do compositor some", !$("#novoConteudo"), $(".compositor")&&$(".compositor").innerHTML.slice(0,100));
  ok("e o rodapé volta a dizer onde vai entrar", /Vai entrar em/.test($(".compositor").textContent),
     $(".compositor").textContent.slice(0,120));
  $("#txtNovo").value="antes de masculino não tem";
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(300);
  ok("e salva direto, sem pedir de novo",
     erros().length===2 && erros().some(e=>e.disciplina==="Português" && !e.assunto),
     erros().map(e=>[e.disciplina,e.assunto]));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nanotar sem filtro funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
