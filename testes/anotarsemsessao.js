/* Anotar não depende de ter estudado. Você esbarra num ponto importante de uma
   matéria que ainda nem começou — e precisa ter onde guardar. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 // "Tributário" foi criada na aba Disciplinas e nunca foi estudada;
 // "Contratos" é ficha de conteúdo dela, também sem sessão nenhuma
 disciplinas:["Legislação","Tributário"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Tributário",nome:"Contratos",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[{id:"r1",data:dia(-1),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
   questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",gravadoEm:hoje}));
   w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const ops=id=>[...$(id).options].map(o=>o.textContent);

(async()=>{try{
  await espera(600);

  /* ---- 1. a disciplina nunca estudada é oferecida ---- */
  const discs=[...$("#eDisciplina").options].map(o=>o.value).filter(Boolean);
  ok("a disciplina sem sessão nenhuma aparece no filtro", discs.includes("Tributário"), discs);
  ok("e a que tem sessão também", discs.includes("Legislação"), discs);

  /* ---- 2. e o conteúdo dela, que também nunca foi estudado ---- */
  const d=$("#eDisciplina"); d.value="Tributário"; change(d); await espera(350);
  ok("o conteúdo sem sessão aparece no seletor",
     ops("#eAssunto").some(t=>/Contratos/.test(t)), ops("#eAssunto"));
  ok("marcado como ainda não estudado",
     ops("#eAssunto").some(t=>/Contratos — ainda sem sessão/.test(t)), ops("#eAssunto"));

  /* ---- 3. anotar na disciplina inteira, sem nunca tê-la estudado ---- */
  const bt=doc.querySelector('[data-acao="abrir-composer"]');
  ok("o botão de anotar está disponível", !!bt, $("#view").textContent.slice(0,90));
  click(bt); await espera(400);
  $("#txtNovo").value="vi num edital: imunidade não é isenção";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(500);
  let e=db().erros.find(x=>/imunidade/.test(x.ensinamento));
  ok("a anotação é salva numa disciplina nunca estudada",
     !!e && e.disciplina==="Tributário" && e.assunto==="", e);

  /* ---- 4. e num conteúdo nunca estudado ---- */
  const sa=$("#eAssunto");
  sa.value=[...sa.options].find(o=>/Contratos/.test(o.textContent)).value;
  change(sa); await espera(400);
  click(doc.querySelector('[data-acao="abrir-composer"]')); await espera(400);
  $("#txtNovo").value="cláusula exorbitante só na administração";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  click(doc.querySelector('[data-acao="salvar-aprendizado"]')); await espera(500);
  e=db().erros.find(x=>/exorbitante/.test(x.ensinamento));
  ok("a anotação é salva num conteúdo nunca estudado",
     !!e && e.disciplina==="Tributário" && e.assunto==="Contratos", e);

  /* ---- 5. e nada disso inventou sessão ou revisão ---- */
  ok("nenhuma sessão foi criada por causa da anotação", db().registros.length===1,
     db().registros.map(r=>[r.disciplina,r.assuntos]));
  ok("nem entrou nada na agenda", db().revisoes.every(r=>r.disciplina!=="Tributário" &&
     !(db().registros.find(x=>x.id===r.registroId)||{disciplina:""}).disciplina.includes("Tributário")),
     db().revisoes.map(r=>r.registroId));

  /* ---- 6. estudando depois, a marca some ---- */
  const seed2=db();
  seed2.registros.push({id:"r2",data:hoje,disciplina:"Tributário",assuntos:["Contratos"],assunto:"Contratos",
    minutos:45,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2});
  const dom2=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(x){ x.__semLogin=true; x.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed2));
     x.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",
       eDisciplina:"Tributário",gravadoEm:hoje})); }});
  await espera(600);
  const ops2=[...dom2.window.document.querySelector("#eAssunto").options].map(o=>o.textContent);
  ok("depois de estudar, o conteúdo perde a marca de 'ainda sem sessão'",
     ops2.some(t=>/Contratos/.test(t)) && !ops2.some(t=>/Contratos — ainda sem sessão/.test(t)), ops2);
  ok("e a anotação feita antes continua lá",
     JSON.parse(dom2.window.localStorage.getItem("plataforma-estudos:v1")).erros
       .some(x=>/exorbitante/.test(x.ensinamento)));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ndá para anotar sem nunca ter estudado o assunto");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
