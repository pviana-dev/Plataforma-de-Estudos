/* TEMPO EDITADO NO TOTAL DO DIA (pedido do Pedro, 26/09). Baixar o tempo de uma
   sessão cronometrada não mudava o "Estudo de hoje": o dia soma os blocos do
   cronômetro, e eles continuavam com o tempo antigo. Ao salvar, os blocos que
   passam do tempo novo são cortados, do mais recente para o mais antigo. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), ontem=iso(new Date(Date.now()-864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(reg){
  const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,
   disciplinas:["Legislação"],grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,
   planosManuaisMigrados:true,conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
   registros:[Object.assign({id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
     questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",plano:"sem",criadoEm:1},reg)],
   revisoes:[],erros:[],cronometro:null};
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const blocos=w=>(db(w).registros[0].blocos||[]).map(b=>b.data===hoje?b.minutos:"ontem:"+b.minutos);
async function mudarTempo(w, min){
  const doc=w.document;
  (doc.querySelector('tbody tr[data-id="r1"] [data-acao="editar-registro"]')
   || doc.querySelector('tbody tr[data-id="r1"]'))
    .dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(450);
  doc.querySelector('#modalCaixa [name="minutos"]').value=String(min);
  doc.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(550);
}
// a mesma conta do app (minutosNoDia): tempo próprio no dia da sessão + blocos no dia em que foram cronometrados
const noDia=(w,dia)=>db(w).registros.reduce((s,r)=>{
  const bl=r.blocos||[], todos=bl.reduce((a,b)=>a+b.minutos,0), doDia=bl.filter(b=>b.data===dia).reduce((a,b)=>a+b.minutos,0);
  return s+doDia+(r.data===dia?Math.max(0,(r.minutos||0)-todos):0); },0);
async function estudoDeHoje(w){
  w.document.querySelector('[data-aba="hoje"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  return (w.document.getElementById("view").textContent.match(/Estudo de hoje(\S+?)meta/)||[])[1];
}
const bloco=(data,min)=>({data,inicio:"08:00",fim:"09:00",minutos:min});

(async()=>{try{
  /* 1. o caso do Pedro: sessão de hoje, toda cronometrada, tempo baixado */
  let w=abrir({minutos:90,blocos:[bloco(hoje,90)]}); await espera(600);
  ok("antes: 1h30 no dia", noDia(w,hoje)===90, noDia(w,hoje));
  await mudarTempo(w,60);
  ok("baixar para 60 min: o dia passa a ter 1h", noDia(w,hoje)===60, noDia(w,hoje));
  ok("…e o bloco do cronômetro acompanha", JSON.stringify(blocos(w))==="[60]", blocos(w));
  ok("o card Estudo de hoje mostra 1h", await estudoDeHoje(w)==="1h", await estudoDeHoje(w));

  /* 2. dois blocos: o corte começa pelo mais recente */
  w=abrir({minutos:90,blocos:[bloco(hoje,30),bloco(hoje,60)]}); await espera(600);
  await mudarTempo(w,45);
  ok("90 → 45 com blocos de 30 e 60: fica 30 + 15", JSON.stringify(blocos(w))==="[30,15]", blocos(w));
  ok("e o dia soma 45", noDia(w,hoje)===45, noDia(w,hoje));
  w=abrir({minutos:90,blocos:[bloco(hoje,30),bloco(hoje,60)]}); await espera(600);
  await mudarTempo(w,20);
  ok("90 → 20: o bloco mais recente some e o outro fica com 20", JSON.stringify(blocos(w))==="[20]", blocos(w));

  /* 3. aumentar o tempo não mexe nos blocos (o que passa deles é tempo digitado) */
  w=abrir({minutos:90,blocos:[bloco(hoje,90)]}); await espera(600);
  await mudarTempo(w,120);
  ok("subir para 120: o dia soma 2h", noDia(w,hoje)===120, noDia(w,hoje));
  ok("…e o bloco continua com 90", JSON.stringify(blocos(w))==="[90]", blocos(w));

  /* 4. sessão sem cronômetro: segue como sempre */
  w=abrir({minutos:90}); await espera(600);
  await mudarTempo(w,40);
  ok("sessão sem blocos: 90 → 40 dá 40 no dia", noDia(w,hoje)===40 && !db(w).registros[0].blocos, noDia(w,hoje));

  /* 5. sessão de ontem com bloco cronometrado hoje: o tempo digitado de ontem cai primeiro */
  w=abrir({data:ontem,minutos:50,blocos:[bloco(hoje,20)]}); await espera(600);
  await mudarTempo(w,40);
  ok("50 → 40: ontem perde 10, hoje segue com 20", noDia(w,ontem)===20 && noDia(w,hoje)===20,
     {ontem:noDia(w,ontem),hoje:noDia(w,hoje)});
  await mudarTempo(w,10);
  ok("40 → 10: ontem fica sem tempo próprio e o bloco de hoje vira 10", noDia(w,ontem)===0 && noDia(w,hoje)===10,
     {ontem:noDia(w,ontem),hoje:noDia(w,hoje)});

  /* 6. sessão baixada ANTES da correção (tempo 60, bloco ainda com 90): acerta ao abrir */
  w=abrir({minutos:60,blocos:[bloco(hoje,90)]}); await espera(600);
  ok("dado antigo: ao abrir, o card Estudo de hoje já mostra 1h", await estudoDeHoje(w)==="1h", await estudoDeHoje(w));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntempo editado chega ao total do dia");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
