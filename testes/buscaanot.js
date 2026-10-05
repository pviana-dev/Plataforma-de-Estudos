/* PESQUISAR NAS ANOTAÇÕES (pedido do Pedro, 05/10).
   - A barra fica no card "Todas as anotações", logo abaixo do título.
   - Procura SÓ no texto da anotação; parte da palavra vale; sem maiúsculas e acentos.
   - Respeita os filtros de disciplina e conteúdo; "limpar filtros" apaga o termo.
   - O trecho encontrado aparece marcado; nada encontrado tem aviso próprio. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
const sess=(id,disc,ass)=>({id,data:hoje,disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,questoes:0,acertos:0,
  dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const anot=(id,disc,ass,texto,extra)=>Object.assign({id,disciplina:disc,assunto:ass,ensinamento:texto,oQueErrei:"",
  categoria:"",fonte:"",importante:false,refeita:false,criadoEm:Date.now()-Number(id.slice(1))*1000},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-12-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],
 grupos:[],lancamentos:[],registros:[sess("r1","Legislação","LAI"),sess("r2","Português","Crase")],
 revisoes:[],cronometro:null,
 erros:[anot("a1","Legislação","LAI","A **Função** pública exige transparência"),
        anot("a2","Legislação","LAI","Prazo de 20 dias, prorrogável por mais 10"),
        anot("a3","Português","Crase","Crase antes de palavra feminina",{oQueErrei:"Achei que a função era outra"}),
        anot("a4","Português","Crase","Nunca antes de verbo")]};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const digitar=async t=>{ const i=$("#eBusca"); i.value=t; i.dispatchEvent(new w.Event("input",{bubbles:true})); await espera(80); };
const vistas=()=>[...doc.querySelectorAll(".apr-item")].map(e=>e.dataset.anotacao).sort().join();
const titulo=()=>[...doc.querySelectorAll("#view h2")].find(h=>/Todas as anotações/.test(h.textContent));

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(350);
  const barra=$("#eBusca");
  ok("a barra existe", !!barra);
  ok("e fica no card da lista, logo depois do título",
     barra && titulo() && titulo().nextElementSibling===barra.closest(".busca-anot"));
  ok("sem termo, todas aparecem", vistas()==="a1,a2,a3,a4", vistas());

  await digitar("funcao");
  ok("sem acento e sem maiúscula, parte da palavra acha (texto e 'o que me confundiu')", vistas()==="a1,a3", vistas());
  ok("o foco continua na barra", doc.activeElement===$("#eBusca"));
  ok("o título conta e diz o termo", /2 anotações com “funcao”/.test(titulo().textContent), titulo().textContent);
  const marcas=[...doc.querySelectorAll(".apr-item mark")].map(m=>m.textContent);
  ok("o trecho encontrado fica marcado, com o acento do original", marcas.includes("Função") && marcas.includes("função"), marcas);
  ok("o rótulo 'O que me confundiu' não é marcado", ![...doc.querySelectorAll(".detalhe > b mark")].length);

  await digitar("pror");
  ok("termo incompleto acha", vistas()==="a2", vistas());

  await digitar("Legislação");
  ok("não procura no nome da disciplina", vistas()==="", vistas());
  ok("nada encontrado: aviso próprio", /Nenhuma anotação com “Legislação”/.test($("#view").textContent));
  ok("a barra continua lá para trocar o termo", !!$("#eBusca"));

  await digitar("antes");
  ok("acha nas duas disciplinas", vistas()==="a3,a4", vistas());
  // filtro de disciplina: a busca fica só dentro dela
  const sd=$("#eDisciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(120);
  ok("com disciplina filtrada, a busca respeita o filtro", vistas()==="", vistas());
  ok("o termo continua", $("#eBusca") && $("#eBusca").value==="antes");
  ok("e o aviso sugere limpar os filtros", /limpe os filtros de cima/.test($("#view").textContent));
  await digitar("prazo");
  ok("dentro da disciplina filtrada, acha", vistas()==="a2", vistas());

  click($('[data-acao="limpar-filtros-fb"]')); await espera(120);
  ok("limpar filtros apaga também o termo", $("#eBusca").value==="" && vistas()==="a1,a2,a3,a4", vistas());

  // tocar fora da barra: o foco não volta para ela no próximo redesenho
  await digitar("crase");
  doc.querySelector('.apr-item [data-acao="erro-estrela"]').dispatchEvent(new w.Event("pointerdown",{bubbles:true}));
  click(doc.querySelector('.apr-item [data-acao="erro-estrela"]')); await espera(120);
  ok("depois de tocar em outra coisa, o foco não volta para a barra", doc.activeElement!==$("#eBusca"));
}catch(e){console.log("ERRO",e.stack);falhas++;}
console.log(falhas?"\n"+falhas+" FALHA(S)":"\npesquisa nas anotações funcionando");
process.exit(falhas?1:0);})();
