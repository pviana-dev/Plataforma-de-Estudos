/* O ✎ da etiqueta, dentro de Editar sessão: renomeia a FICHA e propaga por todo
   o sistema — e não pode levar junto o que está digitado e ainda não foi salvo. */
const responderDialogos=require("./_dialogo.cjs"), fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,ass,extra)=>Object.assign({id,data:dia(-1),disciplina:"Legislação",assuntos:ass,assunto:ass[0],
  minutos:60,questoes:10,acertos:8,dificuldade:3,anotacoes:"",tipo:"estudo",criadoEm:Number(id.slice(1))},extra||{});
const seed={versao:1,tema:"claro",dataProva:"",metaDiariaMin:120,
 disciplinas:["Legislação"],grupos:[],lancamentos:[],
 conteudos:[{disciplina:"Legislação",nome:"LAI",fase:"andamento"},
            {disciplina:"Legislação",nome:"Licitações",fase:"andamento"}],
 conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,
 registros:[sess("r1",["LAI"]), sess("r2",["LAI","Licitações"])],
 revisoes:[{id:"v1",registroId:null,disciplina:"Legislação",assuntos:["LAI"],data:dia(2),ordem:1,
            feita:false,manual:true,minutos:null,questoes:null,acertos:null,dificuldade:null,
            atividade:"",nota:""}],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",texto:"art. 5º",importante:false,criadoEm:1}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let perguntado="", avisado="";
function abrir(resposta){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     responderDialogos(w, t=>{ perguntado=t; return resposta; }, t=>{ avisado=t; });
     w.alert=t=>{ avisado=t; };
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const abrirSessao=async(w,id)=>{
  click(w, w.document.querySelector('tbody tr[data-id="'+id+'"] [data-acao="editar-registro"]')
         || w.document.querySelector('tbody tr[data-id="'+id+'"]'));
  await espera(450);
};

(async()=>{try{
  /* ---- 1. o ✎ está na etiqueta ---- */
  let w=abrir("Lei de Acesso à Informação"); await espera(450);
  let doc=w.document, $=s=>doc.querySelector(s);
  await abrirSessao(w,"r2");
  ok("a tela de edição da sessão abriu", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  const tags=[...doc.querySelectorAll("#listaAssuntosForm .tag")];
  ok("as duas etiquetas estão lá", tags.length===2, tags.map(t=>t.dataset.assunto));
  ok("cada etiqueta tem um ✎ de renomear",
     tags.every(t=>t.querySelector('[data-acao="renomear-no-form"]')), tags.map(t=>t.innerHTML.slice(0,80)));
  /* o texto da etiqueta já se digitou ali mesmo, e renomeava só naquela sessão:
     o que se checa é o comportamento, não a palavra no fonte */
  const txt=tags[0].querySelector(".txt");
  ok("o texto da etiqueta não é mais um campo digitável",
     !txt.isContentEditable && !txt.hasAttribute("contenteditable") &&
     !/\.tag \.txt\{[^}]*cursor:text/.test(html),
     txt.outerHTML);

  /* ---- 2. o que está digitado e não foi salvo ---- */
  const desc=$('#modalCorpo [name="anotacoes"]');
  desc.value="rascunho que não pode sumir";
  const min=$('#modalCorpo [name="minutos"]'); const minAntes=min.value;
  min.value="123";

  /* ---- 3. renomear pelo ✎ ---- */
  const alvo=tags.find(t=>t.dataset.assunto==="LAI");
  click(w, alvo.querySelector('[data-acao="renomear-no-form"]'));
  await espera(400);
  ok("o ✎ pergunta o nome novo", /Novo nome para “LAI”/.test(perguntado), perguntado);
  /* 1 item: a revisão avulsa da seed. Ela já é um pendente que fala de LAI, e
     por isso a agenda não marca uma volta ao lado dela — a invariante "um
     conteúdo aberto, um item só" conta qualquer pendente, não só as voltas. */
  ok("e diz o alcance antes de mudar",
     /2 sessões/.test(perguntado) && /1 item da agenda/.test(perguntado) && /1 anotação/.test(perguntado),
     perguntado);

  const d=db(w);
  ok("a ficha foi renomeada", (d.conteudos||[]).some(c=>c.nome==="Lei de Acesso à Informação") &&
     !d.conteudos.some(c=>c.nome==="LAI"), d.conteudos.map(c=>c.nome));
  ok("as DUAS sessões acompanharam",
     d.registros.every(r=>!r.assuntos.includes("LAI")) &&
     d.registros.filter(r=>r.assuntos.includes("Lei de Acesso à Informação")).length===2,
     d.registros.map(r=>r.assuntos));
  ok("a revisão avulsa acompanhou", d.revisoes[0].assuntos.join()==="Lei de Acesso à Informação",
     d.revisoes[0].assuntos);
  ok("a anotação acompanhou", d.erros[0].assunto==="Lei de Acesso à Informação", d.erros[0].assunto);
  ok("o outro conteúdo ficou intacto", d.conteudos.some(c=>c.nome==="Licitações"));

  /* ---- 4. o que estava digitado sobreviveu ---- */
  ok("a descrição digitada continua na tela",
     $('#modalCorpo [name="anotacoes"]').value==="rascunho que não pode sumir",
     $('#modalCorpo [name="anotacoes"]').value);
  ok("e o tempo digitado também", $('#modalCorpo [name="minutos"]').value==="123",
     {agora:$('#modalCorpo [name="minutos"]').value, antes:minAntes});

  /* ---- 5. a etiqueta na tela passou a valer pelo nome novo ---- */
  const tag2=[...doc.querySelectorAll("#listaAssuntosForm .tag")].find(t=>/Lei de Acesso/.test(t.textContent));
  ok("a etiqueta mostra o nome novo", !!tag2, [...doc.querySelectorAll(".tag")].map(t=>t.textContent));
  ok("e o data-assunto acompanhou — é dele que o salvamento lê",
     tag2 && tag2.dataset.assunto==="Lei de Acesso à Informação", tag2 && tag2.dataset.assunto);

  /* ---- 6. salvar não recria a ficha antiga ---- */
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(450);
  const dd=db(w);
  ok("salvar a sessão não ressuscita o nome antigo",
     !(dd.conteudos||[]).some(c=>c.nome==="LAI") &&
     !dd.registros.some(r=>(r.assuntos||[]).includes("LAI")),
     {conteudos:dd.conteudos.map(c=>c.nome), sess:dd.registros.map(r=>r.assuntos)});
  ok("e a descrição digitada foi gravada",
     dd.registros.find(r=>r.id==="r2").anotacoes==="rascunho que não pode sumir",
     dd.registros.find(r=>r.id==="r2").anotacoes);

  /* ---- 7. nome duplicado é recusado, como na aba Disciplinas ---- */
  w=abrir("Licitações"); await espera(450);
  doc=w.document; $=s=>doc.querySelector(s);
  await abrirSessao(w,"r2");
  const lai=[...doc.querySelectorAll("#listaAssuntosForm .tag")].find(t=>t.dataset.assunto==="LAI");
  click(w, lai.querySelector('[data-acao="renomear-no-form"]'));
  await espera(400);
  ok("renomear para um nome que já existe é recusado",
     /Já existe um conteúdo com esse nome/.test(avisado), avisado);
  ok("e nada foi alterado", (db(w).conteudos||[]).some(c=>c.nome==="LAI") &&
     db(w).registros.some(r=>(r.assuntos||[]).includes("LAI")),
     db(w).conteudos.map(c=>c.nome));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\n✎ no formulário: renomeia em todo o sistema e preserva o que está digitado");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
