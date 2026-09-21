const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:4,acertos:3,dificuldade:3,anotacoes:"",criadoEm:1,tipo:"estudo"}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const abrir=extra=>new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
  beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
    Object.entries(extra||{}).forEach(([k,v])=>w.localStorage.setItem(k,v)); }});
const ativa=doc=>{const b=doc.querySelector('#abas [aria-selected="true"]'); return b&&b.dataset.aba;};

(async()=>{try{
  /* ---- primeira visita: abre em Hoje ---- */
  const d1=abrir(); await espera(300);
  ok("sem nada salvo, abre na aba Hoje", ativa(d1.window.document)==="hoje", ativa(d1.window.document));
  // agora o estado de tela (aba + filtros + rascunho) é gravado como um retrato,
  // já no primeiro desenho — e continua fora do banco de dados
  ok("o estado de tela já nasce gravado", d1.window.localStorage.getItem("plataforma-estudos:aba")==="hoje" &&
     JSON.parse(d1.window.localStorage.getItem("plataforma-estudos:tela")).aba==="hoje",
     d1.window.localStorage.getItem("plataforma-estudos:tela"));

  /* ---- troca para Questões ---- */
  d1.window.document.querySelector('[data-aba="questoes"]')
    .dispatchEvent(new d1.window.MouseEvent("click",{bubbles:true}));
  await espera(250);
  const salva=d1.window.localStorage.getItem("plataforma-estudos:aba");
  ok("trocar de aba grava a escolha", salva==="questoes", salva);

  /* ---- recarregar: volta para Questões ---- */
  const d2=abrir({"plataforma-estudos:aba":"questoes"}); await espera(300);
  ok("ao recarregar, continua em Questões", ativa(d2.window.document)==="questoes", ativa(d2.window.document));
  ok("e a tela da aba certa foi montada", /Questões feitas/.test(d2.window.document.getElementById("view").textContent));

  /* ---- outra aba ---- */
  const d3=abrir({"plataforma-estudos:aba":"revisoes"}); await espera(300);
  ok("vale para qualquer aba", ativa(d3.window.document)==="revisoes", ativa(d3.window.document));

  /* ---- valor inválido não quebra ---- */
  const d4=abrir({"plataforma-estudos:aba":"inventada"}); await espera(300);
  ok("aba inexistente cai de volta para Hoje", ativa(d4.window.document)==="hoje", ativa(d4.window.document));

  /* ---- navegar por dentro também é lembrado ---- */
  const d5=abrir(); await espera(300);
  const w5=d5.window, doc5=d5.window.document;
  doc5.querySelector('[data-aba="registros"]').dispatchEvent(new w5.MouseEvent("click",{bubbles:true}));
  await espera(250);
  doc5.querySelector('[data-acao="novo-lancamento"]') && 0;
  doc5.querySelector('[data-aba="painel"]').dispatchEvent(new w5.MouseEvent("click",{bubbles:true}));
  await espera(250);
  ok("a última aba visitada é a guardada",
     w5.localStorage.getItem("plataforma-estudos:aba")==="painel",
     w5.localStorage.getItem("plataforma-estudos:aba"));
  ok("e isso não entra no backup dos dados",
     !("aba" in JSON.parse(w5.localStorage.getItem("plataforma-estudos:v1"))));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\naba lembrada entre recarregamentos");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
