/* Os blocos da aba Anotações deixaram de medir desempenho (taxa e "por
   desatenção" saíram), e "onde entra" virou dois campos em cascata. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,disc,ass)=>({id,data:dia(-1),disciplina:disc,assuntos:[ass],assunto:ass,minutos:60,
  questoes:10,acertos:7,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))});
const an=(id,disc,ass,txt,extra)=>Object.assign({id,disciplina:disc,assunto:ass,fonte:"",oQueErrei:"",
  ensinamento:txt,categoria:"bobo",refeita:true,importante:false,criadoEm:Date.now()-1000},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Legislação",nome:"Licitações",fase:"andamento"},
            {disciplina:"Português",nome:"Crase",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[sess("r1","Legislação","LAI"), sess("r2","Português","Crase")],
 revisoes:[],
 erros:[an("e1","Legislação","LAI","art. 5º"), an("e2","Legislação","LAI","prazo",{importante:true}),
        an("e3","Legislação","","princípios gerais")],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
   w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"erros",
     eDisciplina:"Legislação",gravadoEm:hoje})); w.confirm=()=>true; }});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const db=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const blocos=()=>[...doc.querySelectorAll("#view .tiles .tile")].map(t=>t.textContent.replace(/\s+/g," ").trim());

(async()=>{try{
  await espera(650);

  /* ---- 1. o que saiu ---- */
  let t=blocos();
  ok("a taxa de acerto saiu dos blocos", !t.some(x=>/Taxa de acerto/.test(x)), t);
  ok("o 'Por desatenção' também", !t.some(x=>/desatenção/i.test(x)), t);
  ok("e o 'N refeitas e acertadas' de baixo da contagem",
     !t.some(x=>/refeitas e acertadas/.test(x)), t);
  ok("mas a contagem de pontos anotados ficou", t.some(x=>/^Pontos anotados3/.test(x)), t);

  /* ---- 2. o que entrou, na disciplina ---- */
  // base sem data de prova = modo Sem objetivo: a estrela diz "Importantes", não "véspera"
  ok("entrou o quanto vai para a estrela", t.some(x=>/^★ Importantes1/.test(x)), t);
  ok("com a proporção", t.some(x=>/33% das anotações/.test(x)), t);
  ok("e a cobertura de conteúdos anotados", t.some(x=>/^Conteúdos anotados1de 2 no cadastro/.test(x)), t);
  ok("as questões continuam como contexto", t.some(x=>/^Questões da disciplina/.test(x)), t);
  /* o número do bloco da véspera usa --star-ink, não --star: o dourado cheio dá
     2,82:1 sobre o papel claro, abaixo do piso de 3:1 para texto grande */
  ok("o número da véspera usa o tom legível, não o dourado cheio",
     /\.tile\.t-star \.val\{color:var\(--star-ink\)\}/.test(html) &&
     /--star-ink:/.test(html), (html.match(/\.tile\.t-star[^}]*\}/g)||[]).join(" "));
  /* o número do bloco ★ usa --star-ink, não --star: o dourado cheio dá 2,82:1
     sobre o papel claro, abaixo do piso de 3:1 para texto grande */
  ok("o número da véspera usa o tom legível, não o dourado cheio",
     /\.tile\.t-star \.val\{color:var\(--star-ink\)\}/.test(html) &&
     /--star-ink:/.test(html), (html.match(/\.tile\.t-star[^}]*\}/g)||[]).join(" "));

  /* ---- 3. no conteúdo, a última anotação entra no lugar da cobertura ---- */
  const sa=$("#eAssunto");
  sa.value=[...sa.options].find(o=>/LAI/.test(o.textContent)).value; change(sa);
  await espera(400);
  t=blocos();
  ok("no conteúdo, aparece a última anotação", t.some(x=>/^Última anotação/.test(x)), t);
  ok("com 'hoje' quando foi hoje", t.some(x=>/Última anotação.*hoje/.test(x)), t);
  ok("e a contagem é só a dele", t.some(x=>/^Pontos anotados2/.test(x)), t);
  ok("sem taxa nem desatenção aqui também",
     !t.some(x=>/Taxa de acerto|desatenção/i.test(x)), t);

  /* ---- 4. o compositor: disciplina e conteúdo em cascata ---- */
  const sd2=$("#eDisciplina"); sd2.value=""; change(sd2); await espera(400);
  click($('[data-acao="abrir-composer"]')); await espera(400);
  const sd=$('.compositor [name="alvoDisciplina"]');
  const sc=$('.compositor [name="alvoConteudo"]');
  ok("o compositor tem campo de disciplina", !!sd, $(".compositor").innerHTML.slice(0,140));
  ok("e campo de conteúdo", !!sc);
  ok("a disciplina lista só disciplinas",
     [...sd.options].filter(o=>o.value).map(o=>o.textContent).sort().join()==="Legislação,Português",
     [...sd.options].map(o=>o.textContent));
  sd.value="Legislação"; change(sd); await espera(200);
  let ops=[...sc.options].map(o=>o.textContent);
  // o rótulo pode trazer o aviso "— ainda sem sessão"
  ok("o conteúdo mostra só os da disciplina escolhida",
     ops.some(t=>/^LAI/.test(t)) && ops.some(t=>/^Licitações/.test(t)) &&
     !ops.some(t=>/Crase/.test(t)), ops);
  ok("com 'Toda a disciplina' em primeiro", /Toda a disciplina/.test(ops[0]), ops);

  sd.value="Português"; change(sd); await espera(200);
  ops=[...$('.compositor [name="alvoConteudo"]').options].map(o=>o.textContent);
  ok("trocar a disciplina refaz a lista de conteúdos",
     ops.includes("Crase") && !ops.includes("LAI"), ops);

  /* ---- 5. salvar usa os dois campos ---- */
  $("#txtNovo").value="antes de masculino não tem crase";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  $('.compositor [name="alvoConteudo"]').value="Crase";
  click($('[data-acao="salvar-aprendizado"]')); await espera(500);
  let e=db().erros.find(x=>/masculino/.test(x.ensinamento));
  ok("a anotação vai para a disciplina e o conteúdo escolhidos",
     !!e && e.disciplina==="Português" && e.assunto==="Crase", e);

  /* ---- 6. conteúdo em branco = disciplina inteira ---- */
  $("#txtNovo").value="ler o enunciado até o fim";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  $('.compositor [name="alvoConteudo"]').value="";
  click($('[data-acao="salvar-aprendizado"]')); await espera(500);
  e=db().erros.find(x=>/enunciado/.test(x.ensinamento));
  ok("conteúdo em branco deixa a anotação na disciplina inteira",
     !!e && e.disciplina==="Português" && e.assunto==="", e);

  /* ---- 7. a edição também tem os dois campos, e move ---- */
  const sd3=$("#eDisciplina"); sd3.value="Português"; change(sd3); await espera(400);
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(450);
  const fd=$('#formEdicaoErro [name="alvoDisciplina"]');
  const fc=$('#formEdicaoErro [name="alvoConteudo"]');
  ok("a edição abre com os dois campos", !!fd && !!fc);
  ok("já com a disciplina da anotação", fd.value==="Português", fd.value);
  fd.value="Legislação"; change(fd); await espera(200);
  const ops2=[...$('#formEdicaoErro [name="alvoConteudo"]').options].map(o=>o.textContent);
  ok("trocando a disciplina na edição, o conteúdo acompanha",
     ops2.includes("LAI") && !ops2.includes("Crase"), ops2);
  $('#formEdicaoErro [name="alvoConteudo"]').value="Licitações";
  $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(450);
  ok("a anotação é movida para a disciplina e o conteúdo novos",
     db().erros.some(x=>x.disciplina==="Legislação" && x.assunto==="Licitações"),
     db().erros.map(x=>x.disciplina+"/"+x.assunto));

  /* ---- 8. o compositor guarda o destino para a próxima anotação ---- */
  const sdz=$("#eDisciplina"); sdz.value=""; change(sdz); await espera(400);
  click($('[data-acao="abrir-composer"]')); await espera(400);
  $('.compositor [name="alvoDisciplina"]').value="Legislação";
  change($('.compositor [name="alvoDisciplina"]')); await espera(200);
  $('.compositor [name="alvoConteudo"]').value="LAI";
  $("#txtNovo").value="primeira do par";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  click($('[data-acao="salvar-aprendizado"]')); await espera(500);
  ok("depois de salvar, a disciplina continua escolhida",
     $('.compositor [name="alvoDisciplina"]').value==="Legislação",
     $('.compositor [name="alvoDisciplina"]').value);
  ok("e o conteúdo também", $('.compositor [name="alvoConteudo"]').value==="LAI",
     $('.compositor [name="alvoConteudo"]').value);
  $("#txtNovo").value="segunda do par, sem reescolher nada";
  $("#txtNovo").dispatchEvent(new w.Event("input",{bubbles:true}));
  click($('[data-acao="salvar-aprendizado"]')); await espera(500);
  const par=db().erros.find(x=>/segunda do par/.test(x.ensinamento));
  ok("a segunda anotação vai para o mesmo destino, sem reescolher",
     !!par && par.disciplina==="Legislação" && par.assunto==="LAI", par);
  click($('[data-acao="cancelar-composer"]')); await espera(350);
  click($('[data-acao="abrir-composer"]')); await espera(400);
  ok("fechar o compositor esquece o destino, como esquece o rascunho",
     $('.compositor [name="alvoDisciplina"]').value==="",
     $('.compositor [name="alvoDisciplina"]').value);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nblocos e campos das anotações ok");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
