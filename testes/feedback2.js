const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,
 disciplinas:["Legislação","Português","Disciplina sem sessão"],grupos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:5,acertos:4,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=250)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));
const opcoes=id=>[...$(id).options].map(o=>o.textContent);
const anotar=texto=>{ click(doc.querySelector('[data-acao="abrir-composer"]')); };

(async()=>{try{
  await passo(()=>{ click(doc.querySelector('[data-aba="erros"]')); });

  /* ---- sem nada escolhido: o botão + já existe (a escolha vem no compositor) ---- */
  await passo(()=>{
    ok("sem escolher nada, o botão + já está disponível", !!doc.querySelector('[data-acao="abrir-composer"]'));
    ok("e ele avisa que a escolha vem na hora de salvar",
       /na hora de salvar/.test(doc.querySelector('[data-acao="abrir-composer"]').textContent),
       doc.querySelector('[data-acao="abrir-composer"]').textContent);
    ok("sem a frase-guia no topo da aba", !/não quer esquecer da matéria/.test($("#view").textContent)); // frase-guia tirada a pedido do Pedro (24/09)
    const d=$("#eDisciplina"); d.value="Legislação"; change(d);
  });

  /* ---- só a disciplina escolhida: dá para anotar na disciplina inteira ---- */
  await passo(()=>{
    const bt=doc.querySelector('[data-acao="abrir-composer"]');
    ok("escolher só a disciplina já libera anotar", !!bt, $("#view").textContent.slice(0,80));
    ok("o botão diz que é na disciplina inteira", /Legislação/.test(bt.textContent)&&/disciplina inteira/.test(bt.textContent), bt.textContent);
    ok("o seletor de conteúdo lista só conteúdos de verdade",
       !opcoes("#eAssunto").some(t=>/disciplina/.test(t)), opcoes("#eAssunto"));
    click(bt);
  });
  await passo(()=>{ $("#txtNovo").value="ler sempre o enunciado até o fim"; click(doc.querySelector('[data-acao="salvar-aprendizado"]')); });
  await passo(()=>{
    const e=lerDb().erros.find(x=>/enunciado/.test(x.ensinamento));
    ok("a anotação fica na disciplina, sem conteúdo", e && e.disciplina==="Legislação" && e.assunto==="", e&&{d:e.disciplina,a:e.assunto});
  });

  /* ---- agora uma no conteúdo ---- */
  await passo(()=>{ const s=$("#eAssunto"); s.value=[...s.options].find(o=>o.textContent==="LAI").value; change(s); });
  await passo(()=>{ click(doc.querySelector('[data-acao="abrir-composer"]')); });
  await passo(()=>{ $("#txtNovo").value="prazo de 20 dias"; click(doc.querySelector('[data-acao="salvar-aprendizado"]')); });
  await passo(()=>{
    const e=lerDb().erros.find(x=>/20 dias/.test(x.ensinamento));
    ok("a anotação por conteúdo fica no conteúdo", e && e.assunto==="LAI", e&&{d:e.disciplina,a:e.assunto});
    ok("filtrando por conteúdo, só aparece a dele",
       /20 dias/.test($("#view").textContent) && !/enunciado/.test($("#view").textContent));
  });

  /* ---- "Tudo de Legislação" mostra as duas dimensões ---- */
  await passo(()=>{ const s=$("#eAssunto"); s.value=""; change(s); });
  await passo(()=>{
    ok("'Tudo de Legislação' mostra as duas dimensões",
       /enunciado/.test($("#view").textContent) && /20 dias/.test($("#view").textContent));
    ok("o card diz de onde cada uma é",
       /toda a disciplina/.test($("#view").textContent) && /LAI/.test($("#view").textContent));
  });

  /* ---- editar: move entre as dimensões, sem criar nada ---- */
  await passo(()=>{ click(doc.querySelectorAll('[data-acao="editar-erro"]')[0]); });
  await passo(()=>{
    const sd=$('#formEdicaoErro [name="alvoDisciplina"]');
    const sc=$('#formEdicaoErro [name="alvoConteudo"]');
    ok("as duas dimensões continuam: disciplina inteira ou um conteúdo dela",
       [...sc.options].some(o=>/Toda a disciplina/.test(o.textContent)) &&
       [...sc.options].some(o=>/LAI/.test(o.textContent)), [...sc.options].map(o=>o.textContent));
    ok("nenhum campo livre ou criação de disciplina",
       !$("#formEdicaoErro input[name=assunto]") && !$("#formEdicaoErro select.sel-disciplina"));
    ok("a disciplina sem sessão também é um destino válido",
       [...sd.options].some(o=>/Disciplina sem sessão/.test(o.textContent)),
       [...sd.options].map(o=>o.textContent));
    sd.value="Português"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
    $('#formEdicaoErro [name="alvoConteudo"]').value="Crase";
    $("#formEdicaoErro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const e=lerDb().erros.find(x=>/20 dias|enunciado/.test(x.ensinamento) && x.disciplina==="Português");
    ok("dá para mover de dimensão/disciplina na edição", !!e && e.assunto==="Crase", lerDb().erros.map(x=>x.disciplina+"/"+x.assunto));
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntodos os testes das duas dimensões passaram");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
