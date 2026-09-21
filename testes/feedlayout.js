const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const erro=(id,disc,ass,txt,extra)=>Object.assign({id,disciplina:disc,assunto:ass,fonte:"",oQueErrei:"",
  ensinamento:txt,categoria:"",refeita:false,importante:false,criadoEm:Date.now()-id.length*1000},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:4,acertos:4,dificuldade:2,anotacoes:"",criadoEm:2}],
 revisoes:[],
 erros:[
  erro("e1","Legislação","LAI","Prazo de resposta é de **20 dias**.",{categoria:"conteudo",fonte:"CESPE 2026 Q42"}),
  erro("e2","Legislação","","Ler o enunciado até o fim.",{categoria:"bobo",importante:true,refeita:true}),
  erro("e3","Português","Crase","Antes de palavra masculina não tem crase.",{oQueErrei:"marquei a alternativa com crase"})],
 cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  const cards=[...doc.querySelectorAll(".apr")];
  console.log("  cards:");
  cards.forEach(c=>console.log("    ["+c.querySelector(".apr-origem b").textContent+" / "+
    c.querySelector(".apr-origem span").textContent+"]  pé: "+
    ((c.querySelector(".apr-pe")||{textContent:"(sem etiquetas)"}).textContent.replace(/\s+/g," ").trim())));

  const porTitulo=t=>cards.find(c=>c.querySelector(".apr-origem b").textContent===t);
  ok("as anotações viraram cards próprios", cards.length===3, cards.length);
  ok("a origem fica no topo de cada card", cards.every(c=>{
    const cab=c.querySelector(".apr-cab"), primeira=c.querySelector(".apr-item");
    return !!(cab.compareDocumentPosition(primeira) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  }));
  ok("o conteúdo é o título e a disciplina o subtítulo",
     !!porTitulo("LAI") && porTitulo("LAI").querySelector(".apr-origem span").textContent==="Legislação",
     porTitulo("LAI") && porTitulo("LAI").querySelector(".apr-origem span").textContent);
  const daDisc=cards.find(c=>/toda a disciplina/.test(c.querySelector(".apr-origem span").textContent));
  ok("anotação da disciplina inteira mostra a disciplina como título",
     !!daDisc && daDisc.querySelector(".apr-origem b").textContent==="Legislação",
     daDisc && daDisc.querySelector(".apr-origem b").textContent);
  ok("estrela e editar ficam em cada anotação",
     cards.every(c=>!!c.querySelector('.apr-topo [data-acao="erro-estrela"]') && !!c.querySelector('.apr-topo [data-acao="editar-erro"]')));
  ok("a marcada para a véspera se destaca", !!doc.querySelector(".apr-item.marcado .estrela.on"));
  const lai=porTitulo("LAI");
  ok("categoria, banca e 'refeita' ficam no pé de cada anotação",
     /Faltou conteúdo/.test(lai.querySelector(".apr-pe").textContent) &&
     /CESPE 2026 Q42/.test(lai.querySelector(".apr-pe").textContent) &&
     /refeita e acertada/.test(porTitulo("Legislação").querySelector(".apr-pe").textContent),
     lai.querySelector(".apr-pe").textContent);
  ok("anotação sem etiqueta nenhuma não ganha pé vazio",
     !porTitulo("Crase").querySelector(".apr-pe"),
     porTitulo("Crase").innerHTML.slice(-120));
  ok("o texto da anotação vem formatado", !!lai.querySelector(".apr-texto .aprendizado strong"),
     lai.querySelector(".apr-texto").innerHTML.slice(0,120));
  ok("'o que me confundiu' fica separado no texto", !!doc.querySelector(".apr-texto .detalhe"));

  /* ---- a lista ganhou card próprio, com contagem ---- */
  const cardsTela=[...doc.querySelectorAll("#view > .card")];
  ok("a tela tem dois cards: filtros e lista", cardsTela.length===2, cardsTela.length);
  ok("o card da lista conta as anotações", /3 anotações/.test(cardsTela[1].querySelector("h2").textContent),
     cardsTela[1].querySelector("h2").textContent);

  /* ---- filtrando, o título acompanha ---- */
  const s=$("#eDisciplina"); s.value="Português"; s.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(250);
  ok("filtrando por disciplina, o título diz onde", /1 anotação em Português/.test($("#view").textContent),
     [...doc.querySelectorAll("#view > .card h2")].map(x=>x.textContent));
  ok("e a origem continua no card mesmo filtrada",
     doc.querySelector(".apr .apr-origem b").textContent==="Crase");

  /* ---- editar continua funcionando ---- */
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(250);
  ok("editar abre o formulário no lugar do card", !!$("#formEdicaoErro"));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nlayout dos Pontos importantes ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
