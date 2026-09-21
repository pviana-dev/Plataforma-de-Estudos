const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");

/* A aba Agenda abre na visão POR DIA. Quem testa os cards por assunto precisa
   pedir a visão "Por assunto" primeiro. */
function verPorAssunto(doc, w){
  const b=doc.querySelector('[data-acao="visao-agenda"][data-visao="assunto"]');
  if (b) b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return !!b;
}

/* O conteúdo agora se escolhe numa lista. Este atalho faz o que a pessoa faz:
   escolhe "criar novo", digita o nome e clica em adicionar. */
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const existe=[...sel.options].some(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (existe){ sel.value=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase()).value; }
  else {
    sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
    const campo=doc.querySelector("#novoConteudoNome"); if (!campo) return false;
    campo.value=nome;
  }
  const bt=doc.querySelector('[data-acao="add-assunto"]');
  bt.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  return true;
}
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
// duas sessões de LAI, cada uma com seu próprio plano individual (o estado que gerou "1,2,3 duas vezes")
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[
  {id:"rA",data:ontem,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:7,dificuldade:4,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje, disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:50,questoes:8,acertos:5,dificuldade:4,anotacoes:"",criadoEm:2}],
 revisoes:[
  {id:"a1",registroId:"rA",data:iso(new Date(Date.now()+2*864e5)),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"a2",registroId:"rA",data:iso(new Date(Date.now()+7*864e5)),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"a3",registroId:"rA",data:iso(new Date(Date.now()+14*864e5)),ordem:3,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"b1",registroId:"rB",data:iso(new Date(Date.now()+3*864e5)),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"b2",registroId:"rB",data:iso(new Date(Date.now()+9*864e5)),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"b3",registroId:"rB",data:iso(new Date(Date.now()+16*864e5)),ordem:3,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const passo=(fn,ms=300)=>new Promise(r=>setTimeout(()=>{fn();r();},ms));
const numeros=()=>[...doc.querySelectorAll("#view .meta")].map(m=>(m.textContent.match(/revisão (\d+)/)||[])[1]).filter(Boolean);

(async()=>{try{
  await passo(()=>{ click($('[data-aba="revisoes"]')); });
  await passo(()=>{ verPorAssunto(doc, w); });
  await passo(()=>{
    const cards=[...doc.querySelectorAll('[data-acao="editar-card"]')];
    const ns=numeros();
    ok("as duas sessões de LAI caem no mesmo card", cards.length===1, cards.map(c=>c.dataset.card));
    ok("a numeração é contínua (sem 1,2,3 repetido)", ns.join(",")===ns.map((_,i)=>i+1).join(","), ns);
  });

  /* ---- o card agora pode ser editado: título + conteúdos ligados ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-card"]')); });
  await passo(()=>{
    ok("o editor do card abre com o título atual", $("#tituloCard") && $("#tituloCard").value==="LAI", $("#tituloCard")&&$("#tituloCard").value);
    const chips=[...doc.querySelectorAll("#modalCorpo [data-membro]")].map(c=>c.dataset.membro).sort();
    ok("mostra os conteúdos ligados ao card", chips.join(",")==="rA,rB", chips);
    $("#tituloCard").value="LAI (Lei 12.527)";
    click(doc.querySelector('[data-acao="salvar-card"]'));
  },100);
  const antesDaFusao = [];
  await passo(()=>{
    const d=lerDb();
    ok("editar o título transformou o card num grupo", d.grupos.length===1 && d.grupos[0].nome==="LAI (Lei 12.527)", d.grupos);
    const gid=d.grupos[0].id;
    ok("as duas sessões ficaram ligadas ao card", d.registros.filter(r=>r.grupoId===gid).length===2, d.registros.map(r=>r.id+":"+(r.grupoId||"-")));
    d.revisoes.forEach(r=>antesDaFusao.push(r.data));
    ok("o título do card aparece na Rotina", /LAI \(Lei 12\.527\)/.test($("#view").textContent));
    console.log("      [fila depois de juntar as duas sessões: " + d.revisoes.length + " cards — " +
                d.revisoes.map(r=>r.data.slice(5)).sort().join(", ") + "]");
  });

  /* ---- integrar uma TERCEIRA sessão não pode criar cards novos ---- */
  let datasAntes, qtdAntes;
  await passo(()=>{
    const d=lerDb(); qtdAntes=d.revisoes.length; datasAntes=d.revisoes.map(r=>r.data).sort().join(",");
    click($('[data-aba="registros"]'));
  });
  await passo(()=>{
    click($('[data-acao="toggle-form-registro"]'));
  });
  // trocar a disciplina redesenha o formulário (a lista de conteúdos é outra):
  // tudo precisa ser consultado de novo depois disso
  await passo(()=>{
    const sd=$("#formRegistro select.sel-disciplina");
    sd.value="Legislação"; change(sd);
  });
  await passo(()=>{
    const f=$("#formRegistro");
    porConteudo(doc, w, "LAI - prazos");
    const cx=$("#cxIntegrado"); cx.checked=true; change(cx);
    const sel=$("#grupoAlvo"); const opt=[...sel.options].find(o=>o.value.startsWith("g:"));
    ok("o card existente aparece como destino da integração", !!opt, [...sel.options].map(o=>o.value));
    sel.value=opt.value; change(sel);
    f.querySelector("[name=minutos]").value="30";
    f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  });
  await passo(()=>{
    const d=lerDb();
    ok("NENHUM card de revisão novo foi criado", d.revisoes.length===qtdAntes, {antes:qtdAntes, depois:d.revisoes.length});
    ok("as datas das revisões continuam as mesmas", d.revisoes.map(r=>r.data).sort().join(",")===datasAntes,
       {antes:datasAntes, depois:d.revisoes.map(r=>r.data).sort().join(",")});
    const gid=d.grupos[0].id;
    ok("o conteúdo novo entrou nos cards que já existiam",
       d.revisoes.filter(r=>r.grupoId===gid).every(r=>(r.assuntos||[]).includes("LAI - prazos")),
       d.revisoes.map(r=>(r.assuntos||[]).join("·")));
    ok("as três sessões estão ligadas ao card", d.registros.filter(r=>r.grupoId===gid).length===3,
       d.registros.map(r=>r.assunto+":"+(r.grupoId?"g":"-")));
  });
  await passo(()=>{ click($('[data-aba="revisoes"]')); });
  await passo(()=>{ verPorAssunto(doc, w); });
  await passo(()=>{
    const ns=numeros();
    ok("continua havendo um card só", doc.querySelectorAll('[data-acao="editar-card"]').length===1);
    ok("a numeração segue contínua depois de integrar", ns.join(",")===ns.map((_,i)=>i+1).join(","), ns);
    ok("o card lista os três conteúdos", /LAI · LAI - prazos|LAI - prazos/.test($("#view").textContent));
  });

  /* ---- remover um conteúdo pelo editor do card ---- */
  await passo(()=>{ click(doc.querySelector('[data-acao="editar-card"]')); });
  await passo(()=>{
    const chip=doc.querySelector('#modalCorpo [data-membro="rA"]');
    ok("o conteúdo aparece para ser removido", !!chip);
    click(chip.querySelector('[data-acao="remover-membro"]'));
    click(doc.querySelector('[data-acao="salvar-card"]'));
  },100);
  await passo(()=>{
    const d=lerDb(), gid=d.grupos[0].id;
    ok("o conteúdo saiu do card", !d.registros.some(r=>r.id==="rA" && r.grupoId===gid), d.registros.map(r=>r.id+":"+(r.grupoId||"-")));
    ok("quem saiu ficou em revisão manual", d.registros.find(r=>r.id==="rA").plano==="manual");
    ok("os cards do grupo continuam de pé", d.revisoes.some(r=>r.grupoId===gid && !r.feita));
  });

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntodos os testes passaram");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,5).join("\n"));process.exit(2);}})();
