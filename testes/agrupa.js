const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const agora=Date.now(), ha5=agora-5*864e5;
const e=(id,disc,ass,txt,criadoEm,extra)=>Object.assign({id,disciplina:disc,assunto:ass,fonte:"",oQueErrei:"",
  ensinamento:txt,categoria:"",refeita:false,importante:false,criadoEm},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[],
 erros:[
  // LAI: duas de hoje (mesmo card) e uma de 5 dias atrás (card separado)
  e("e1","Legislação","LAI","prazo de 20 dias",agora,{categoria:"conteudo",fonte:"CESPE Q42"}),
  e("e3","Legislação","LAI","vale para órgão e entidade",agora-1000,{importante:true,categoria:"bobo"}),
  e("e2","Legislação","LAI","não confundir com o recurso",ha5),
  // sem conteúdo, na disciplina: as duas do mesmo dia continuam juntas
  e("e4","Legislação","","ler o enunciado até o fim",agora-2000),
  e("e5","Legislação","","eliminar extremos",agora-3000),
  e("e6","Português","Crase","antes de masculino não tem",agora-4000)],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const titulo=c=>c.querySelector(".apr-origem b").textContent;
const data=c=>c.querySelector(".apr-cab .meta").textContent;

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  const cards=[...doc.querySelectorAll(".apr")];
  console.log("  cards:");
  cards.forEach(c=>console.log("    ["+titulo(c)+" / "+c.querySelector(".apr-origem span").textContent+"] "+
    data(c)+" — "+c.querySelectorAll(".apr-item").length+" linha(s)"));

  ok("6 anotações viraram 4 cards (conteúdo + dia)", cards.length===4, cards.length);
  const doDia=(t,d)=>cards.filter(c=>titulo(c)===t).find(c=>!d||data(c)===d);
  const laiHoje=cards.filter(c=>titulo(c)==="LAI").sort((a,b)=>b.querySelectorAll(".apr-item").length-a.querySelectorAll(".apr-item").length)[0];
  const laiVelho=cards.filter(c=>titulo(c)==="LAI").find(c=>c!==laiHoje);

  ok("o mesmo conteúdo em dois dias vira dois cards",
     cards.filter(c=>titulo(c)==="LAI").length===2, cards.filter(c=>titulo(c)==="LAI").length);
  ok("as duas do mesmo dia ficaram juntas", laiHoje.querySelectorAll(".apr-item").length===2,
     laiHoje.querySelectorAll(".apr-item").length);
  ok("a de outro dia ficou sozinha", laiVelho.querySelectorAll(".apr-item").length===1);
  ok("e os dois cards têm datas diferentes", data(laiHoje)!==data(laiVelho), [data(laiHoje), data(laiVelho)]);
  ok("nenhum card mistura dias: a data é sempre uma só",
     cards.every(c=>/^\d\d\/\d\d\/\d{4}$/.test(data(c))), cards.map(data));
  ok("as 2 sem conteúdo, do mesmo dia, ficaram juntas na disciplina",
     doDia("Legislação").querySelectorAll(".apr-item").length===2 &&
     /toda a disciplina/.test(doDia("Legislação").querySelector(".apr-origem span").textContent),
     doDia("Legislação").querySelectorAll(".apr-item").length);
  ok("conteúdo de outra disciplina fica em card separado",
     doDia("Crase").querySelectorAll(".apr-item").length===1);
  ok("o cabeçalho conta quantas são", /2 anotações/.test(laiHoje.querySelector(".apr-cab .badge").textContent),
     laiHoje.querySelector(".apr-cab .badge").textContent);
  ok("cada anotação mantém ★ e editar",
     laiHoje.querySelectorAll('.apr-item [data-acao="erro-estrela"]').length===2 &&
     laiHoje.querySelectorAll('.apr-item [data-acao="editar-erro"]').length===2);
  ok("cada anotação mantém categoria e banca no pé",
     /CESPE Q42/.test(laiHoje.textContent) && /Faltou conteúdo/.test(laiHoje.textContent));

  /* ---- a data aparece uma vez por card, não em cada anotação ---- */
  cards.forEach(c=>{
    const noCorpo=[...c.querySelectorAll(".apr-item")].map(i=>i.textContent).join(" ");
    ok("o card de "+titulo(c)+" não repete data nas anotações",
       !/\d\d\/\d\d\/\d{4}/.test(noCorpo), (noCorpo.match(/\d\d\/\d\d\/\d{4}/g)||[]));
    ok("e tem exatamente um lugar com data (o cabeçalho)",
       c.querySelectorAll(".apr-cab .meta").length===1);
  });
  ok("nenhuma anotação repete a data no pé",
     [...doc.querySelectorAll(".apr-item .apr-pe")].every(p=>!/\d\d\/\d\d\/\d{4}/.test(p.textContent)),
     [...doc.querySelectorAll(".apr-item .apr-pe")].map(p=>p.textContent));
  ok("mas a data de cada uma fica no title",
     [...doc.querySelectorAll(".apr-item")].every(i=>/Anotada em \d\d\/\d\d\/\d{4}/.test(i.title)),
     [...doc.querySelectorAll(".apr-item")].map(i=>i.title));
  ok("a de véspera é destacada dentro do card", !!laiHoje.querySelector(".apr-item.marcado"));
  ok("e o card inteiro sinaliza que tem uma de véspera", laiHoje.classList.contains("tem-vespera"));
  ok("o card com véspera vem primeiro", cards[0]===laiHoje, cards.map(titulo));

  /* ---- editar abre a tela sobreposta; o card continua inteiro atrás ---- */
  click(laiHoje.querySelectorAll('[data-acao="editar-erro"]')[1]); await espera(300);
  ok("o formulário abre na tela sobreposta", !$("#overlay").hidden && !!$("#modalCorpo #formEdicaoErro"));
  const laiAgora=[...doc.querySelectorAll(".apr")].find(c=>c.querySelector(".apr-item.em-edicao"));
  ok("a linha em edição fica marcada no card",
     !!laiAgora && laiAgora.querySelectorAll(".apr-item.em-edicao").length===1,
     laiAgora && laiAgora.querySelectorAll(".apr-item.em-edicao").length);
  ok("e as duas anotações seguem visíveis como texto",
     laiAgora.querySelectorAll(".apr-item .aprendizado").length===2,
     laiAgora.querySelectorAll(".apr-item .aprendizado").length);

  /* ---- filtrando por conteúdo, sobram só os cards daquele conteúdo ---- */
  click(doc.querySelector('[data-acao="cancelar-edicao-erro"]')); await espera(250);
  const sel=$("#eAssunto"); sel.value=[...sel.options].find(o=>/LAI$/.test(o.textContent)).value;
  sel.dispatchEvent(new w.Event("change",{bubbles:true})); await espera(250);
  ok("filtrando por conteúdo, ficam os 2 dias com as 3 anotações",
     doc.querySelectorAll(".apr").length===2 && doc.querySelectorAll(".apr-item").length===3,
     [doc.querySelectorAll(".apr").length, doc.querySelectorAll(".apr-item").length]);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nanotações agrupadas por conteúdo e dia");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
