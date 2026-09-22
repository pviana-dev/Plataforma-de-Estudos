const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[
  // duas medições no mesmo dia: 11-13 e 15-18
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:300,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1,
   inicio:"11:00",fim:"18:00",
   blocos:[{data:hoje,inicio:"11:00",fim:"13:00",minutos:120},{data:hoje,inicio:"15:00",fim:"18:00",minutos:180}]},
  // sessão de ontem que recebeu um bloco cronometrado hoje
  {id:"rB",data:ontem,disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:90,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2,
   inicio:"09:00",fim:"10:30",
   blocos:[{data:ontem,inicio:"09:00",fim:"10:00",minutos:60},{data:hoje,inicio:"20:00",fim:"20:30",minutos:30}]},
  // sessão antiga, sem blocos (só início/fim)
  {id:"rC",data:ontem,disciplina:"Legislação",assuntos:["Improbidade"],assunto:"Improbidade",minutos:45,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:3,
   inicio:"08:00",fim:"08:45"},
  // quatro medições, para ver o resumo
  {id:"rD",data:hoje,disciplina:"Legislação",assuntos:["Súmulas"],assunto:"Súmulas",minutos:100,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:4,
   inicio:"07:00",fim:"22:00",
   blocos:[{data:hoje,inicio:"07:00",fim:"07:30",minutos:30},{data:hoje,inicio:"09:00",fim:"09:20",minutos:20},
           {data:hoje,inicio:"14:00",fim:"14:30",minutos:30},{data:hoje,inicio:"21:40",fim:"22:00",minutos:20}]}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
w.confirm=()=>false;   // recusa a exclusão, só queremos ver que não abriu a edição
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const linhaDe=id=>[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id===id);

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const tempo=id=>{ const tr=linhaDe(id); return tr.querySelectorAll("td")[2].textContent.replace(/\s+/g," ").trim(); };
  console.log("  coluna Tempo de cada sessão:");
  ["rA","rB","rC","rD"].forEach(id=>console.log("    "+id+": "+tempo(id)));

  ok("o histórico mostra só o total e a contagem", /^5h · 2 medições$|^5h2 medições$/.test(tempo("rA")), tempo("rA"));
  ok("e não mostra mais faixa nenhuma no overview", !/11:00/.test(tempo("rA")), tempo("rA"));
  ok("sessão com uma medição só não polui a coluna", !/medições/.test(tempo("rC")), tempo("rC"));

  /* ---- clicar na linha abre a sessão, com as informações dentro ---- */
  click(linhaDe("rA")); await espera(300);
  const modal=$("#modalCorpo").textContent.replace(/\s+/g," ");
  ok("clicar na linha abre a tela da sessão", !$("#overlay").hidden && !!$("#modalCorpo #formRegistro"));
  ok("a sessão certa foi aberta", /LAI/.test(modal), modal.slice(0,90));
  const faixas=[...doc.querySelectorAll("#modalCorpo .faixa")].map(f=>f.textContent);
  ok("as medições aparecem uma a uma dentro da sessão",
     faixas.join(" | ")==="11:00–13:00 | 15:00–18:00", faixas);
  ok("com a contagem e o total", /Cronômetro · 2 medições/.test(modal) && /5h no total/.test(modal), modal.slice(0,200));
  ok("mostra quando foi registrada", /Registrada em/.test(modal));
  ok("e a situação das revisões", /Revisões/.test(modal));
  click(doc.querySelector('#overlay [data-acao="fechar-modal"]')); await espera(250);

  /* ---- bloco de outro dia aparece com a data, dentro da sessão ---- */
  click(linhaDe("rB")); await espera(300);
  const f2=[...doc.querySelectorAll("#modalCorpo .faixa")].map(f=>f.textContent);
  ok("bloco cronometrado em outro dia vem com a data",
     f2.some(x=>/^09:00–10:00$/.test(x)) && f2.some(x=>/^\d\d\/\d\d 20:00–20:30$/.test(x)), f2);
  click(doc.querySelector('#overlay [data-acao="fechar-modal"]')); await espera(250);

  /* ---- sessão antiga, sem blocos ---- */
  click(linhaDe("rC")); await espera(300);
  const f3=[...doc.querySelectorAll("#modalCorpo .faixa")].map(f=>f.textContent);
  ok("sessão antiga mostra o horário que tem", f3.join("")==="08:00–08:45", f3);
  click(doc.querySelector('#overlay [data-acao="fechar-modal"]')); await espera(250);

  /* ---- o botão Excluir não abre a edição ---- */
  // o excluir saiu da linha: agora ele vive só dentro da tela de edição
  click(linhaDe("rD")); await espera(300);
  ok("a tela da sessão traz o excluir", !!doc.querySelector('#modalCaixa [data-acao="excluir-registro"]'));

  /* ---- painel: o detalhe do dia mostra as faixas daquele dia ---- */
  click(doc.querySelector('[data-aba="painel"]')); await espera(300);
  const info=$(".dia-info").textContent.replace(/\s+/g," ");
  ok("o detalhe do dia lista as faixas do dia", /11:00–13:00 · 15:00–18:00/.test(info), info.slice(0,220));
  ok("e mostra só o bloco daquele dia na sessão de ontem",
     /20:00–20:30/.test(info) && !/09:00–10:00/.test(info), info.slice(0,260));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nintervalos do cronômetro corretos");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
