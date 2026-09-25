/* Criar e renomear disciplinas pela aba Disciplinas. Renomear tem de alcançar
   tudo o que escreve o nome: a lista, as sessões, a agenda, as anotações e as
   fichas de conteúdo — senão o cadastro se parte em duas. */
const responderDialogos=require("./_dialogo.cjs"), fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 disciplinas:["Legislação","Português"],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Português",nome:"Crase",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[{id:"r1",data:dia(-2),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,
   questoes:10,acertos:8,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:1},
  {id:"r2",data:dia(-1),disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,
   questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:2}],
 revisoes:[{id:"v1",registroId:null,disciplina:"Legislação",assuntos:["LAI"],data:dia(2),ordem:1,
   feita:false,manual:true,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",ensinamento:"art. 5º",importante:false,criadoEm:1}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let perguntado="", avisado="";
function abrir(resposta){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"conteudos",gravadoEm:hoje}));
     responderDialogos(w, t=>{ perguntado=t; return resposta; }, t=>{ avisado=t; });
     w.alert=t=>{ avisado=t; };
     w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const discsNaTela=doc=>[...doc.querySelectorAll("#view .grupo-rev .cab strong")].map(e=>e.textContent);

(async()=>{try{
  /* ---- 1. criar ---- */
  let w=abrir("Matemática"); await espera(500);
  let doc=w.document, $=s=>doc.querySelector(s);
  ok("a aba tem o botão de nova disciplina", !!$('[data-acao="nova-disciplina"]'),
     $("#view").textContent.slice(0,80));
  click(w, $('[data-acao="nova-disciplina"]')); await espera(400);
  // a tela do navegador (prompt) virou uma tela do app (pedido do Pedro, 24/09)
  ok("ele abre a tela 'Nova disciplina', no estilo do app", $("#modalTitulo").textContent==="Nova disciplina" &&
     !!$("#formNovaDisciplina [name=nome]") && !perguntado, [$("#modalTitulo").textContent, perguntado]);
  $("#formNovaDisciplina [name=nome]").value="Matemática";
  $("#formNovaDisciplina").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("a disciplina é criada", (db(w).disciplinas||[]).includes("Matemática"), db(w).disciplinas);
  ok("e aparece na tela, ainda sem conteúdos",
     discsNaTela(doc).includes("Matemática") && /Nenhum conteúdo cadastrado/.test($("#view").textContent),
     discsNaTela(doc));
  ok("nenhum conteúdo foi inventado junto",
     !(db(w).conteudos||[]).some(c=>c.disciplina==="Matemática"), db(w).conteudos);

  /* ---- 2. nome repetido é recusado ---- */
  w=abrir("legislação"); await espera(500);
  doc=w.document; $=s=>doc.querySelector(s);
  click(w, $('[data-acao="nova-disciplina"]')); await espera(350);
  $("#formNovaDisciplina [name=nome]").value="legislação";
  $("#formNovaDisciplina").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  ok("nome repetido (mesmo com outra caixa) é recusado, na própria tela",
     /Já existe uma disciplina/.test($("#erroNovaDisciplina").textContent) && !avisado, $("#erroNovaDisciplina").textContent);
  ok("e nada é criado", (db(w).disciplinas||[]).length===2, db(w).disciplinas);

  /* ---- 3. renomear propaga para tudo ---- */
  w=abrir("Direito Administrativo"); await espera(500);
  doc=w.document; $=s=>doc.querySelector(s);
  const bt=[...doc.querySelectorAll('[data-acao="renomear-disciplina"]')]
    .find(b=>b.dataset.disc==="Legislação");
  ok("cada disciplina tem um ✎ de renomear", !!bt, discsNaTela(doc));
  click(w, bt); await espera(450);
  ok("o ✎ diz o alcance antes de mudar",
     /1 conteúdo/.test(perguntado) && /1 sessão/.test(perguntado) && /1 anotação/.test(perguntado),
     perguntado);
  const d=db(w);
  ok("a lista de disciplinas acompanhou",
     d.disciplinas.includes("Direito Administrativo") && !d.disciplinas.includes("Legislação"),
     d.disciplinas);
  ok("a sessão acompanhou", d.registros.find(r=>r.id==="r1").disciplina==="Direito Administrativo",
     d.registros.map(r=>r.disciplina));
  ok("a ficha do conteúdo acompanhou",
     d.conteudos.find(c=>c.nome==="LAI").disciplina==="Direito Administrativo",
     d.conteudos);
  ok("a revisão avulsa acompanhou", d.revisoes.find(r=>r.id==="v1").disciplina==="Direito Administrativo",
     d.revisoes.map(r=>r.disciplina));
  ok("a anotação acompanhou", d.erros[0].disciplina==="Direito Administrativo", d.erros[0].disciplina);
  ok("a outra disciplina ficou intacta",
     d.registros.find(r=>r.id==="r2").disciplina==="Português" &&
     d.conteudos.find(c=>c.nome==="Crase").disciplina==="Português");
  ok("e a tela mostra o nome novo",
     discsNaTela(doc).sort().join()==="Direito Administrativo,Português", discsNaTela(doc));
  ok("sem sobrar nenhuma disciplina órfã com o nome antigo",
     !JSON.stringify(d).includes('"Legislação"'),
     (JSON.stringify(d).match(/Legisla[^"]*/g)||[]).slice(0,4));

  /* ---- 4. renomear para um nome que já existe é recusado ---- */
  w=abrir("Português"); await espera(500);
  doc=w.document; $=s=>doc.querySelector(s);
  click(w, [...doc.querySelectorAll('[data-acao="renomear-disciplina"]')]
    .find(b=>b.dataset.disc==="Legislação")); await espera(400);
  ok("renomear para uma disciplina existente é recusado",
     /Já existe uma disciplina/.test(avisado), avisado);
  ok("e nada mudou", db(w).registros.find(r=>r.id==="r1").disciplina==="Legislação",
     db(w).registros.map(r=>r.disciplina));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ncriar e renomear disciplinas funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
