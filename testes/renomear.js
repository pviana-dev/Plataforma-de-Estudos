/* Renomear um conteúdo agora acontece num lugar só — Ajustes → Disciplinas e
   conteúdos — e vale para tudo o que aponta para aquele nome. Antes o nome era
   editado na etiqueta da sessão, e renomear numa não mexia nas outras. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
const sess=(id,assuntos,extra)=>Object.assign({id,data:hoje,disciplina:"Português",assuntos,assunto:assuntos[0],
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
 disciplinas:["Português"],conteudos:[],grupos:[],lancamentos:[],
 registros:[sess("r1",["Crase","LAI"]), sess("r2",["Crase"])],
 revisoes:[{id:"v1",registroId:null,disciplina:"Português",assuntos:["Crase"],data:hoje,ordem:1,feita:false,
   manual:true,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[{id:"e1",disciplina:"Português",assunto:"Crase",fonte:"",oQueErrei:"",ensinamento:"antes de masculino não tem",
   categoria:"",refeita:false,importante:false,criadoEm:Date.now()}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let perguntado="";
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.confirm=()=>true; w.prompt=(msg,padrao)=>{ perguntado=msg; return "Crase e acento grave"; }; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));

(async()=>{try{
  await espera(400);
  /* ---- a etiqueta não é mais editável ---- */
  click($('[data-aba="registros"]')); await espera(300);
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="r1").querySelector("td"));
  await espera(350);
  const tags=[...doc.querySelectorAll("#listaAssuntosForm .tag")];
  ok("a sessão mostra os conteúdos como etiquetas", tags.length===2, tags.map(t=>t.dataset.assunto));
  ok("e elas NÃO são editáveis no lugar",
     tags.every(t=>!t.querySelector(".txt").hasAttribute("contenteditable")),
     tags.map(t=>t.querySelector(".txt").outerHTML.slice(0,40)));
  ok("o conteúdo se escolhe numa lista, não se digita",
     $("#campoAssunto") && $("#campoAssunto").tagName==="SELECT", $("#campoAssunto") && $("#campoAssunto").tagName);
  click($('#modalCaixa [data-acao="cancelar-edicao"]')); await espera(250);

  /* ---- a tela de conteúdos existe e lista por disciplina ---- */
  click($('#abas [data-aba="conteudos"]')); await espera(350);
  ok("a aba Disciplinas abre", /Disciplinas/.test($("#view h2").textContent),
     $("#view h2").textContent);
  const fichas=[...doc.querySelectorAll("#view .item .titulo")].map(t=>t.textContent);
  ok("as fichas dos conteúdos em uso já estão lá", fichas.sort().join("|")==="Crase|LAI", fichas);
  ok("diz em quantas sessões cada conteúdo aparece",
     /2 sessões/.test($("#view").textContent), $("#view").textContent.slice(0,200));

  /* ---- renomear propaga para tudo ---- */
  click([...doc.querySelectorAll('[data-acao="renomear-conteudo"]')].find(b=>b.dataset.cont==="Crase"));
  await espera(400);
  ok("a plataforma perguntou o nome novo", /Crase/.test(perguntado), perguntado);
  const d=db();
  ok("as DUAS sessões passaram a usar o nome novo",
     d.registros.every(r=>!r.assuntos.includes("Crase")) &&
     d.registros.filter(r=>r.assuntos.includes("Crase e acento grave")).length===2,
     d.registros.map(r=>r.assuntos));
  ok("a revisão avulsa acompanhou", d.revisoes[0].assuntos.join()==="Crase e acento grave",
     d.revisoes[0].assuntos);
  ok("o ponto importante acompanhou", d.erros[0].assunto==="Crase e acento grave", d.erros[0].assunto);
  ok("e a ficha do cadastro também",
     d.conteudos.some(c=>c.nome==="Crase e acento grave") && !d.conteudos.some(c=>c.nome==="Crase"),
     d.conteudos.map(c=>c.nome));
  ok("o outro conteúdo ficou intacto", d.conteudos.some(c=>c.nome==="LAI"));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrenomear conteúdo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
