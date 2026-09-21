const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date()),ontem=iso(new Date(Date.now()-864e5));
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[
  {id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:90,questoes:10,acertos:7,dificuldade:3,anotacoes:"",criadoEm:1},
  {id:"rB",data:ontem,disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:45,questoes:5,acertos:5,dificuldade:2,anotacoes:"",criadoEm:2}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
setTimeout(()=>{
  click(doc.querySelector('[data-aba="painel"]'));
  setTimeout(()=>{
    const info=$(".dia-info").textContent;
    ok("o painel já abre com um dia selecionado", !/Nenhum dia escolhido/.test(info), info.slice(0,60));
    const [a,m,d]=hoje.split("-");
    ok("e o dia é o de hoje", $(".dia-info .dia-cab b").textContent.includes(d+"/"+m+"/"+a),
       $(".dia-info .dia-cab b").textContent);
    ok("mostra o estudo de hoje (90min)", /1h30/.test(info), info.replace(/\s+/g," ").slice(0,140));
    const cel = $('.cal-dia[data-dia="'+hoje+'"]');
    ok("o dia de hoje aparece marcado no calendário",
       !!cel && cel.classList.contains("sel") && cel.classList.contains("hoje"),
       cel && cel.className);
    // continua dando para escolher outro dia e limpar
    click($('[data-acao="sel-dia"][data-dia="'+ontem+'"]'));
    setTimeout(()=>{
      ok("dá para escolher outro dia", /45|0h45/.test($(".dia-info").textContent), $(".dia-info").textContent.replace(/\s+/g," ").slice(0,120));
      click(doc.querySelector('.dia-info [data-acao="sel-dia"]'));
      setTimeout(()=>{
        ok("e limpar volta ao 'nenhum dia'", /Nenhum dia escolhido/.test($(".dia-info").textContent), $(".dia-info").textContent.slice(0,60));
        console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntudo certo");
        process.exit(falhas?1:0);
      },150);
    },150);
  },200);
},250);
