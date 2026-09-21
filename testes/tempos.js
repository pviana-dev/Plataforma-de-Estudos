const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=new Date();
const dia=n=>iso(new Date(Date.now()+n*864e5));
// domingo desta semana
const domingo=new Date(hoje); domingo.setDate(hoje.getDate()-hoje.getDay());
const dow=n=>{const d=new Date(domingo); d.setDate(domingo.getDate()+n); return iso(d);};
const r=(id,data,min)=>({id,data,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:min,
  questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:Number(id.slice(1)),tipo:"estudo"});
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação","Português"],grupos:[],lancamentos:[],
 registros:[
  r("r1",dow(0),60),            // domingo desta semana
  r("r2",dow(3),90),            // meio da semana
  Object.assign(r("r3",dow(6),30),{disciplina:"Português",assuntos:["Crase"],assunto:"Crase"}), // sábado
  r("r4",iso(new Date(domingo.getTime()-864e5)),120),   // sábado da semana passada
  r("r5",iso(new Date(domingo.getTime()-10*864e5)),45)],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const change=el=>el.dispatchEvent(new w.Event("change",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const tiles=()=>[...doc.querySelectorAll("#view .tiles .tile")].map(t=>t.textContent.replace(/\s+/g," "));

(async()=>{try{
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  const t=tiles();
  console.log("  blocos:"); t.forEach(x=>console.log("    "+x));

  ok("o segundo bloco é o tempo da semana", /^Tempo na semana/.test(t[1]), t[1]);
  ok("soma só a semana corrente, dom a sáb (60+90+30 = 3h)", /Tempo na semana3h/.test(t[1]), t[1]);
  ok("e mostra o intervalo da semana", /\d\d\/\d\d a \d\d\/\d\d/.test(t[1]), t[1]);
  ok("o último bloco é o total", /^Tempo total/.test(t[t.length-1]), t[t.length-1]);
  ok("somando tudo (60+90+30+120+45 = 5h45)", /Tempo total5h45/.test(t[t.length-1]), t[t.length-1]);
  ok("o tempo do filtro ficou no bloco de sessões", /no filtro/.test(t[0]), t[0]);

  /* ---- filtrar não mexe na semana nem no total ---- */
  const d=$("#fDisciplina"); d.value="Português"; change(d); await espera(300);
  const t2=tiles();
  console.log("  com filtro de Português:"); t2.forEach(x=>console.log("    "+x));
  ok("a semana continua a mesma", /Tempo na semana3h/.test(t2[1]), t2[1]);
  ok("o total continua o mesmo", /Tempo total5h45/.test(t2[t2.length-1]), t2[t2.length-1]);
  ok("mas o filtro mostra só os 30min dele", /30min no filtro/.test(t2[0]), t2[0]);
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntempos da semana e total ok");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
