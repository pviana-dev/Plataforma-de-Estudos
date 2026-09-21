const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,
 disciplinas:["Legislação","Português","Disciplina sem sessão"],grupos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:5,acertos:4,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Direito Penal",assunto:"Peculato",fonte:"",oQueErrei:"",ensinamento:"anotação órfã do modelo antigo",categoria:"",refeita:false,importante:false,criadoEm:1}],
 cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));

(async()=>{try{
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });
  await passo(()=>{
    ok("sumiu o botão de criar conteúdo", !doc.querySelector('[data-acao="novo-conteudo"]'));
    ok("não existe mais formulário de novo conteúdo", !$("#formConteudo"));
    const discs=[...$("#eDisciplina").options].map(o=>o.value).filter(Boolean);
    ok("disciplina sem sessão não aparece no filtro", !discs.includes("Disciplina sem sessão"), discs);
    ok("as disciplinas com sessão aparecem", discs.includes("Legislação")&&discs.includes("Português"), discs);
    const cont=[...$("#eAssunto").options].map(o=>o.textContent);
    ok("os conteúdos vêm das sessões registradas", cont.some(t=>/LAI/.test(t))&&cont.some(t=>/Crase/.test(t)), cont);
    ok("a anotação antiga sem sessão continua acessível, marcada",
       cont.some(t=>/Peculato — sem sessão de estudo/.test(t)), cont);
  });

  /* ---- anotar num conteúdo existente ---- */
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>/LAI/.test(o.textContent)).value; change(s); });
  await passo(()=>{ click(doc.querySelector('[data-acao="abrir-composer"]')); });
  await passo(()=>{
    $("#txtNovo").value="prazo de resposta é de 20 dias";
    click(doc.querySelector('[data-acao="salvar-aprendizado"]'));
  });
  await passo(()=>{
    const novo=lerDb().erros.find(e=>/20 dias/.test(e.ensinamento));
    ok("o feedback nasce preso ao conteúdo da sessão",
       novo && novo.disciplina==="Legislação" && novo.assunto==="LAI", novo&&{d:novo.disciplina,a:novo.assunto});
  });

  /* ---- editar: sem campo livre, sem criar disciplina ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-erro"]')); });
  await passo(()=>{
    const f=$("#formEdicaoErro");
    ok("o conteúdo virou seletor", !!f.querySelector('select[name=conteudo]'));
    ok("não há campo livre de conteúdo", !f.querySelector('input[name=assunto]'));
    ok("não há seletor de disciplina com 'criar nova'", !f.querySelector('select.sel-disciplina'),
       [...f.querySelectorAll("select")].map(s=>s.name));
    const opts=[...f.querySelector('select[name=conteudo]').options].map(o=>o.textContent);
    ok("o seletor só oferece alvos de sessão registrada",
       opts.every(t=>/Legislação|Português/.test(t)) && !opts.some(t=>/sem sessão de estudo/.test(t)), opts);
    // troca o conteúdo para outro existente
    const sel=f.querySelector('select[name=conteudo]');
    sel.value=[...sel.options].find(o=>/Crase/.test(o.textContent)).value;
    f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const e=lerDb().erros.find(x=>/20 dias/.test(x.ensinamento));
    ok("dá para mover o feedback para outro conteúdo existente",
       e.disciplina==="Português"&&e.assunto==="Crase", {d:e.disciplina,a:e.assunto});
  });

  /* ---- a anotação órfã pode ser consertada, não recriada ---- */
  await passo(()=>{ const d=$("#eDisciplina"); d.value=""; change(d); });   // volta a ver tudo
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>/Peculato/.test(o.textContent)).value; change(s); });
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-erro"]')); });
  await passo(()=>{
    const sel=$("#formEdicaoErro select[name=conteudo]");
    ok("a órfã abre com o conteúdo dela selecionado", /Peculato/.test(sel.options[sel.selectedIndex].textContent),
       sel.options[sel.selectedIndex].textContent);
    sel.value=[...sel.options].find(o=>/LAI/.test(o.textContent)).value;
    $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const e=lerDb().erros.find(x=>/órfã/.test(x.ensinamento));
    ok("a órfã foi ligada a uma sessão de verdade", e.disciplina==="Legislação"&&e.assunto==="LAI", {d:e.disciplina,a:e.assunto});
    ok("e some da lista de conteúdos sem sessão",
       ![...$("#eAssunto").options].some(o=>/Peculato/.test(o.textContent)), [...$("#eAssunto").options].map(o=>o.textContent));
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntodos os testes de feedback passaram");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
