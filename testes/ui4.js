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
    // o card continua único; quem saiu foi o botão de editá-lo, com a integração
    const cards=[...doc.querySelectorAll("#view .grupo-rev")];
    const ns=numeros();
    ok("as duas sessões de LAI caem no mesmo card", cards.length===1,
       cards.map(c=>c.querySelector(".cab strong").textContent));
    ok("a numeração é contínua (sem 1,2,3 repetido)", ns.join(",")===ns.map((_,i)=>i+1).join(","), ns);
  });

  /* Daqui para baixo esta suíte editava o título do card e integrava uma
     terceira sessão. Saiu com a integração. O que ficou é o que a substituiu:
     o card único já vem da regra de conteúdo, sem ninguém integrar nada. */
  await passo(()=>{
    const d=lerDb();
    ok("o card único não veio de grupo nenhum", !(d.grupos||[]).length, d.grupos);
    ok("nem de revisão marcada como integrada",
       !d.revisoes.some(r=>r.grupoId||r.integrada), d.revisoes.map(r=>[r.id,r.grupoId]));
    ok("e não há botão de editar card na tela", !doc.querySelector('[data-acao="editar-card"]'));
    console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntodos os testes passaram");
    process.exit(falhas?1:0);
  });
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,4).join("\n"));process.exit(2);}})();
