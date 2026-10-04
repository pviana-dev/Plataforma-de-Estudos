const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const agora=Date.now(), ha5=agora-5*864e5, ha9=agora-9*864e5;
const e=(id,disc,ass,txt,criadoEm,extra)=>Object.assign({id,disciplina:disc,assunto:ass,fonte:"",oQueErrei:"",
  ensinamento:txt,categoria:"",refeita:false,importante:false,criadoEm},extra||{});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:hoje,disciplina:"Português",assuntos:["Crase"],assunto:"Crase",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2}],
 revisoes:[],
 erros:[
  e("e1","Legislação","LAI","prazo de 20 dias",agora),
  e("e2","Legislação","LAI","vale para órgão e entidade",agora-1000,{importante:true}),
  e("e3","Legislação","LAI","não confundir com o recurso",ha5),
  e("e4","Legislação","LAI","cabe a autoridade superior",ha9),
  e("e5","Português","Crase","antes de masculino não tem",agora-2000)],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.__confirmarNativo=true; w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const cards=()=>[...doc.querySelectorAll(".apr")];
const titulo=c=>c.querySelector(".apr-origem b").textContent;
const btn=()=>doc.querySelector('[data-acao="toggle-juntar"]');

(async()=>{try{
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);

  /* ---- estado original: separado por dia ---- */
  const antes=cards().map(c=>titulo(c)+":"+c.querySelectorAll(".apr-item").length);
  ok("começa separado por dia (3 cards de LAI + 1 de Crase)", cards().length===4, antes);
  ok("nenhuma data solta nas linhas", !doc.querySelector(".apr-data"));
  ok("existe o botão de juntar os dias", !!btn() && /juntar os dias/i.test(btn().textContent), btn()&&btn().textContent);
  ok("e ele começa desligado", btn().getAttribute("aria-pressed")==="false");

  /* ---- juntar tudo ---- */
  click(btn()); await espera(250);
  ok("juntou: um card por conteúdo", cards().length===2, cards().map(c=>titulo(c)+":"+c.querySelectorAll(".apr-item").length));
  const lai=cards().find(c=>titulo(c)==="LAI");
  ok("as 4 anotações de LAI ficaram no mesmo card", lai.querySelectorAll(".apr-item").length===4,
     lai.querySelectorAll(".apr-item").length);
  ok("cada anotação mostra a própria data", lai.querySelectorAll(".apr-data").length===4,
     lai.querySelectorAll(".apr-data").length);
  ok("a data é miúda e no formato dd/mm",
     [...lai.querySelectorAll(".apr-data")].every(d=>/^\d\d\/\d\d$/.test(d.textContent.trim())),
     [...lai.querySelectorAll(".apr-data")].map(d=>d.textContent));
  const topo=lai.querySelector(".apr-topo");
  const filhos=[...topo.children];
  // a alça de reordenar é o primeiro filho; a estrela é procurada pela ação,
  // não por "o primeiro .act", que passou a ser a alça
  const iData=filhos.findIndex(x=>x.classList.contains("apr-data"));
  const iEstrela=filhos.findIndex(x=>x.dataset.acao==="erro-estrela");
  ok("a data vem à esquerda da estrela", iData>=0 && iEstrela>=0 && iData<iEstrela,
     filhos.map(x=>x.className+"/"+(x.dataset.acao||"")));
  ok("o cabeçalho deixa de mostrar uma data única e diz de quantos dias é",
     /3 dias/.test(lai.querySelector(".apr-cab .meta").textContent),
     lai.querySelector(".apr-cab .meta").textContent);
  ok("o botão vira 'separar por dia'", /separar por dia/i.test(btn().textContent), btn().textContent);
  ok("e fica marcado como ativo", btn().getAttribute("aria-pressed")==="true");
  ok("a véspera continua destacada", !!lai.querySelector(".apr-item.marcado"));
  ok("★ e editar seguem em cada anotação",
     lai.querySelectorAll('[data-acao="erro-estrela"]').length===4 &&
     lai.querySelectorAll('[data-acao="editar-erro"]').length===4);

  /* ---- editar continua funcionando com tudo junto ---- */
  click(lai.querySelectorAll('[data-acao="editar-erro"]')[2]); await espera(250);
  ok("dá para editar uma anotação no card juntado", !!doc.querySelector("#formEdicaoErro"));
  click(doc.querySelector('[data-acao="cancelar-edicao-erro"]')); await espera(250);

  /* ---- desfazer volta ao estado original ---- */
  click(btn()); await espera(250);
  ok("desfez: voltou a separar por dia", cards().length===4, cards().length);
  ok("e o estado é o mesmo de antes",
     cards().map(c=>titulo(c)+":"+c.querySelectorAll(".apr-item").length).join("|")===antes.join("|"),
     [antes, cards().map(c=>titulo(c)+":"+c.querySelectorAll(".apr-item").length)]);
  ok("as datas somem das linhas", !doc.querySelector(".apr-data"));
  ok("e voltam para o cabeçalho, uma data cheia por card",
     cards().every(c=>/^\d\d\/\d\d\/\d{4}$/.test(c.querySelector(".apr-cab .meta").textContent)),
     cards().map(c=>c.querySelector(".apr-cab .meta").textContent));
  ok("a preferência não vai para o banco",
     !/eJuntarTudo/.test(w.localStorage.getItem("plataforma-estudos:v1")));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\njuntar tudo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
