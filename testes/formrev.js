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
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[{id:"v1",registroId:"rA",data:hoje,ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:"refazer as questões"}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join("");

(async()=>{try{
  click(doc.querySelector('[data-aba="revisoes"]')); await espera(300);
  verPorAssunto(doc, w); await espera(250);
  click(doc.querySelector('[data-acao="editar-revisao"]')); await espera(300);
  const f=$("#modalCorpo #formRevisao");
  ok("a tela de editar revisão abriu", !!f);
  ok("sumiu a dica 'Revisou mais de um tópico?'", !/Revisou mais de um tópico/.test(f.textContent),
     (f.textContent.match(/.{0,50}mais de um tópico.{0,30}/)||[""])[0]);
  ok("mas as etiquetas e o campo de adicionar continuam",
     !!f.querySelector("#listaAssuntosForm") && !!f.querySelector("#campoAssunto"));
  const nota=f.querySelector("[name=nota]");
  ok("os detalhes ficaram num campo grande", nota.classList.contains("texto-grande"));
  ok("e a altura está no CSS", /textarea\.texto-grande\{min-height:170px\}/.test(css));
  ok("a caixa de data foi limitada", /input\[type="date"\]\{max-width:175px\}/.test(css));
  ok("o conteúdo do campo veio preenchido", nota.value==="refazer as questões", nota.value);

  /* ---- a dica continua no formulário da sessão, onde é útil ---- */
  click(doc.querySelector('[data-acao="cancelar-revisao"]')); await espera(250);
  click(doc.querySelector('[data-aba="registros"]')); await espera(250);
  click([...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rA")); await espera(300);
  ok("no registro, sem a frase-guia dos conteúdos", !/Escolha um de cada vez|é a descrição/.test($("#modalCorpo").textContent)); // frase-guia tirada a pedido do Pedro (24/09)
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nformulário de revisão ajustado");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
