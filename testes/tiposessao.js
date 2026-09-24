const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),dia=n=>iso(new Date(Date.now()+n*864e5));
/* revisarAte curto: a escada é completada na carga (garantia de revisão), e esta suíte é sobre a tela, não sobre quantas revisões cabem. */
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",revisarAte:dia(6),metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:dia(-5),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[
  {id:"vHoje",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vAtras",registroId:"rA",data:dia(-2),ordem:2,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},
  {id:"vFut",registroId:"rA",data:dia(6),ordem:3,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};

/* Estas suítes testam a ESCADA de revisões, que só existe em conteúdo fechado.
   Com a fase nova, conteúdo nasce em andamento — então o seed fecha tudo. */
seed.registros.forEach(r=>{ r.fase="concluido"; r.concluidoEm=r.data; });
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  await espera(300);
  // o tipo é atribuído ao carregar e gravado na próxima escrita

  click(doc.querySelector('[data-aba="registros"]')); await espera(250);
  click(doc.querySelector('[data-acao="toggle-form-registro"]')); await espera(300);
  ok("o formulário pergunta o tipo", !!$("#tipoEstudo") && !!$("#tipoRevisao"));
  ok("estudo é o padrão", $("#tipoEstudo").checked);
  ok("sem tipo revisão não há painel de revisão", !$("#revisaoAlvo"));

  $("#tipoRevisao").checked=true; change($("#tipoRevisao")); await espera(300);
  ok("escolhendo revisão, aparece o seletor", !!$("#revisaoAlvo"));
  const opts=[...$("#revisaoAlvo").options].map(o=>o.textContent);
  console.log("  revisões oferecidas: "+opts.join(" | "));
  ok("lista a de hoje", opts.some(t=>/LAI/.test(t)&&!/atrasada/.test(t)), opts);
  ok("lista a atrasada com aviso", opts.some(t=>/⚠ atrasada de/.test(t)), opts);
  ok("não lista a futura", opts.length===3, opts);
  ok("a integração some na revisão", !$("#cxIntegrado"));
  ok("os assuntos ficam travados", !$("#campoAssunto") && !!doc.querySelector("#listaAssuntosForm .tag.fixo"));

  $("#revisaoAlvo").value="vHoje"; change($("#revisaoAlvo")); await espera(300);
  ok("escolhida a revisão, o conteúdo dela aparece",
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].some(t=>/LAI/.test(t.textContent)),
     [...doc.querySelectorAll("#listaAssuntosForm .tag")].map(t=>t.textContent));
  $("#modalCorpo [name=minutos]").value="40";
  { const _d=$("#formRegistro [name=dificuldade]"); if (_d && !_d.value) _d.value="2"; }   // obrigatória, sem padrão
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);

  const d=lerDb(), nova=d.registros.find(r=>r.tipo==="revisao");
  ok("a sessão antiga ficou gravada como estudo",
     d.registros.find(r=>r.id==="rA").tipo==="estudo", d.registros.find(r=>r.id==="rA").tipo);
  ok("a sessão nasceu como revisão", !!nova, d.registros.map(r=>r.tipo));
  ok("com o conteúdo da revisão", nova.assuntos.join()==="LAI", nova.assuntos);
  ok("e com as horas", nova.minutos===40, nova.minutos);
  const rev=d.revisoes.find(r=>r.id==="vHoje");
  ok("a revisão foi marcada sozinha", rev.feita===true && rev.sessaoId===nova.id, {f:rev.feita,s:rev.sessaoId});
  ok("a sessão aponta de volta", nova.revisaoId==="vHoje", nova.revisaoId);
  ok("a sessão de revisão NÃO gerou cronograma novo",
     d.revisoes.filter(r=>r.registroId===nova.id).length===0, d.revisoes.length);
  ok("nem mexeu nas outras revisões", d.revisoes.length===3, d.revisoes.length);

  /* ---- a revisão já cumprida sai da lista ---- */
  click(doc.querySelector('[data-acao="toggle-form-registro"]')); await espera(300);
  $("#tipoRevisao").checked=true; change($("#tipoRevisao")); await espera(300);
  ok("revisão já cumprida não aparece de novo",
     ![...$("#revisaoAlvo").options].some(o=>o.value==="vHoje"),
     [...$("#revisaoAlvo").options].map(o=>o.value));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntipo de sessão e vínculo funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
