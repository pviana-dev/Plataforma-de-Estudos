const fs=require("fs"),{JSDOM}=require("jsdom");
const CONFIG_MAX=5;   // degraus que cabem até a véspera, nesta janela
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const dia=n=>iso(new Date(Date.now()+n*864e5));
const reg=(id,d,ass,extra)=>Object.assign({id,data:d,disciplina:"Legislação",assuntos:[ass],assunto:ass,
  minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1},extra||{});
// X e Y já integrados no grupo "LAI"; Z é a sessão de hoje, ainda sozinha
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],
 grupos:[{id:"g1",nome:"LAI",disciplina:"Legislação",criadoEm:1}],
 registros:[
   reg("rX",dia(-3),"LAI",{plano:"grupo",grupoId:"g1"}),
   reg("rY",dia(-1),"LAI - prazos",{plano:"grupo",grupoId:"g1"}),
   reg("rZ",dia(0),"LAI - recursos")],
 revisoes:[{id:"v1",registroId:"rX",grupoId:"g1",integrada:true,disciplina:"Legislação",assuntos:["LAI","LAI - prazos"],
            data:dia(2),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const lerDb=()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const linha=[...doc.querySelectorAll("tbody tr")].find(tr=>tr.dataset.id==="rZ");
  click(linha); await espera(300);
  const cx=$("#cxIntegrado"); cx.checked=true; change(cx); await espera(150);
  const opts=[...$("#grupoAlvo").options].map(o=>o.value+" :: "+o.textContent);
  console.log("  destinos oferecidos a Z:");
  opts.forEach(o=>console.log("    "+o));

  ok("o grupo de X e Y aparece como um destino só",
     opts.some(o=>/^g:g1 :: LAI \(2 conteúdos\)/.test(o)), opts);
  ok("X não aparece solto no seletor", !opts.some(o=>/r:rX/.test(o)), opts);
  ok("Y também não", !opts.some(o=>/r:rY/.test(o)), opts);

  // integrar Z com o grupo
  const sel=$("#grupoAlvo"); sel.value="g:g1"; change(sel); await espera(200);
  const chips=[...doc.querySelectorAll("#listaMembros .tag")].map(t=>t.textContent.replace("✕",""));
  console.log("  conteúdos que o grupo passa a reunir: "+chips.join(" | "));
  ok("o painel já mostra X e Y dentro do grupo",
     chips.some(c=>/^LAI ·/.test(c)) && chips.some(c=>/LAI - prazos/.test(c)), chips);

  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  const db=lerDb(), gid=db.grupos[0].id;
  const dentro=db.registros.filter(r=>r.grupoId===gid).map(r=>r.assunto).sort();
  ok("integrar com o grupo integra com TODAS as sessões dele",
     dentro.join(", ")==="LAI, LAI - prazos, LAI - recursos", dentro);
  ok("continua sendo um grupo só", db.grupos.length===1, db.grupos.map(g=>g.nome));
  const cards=db.revisoes.filter(r=>r.grupoId===gid).sort((a,b)=>a.data.localeCompare(b.data));
  console.log("  fila do grupo depois: "+cards.map(c=>c.data+(c.id==="v1"?" (a que já existia)":" (nova)")).join(" | "));
  const antiga=cards.find(c=>c.id==="v1");
  ok("o card que já existia continua lá, na mesma data", !!antiga && antiga.data===dia(2), antiga&&antiga.data);
  ok("e passou a cobrir os três conteúdos",
     (antiga.assuntos||[]).sort().join(", ")==="LAI, LAI - prazos, LAI - recursos", antiga.assuntos);
  ok("os cards extras (se houver) vêm DEPOIS do que já estava marcado",
     cards.filter(c=>c.id!=="v1").every(c=>c.data>=antiga.data), cards.map(c=>c.data));
  // o plano agora segue a escada quando ela cabe na janela: D+1, 3, 7, 16…
  ok("a fila não passa do que o plano pede", cards.length<=CONFIG_MAX, cards.length);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nintegração pelo grupo alcança todo mundo");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
